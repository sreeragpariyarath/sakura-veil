# M2: Lantern gameplay loop

The core of the game: fly to a festival lantern, press **E**, the lantern lights up and opens a portfolio card. Five lanterns, progress saved between visits, and a finale event when all five are lit.

Built first on the current map with placeholder positions, then moved onto the `refLantern*` empties once M1.1 exists.

| Sub-phase | Plan | Status |
|---|---|---|
| 2.1 `Lanterns.js` and placement | [plan](2.1-lanterns-system/plan.md) | Done |
| 2.2 Interaction and card opening | [plan](2.2-interaction/plan.md) | Done (gamepad/mobile untested) |
| 2.3 Lit state | [plan](2.3-lit-state/plan.md) | Not started |
| 2.4 Saved progress | [plan](2.4-progress/plan.md) | Not started |
| 2.5 Finale event | [plan](2.5-finale-event/plan.md) | Not started |

## Reuses
- `japanOldLampModel` (`japan_old_lamp.glb`), already loaded in `Game.js`.
- `InteractivePoints.create(position, text, align, state, interactCallback, …)` (see `World/Areas/SocialArea.js` for a working example).
- `Modals.open(name)` with `.js-modal` blocks in `sources/index.html`.
- `World/Confetti.js` (`world.confetti.pop(position)`) for small bursts.
