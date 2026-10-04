# 8.4 Guardian 4: The Penultimate Guardian [TBA]

**Goal:** Implement the Level 4 Guardian protecting Veil IV (Desire). This is the 4th most powerful entity in Sauraka Veil, serving as the penultimate boss encounter before the summit.

**Status:** Reserved slot — 3D asset, character theme, and animation set will be provided by user during development progress.

## Overview

- **Level:** 4
- **Veil Guarded:** Veil IV (Desire / Unfinished Goals)
- **Position in Hierarchy:** 4th most powerful entity in Sauraka Veil
- **Location:** The Ancient Threshold / Sacred Gate preceding the Pagoda Hill summit

## Steps

1. [ ] **Asset Integration**:
   - Receive and import the 3D model provided by the user.
   - Rig / verify animations (idle, walk/hover, multi-tier attacks, ultimate ability, stagger, defeat).
   - Optimize GLTF with Draco and KTX2 compression via `npm run compress`.
2. [ ] **Boss Mechanics**:
   - High-difficulty hybrid combat profile combining agility, projectile volleys, and aggressive gap-closers.
   - Two-phase encounter (Phase 1: Normal combat; Phase 2: Enraged at 50% HP with amplified attack speed and glowing visual effects).
3. [ ] **Relic Interaction**:
   - Defeating Guardian 4 unlocks Veil IV (Desire) and triggers deeper Kaori memory fragments.
   - Clears the path to the summit for Guardian 5 (The Monkey King).

## Done when

- [ ] User-provided model is imported and fully animated.
- [ ] Boss encounter is balanced, challenging, and smoothly transitions into Phase 2.
- [ ] Unlocks Veil IV upon defeat.
