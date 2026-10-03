# 4.4 Fireworks

**Goal:** simple, bright fireworks over the pagoda for the finale.

**Files:** new `sources/Game/World/Fireworks.js`, `sources/Game/World/World.js`.

## Steps
1. [ ] One `InstancedMesh` of small glowing quads (~200 particles per shell, a pool of 4 shells).
2. [ ] Animate fully in TSL from a launch time uniform: rise, burst outward, fall with gravity, fade.
3. [ ] Colours: pink, gold, white, soft cyan.
4. [ ] Position from the `refFireworks` empty (M1.6), fallback above the map centre.
5. [ ] `launch(count, interval)` API; construct inside `World.step(1)`'s `safe()`.

## Done when
- [ ] A sequence of ~8 shells looks good and costs only a handful of draw calls.
