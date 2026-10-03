# 2.4 Saved progress

**Goal:** lit lanterns stay lit when the visitor comes back.

**Files:** `sources/Game/World/Lanterns.js`.

## Steps
1. [ ] Store the list of lit ids in `localStorage` (key `sakura-veil-lanterns`), every read/write in try/catch.
2. [ ] On load, restore lit lanterns instantly (no burst, no sound).
3. [ ] Add a debug button "Reset lanterns" under `#debug`.
4. [ ] Test in a private window: the game must work with storage unavailable.

## Done when
- [ ] Reloading keeps progress; private window starts fresh without errors.
