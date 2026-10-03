# M1: Festival Garden

The one map of the game, matching the concept image: a sunny sakura garden with a turquoise river, a red arched bridge, torii gates, a koi pond and a pagoda on a hill.

It must be big enough to explore: about **250 × 250 m** (around 30 s to cross at boost speed), split into **five zones**. Each zone has one landmark and hides one festival lantern, so finding the five lanterns takes the player on a tour of the whole garden.

## Zones

| Zone | Landmark | Lantern | Placeholder position (until 1.1) |
|---|---|---|---|
| Sakura Grove (start) | Big sakura trees, stone path | About me | (-40, 10) |
| River Crossing | River, red arched bridge | Experience | (45, -45) |
| Torii Path | Row of torii gates up stone stairs | Skills | (-65, -50) |
| Koi Pond | Pond, stepping stones, rocks | Projects | (50, 40) |
| Pagoda Hill | Pagoda on the hilltop (fireworks spot) | Contact | (-15, 65) |

Rules for lantern spots:
- 40–100 m from each other, never two in the same view at the start.
- Partly hidden (behind trees, by the bridge, up the hill), but the glow and floating marker can be spotted from far away.
- On dry ground with a clear space of about 3 m around them for the interaction.

| Sub-phase | Plan | Status |
|---|---|---|
| 1.1 Zone layout and blockout | [plan](1.1-blockout/plan.md) | Not started |
| 1.2 Sakura trees and foliage | [plan](1.2-trees/plan.md) | Not started |
| 1.3 Landmarks: torii, bridge, pagoda, rocks, fences | [plan](1.3-landmarks/plan.md) | Not started |
| 1.4 Water, grass, flowers, petals | [plan](1.4-nature/plan.md) | Not started |
| 1.5 Lighting, sky, fog, post-processing | [plan](1.5-lighting/plan.md) | Not started |
| 1.6 Background: hill, pagoda, mountains | [plan](1.6-background/plan.md) | Not started |
| 1.7 Things to find between zones | [plan](1.7-exploration/plan.md) | Not started |

## Models needed

| Model | Count in scene | Suggested free source |
|---|---|---|
| Torii gate | 4–6 (Torii Path) + 1 at the start | Poly Pizza, Sketchfab, Quaternius Japanese pack |
| Stone lanterns (decoration, besides the 5 festival lanterns) | 10–20 (instanced) | Quaternius, Poly Pizza |
| Arched red bridge | 1 | Poly Pizza / Sketchfab |
| Stone stairs | 1–2 flights | Make in Blender from boxes |
| Rocks | 5–8 variants | Quaternius Nature, Poly Haven |
| Rope fence posts | 1 piece, instanced | Kenney Nature, Quaternius |
| Sakura tree trunks | 3 variants | Quaternius Nature (recolour), Sketchfab |
| Pagoda | 1 (hilltop, also the fireworks spot) | Sketchfab / Poly Pizza |
| Stepping stones | 3 variants | Make in Blender from cylinders |
| Bushes | 3 variants | Quaternius |
