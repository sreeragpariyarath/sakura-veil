# 2.5 Finale event

**Goal:** lighting the fifth lantern fires one `finale` event that the celebration and UI react to.

**Files:** `sources/Game/World/Lanterns.js`.

## Steps
1. [ ] When the count reaches 5 for the first time, trigger `lanterns.events.trigger('finale')` after the card closes.
2. [ ] Store `finaleSeen` so a returning visitor doesn't replay it on load; add a debug button to replay it.
3. [ ] Temporary placeholder: log "Festival begins!" and pop confetti until M4/M6 are in.

## Done when
- [ ] The finale fires exactly once, after the last card is closed.
