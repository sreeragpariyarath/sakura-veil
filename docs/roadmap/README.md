# Sakura Veil Roadmap

The project is split into **phases**, each phase into **sub-phases**, and each sub-phase has its own `plan.md` with numbered steps. Work through one sub-phase at a time. A sub-phase is done only when its **Done when** checklist passes in the running game (`npm run dev`) and `npm run build` succeeds.

There is no 3D modeller on the team, so every model comes from free libraries (see [Free asset sources](#free-asset-sources)) and is adapted in Blender (scale, pivot, materials, merging) rather than modelled from scratch. Record every downloaded asset and its licence in `ASSET_CREDITS.md`.

Target look: the concept sheet (Rei turnaround and the sakura entrance screenshot). Target performance: see `phase-6-performance-release`.

## Phases

| # | Phase | Goal | Status |
|---|---|---|---|
| 0 | [Foundation and controls](phase-0-foundation/README.md) | The game feels good to move around before any new art is added | In progress |
| 1 | [Rei character](phase-1-rei/README.md) | Rei matches the concept turnaround | Not started |
| 2 | [Sakura Entrance (vertical slice)](phase-2-sakura-entrance/README.md) | One small area that looks like the concept screenshot | Not started |
| 3 | [Interaction and portfolio content](phase-3-interaction/README.md) | Locations reveal portfolio content | Not started |
| 4 | [More areas](phase-4-areas/README.md) | Shrine, Spirit Path, Memory Garden, Archive, Project Chambers, Restored Core | Not started |
| 5 | [Audio and UI](phase-5-audio-ui/README.md) | Ambient sound, SFX, restyled menus and loading screen | Not started |
| 6 | [Performance and release](phase-6-performance-release/README.md) | Runs well on laptops and phones, deployed | Not started |

Phase 2 is the most important milestone: one polished area proves the art direction and the performance budget before the world grows.

## How to work a sub-phase

1. Open the sub-phase `plan.md` and copy its steps into your task list.
2. Do the steps in order; each step should be small enough for one sitting.
3. After each step, run the game and check nothing regressed.
4. Tick the **Done when** checklist, update the status table in the phase README, commit.

## Free asset sources

| Source | Good for | Licence to check |
|---|---|---|
| [Quaternius](https://quaternius.com) | Stylized nature packs, Japanese props, characters | CC0 |
| [Kenney](https://kenney.nl/assets) | Props, nature, UI, audio | CC0 |
| [Poly Pizza](https://poly.pizza) | Low-poly single models (torii, lanterns, pagoda, bridges) | Mostly CC0 / CC-BY, per model |
| [Sketchfab](https://sketchfab.com) (filter: Downloadable, CC0/CC-BY) | Hero models: cloaked ghost, pagoda, sakura trees | Per model, credit CC-BY authors |
| [Poly Haven](https://polyhaven.com) | Textures, HDRIs, rocks | CC0 |
| [ambientCG](https://ambientcg.com) | Ground, stone path, wood textures | CC0 |
| [Mixamo](https://www.mixamo.com) | Humanoid animations (not needed for Rei, the cloak is shader-animated) | Free with Adobe account |
| [Freesound](https://freesound.org), [Pixabay audio](https://pixabay.com/sound-effects) | Ambience, wind, chimes | CC0 / per sound |

Rule of thumb: prefer low-poly stylized packs from one source per area so the style matches; avoid photoreal scans.
