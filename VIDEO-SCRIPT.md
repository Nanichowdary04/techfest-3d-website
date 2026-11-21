# Techfest 2027 — video script for the 3D scroll webpage

One continuous drone flight: **clouds open → floating island → AI Valley → Robotics District → rocket launch → night finale at the arena.**
Scrolling the webpage plays this flight forward and backward. All titles ("TECHFEST 2027", zone names, dates) are added by the webpage, **not** in the video — AI tools garble text.

---

## Settings (every clip)

| Setting | Value |
|---|---|
| Mode | **Image-to-video** (start frame = the image named in each shot) |
| Aspect ratio | **16:9** |
| Resolution | Highest your free plan allows (1080p, else 720p) |
| Length | **5 s** (8 s is fine in Google Flow) |
| Camera preset | None / auto — the prompt describes the motion |
| Audio | Off (the page has no sound) |

## Paste after EVERY day prompt (stills A + shots 1–5)

```
Photorealistic cinematic aerial drone footage, golden-hour sunlight, soft volumetric haze, natural warm colors, clean futuristic architecture in white concrete, brushed metal and glass with small cyan light accents, lush green landscape, highly detailed, 8k, smooth stabilized gimbal camera, no text.
```

## Negative prompt (every clip, if the tool has the box)

```
text, letters, words, logo, watermark, signage, subtitles, UI, HUD, neon, cyberpunk, blue color cast, people close-up, faces, morphing, melting, warped buildings, duplicate objects, extra buildings appearing, flicker, jitter, shaky camera, fast motion, hard cut, scene change, low resolution, blurry
```

---

## STILL A — the hero image (make this first)

Text-to-image, 16:9. Make 3–4 and keep the cleanest one: island in the centre, natural colours, **no text anywhere**.

```
Wide aerial view of a huge floating island high above a sea of white clouds at golden hour. The island carries a futuristic tech-festival campus: a circular white open-air stadium in the centre with a thin beam of light rising into the sky, a cluster of large glass domes, sleek white towers, a launch pad with a tall white rocket on one edge, green hills, trees, and rivers that pour off the island edges as long waterfalls into the clouds below. A jagged rocky underside hangs beneath the island. Two or three smaller floating islets drift nearby. Camera slightly above and in front of the island; the island fills the centre third of the frame with lots of open sky and clouds around it.
```
+ the day style line.

---

## SHOT 1 — Clouds open (0–15% of scroll)
**Start frame:** Still A · **Save as:** `clips/01-clouds.mp4`

Generate the clouds *closing in*; the page plays it in reverse so the clouds **open** and land exactly on the island.

```
Thick soft white clouds slowly roll in from the left, the right and from below, drifting toward the camera and gradually covering the floating island, until by the final frame the entire frame is completely filled with bright white clouds and nothing else is visible. The island itself stays perfectly still and unchanged. Locked camera, very slow smooth motion.
```

## SHOT 2 — Approach the island (15–32%)
**Start frame:** Still A · **Save as:** `clips/02-approach.mp4`

```
Smooth drone flight: the camera glides slowly forward and gently descends toward the floating island. The central stadium with its light beam grows larger, waterfalls pour off the island edges into the clouds, a few small drones fly past in the distance. By the final frame the camera is just above the island's green hills, looking across the campus toward the glass domes. The island and its buildings stay consistent, no new buildings appear.
```

## SHOT 3 — AI Valley (32–50%)
**Start frame:** last frame of shot 2 · **Save as:** `clips/03-ai-valley.mp4`

```
The camera keeps gliding forward at low altitude over a valley of large transparent glass domes. Inside each dome a softly glowing sphere of light pulses slowly, thin luminous lines connect the domes across the grass like a neural network, a small river winds between them, pink cherry-blossom trees. Slow steady forward motion with a gentle bank to the left. Buildings stay solid and consistent.
```

## SHOT 4 — Robotics District (50–67%)
**Start frame:** last frame of shot 3 · **Save as:** `clips/04-robotics.mp4`

```
The camera flies slowly along a wide, clean futuristic boulevard between white buildings. White humanoid robots walk along the street in the distance, large industrial robotic arms move in an open-air workshop, and inside a glass-walled arena two combat robots clash and throw bright orange sparks. A transparent hyperloop tube with a sleek pod gliding through it runs overhead. Steady forward motion, level horizon.
```

## SHOT 5 — Rocket launch (67–84%)
**Start frame:** last frame of shot 4 · **Save as:** `clips/05-launch.mp4`

```
The camera rises up and out over the edge of the floating island toward a launch pad on a cliff at the island's rim. A tall white rocket on the pad ignites: bright orange flame and huge billowing white smoke clouds spread across the pad, and the rocket lifts off slowly and climbs into the golden sky. The camera tilts up gently to follow it as the sun lowers and the sky warms toward dusk.
```

---

## STILL B — the night arena (for shot 6)

Text-to-image, 16:9. Use **this** style line instead of the day one:

```
Night aerial view of a huge circular open-air stadium on a floating island above moonlit clouds. Thousands of tiny warm lights fill the stands, a bright central stage glows, wide white and warm-gold light beams sweep up into the sky, colourful fireworks burst above the stadium, the waterfalls and glass domes of the island glow softly around it, stars in a deep black sky. Keep clear empty sky in the upper middle of the frame.
```
Night style line:
```
Photorealistic cinematic aerial drone footage at night, warm golden stage lighting, natural colors, highly detailed, 8k, smooth stabilized gimbal camera, no text.
```
(Remove nothing else; the negative prompt stays the same.)

## SHOT 6 — Finale at the Innovation Arena (84–100%)
**Start frame:** Still B · **Save as:** `clips/06-finale.mp4`

```
Slow cinematic push-in toward the stadium at night. Fireworks burst in gold, white and soft pink above the arena, the stage light beams sweep slowly across the sky, sparkling confetti drifts down, the lights in the stands shimmer. Very smooth slow camera move; the stadium stays consistent. By the final frame the fireworks fill the upper part of the frame above the glowing stadium, with clear sky left in the upper middle.
```

---

## How to chain the shots

1. Make **Still A**, pick the best one, save it as `clips/still-a.png`.
2. Shots 1 and 2 both start from Still A.
3. Shots 3, 4, 5 each start from the **last frame of the clip before**. Use the tool's "use last frame" / "extend" option, or grab it with `ffmpeg -sseof -0.05 -i clip.mp4 -frames:v 1 last.png`.
4. Make **Still B** (`clips/still-b.png`) and use it for shot 6.
5. Check each clip before moving on: no text or logos, no melting or morphing buildings, no sudden cut. If one is bad, **regenerate only that one**.

## What the webpage shows on top (added in code, not in the video)

| Scroll | Clip | On-screen text |
|---|---|---|
| 0–15% | Clouds open | **TECHFEST 2027** · The future is now · [your dates · city] |
| 15–32% | Approach | Welcome to the island · Three days of science, engineering and imagination |
| 32–50% | AI Valley | **AI Valley** · Hackathons, labs, live model battles |
| 50–67% | Robotics | **Robotics District** · Robowars, humanoids, automation |
| 67–84% | Launch | **Launchpad** · Rocketry, drones, space tech |
| 84–100% | Finale | **Innovation Arena** · Keynotes, pro-nights, finale · **Register** |

Below the flight the page continues with the full Techfest site: events, schedule, passes, FAQ, footer.
