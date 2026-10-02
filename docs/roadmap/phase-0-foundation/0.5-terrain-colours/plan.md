# 0.5 Terrain colour pass

**Goal:** the ground stops looking orange/olive; it reads as grass, dirt path and stone like the concept.

**Files:** `sources/Game/Terrain.js`, `sources/Game/World/Floor.js`, `static/terrain/terrain.png`, `static/palette.png`.

## Steps
1. [ ] Understand how `terrain.png` channels drive grass / path / water in `Floor.js` and `Terrain.js`.
2. [ ] Retune the terrain gradient and palette: fresh green grass, warm beige path, soft purple shadows.
3. [ ] Repaint `terrain.png` (Krita/GIMP/Photoshop) for a path leading from spawn to the future torii.
4. [ ] Check the grass (`Grass.js`) colour against the new ground.

## Done when
- [ ] A screenshot from spawn reads as "garden with a path", not "desert".
