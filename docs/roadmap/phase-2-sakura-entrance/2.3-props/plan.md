# 2.3 Props

## Steps
1. [ ] Download torii, lanterns, bridge, rocks, fences (see table in phase README); log credits.
2. [ ] Blender per prop: scale, pivot at base, merge meshes, one material using the palette texture where possible.
3. [ ] Lantern glow: emissive material plus a camera-facing halo sprite; real point lights at most 2–3.
4. [ ] Place via reference empties; instance repeated props.
5. [ ] Simplified colliders (boxes) for torii pillars, bridge, rocks.
6. [ ] Compress with `npm run compress` and check file sizes.

## Done when
- [ ] Each prop exists once in GPU memory and draw calls stay under budget.
