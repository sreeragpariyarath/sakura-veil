# 1.1 Source and import Rei

**Assets needed:** one hooded cloak/ghost mesh (3–8k triangles), one small talisman mesh.
**Where:** Sketchfab "hooded ghost / reaper / cloak" (CC0/CC-BY, stylized), Poly Pizza, or the existing `static/character/ghost.glb`.

## Steps
1. [ ] Collect 3 candidates; compare silhouette to the turnaround (wide sleeves, pointed hood, ragged hem).
2. [ ] In Blender: scale to ~1.6 m tall, pivot at the centre of mass, facing +Z, apply transforms.
3. [ ] Hollow the face: replace the face area with a black material slot named `Face`.
4. [ ] Material slots named `Cloak`, `Face`, `Eyes`, `Talisman`.
5. [ ] UV-unwrap the cloak so a vertical gradient (V=0 at hem, V=1 at hood) is available for the glow.
6. [ ] Export GLB to `static/character/rei.glb`; load as resource key `rei` and point `VisualGhost` at it.
7. [ ] Record the asset in `ASSET_CREDITS.md`.

## Done when
- [ ] Rei appears in game at the right size, facing the movement direction.
