# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Sakura Veil is a 3D interactive portfolio: a floating spirit named **Rei** explores a Japanese-inspired sakura world whose locations reveal projects, career, lab experiments and social links. Stack: Three.js WebGPU (`three/webgpu` + TSL node shaders), Rapier3D physics (WASM, lazy-imported), GSAP, Howler, Tweakpane, Vite. Plain JavaScript ES modules, no framework, no TypeScript.

The codebase is a fork of Bruno Simon's folio-2025 (a driving game) being converted into a flying-ghost experience. Expect legacy names and leftovers: the player's physics body is `game.physicalVehicle` (`Physics/PhysicsFlight.js`), Rei's visual is `world.visualVehicle` (`World/VisualGhost.js`), Rei's GLB is loaded under the resource key **`vehicle`** (`character/ghost.glb`), and input categories are still named `wandering` / `racing` / `cinematic`. Do not rename these without updating every reference.

## Commands

```bash
npm install --force   # --force is required for peer-dep conflicts
npm run dev           # Vite dev server on :3000 (host exposed, auto-opens); restarts on static/** changes
npm run build         # production build to dist/
npm run preview
npm run compress      # gltf-transform (ETC1S + Draco) on static/**/*.glb -> *-compressed.glb, sharp for textures
```

There is no test suite, linter or CI. Verify by `npm run build` and by running the dev server and playing the scene. Append `#debug` to the URL to enable the Tweakpane debug panel (`H` toggles it; `V` toggles the free view camera); many systems only register their debug folders when `game.debug.active`.

## Environment variables

Loaded from the repo-root `.env` (`envDir: '../'` in `vite.config.js`; `.env*` is git-ignored):

- `VITE_COMPRESSED` — when set, load `*-compressed.glb` models and `.ktx` textures instead of raw `.glb` / `.png` (see the suffix logic in `Game.init()`).
- `VITE_GAME_PUBLIC` — expose the `Game` instance as `window.game`.
- `VITE_PLAYER_SPAWN` — respawn name to start at (default `landing`).
- `VITE_SERVER_URL` — optional WebSocket backend (`Server.js`).
- `VITE_LOG`, `VITE_MUSIC`, `VITE_WHISPERS_COUNT`, `VITE_YEAR_CYCLE_PROGRESS`.
- `VITE_DAY_CYCLE_PROGRESS` is documented but currently unused: `DayCycles.js` hard-codes `forcedProgress = 0.0`.

## Architecture

Vite `root` is `sources/` (entry `sources/index.html` → `sources/index.js`), `publicDir` is `static/`, output is `dist/`. `resources/` holds Blender/Substance source files and is not served.

### Game singleton and startup order

`sources/Game/Game.js` is a singleton; every subsystem does `this.game = Game.getInstance()` in its constructor and reaches siblings through it (`this.game.physics`, `this.game.resources.foo`, …). Because of that, **construction order in `Game.init()` is a dependency order**: a subsystem can only touch siblings created before it. Startup is:

1. Core systems (debug, quality, ticker, time, cycles, inputs, audio, viewport, rendering), then `await rendering.setRenderer()`.
2. First resource batch (intro textures), then view, post-processing, `rendering.start()` (which starts the animation loop), materials, `Objects`, `World` (step 0).
3. Second resource batch **in parallel with** `import('@dimforge/rapier3d')`; the batch's progress drives `world.intro`.
4. After both resolve: terrain, `Physics`, `PhysicsFlight`, zones, `Player`, interactive points, achievements, map, etc., then `world.step(1)` builds the world content, then overlay.

Anything that needs `game.physics`, `game.RAPIER` or second-batch resources must be constructed in phase 4 (or inside `World.step(1)` / later). `World.step()` wraps each subsystem in a `safe()` try/catch so one broken asset can't block the reveal sequence that unlocks input — keep new world subsystems inside that wrapper.

### Resources

`ResourcesLoader.load([[key, path, type, onLoad?], ...])` returns a flat object keyed by the given names, merged into `game.resources`. Types: `gltf` (with Draco + KTX2 loaders wired, decoders at `static/draco/` and `static/basis/`), `texture`, `textureKtx`. Texture sampling settings are applied in the per-entry callback in `Game.js`.

Several systems still read keys that are **not loaded** in the current `Game.js` (`areasModel`, `respawnsReferencesModel`, `benchesModel`, `bricksModel`, `poleLightsModel`, `explosiveCratesModel`, `flowersReferencesModel`, `tornadoPathReferencesModel`, `bushesReferences`, …). Those systems either guard with `?.` and do nothing, fall back to defaults (e.g. `Respawns` only has the hard-coded `landing` spawn), or fail inside `World.step`'s `safe()`. When something "doesn't appear", check whether its resource is actually loaded first.

### Frame loop and tick order

`Rendering` calls `renderer.setAnimationLoop` → `Ticker.update()` → `ticker.events.trigger('tick')`. `Events.on(name, cb, order)` stores callbacks in order buckets and runs lower orders first; **the order argument, not construction order, decides execution order**. Current convention:

