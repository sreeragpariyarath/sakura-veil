# 2.2 Interaction and card opening

**Goal:** near a lantern, "press E" appears; pressing it opens that lantern's portfolio card.

**Files:** `sources/Game/World/Lanterns.js`, `sources/index.html`, `sources/Game/Modals.js`.

## Steps
1. [ ] For each lantern call `game.interactivePoints.create(position, label, align, STATE_CONCEALED, onInteract)`, with the point slightly above the lamp.
2. [ ] Add five `.js-modal` blocks in `index.html` (`data-name="lantern-about"`, …) with placeholder text.
3. [ ] `onInteract` opens the card with `game.modals.open('lantern-<id>')`.
4. [ ] Check the input filter: E must work while flying (`wandering`), and the card must close back into flying.
5. [ ] Test with keyboard, gamepad and the mobile joystick tap.

## Done when
- [ ] Each of the 5 lanterns opens its own card and closing it returns to flying.
