# 0.1 Third-person camera

**Goal:** mouse-look like a third-person game: free horizontal orbit, look up into the sky and down at the ground, camera never goes under the floor.

**Files:** `sources/Game/View.js` (`setSpherical`, `setMouseControls`, `update`).

## Steps
1. [x] Allow pitch above the horizon: `spherical.phiLimits` = 0.12π to 0.66π (above π/2 the camera sits below Rei and looks up).
2. [x] Make mouse Y non-inverted: moving the mouse up looks up.
3. [x] Ground clearance: when the camera would go below `groundClearance`, pull it in toward Rei instead.
4. [x] Lower default pitch (0.46π) so the first view shows the horizon and sky.
5. [ ] Playtest and tune `mouseControls.sensitivity`, `phiLimits` and the zoom radius (`radius.edges`).
6. [ ] Add an "Invert Y" toggle in the options menu (stored in `localStorage`).
7. [ ] Camera collision with trees/props: raycast from Rei to camera against static colliders and shorten the radius on hit.
8. [ ] Mouse wheel zoom within `radius.edges`.

## Done when
- [ ] Looking up shows sky, looking down shows Rei from above, no clipping into ground.
- [ ] Turning 360° with the mouse is smooth at any speed.
- [ ] No camera jitter when flying fast or landing.
