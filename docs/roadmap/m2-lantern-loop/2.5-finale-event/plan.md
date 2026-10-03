# 2.5 Finale event

**Goal:** lighting the fifth lantern fires one `finale` event that the celebration and UI react to.

**Files:** `sources/Game/World/Lanterns.js`.

## Steps
1. [x] When the count reaches 5 for the first time, trigger `lanterns.events.trigger('finale')` after the card closes.
2. [x] Store `finaleSeen` so a returning visitor doesn't replay it on load; add a debug button to replay it.
3. [x] Temporary placeholder: log "Festival begins!" and pop confetti until M4/M6 are in.

## Done when
- [x] The finale fires exactly once, after the last card is closed.

## Notes
- If all five are saved as lit but the finale was never seen (page left before the last card closed), it plays 3 s after load.
- Debug panel (`#debug` → 🏮 Lanterns): "Light all", "Replay finale", "Reset lanterns".
