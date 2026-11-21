"""Turn the six Techfest shots into one scroll-scrubbed drone flight.

usage (from the site folder):
  python -I tools/build_film.py

Reads   clips/src/01-clouds.mp4 … 06-finale.mp4
Writes  clips/master.mp4                      (watermark-free, silent, cross-faded, 720p)
        assets/film/flight-1080.mp4           (HD: denoised, lanczos-upscaled to 1080p, sharpened)
        assets/film/flight-portrait.mp4       (phones: 3:4 centre crop of the HD flight)
        assets/film/film.json                 (duration + chapter scroll fractions)
        assets/img/*.webp                     (sharp HD stills for the sections below the film)

The web videos use a short keyframe interval (every 8 frames, no B-frames)
so the browser can seek them smoothly while you scroll.
"""
import json
import shutil
import subprocess
import tempfile
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "clips" / "src"
CHAPTERS = [
    ("clouds", "01-clouds.mp4"),
    ("approach", "02-approach.mp4"),
    ("ai", "03-ai-valley.mp4"),
    ("robotics", "04-robotics.mp4"),
    ("launch", "05-launch.mp4"),
    ("finale", "06-finale.mp4"),
]
XFADE = 0.6
DELOGO = "delogo=x=1126:y=566:w=68:h=68"   # generator's ✦ mark, bottom-right
HD = "hqdn3d=1.2:1.2:2:2,scale=1920:1080:flags=lanczos,unsharp=5:5:0.8:5:5:0"
SCRUB = ["-c:v", "libx264", "-preset", "slow", "-tune", "film", "-g", "8", "-keyint_min", "8",
         "-bf", "0", "-pix_fmt", "yuv420p", "-an", "-movflags", "+faststart"]


def run(cmd):
    subprocess.run(cmd, check=True)


def duration(p):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)])
    return float(out.strip())


def build_master(master: Path):
    durs = [duration(SRC / f) for _, f in CHAPTERS]
    args = ["ffmpeg", "-y", "-v", "error"]
    for _, f in CHAPTERS:
        args += ["-i", str(SRC / f)]
    filters, starts = [], [0.0]
    for i in range(len(CHAPTERS)):
        filters.append(f"[{i}:v]{DELOGO},scale=1280:720,fps=24,setsar=1,format=yuv420p[n{i}]")
    prev, end = "[n0]", durs[0]
    for i in range(1, len(CHAPTERS)):
        off = end - XFADE
        filters.append(f"{prev}[n{i}]xfade=transition=fade:duration={XFADE}:offset={off:.4f}[v{i}]")
        starts.append(off)
        prev, end = f"[v{i}]", off + durs[i]
    args += ["-filter_complex", ";".join(filters), "-map", prev, "-an",
             "-c:v", "libx264", "-crf", "15", "-preset", "slow", "-pix_fmt", "yuv420p", str(master)]
    run(args)
    return end, starts


def encode(job):
    src, dst, q = job
    Image.open(src).convert("RGB").save(dst, "WEBP", quality=q, method=5)
    return Path(dst).stat().st_size


def frames(master: Path, name: str, fps: int, vf: str, q: int, size, total, starts):
    out = ROOT / "assets" / "film" / name
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    with tempfile.TemporaryDirectory() as tmp:
        run(["ffmpeg", "-y", "-v", "error", "-i", str(master), "-vf", f"fps={fps},{vf}", str(Path(tmp) / "p_%04d.png")])
        pngs = sorted(Path(tmp).glob("p_*.png"))
        jobs = [(str(p), str(out / f"f_{i + 1:04d}.webp"), q) for i, p in enumerate(pngs)]
        with ProcessPoolExecutor() as ex:
            total_bytes = sum(ex.map(encode, jobs, chunksize=8))
    manifest = {
        "count": len(jobs), "pattern": f"assets/film/{name}/f_%04d.webp", "fps": fps,
        "width": size[0], "height": size[1], "duration": round(total, 3),
        "chapters": {n: round(s / total, 4) for (n, _), s in zip(CHAPTERS, starts)},
    }
    (out / "manifest.json").write_text(json.dumps(manifest, indent=2))
    print(f"{name}: {len(jobs)} frames, {total_bytes / 1e6:.1f} MB")


def web_videos(master: Path, total, starts):
    film = ROOT / "assets" / "film"
    for old in ("desktop", "mobile"):
        if (film / old).exists():
            shutil.rmtree(film / old, ignore_errors=True)  # old frame sequences are no longer used
    film.mkdir(parents=True, exist_ok=True)
    hd, portrait = film / "flight-1080.mp4", film / "flight-portrait.mp4"
    run(["ffmpeg", "-y", "-v", "error", "-i", str(master), "-vf", HD, *SCRUB, "-crf", "22", str(hd)])
    run(["ffmpeg", "-y", "-v", "error", "-i", str(master), "-vf", HD + ",crop=810:1080:555:0", *SCRUB, "-crf", "23", str(portrait)])
    meta = {"duration": round(total, 3), "fps": 24, "src": "assets/film/flight-1080.mp4",
            "portrait": "assets/film/flight-portrait.mp4",
            "chapters": {n: round(st / total, 4) for (n, _), st in zip(CHAPTERS, starts)}}
    (film / "film.json").write_text(json.dumps(meta, indent=2))
    for v in (hd, portrait):
        print(f"{v.name}: {v.stat().st_size / 1e6:.1f} MB")


def stills(master: Path, starts, total):
    img = ROOT / "assets" / "img"
    img.mkdir(parents=True, exist_ok=True)
    picks = {  # name: seconds into the master
        "poster": 5.6, "island": 5.0, "campus": starts[1] + 6.5, "ai": starts[2] + 4.0,
        "robotics": starts[3] + 3.5, "launch": starts[4] + 4.2, "finale": starts[5] + 5.0,
    }
    with tempfile.TemporaryDirectory() as tmp:
        for n, t in picks.items():
            p = Path(tmp) / f"{n}.png"
            run(["ffmpeg", "-y", "-v", "error", "-ss", f"{min(t, total - 0.1):.2f}", "-i", str(master), "-frames:v", "1", "-vf", HD, str(p)])
            Image.open(p).convert("RGB").save(img / f"{n}.webp", "WEBP", quality=88, method=5)
    Image.open(img / "finale.webp").convert("RGB").resize((1200, 675)).save(img / "og.jpg", "JPEG", quality=85)
    print("stills:", ", ".join(picks))


if __name__ == "__main__":
    master = ROOT / "clips" / "master.mp4"
    total, starts = build_master(master)
    print(f"master: {total:.2f}s")
    for (n, _), s in zip(CHAPTERS, starts):
        print(f"  {n:<9} starts at {s / total:.4f}  ({s:.2f}s)")
    web_videos(master, total, starts)
    stills(master, starts, total)
