# CLAUDE.md

This file provides guidance to Claude Code when working in the **Sakura Veil** repository.

## What this is

Sakura Veil is a 3D interactive portfolio experience built with Three.js WebGPU (`three/webgpu` + TSL shaders), Rapier3D physics, a floating spirit character named **Rei**, third-person camera controls, and Vite.

The experience is Japanese-inspired and atmospheric: Rei explores a sakura world where interactive locations reveal portfolio content, engineering projects, technical experiments, and personal information.

There is currently no test suite, linter, or CI configuration in the repository. Verification is performed by running the development server, building the project, and manually playing and observing the scene.

## Commands

```bash
npm install --force
npm run dev
npm run build
npm run preview
npm run compress
```

The development server is configured for port `3000`.

## Project Layout

- `sources/` — application source and game systems
- `static/` — public models, textures, audio, and UI assets
- `scripts/` — asset-processing scripts
- `dist/` — generated production output
- `docs/` — architecture, art direction, and performance notes

Vite uses `sources/` as its root, serves assets from `static/`, and writes the production build to `dist/`.

## Environment Variables

Environment variables are loaded from the repository root `.env` file.

Important variables include:

- `VITE_SERVER_URL` — optional multiplayer or WebSocket backend
- `VITE_COMPRESSED` — selects compressed or raw assets
- `VITE_GAME_PUBLIC` — exposes `window.game` for browser debugging
- `VITE_LOG`
- `VITE_PLAYER_SPAWN`
- `VITE_DAY_CYCLE_PROGRESS`
- `VITE_YEAR_CYCLE_PROGRESS`
- `VITE_WHISPERS_COUNT`
- `VITE_MUSIC`

Never commit secrets or private `.env` files.

## Architecture

### Game Singleton and Subsystems

`Game` is a singleton accessed through `Game.getInstance()`. It owns the primary subsystems, including physics, player, world, rendering, ticker, resources, and input handling.

Subsystems commonly access other systems through the singleton. There is no dependency-injection container. Before adding a subsystem, inspect `Game.init()` and preserve the required construction order.

### Resource Loading

Resources are loaded in batches:

1. A small initial batch for the intro/loading experience.
2. A larger batch containing world models, character assets, textures, and other resources.

Resources are stored in a flat map using the keys supplied to the resource loader. New resource keys must be unique and documented when they are not self-explanatory.

### Frame Loop

The game uses a ticker and event-based update system. Systems subscribe to the `tick` event with an explicit execution order.

When adding a ticking system:

- Determine which state it reads and writes.
- Run movement and physics-dependent systems in the correct order.
- Update camera-related systems after the player state they depend on is available.
- Keep rendering-adjacent work near the existing rendering order.
- Avoid expensive allocations and DOM operations inside the frame loop.

Do not assume construction order determines frame execution order; the event priority controls execution order.

### Physics and Visual Objects

The object layer bridges Rapier3D physics bodies and Three.js visual meshes. Maintain a clear separation between:

- Visual representation
- Collision representation
- Interaction metadata

Static scenery should not receive unnecessary dynamic physics bodies. Use simplified colliders for terrain, paths, buildings, trees, and environmental props.

### Rei Character System

Rei is a floating spirit, not a conventional walking character.

Character behavior should support:

- Idle floating
- Smooth movement
- Rotation interpolation
- Interaction
- Discovery
- Restoration or world-state events

Avoid excessive vertical bobbing, camera shake, bloom, or particle effects. Rei must remain readable against bright sakura scenery.

### World and Interactive Areas

World areas should be organized around meaningful discoveries rather than generic asset groups. Suggested area types include:

- Sakura Entrance
- Forgotten Shrine
- Spirit Path
- Memory Garden
- Engineering Archive
- Project Chambers
- Restored Core

Each interactive area should define:

- A clear visual landmark
- A readable interaction boundary
- Its portfolio content or narrative purpose
- Its unlock or progression behavior
- Its performance budget

Use named GLTF markers for interaction bounds, frustum zones, spawn points, and important landmarks.

### Rendering and Performance

The project uses Three.js WebGPU and TSL. Performance-sensitive systems must be profiled rather than optimized based only on assumptions.

Pay particular attention to:

- Transparent sakura petals and foliage
- Shadow-map cost
- Post-processing and bloom
- Draw calls and material count
- Texture resolution and memory usage
- Large GLB loading and decompression time
- Mobile and integrated-GPU behavior

Prefer instancing, texture atlases, compressed textures, simplified collision geometry, and visibility management where appropriate.

### Asset Pipeline

3D assets are authored in Blender and exported as GLB files into `static/`. The compression script produces optimized sibling assets while preserving originals.

Before accepting an asset:

1. Confirm scale and orientation.
2. Confirm material and texture naming.
3. Confirm pivot placement.
4. Confirm collision requirements.
5. Confirm animation clip names where applicable.
6. Test the asset in the target scene.
7. Check loading size and GPU cost.

Recommended animation names for Rei include:

```text
IdleFloat
MoveFloat
Dash
Interact
Discover
Restore
Damaged
```

Do not rename existing animation clips or resource keys without checking all references.

## Engineering Rules

- Preserve existing behavior unless the task explicitly requests a behavior change.
- Avoid introducing dependencies without a clear need.
- Do not place per-frame state in React or the DOM if it can remain inside the game runtime.
- Keep UI, narrative content, and game systems modular.
- Validate with `npm run build` after structural changes.
- Document new architectural decisions in `docs/` when they affect multiple systems.
