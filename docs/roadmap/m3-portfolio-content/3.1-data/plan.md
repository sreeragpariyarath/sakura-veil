# 3.1 Portfolio data file

**Goal:** all card content is in one data file.

**Files:** new `sources/data/portfolio.js`, `sources/Game/World/Lanterns.js`.

## Steps
1. [ ] Create `portfolio.js` exporting one entry per lantern id: `about`, `experience`, `skills`, `projects`, `contact`.
2. [ ] Shape: `{ title, intro, items: [...] }`; projects items have `title`, `image`, `line`, `url`.
3. [ ] Fill with placeholder text.
4. [ ] Build the card HTML from this data once at startup (not every frame), replacing the hand-written placeholders from M2.2.

## Done when
- [ ] Changing text in `portfolio.js` changes the card in game.
