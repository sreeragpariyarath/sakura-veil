# 8.2 Combat Foundations

**Goal:** Establish the player's combat mechanics, health system, dodge/dash i-frames, and spirit projectile/slash abilities.

## Steps

1. [ ] **Player Health & Status**:
   - Add `health` (max: 100, current) to `Player.js`.
   - Add subtle HUD spirit health indicator (fades out when out of combat).
   - Implement damage flinch, red vignette flash, and invulnerability window (i-frames) on hit.
2. [ ] **Dodge / Dash**:
   - Map <kbd>Space</kbd> + directional keys / <kbd>Shift</kbd> quick tap to a rapid evasive spirit dash.
   - Add trail effect via `Trails.js` or particle shimmer.
3. [ ] **Spirit Attack / Petal Blast**:
   - Add primary attack input (<kbd>Left Click</kbd> or <kbd>J</kbd> / Gamepad <kbd>X</kbd>).
   - Fire homing spirit orb / sakura petal burst toward locked-on or facing direction.
4. [ ] **Targeting & Lock-on**:
   - Soft-target nearest enemy in front of camera view.
   - Display subtle reticle over targeted hostile entity.

## Done when

- [ ] Rei can dash with i-frames to evade incoming attacks.
- [ ] Rei can deal damage to hostile targets with spirit bursts.
- [ ] Health bar updates smoothly and respawns Rei on depletion.
