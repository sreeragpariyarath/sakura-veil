# 2.1 `Lanterns.js` and placement

**Goal:** five festival lanterns stand in the world, built by one small system.

**Files:** new `sources/Game/World/Lanterns.js`, `sources/Game/World/World.js`.

## Steps
1. [x] Create `Lanterns.js` with the usual `this.game = Game.getInstance()` pattern.
2. [x] Define the 5 lanterns as data: `{ id, name, modal, position }` (ids `about`, `experience`, `skills`, `projects`, `contact`), with placeholder positions near spawn.
3. [x] Clone `game.resources.japanOldLampModel.scene` for each lantern; add it through `Objects` with a simple fixed box collider.
4. [x] Construct it in `World.step(1)` inside `safe('lanterns', …)` so a failure can't block the intro.
5. [x] If `references.items.get('lantern…')` exist (after M1.1), use those positions instead of the placeholders.
6. [x] Expose it as `game.world.lanterns`.

## Done when
- [x] Five lanterns are visible on load with no console errors.
- [x] `npm run build` succeeds.
