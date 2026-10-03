# 2.4 Saved progress

**Goal:** lit lanterns stay lit when the visitor comes back.

**Files:** `sources/Game/World/Lanterns.js`.

## Steps
1. [x] Store the list of lit ids in `localStorage` (key `sakura-veil-lanterns`), every read/write in try/catch.
2. [x] On load, restore lit lanterns instantly (no burst, no sound).
3. [x] Add a debug button "Reset lanterns" under `#debug`.
4. [x] Test in a private window: the game must work with storage unavailable.

## Done when
- [x] Reloading keeps progress; private window starts fresh without errors.

## Notes
- Lantern storage is guarded, but older code (`Server.js`, `Player.js`) reads `localStorage` unguarded, so a browser that blocks storage entirely still fails at startup. Fix in M0.4 cleanup.
