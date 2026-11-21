# Techfest 2027 — 3D scroll website

Scroll to fly: six AI-generated shots are stitched into one 37-second drone flight
(clouds open → the island → AI Valley → Robotics District → Launchpad →
fireworks finale), upscaled to sharp 1080p, and played by your scroll. Below the flight
the page has the full festival site: a 3D rotating ring of the five zones,
events, schedule, countdown, passes, FAQ and footer.

## Run it

```bash
python tools/serve.py
```

Open http://localhost:4189. Any static host (GitHub Pages, Netlify, Vercel) works too: upload the folder.

## Change the details

- **Dates, city, countdown, register link:** `js/data.js` → `FEST`
- **Zones, events, schedule text:** `js/data.js`
- **Words over the film:** `index.html` (the `.cap` blocks)

## Swap or regenerate a shot

1. Replace a file in `clips/src/` (`01-clouds.mp4` … `06-finale.mp4`). The prompts are in `VIDEO-SCRIPT.md`.
2. Rebuild:

```bash
python -I tools/build_film.py
```

The build removes the generator's corner ✦ watermark, strips the audio, cross-fades the shots, denoises + upscales to 1080p with sharpening, and writes `assets/film/flight-1080.mp4` (desktop, ~37 MB) and `flight-portrait.mp4` (phones, ~15 MB). Exporting the source clips at 1080p makes it sharper still.
