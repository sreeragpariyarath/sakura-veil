# 2.2 Interaction and card opening

**Goal:** near a lantern, "press E" appears; pressing it opens that lantern's portfolio card.

**Files:** `sources/Game/World/Lanterns.js`, `sources/index.html`, `sources/Game/Modals.js`.

## Steps
1. [x] For each lantern call `game.interactivePoints.create(position, label, align, STATE_CONCEALED, onInteract)`, with the point slightly above the lamp.
2. [x] Add five `.js-modal` blocks in `index.html` (`data-name="lantern-about"`, …) with placeholder text.
3. [x] `onInteract` opens the card with `game.modals.open('lantern-<id>')`.
4. [x] Check the input filter: E must work while flying (`wandering`), and the card must close back into flying.
5. [ ] Test with keyboard, gamepad and the mobile joystick tap.

## Done when
- [x] Each of the 5 lanterns opens its own card and closing it returns to flying.

## Notes
- `InteractivePoints` labels now billboard toward the camera (the original fixed 45° orientation was invisible from behind with the free camera).
- Step 5 (gamepad and mobile tap) still needs a check on real devices.
