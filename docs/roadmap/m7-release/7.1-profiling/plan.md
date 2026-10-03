# 7.1 Budgets and profiling

## Budgets
- Desktop: ≤150 draw calls, ≤600k triangles.
- Mobile: ≤80 draw calls, ≤150k triangles.
- First download ≤20 MB.

## Steps
1. [ ] Measure with stats-gl and the browser GPU profiler on a mid laptop and a mid Android phone.
2. [ ] Check the worst moments: finale (fireworks + petals + confetti) and the view over the whole garden.
3. [ ] Fix the biggest cost first (transparent petals, foliage, shadows, post-processing).

## Done when
- [ ] Stays within budget during the finale on both devices.
