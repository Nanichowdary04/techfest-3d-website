/* Techfest 2027 — all editable content in one place. */

export const FEST = {
  dates: "15—17 January 2027",           // ← put your real dates here
  city: "Mumbai",                         // ← and your city
  venue: "Innovation Arena",
  start: "2027-01-15T09:00:00+05:30",     // countdown target (ISO time)
  registerUrl: "",                        // ticketing link; empty shows "opening soon"
};

/* The 3D ring: one panel per zone, image = a frame from the flight. */
export const ZONES = [
  { name: "The Island", tag: "Festival grounds", img: "assets/img/campus.webp",
    desc: "A campus above the clouds, with the arena and its beam of light at its heart.",
    events: [["Opening ceremony", "Day 1"], ["Campus tours", "All days"]] },
  { name: "AI Valley", tag: "AI & machine learning", img: "assets/img/ai.webp",
    desc: "Glass labs with live model battles. The lights stay on all night.",
    events: [["Neural Forge Hackathon", "₹5L"], ["Agent Arena", "₹3L"]] },
  { name: "Robotics District", tag: "Robotics & automation", img: "assets/img/robotics.webp",
    desc: "A steel-and-glass cage, 60 kg combat bots and humanoids on patrol.",
    events: [["RoboWars: Titan Clash", "₹6L"], ["Swarm Rescue", "₹2.5L"]] },
  { name: "Launchpad", tag: "Space & aerospace", img: "assets/img/launch.webp",
    desc: "Rocketry, CanSats and drone racing on the cliffs at the island's edge.",
    events: [["CanSat Descent", "₹3L"], ["Drone Racing League", "₹2L"]] },
  { name: "Innovation Arena", tag: "Keynotes & Pro-Nights", img: "assets/img/finale.webp",
    desc: "Keynotes by day, Pro-Nights after dark, and the fireworks finale.",
    events: [["Keynote series", "Free"], ["Pro-Night finale", "Day 3"]] },
];

export const EVENTS = [
  { zone: "AI Valley", title: "Neural Forge Hackathon", desc: "36 hours from idea to a live AI demo.", prize: "₹5L", team: "2–4" },
  { zone: "AI Valley", title: "Agent Arena", desc: "Autonomous agents compete in a live city simulation.", prize: "₹3L", team: "1–3" },
  { zone: "Robotics", title: "RoboWars: Titan Clash", desc: "60 kg combat robots in a steel-and-glass cage.", prize: "₹6L", team: "3–6" },
  { zone: "Robotics", title: "Swarm Rescue", desc: "Guide a robot swarm through a collapsed-building course.", prize: "₹2.5L", team: "2–4" },
  { zone: "Launchpad", title: "CanSat Descent", desc: "Build a satellite the size of a soda can. We drop it from 500 m.", prize: "₹3L", team: "3–5" },
  { zone: "Launchpad", title: "Drone Racing League", desc: "FPV drones through a ring course at 120 km/h.", prize: "₹2L", team: "1–2" },
  { zone: "Arena", title: "Keynote Series", desc: "Founders, scientists and engineers on the main stage.", prize: "Free", team: "Open" },
  { zone: "Arena", title: "Pro-Night Finale", desc: "Live music, light beams and the fireworks finale.", prize: "Pass", team: "Open" },
];

export const SCHEDULE = [
  { day: "01", name: "Ignition", date: "Friday", slots: [
    ["09:00", "Opening ceremony", "Innovation Arena"],
    ["11:00", "Neural Forge begins", "AI Valley"],
    ["15:00", "RoboWars qualifiers", "Robotics District"],
    ["20:00", "Pro-Night: Live", "Innovation Arena"],
  ]},
  { day: "02", name: "Orbit", date: "Saturday", slots: [
    ["10:00", "CanSat drone drops", "Launchpad"],
    ["13:00", "Agent Arena finals", "AI Valley"],
    ["16:00", "Keynote: the next 100 years of flight", "Innovation Arena"],
    ["19:30", "Drone Racing League", "Launchpad"],
  ]},
  { day: "03", name: "Launch", date: "Sunday", slots: [
    ["09:00", "Hackathon demos", "AI Valley"],
    ["13:00", "Titan Clash finals", "Robotics District"],
    ["17:00", "Awards and grants", "Innovation Arena"],
    ["21:00", "Fireworks finale", "Innovation Arena"],
  ]},
];
