# 0.3 Startup sky colours

**Goal:** no dark purple flash on load; the first frames match the day sky.

**Files:** `sources/style/general.styl` (`html` background), `sources/Game/Overlay.js` (transition overlay colours), `sources/Game/Cycles/DayCycles.js` (presets).

## Steps
1. [x] Page background: light sky gradient `#bfe1ff → #7fb4f0`.
2. [x] Respawn/transition overlay uses the same sky colours.
3. [ ] Loading progress UI (Intro) restyled to the sky palette with a sakura petal loader.
4. [ ] Decide on the day cycle: keep a fixed "golden afternoon" or tune dusk/night presets (all four presets are currently identical copies of "day").
5. [ ] Tune `fogColorA/B` and `lightColor` to the concept: warm sun, purple-blue haze.

## Done when
- [ ] From page open to first playable frame the screen never goes dark purple.
