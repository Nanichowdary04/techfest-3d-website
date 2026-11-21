/* Techfest 2027 — page orchestration. */
import { FEST, ZONES, EVENTS, SCHEDULE } from "./data.js";
import { initFilm } from "./film.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
document.documentElement.classList.remove("no-js");

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);

/* ── fest details everywhere ── */
const when = `${FEST.dates} · ${FEST.city}`;
$$('[data-fest="when"]').forEach((el) => (el.textContent = when));
$$('[data-fest="where"]').forEach((el) => (el.textContent = `${FEST.dates} · ${FEST.venue}, ${FEST.city}`));
$$('[data-fest="city"]').forEach((el) => (el.textContent = `${FEST.city}, India`));
$$('[data-fest="dates"]').forEach((el) => (el.textContent = FEST.dates));

/* ── smooth scroll ── */
let lenis = null;
if (!reduced && window.Lenis) {
  lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}
const scrollTo = (target, duration = 1.6) => {
  if (lenis) lenis.scrollTo(target, { duration, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else {
    const y = typeof target === "number" ? target : $(target).getBoundingClientRect().top + scrollY;
    scrollTo_(y);
  }
};
const scrollTo_ = (y) => window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });

/* ── toast ── */
let toastT;
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 3200);
}

/* ── loader + film ── */
const nav = $("#nav");
let booted = false;
const t0 = performance.now();
function boot() {
  if (booted) return; booted = true;
  setTimeout(() => {
    $("#loader-bar").style.width = "100%"; $("#loader-pct").textContent = "100%";
    $("#loader").classList.add("done");
    document.body.classList.remove("is-loading");
    document.body.classList.add("ready");
    lenis?.start();
    ScrollTrigger.refresh();
  }, Math.max(0, 800 - (performance.now() - t0)));
}
const film = initFilm({
  reduced,
  onLoad: (f) => { const p = Math.round(f * 100); $("#loader-bar").style.width = p + "%"; $("#loader-pct").textContent = p + "%"; },
  onReady: boot,
  onProgress: (p) => nav.classList.toggle("on-clouds", p < 0.07),
});
setTimeout(boot, 9000);
window.__tf = { film, get lenis() { return lenis; } };

$("#skip-film").addEventListener("click", () => scrollTo("#intro", 2));
function navState() {
  const end = film.end();
  nav.classList.toggle("on-film", scrollY < end - 8);
  nav.classList.toggle("solid", scrollY >= end - 8);
}
if (lenis) lenis.on("scroll", navState); else addEventListener("scroll", navState, { passive: true });
navState();
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute("href");
  if (id.length < 2 || !$(id)) { e.preventDefault(); return; }
  e.preventDefault();
  scrollTo(id === "#top" ? 0 : id, id === "#top" ? 2.4 : 1.6);
});

/* ── reveals ── */
const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" });
$$(".reveal").forEach((el) => {
  const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
  el.style.setProperty("--d", `${sibs.indexOf(el) * 0.08}s`);
  io.observe(el);
});

/* ── statement: words light up while scrolling ── */
(() => {
  const el = $("#statement");
  el.innerHTML = el.textContent.split(/(\s+)/).map((w) => (w.trim() ? `<span class="w">${w}</span>` : w)).join("");
  const words = $$(".w", el);
  if (reduced) { words.forEach((w) => w.classList.add("on")); return; }
  ScrollTrigger.create({ trigger: el, start: "top 82%", end: "bottom 45%", scrub: true,
    onUpdate: (s) => { const n = Math.round(s.progress * words.length); words.forEach((w, i) => w.classList.toggle("on", i < n)); } });
})();

/* ── counters ── */
const cio = new IntersectionObserver((es) => es.forEach((en) => {
  if (!en.isIntersecting) return;
  cio.unobserve(en.target);
  const el = en.target, to = +el.dataset.count, pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
  const o = { v: reduced ? to : 0 };
  const draw = () => (el.textContent = pre + Math.round(o.v).toLocaleString("en-IN") + suf);
  if (reduced) draw(); else gsap.to(o, { v: to, duration: 2, ease: "expo.out", onUpdate: draw });
}), { threshold: 0.6 });
$$("[data-count]").forEach((el) => cio.observe(el));

