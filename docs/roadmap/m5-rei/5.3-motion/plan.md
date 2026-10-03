# 5.3 Motion: float, sway, lean

**Files:** `VisualGhost.js` vertex shader, `PhysicsFlight.js` (speed/bank values).

## Steps
1. [ ] Idle float: gentle vertical bob (±5 cm, ~0.5 Hz) on the visual only, not the physics body.
2. [ ] Cloak sway: vertex offset weighted by (1 − V) so the hem moves most; noise + wind uniform.
3. [ ] Movement drag: hem trails opposite to velocity, proportional to speed.
4. [ ] Lean/bank into turns using `physicalVehicle.bank`.
5. [ ] Boost: stretch slightly and increase trail.

## Done when
- [ ] Rei never looks rigid: idle, move, turn and boost each have visible motion.
