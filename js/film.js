/* Scroll-scrubbed HD drone flight.
   The whole 1080p video is downloaded once (with progress for the loader),
   then scroll position drives video.currentTime. Real 24 fps video frames,
   scaled by the browser's high-quality video path, so the picture stays
   sharp and there is no frame blending or ghosting. Captions, chapter rail
   and the shade are driven by the same scroll progress. */

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

export function initFilm({ reduced, onLoad, onReady, onProgress }) {
  const section = document.getElementById("top");
  const stage = section.querySelector(".film-stage");
  const video = document.getElementById("film");
  const shadeEl = section.querySelector(".film-shade");
  const cue = document.getElementById("scroll-cue");
  const bar = document.getElementById("film-progress");
  const chapterEls = [...document.querySelectorAll("#chapters li")];
  const narrow = () => matchMedia("(max-width: 960px)").matches;
  const caps = [...section.querySelectorAll(".cap")].map((el) => ({
    el, tin: +el.dataset.in, hold: +el.dataset.hold, tout: +el.dataset.out,
    side: el.classList.contains("cap-left") ? "l" : el.classList.contains("cap-right") ? "r" : "c",
    center: el.classList.contains("cap-hero"), finale: el.classList.contains("cap-finale"),
  }));
  Object.assign(video, { muted: true, playsInline: true, preload: "auto", controls: false, disablePictureInPicture: true });

  const S = { ready: false, dur: 1, cur: 0, target: 0, seeking: false, mx: 0, my: 0, px: 0, py: 0 };
  video.addEventListener("seeking", () => (S.seeking = true));
  video.addEventListener("seeked", () => (S.seeking = false));

  /* ── load: stream the file so the loader shows real progress ── */
  async function load() {
    const meta = await (await fetch("assets/film/film.json")).json();
    const portrait = innerWidth < 900 && innerHeight > innerWidth;
    const src = portrait ? meta.portrait : meta.src;
    S.dur = meta.duration;
    try {
      const res = await fetch(src);
      if (!res.ok || !res.body) throw new Error("stream");
      const total = +res.headers.get("content-length") || 0;
      const reader = res.body.getReader();
      const chunks = []; let got = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value); got += value.length;
        if (total) onLoad?.(got / total);
      }
      video.src = URL.createObjectURL(new Blob(chunks, { type: "video/mp4" }));
    } catch {
      video.src = src; // fall back to normal streaming
    }
    await new Promise((r) => { if (video.readyState >= 2) r(); else video.addEventListener("loadeddata", r, { once: true }); });
    S.dur = video.duration || S.dur;
    // some mobile browsers only paint frames after one play() call
    try { await video.play(); video.pause(); } catch {}
    video.currentTime = 0;
    S.ready = true;
    onReady?.();
  }

  function progress() {
    const r = section.getBoundingClientRect(), max = section.offsetHeight - innerHeight;
    return max > 0 ? clamp(-r.top / max) : 0;
  }
  function overlays(p) {
    let sl = 0, sr = 0;
    for (const c of caps) {
      const rise = Math.max((c.hold - c.tin) * 0.55, 0.008), fall = Math.max((c.tout - c.hold) * 0.5, 0.008);
      let o = 0;
      if (p >= c.tin && p <= c.tout) o = clamp(Math.min((p - c.tin) / rise, 1) * Math.min((c.tout - p) / fall, 1));
      const s = c.el.style;
      s.opacity = o.toFixed(3);
      s.visibility = o > 0 ? "visible" : "hidden";
      c.el.classList.toggle("live", o > 0.6);
      if (o > 0) {
        const drift = reduced ? 0 : (p - c.hold) * -220;
        const base = c.center ? "translate(-50%, -50%)" : c.finale ? "translateX(-50%)" : narrow() ? "" : "translateY(-50%)";
        s.transform = `${base} translate3d(0, ${drift.toFixed(1)}px, 0) scale(${(reduced ? 1 : 0.97 + 0.03 * o).toFixed(4)})`;
        s.filter = !reduced && o < 0.98 ? `blur(${((1 - o) * 8).toFixed(1)}px)` : "none";
      }
      if (c.side === "l") sl = Math.max(sl, o);
      if (c.side === "r") sr = Math.max(sr, o);
    }
    stage.style.setProperty("--shade", smooth(0.05, 0.12, p).toFixed(3));
    shadeEl.style.setProperty("--sl", (sl * 0.75).toFixed(3));
    shadeEl.style.setProperty("--sr", (sr * 0.75).toFixed(3));
    bar.style.transform = `scaleX(${p.toFixed(4)})`;
    let on = 0;
    chapterEls.forEach((li, k) => { if (p >= +li.dataset.at - 0.001) on = k; });
    chapterEls.forEach((li, k) => li.classList.toggle("on", k === on));
    cue.style.opacity = p < 0.012 ? 1 : 0;
    onProgress?.(p);
  }

  let last = performance.now(), lastP = -1;
  function tick(now) {
    requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.25) || 0.016;
    last = now;
    const p = progress();
    if (p !== lastP) { overlays(p); lastP = p; }
    if (!S.ready || section.getBoundingClientRect().bottom < 0) return;
    S.target = p * (S.dur - 0.05);
    S.cur += (S.target - S.cur) * (1 - Math.exp(-dt * 10));
    if (Math.abs(S.target - S.cur) < 0.002) S.cur = S.target;
    // only ask for a new frame when the last seek has landed
    if (!S.seeking && Math.abs(video.currentTime - S.cur) > 0.5 / 24) video.currentTime = S.cur;
    // gentle pointer parallax (GPU transform, no re-render of the video)
    const k = 1 - Math.exp(-dt * 4);
    S.px += (S.mx - S.px) * k; S.py += (S.my - S.py) * k;
    if (!reduced) video.style.transform = `translate3d(${(S.px * 1.6).toFixed(3)}%, ${(S.py * 1.6).toFixed(3)}%, 0) scale(1.035)`;
  }

  if (!reduced) addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    S.mx = -(e.clientX / innerWidth - 0.5); S.my = -(e.clientY / innerHeight - 0.5);
  }, { passive: true });
  overlays(0);
  requestAnimationFrame(tick);
  load().catch((e) => { console.warn("[film]", e); onReady?.(); });

  return {
    end: () => section.offsetTop + section.offsetHeight - innerHeight,
    // debug helper: jump straight to progress p
    renderAt(p) {
      overlays(p);
      S.cur = S.target = p * (S.dur - 0.05);
      return new Promise((r) => { video.addEventListener("seeked", () => r(video.currentTime), { once: true }); video.currentTime = S.cur; });
    },
    state: S, video,
  };
}