/* ── zones: a 3D ring of panels turned by scroll, buttons or a click ── */
(() => {
  const section = $("#zones"), ring = $("#ring"), vp = $("#ring-viewport");
  const N = ZONES.length, STEP = 360 / N;
  ring.innerHTML = ZONES.map((z, i) => `
    <figure class="panel" data-i="${i}" role="button" tabindex="0" aria-label="Show ${z.name}">
      <img src="${z.img}" alt="${z.name}: ${z.desc}" loading="lazy">
      <figcaption class="pl"><small>${String(i + 1).padStart(2, "0")} · ${z.tag}</small>${z.name}</figcaption>
    </figure>`).join("");
  const panels = $$(".panel", ring);
  let R = 0, active = -1, tiltX = 0, tiltY = 0, mx = 0, my = 0, angle = 0;
  function layout() {
    const pw = Math.min(600, vp.clientWidth * (innerWidth < 700 ? 0.78 : 0.5));
    const ph = Math.min(pw * 0.5625, vp.clientHeight * 0.86);
    ring.style.setProperty("--pw", `${pw}px`); ring.style.setProperty("--ph", `${ph}px`);
    $$(".panel", ring).forEach((p) => { p.style.setProperty("--pw", `${pw}px`); p.style.setProperty("--ph", `${ph}px`); });
    R = pw / 2 / Math.tan(Math.PI / N) + pw * 0.1;
    panels.forEach((p, i) => (p.style.transform = `rotateY(${i * STEP}deg) translateZ(${R}px)`));
  }
  function setInfo(i) {
    if (i === active) return; active = i;
    const z = ZONES[i];
    $("#zone-num").textContent = `${String(i + 1).padStart(2, "0")} / ${String(N).padStart(2, "0")}`;
    $("#zone-name").textContent = z.name;
    $("#zone-desc").textContent = z.desc;
    $("#zone-events").innerHTML = z.events.map(([a, b]) => `<li><span>${a}</span><b>${b}</b></li>`).join("");
    for (const el of [$(".zone-meta"), $("#zone-events")]) { el.classList.remove("swap"); void el.offsetWidth; el.classList.add("swap"); }
    panels.forEach((p, k) => p.classList.toggle("active", k === i));
  }
  const prog = () => { const r = section.getBoundingClientRect(), max = section.offsetHeight - innerHeight; return max > 0 ? clamp(-r.top / max) : 0; };
  // dwell on each panel: progress → (index + eased fraction)
  const pos = (p) => { const a = p * (N - 1), i = Math.min(N - 2, Math.floor(a)), f = a - i; const e = clamp((f - 0.22) / 0.56); return i + e * e * (3 - 2 * e); };
  const goTo = (i) => {
    const max = section.offsetHeight - innerHeight;
    scrollTo(section.offsetTop + (clamp(i, 0, N - 1) / (N - 1)) * max, 1.2);
  };
  panels.forEach((p, i) => {
    p.addEventListener("click", () => goTo(i));
    p.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goTo(i); } });
  });
  $("#zone-prev").addEventListener("click", () => goTo(active - 1));
  $("#zone-next").addEventListener("click", () => goTo(active + 1));
  if (fine && !reduced) vp.addEventListener("pointermove", (e) => {
    const r = vp.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5;
  });
  vp.addEventListener("pointerleave", () => { mx = my = 0; });
  function frame() {
    requestAnimationFrame(frame);
    const r = section.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const target = -pos(prog()) * STEP;
    angle += (target - angle) * 0.14;
    tiltX += (my * -8 - tiltX) * 0.08; tiltY += (mx * 10 - tiltY) * 0.08;
    ring.style.transform = `translateZ(${-R}px) rotateX(${(tiltX - 4).toFixed(2)}deg) rotateY(${(angle + tiltY).toFixed(2)}deg)`;
    panels.forEach((p, i) => {
      const a = ((i * STEP + angle) % 360 + 540) % 360 - 180;           // -180..180, 0 = facing us
      const face = Math.cos((a * Math.PI) / 180);
      p.style.filter = `brightness(${(0.35 + 0.65 * Math.max(face, 0)).toFixed(3)})`;
      p.style.zIndex = String(Math.round(face * 100) + 100);
    });
    setInfo(Math.round(-angle / STEP + N * 10) % N);
  }
  addEventListener("resize", layout);
  layout(); setInfo(0); frame();
})();

