# 🏝️ Castaway: Island Survival Tycoon

Four survivors — **Robin, Lenni, Leif and Erim** — wash ashore after a shipwreck.
What begins as a desperate scramble for food, water and shelter slowly grows into
a thriving island colony with farms, workshops, industry, trade routes and, finally,
a Grand Monument crowning a prosperous town.

A complete, single‑player **survival‑colony tycoon** built in plain HTML, CSS and
JavaScript — no build step, no frameworks, no dependencies. Just open it and play.

---

## ▶️ Play

Open **`index.html`** in any modern browser (Chrome, Edge, Firefox, Safari).
That's it — it runs straight from the file system. The game **autosaves** to your
browser and resumes where you left off.

> Tip: it also works great served from any static host. No server logic is required.

---

## 🎮 How to play

A 2–4 hour playthrough that deliberately starts slow and tense, then opens up.

1. **Assign jobs** (🧰 Jobs / 🧑‍🤝‍🧑 Survivors) — idle survivors produce nothing. Put
   them on foraging, water, fishing, mining, building and more.
2. **Build** (🏗️ Build) — raise shelters, storage and workshops. Your **Builders**
   construct everything in the queue. Buildings upgrade through multiple levels.
3. **Research** (🔬 Research) — a Researcher unlocks 100+ technologies: new buildings,
   jobs, production chains and upgrades across 8 disciplines.
4. **Explore** (🧭 Explore) — send expeditions to discover 10 island regions, each
   with unique resources, rare finds and risks.
5. **Survive & thrive** — keep everyone fed, watered, rested and happy. A content,
   well‑housed colony attracts new settlers and grows on its own.
6. **Follow quests** (🎯) and chase **217 achievements** (🏆). Level up your four heroes
   and spend skill points in their personal skill trees (⭐).

**Goal:** advance through 7 stages — *Shipwreck Survival → Permanent Camp → Village →
Growing Settlement → Colony → Island Town → Prosperous Island* — and build the
**Grand Monument** to win. Victory unlocks endless **sandbox** mode.

**Controls:** `Space` pause/resume · `1` `2` `3` speed · click the speed buttons
top‑right · `☰` menu (save/load/settings/export) · `?` how‑to.

---

## ✨ Features

- **Deep worker‑assignment economy** with experience, morale, energy and full
  production chains (wood→lumber→planks, ore→iron→steel, clay→brick, hide→leather,
  crops→bread, and more).
- **65 buildings** across 8 categories, each with upgrade levels and real gameplay impact.
- **107 technologies** forming a meaningful prerequisite tree — every upgrade changes play.
- **184 dynamic events** (weather, fortune, danger, wildlife, discovery, trade, mystery)
  with branching choices.
- **113 quests** — a 22‑step main storyline, milestones, per‑character arcs, exploration
  and hidden secret quests.
- **217 achievements** including secret and challenge ones.
- **Four named heroes** with independent leveling, skill trees and settlement‑wide bonuses.
- **Population growth, settler immigration, trade & coin economy, recruiting.**
- **Living settlement view** with a day/night cycle that visibly grows from a lone
  campfire to a bustling town.
- **Polished UI**: tooltips, smooth panels, production rate readouts, build previews,
  toasts, and a tropical theme. Fully responsive (desktop & mobile).
- **Lightweight synthesized audio** — ambient ocean, gentle music and UI/feedback sounds
  (all toggleable), generated in‑browser with WebAudio (no audio files).
- **Robust saves**: autosave, 3 manual slots, and export/import save codes — all in
  `localStorage`.

---

## 🗂️ Project structure

```
index.html              # loads everything in order; open this to play
css/style.css           # the complete tropical UI theme
js/
  core/                 # utils, central state, save system, game loop (engine)
  data/                 # content & balance: config, resources, jobs, regions,
                        #   buildings, tech, characters, events, quests, achievements
  systems/              # economy, survival, construction, colony, research,
                        #   exploration, trade, effects, events, quests, achievements
  ui/                   # audio, settlement renderer, full interface controller
  main.js               # bootstrap
assets/                 # drop robin/lenni/leif/erim .jpeg here (see assets/README.md)
DESIGN.md               # the design contract (economy, schemas, pacing)
tools/                  # headless dev tests (not part of the game)
```

The code is intentionally modular with a single global `CG` namespace and a small
internal event bus, so systems stay decoupled. There are no placeholders or TODOs —
every system is wired and playable.

## 🖼️ Character photos

The game references `assets/robin.jpeg`, `lenni.jpeg`, `leif.jpeg`, `erim.jpeg`.
Add those files and the portraits appear automatically; until then the game shows
generated avatars so nothing looks unfinished. See `assets/README.md`.

## 🧪 Developer tests (optional)

The game itself needs no dependencies. The `tools/` folder contains headless tests:

```
node tools/harness.js   # validates all content IDs + simulates a full playthrough
node tools/uitest.js    # boots the real UI in jsdom and exercises every screen
                        #   (this one needs: npm install jsdom)
```