| Order | Systems |
|---|---|
| 0 | `Time`, `Inputs` |
| 1 | `Player.updatePrePhysics` |
| 2 | `PhysicsFlight.updatePrePhysics` (apply forces); TSL-uniform prep in Floor/Grass/WaterSurface |
| 3 | `Physics` world step |
| 4 | `Objects` (sync visuals from physics bodies); `PhysicsWireframe` |
| 5 | `PhysicsFlight.updatePostPhysics` |
| 6 | `Player.updatePostPhysics` |
| 7 | `View` (camera follow) |
| 8 | `Cycles`, `Zones`, `Weather` |
| 9 | `Wind`, `Tracks`, `Tornado`, `InteractivePoints`, `Lighting` |
| 10 | Most world visuals and each `Area` (frustum test + `update()`) |
| 13 | `InstancedGroup` matrix uploads |
| 14 | UI/audio: `Audio`, `Notifications`, `Map`, `Title` |
| 998 | Render |

`ticker.wait(frames, cb)` defers by frames. `Ticker` also exposes TSL uniforms (`elapsedUniform`, `deltaScaledUniform`, …) that shaders read directly. Note `ticker.scale = 2`: gameplay generally uses `deltaScaled`.

### Physics ↔ visual objects

`Objects.add(visualDescription, physicalDescription)` pairs a Three.js object with a Rapier body built by `Physics.getPhysical()` (types `fixed` / `dynamic` / kinematic; colliders by `shape`, `parameters`, `category`) and syncs them each tick. `Objects.addFromModel(child, …)` builds both from a GLTF node, reading physics settings (`mass`, `friction`, `restitution`, `category`, …) from Blender custom properties in `userData`. Opt-out flags in `userData`: `preventAutoAdd`, `preventFrustum`, `preventPreRender`. Static scenery should use `fixed` bodies with simplified colliders, or none.

### Areas, references and zones

`World/Areas/Areas.js` walks the `areasModel` GLTF and instantiates an `Area` subclass for each top-level child whose name starts with a known key (`landing`, `projects`, `career`, `lab`, `social`, …). The `Area` base class auto-adds child objects, computes bounds and a frustum test, and only calls the subclass's `update()` while the area is on screen. Nodes named `ref<Name><n>` / `reference<Name><n>` are collected by `References` (`references.items.get('name')`, `getStartingWith(prefix)`) and are how areas locate spawn points, interaction spots and landmarks authored in Blender. `Zones.create('sphere'|…, position, radius)` emits enter/leave events (`#debug` → "Zones" → `previewVisible` shows them). Portfolio content lives in `sources/data/*.js` (projects, lab, social, achievements), separate from the systems that render it.

### Inputs

`inputs.addActions([{ name, categories, keys }])` maps keyboard, gamepad, pointer and the mobile "nipple" joystick to named actions. Actions only fire when one of their categories matches an active input filter (`game.inputs.filters`: starts as `intro`; `ClosingManager` and areas such as Lab/Circuit swap in `wandering` / `racing` / `cinematic`), so a new action that never fires usually has the wrong categories.

### Rendering and quality

Materials are TSL node materials; `MeshDefaultMaterial` and the shared `Materials` palette (`palette` texture) give the world its look, and `materials.updateObject(model)` is applied to GLTF models added through `Objects`. `Quality.level` is `0` (high) on desktop and `1` (low) on mobile, and systems listen to its events to scale down. `PreRenderer` warms up shaders on high quality with a WebGPU backend.

## Project direction (from the owner)

- Rei is a floating spirit, not a walking character: idle floating, smooth movement, interpolated rotation, interaction/discover/restore states. Avoid excessive bobbing, camera shake, bloom or particles; Rei must stay readable against bright sakura scenery. Preferred animation clip names: `IdleFloat`, `MoveFloat`, `Dash`, `Interact`, `Discover`, `Restore`, `Damaged`.
- Areas should be meaningful discoveries (Sakura Entrance, Forgotten Shrine, Spirit Path, Memory Garden, Engineering Archive, Project Chambers, Restored Core), each with a landmark, a readable interaction boundary, its content and unlock behaviour, and named GLTF markers for bounds and spawns.
- Prefer a polished small environment over a large unfinished map. Use purple as atmospheric lighting rather than as the material colour for everything.
- Profile before optimizing. Watch transparent petals and foliage, shadows, post-processing, draw calls and material count, texture memory, GLB size and decode time, and mobile/integrated GPUs. Prefer instancing (`InstancedGroup`), atlases, compressed assets and simplified colliders.
- Assets come from Blender as GLB into `static/`. Check scale, orientation, pivot, naming, collision needs and clip names, then run `npm run compress`; originals are kept alongside the `-compressed` versions.
- Keep per-frame state inside the game runtime, not the DOM, and avoid allocations or DOM work in tick callbacks.
- Validate with `npm run build` after structural changes.
