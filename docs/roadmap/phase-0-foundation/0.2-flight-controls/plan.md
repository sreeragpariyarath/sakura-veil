# 0.2 Flight controls

**Goal:** Rei moves like a third-person game character: instant, predictable, camera-relative.

**Controls:** WASD move (camera-relative), mouse look, Space up, C / Q / Ctrl down, Shift boost, E / F / Enter interact, R respawn.

**Files:** `sources/Game/Physics/PhysicsFlight.js`, `sources/Game/Player.js`.

## Steps
1. [x] Replace force-based thrust with velocity steering: ease velocity toward `moveVector * topSpeed` using `acceleration` / `deceleration`.
2. [x] Hover in place when no vertical input (gravity off, vertical velocity eased to 0).
3. [x] Climb/descend at `climbSpeed`, cap at `maxAltitude`.
4. [x] Add C and Q as descend keys.
5. [ ] Tune in `#debug` → Physics → Flight: `topSpeed`, `topSpeedBoost`, `acceleration`, `deceleration`, `climbSpeed`. Write chosen values back to the constructor.
6. [ ] Optional "hover height" mode: when not climbing, gently settle to ~1.5 m above the ground (raycast down).
7. [ ] Rotate Rei toward camera forward while strafing (option: "face camera" vs "face movement").
8. [ ] On-screen controls hint on first launch (reuse `controls.styl`).
9. [ ] Gamepad: right stick should orbit the camera (currently pans the map in `View.update`).

## Done when
- [ ] Releasing all keys stops Rei within about half a second, without sliding.
- [ ] Rei goes exactly where the camera points when holding W.
- [ ] A new player can fly through the torii gate on the first try.
