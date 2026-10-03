# 1.1 Zone layout and blockout

**Goal:** the 250 × 250 m garden exists in grey boxes, with the five zones, Rei's spawn and the five lantern spots placed.

## Steps
1. [ ] Sketch a top-down map (paper or Excalidraw): the five zones from the M1 README, the river, paths linking the zones, the pagoda hill at the far end, the spawn in the Sakura Grove.
2. [ ] Check distances: lanterns 40–100 m apart, the whole loop about 3–5 minutes at normal speed.
3. [ ] Blender: block the garden with cubes/planes at real scale (hill, river bed, bridge, stairs, pond); place empties `refSpawnLanding` and `refLantern1` … `refLantern5` (1 = About me … 5 = Contact).
4. [ ] Export as `static/areas/garden.glb`; load it as `gardenModel` in `Game.js` (Lanterns.js already reads `refLantern*` from it).
5. [ ] Repaint `terrain.png` to the new layout (paths, river bed, grass); extend the terrain if 192 m isn't enough.
6. [ ] Invisible boundary so Rei can't leave the garden.
7. [ ] Fly through: scale relative to Rei, camera framing, and that each zone's landmark is visible from the previous zone.

## Done when
- [ ] Flying the loop with grey boxes already feels like a journey through five places.
- [ ] All 5 lanterns sit on their final spots, one per zone.
