# 6.1 Story text overlay

**Goal:** the four story lines appear as soft floating text.

**Files:** `sources/index.html`, `sources/style/*.styl`, new `sources/Game/StoryText.js`.

## Steps
1. [ ] One HTML element, centred near the top; fade in, hold ~3 s, fade out (CSS transitions, no per-frame DOM work).
2. [ ] Lines: start "Welcome to the Sakura Festival!" then "Light the five festival lanterns to begin the celebration."; on `lit` "A lantern glows! (n/5)"; on `finale` "The festival begins! Thank you for visiting."
3. [ ] Returning visitors with progress: skip the intro lines.
4. [ ] Queue lines so two never overlap.

## Done when
- [ ] All four lines show at the right moments and never block input.
