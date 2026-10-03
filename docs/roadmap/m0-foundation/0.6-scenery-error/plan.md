# 0.6 Fix the scenery error

**Goal:** `World.step(1)` no longer logs `"scenery" failed to construct` (a `traverse` of `undefined`).

**Files:** `sources/Game/World/Scenery.js`, `sources/Game/World/World.js`, `sources/Game/Game.js`.

## Steps
1. [ ] Reproduce: run `npm run dev`, open the console, note the full stack trace.
2. [ ] Find which `game.resources.X` Scenery reads and whether `Game.js` loads it.
3. [ ] Either load the missing resource, or guard the code so Scenery skips what isn't there.
4. [ ] Reload and check the scenery that should appear is visible.

## Done when
- [ ] No "failed to construct" message for scenery on load.
- [ ] `npm run build` succeeds.
