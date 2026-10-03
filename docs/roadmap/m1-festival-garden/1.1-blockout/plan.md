# 1.1 Layout blockout and lantern spots

**Goal:** the garden layout exists in grey boxes, with Rei's spawn and the 5 festival lantern spots placed.

## Steps
1. [ ] Sketch a top-down map (paper or Excalidraw): spawn, path, river, bridge, torii, pagoda hill, and the 5 lantern spots spread around the loop.
2. [ ] Blender: block the garden with cubes/planes at real scale; place empties `refSpawnLanding` and `refLantern1` … `refLantern5`.
3. [ ] Export as `static/areas/garden.glb`; load it and spawn Rei at the spawn empty.
4. [ ] Make `Lanterns.js` (M2) read its positions from the `refLantern*` empties instead of placeholders.
5. [ ] Fly through: check scale relative to Rei, camera framing from the main viewpoints, and that each lantern is visible from the one before it.
6. [ ] Repaint `terrain.png` to match the layout (path, river bed).

## Done when
- [ ] Flying the loop with grey boxes already feels like the concept composition.
- [ ] All 5 lanterns sit on their final spots.