/* ── events ── */
(() => {
  const grid = $("#event-grid"), filters = $("#filters");
  const zones = ["All", ...new Set(EVENTS.map((e) => e.zone))];
  filters.innerHTML = zones.map((z, i) => `<button class="chip" type="button" aria-pressed="${i === 0}" data-z="${z}">${z}</button>`).join("");
  grid.innerHTML = EVENTS.map((e) => `
    <article class="ev" data-z="${e.zone}">
      <div class="ev-top mono"><span class="z">${e.zone}</span><span>Team ${e.team}</span></div>
      <h3>${e.title}</h3>
      <p>${e.desc}</p>
      <div class="ev-meta mono"><span>Prize <b>${e.prize}</b></span><span>Register →</span></div>
    </article>`).join("");
  const cards = $$(".ev", grid);
  filters.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-z]"); if (!b) return;
    $$(".chip", filters).forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
    cards.forEach((c) => {
      const show = b.dataset.z === "All" || c.dataset.z === b.dataset.z;
      if (show) { c.hidden = false; requestAnimationFrame(() => c.classList.remove("out")); }
      else { c.classList.add("out"); setTimeout(() => { if (c.classList.contains("out")) c.hidden = true; }, 380); }
    });
  });
  cards.forEach((c) => c.addEventListener("click", () => scrollTo("#passes")));
  if (!reduced) gsap.from(cards, { y: 60, rotateX: -18, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.06, clearProps: "transform,opacity", scrollTrigger: { trigger: grid, start: "top 85%" } });
})();

/* ── tilt (events + passes) ── */
function tilt(el, max) {
  if (!fine || reduced) return;
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${((x - 0.5) * max * 2).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${((0.5 - y) * max * 2).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`); el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
  });
  el.addEventListener("pointerleave", () => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
}
$$(".ev").forEach((c) => tilt(c, 8));
$$("[data-tilt]").forEach((c) => tilt(c, 5));

/* ── schedule ── */
$("#days").innerHTML = SCHEDULE.map((d) => `
  <article class="day reveal">
    <div class="day-head"><b>Day ${d.day} <em>${d.name}</em></b><span class="mono">${d.date}</span></div>
    ${d.slots.map(([t, a, b]) => `<div class="slot"><time>${t}</time><div><h4>${a}</h4><p>${b}</p></div></div>`).join("")}
  </article>`).join("");
$$("#days .reveal").forEach((el, i) => { el.style.setProperty("--d", `${i * 0.1}s`); io.observe(el); });

/* ── countdown: the night arena opens like a window as you scroll ── */
(() => {
  const portal = $("#cd-portal"), img = $("#cd-img");
  if (reduced) { portal.style.clipPath = "none"; }
  else ScrollTrigger.create({ trigger: "#countdown", start: "top bottom", end: "center center", scrub: true,
    onUpdate: (s) => {
      const e = 1 - Math.pow(1 - s.progress, 3), inset = 30 * (1 - e), rad = 28 * (1 - e);
      portal.style.clipPath = `inset(${inset.toFixed(2)}% ${inset.toFixed(2)}% round ${rad.toFixed(1)}px)`;
      img.style.transform = `scale(${(1.2 - 0.2 * e).toFixed(4)})`;
    } });
  const target = new Date(FEST.start).getTime();
  const els = Object.fromEntries($$("[data-u]").map((b) => [b.dataset.u, b]));
  const tick = () => {
    const s = Math.max(0, Math.floor((target - Date.now()) / 1000));
    const v = { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
    for (const k in v) els[k].textContent = String(v[k]).padStart(2, "0");
  };
  tick(); setInterval(tick, 1000);
})();

/* ── register ── */
$$("[data-register]").forEach((b) => b.addEventListener("click", () => {
  if (FEST.registerUrl) window.open(FEST.registerUrl, "_blank", "noopener");
  else toast("Registrations open soon. This button will link to the ticketing page.");
}));

document.fonts?.ready.then(() => ScrollTrigger.refresh());
addEventListener("load", () => ScrollTrigger.refresh());
