# Sakura Veil Roadmap

The game is built around one story: the **Sakura Festival** ([docs/story/STORY.md](../story/STORY.md)). Rei lights five festival lanterns in a bright sakura garden; each lantern opens one portfolio card, and lighting all five starts the celebration.

The work is split into **master phases**, each master phase into **sub-phases**, and each sub-phase has its own `plan.md` with numbered steps and a **Done when** checklist. Work through one sub-phase at a time. A sub-phase is done only when its checklist passes in the running game (`npm run dev`) and `npm run build` succeeds.

There is no 3D modeller on the team, so every model comes from free libraries (see [Free asset sources](#free-asset-sources)) and is adapted in Blender (scale, pivot, materials, merging) rather than modelled from scratch. Record every downloaded asset and its licence in `ASSET_CREDITS.md`.

## Master phases

| # | Master phase | Goal | Status |
|---|---|---|---|
| M0 | [Foundation](m0-foundation/README.md) | Controls, camera and colours feel good; known errors fixed | In progress |
| M1 | [Festival Garden](m1-festival-garden/README.md) | The single garden from the concept image, with 5 lantern spots | Not started |
| M2 | [Lantern gameplay loop](m2-lantern-loop/README.md) | Fly → press E → lantern lights → card opens → progress saved | Not started |
| M3 | [Portfolio content](m3-portfolio-content/README.md) | Real About / Experience / Skills / Projects / Contact cards | Waiting on content |
| M4 | [Celebration](m4-celebration/README.md) | Festival level, petals, glow, confetti and the fireworks finale | Not started |
| M5 | [Rei](m5-rei/README.md) | Rei matches the concept turnaround | Postponed (Rei model being reworked) |
| M6 | [Audio and UI](m6-audio-ui/README.md) | Story text, lantern counter, festival music, SFX, loading screen | Not started |
| M7 | [Performance and release](m7-release/README.md) | Runs well on laptops and phones, deployed | Not started |
| Later | [Extra areas](later-extra-areas/README.md) | Optional ideas after release | Parked |

## Build order

M0 → M2 → M1 → M3 → M4 → M6 → M7. M5 slots in whenever the new Rei model is ready.

M2 comes before M1 on purpose: the lantern loop is built and tested on the current map with placeholder positions, so the game is playable end to end early. M1 then gives the lanterns their final homes in the festival garden.

## How to work a sub-phase

1. Open the sub-phase `plan.md` and copy its steps into your task list.
2. Do the steps in order; each step should be small enough for one sitting.
3. After each step, run the game and check nothing regressed.
4. Tick the **Done when** checklist, update the status table in the master phase README, commit.

## Free asset sources

| Source | Good for | Licence to check |
|---|---|---|
| [Quaternius](https://quaternius.com) | Stylized nature packs, Japanese props, characters | CC0 |
| [Kenney](https://kenney.nl/assets) | Props, nature, UI, audio | CC0 |
| [Poly Pizza](https://poly.pizza) | Low-poly single models (torii, lanterns, pagoda, bridges) | Mostly CC0 / CC-BY, per model |
| [Sketchfab](https://sketchfab.com) (filter: Downloadable, CC0/CC-BY) | Hero models: pagoda, sakura trees | Per model, credit CC-BY authors |
| [Poly Haven](https://polyhaven.com) | Textures, HDRIs, rocks | CC0 |
| [ambientCG](https://ambientcg.com) | Ground, stone path, wood textures | CC0 |
| [Freesound](https://freesound.org), [Pixabay audio](https://pixabay.com/sound-effects) | Festival music, chimes, fireworks, ambience | CC0 / per sound |

Rule of thumb: prefer low-poly stylized packs from one source so the style matches; avoid photoreal scans.
