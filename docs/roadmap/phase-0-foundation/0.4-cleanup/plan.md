# 0.4 Resource and legacy cleanup

**Goal:** remove driving-game leftovers and missing resources that silently disable systems.

**Files:** `sources/Game/Game.js`, `sources/Game/World/World.js`, `sources/Game/World/Areas/*`, `sources/Game/Respawns.js`.

## Steps
1. [ ] List every `game.resources.X` that is read but not loaded (`areasModel`, `respawnsReferencesModel`, `benchesModel`, `bricksModel`, `poleLightsModel`, `explosiveCratesModel`, `flowersReferencesModel`, `tornadoPathReferencesModel`, `bushesReferences`).
2. [ ] For each: decide keep (will get a new asset in Phase 2/3) or remove (system not wanted: bowling, circuit, toilet, explosive crates, tornado, cookie...).
3. [ ] Remove unwanted systems from `World.step` and `Game.init`, and their resources/sounds.
4. [ ] Add a small `.env.example` documenting every `VITE_*` variable with safe defaults.
5. [ ] Remove the `VITE_DAY_CYCLE_PROGRESS` mention or wire it into `DayCycles` like `YearCycles`.
6. [ ] Console must be free of errors and warnings on load.

## Done when
- [ ] No console errors; `World.step` logs no "failed to construct" messages.
