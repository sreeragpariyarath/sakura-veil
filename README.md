# Sakura Veil — Interactive 3D Portfolio

> A cinematic, Japanese-inspired 3D portfolio experience where **Rei**, a mysterious floating spirit, explores a fading sakura world and discovers the story behind an engineer's work.

Sakura Veil combines interactive exploration, atmospheric worldbuilding, real-time 3D graphics, and portfolio storytelling. Visitors explore the environment through Rei, interact with meaningful locations, and uncover projects, technical experiments, engineering decisions, and personal information through the world itself.

---

## ✨ Features

- 👻 **Rei — Floating Spirit Character**: Third-person movement with smooth camera-relative steering and rotation interpolation.
- 📹 **Over-the-Shoulder Camera**: PUBG-style third-person camera with mouse-look orbit controls and dynamic follower distance and height.
- 🌸 **Sakura Fantasy Environment**: Japanese-inspired scenery with cherry blossom trees, paths, shrines, lanterns, and atmospheric lighting.
- 🌓 **Cinematic Worldbuilding**: A mysterious spirit world using controlled purple, pink, cyan, and warm lantern lighting.
- ⚡ **WebGPU & TSL Shaders**: Built with `three/webgpu` and Three.js Shading Language for modern real-time rendering.
- 🧱 **Rapier3D Physics**: Collision detection and physics simulation for the explorable environment.
- 🗺️ **Interactive Portfolio Discovery**: Portfolio content can be revealed through locations, objects, encounters, and world events.
- 🎧 **Atmospheric Audio**: Sound and music support through Howler.js.
- 📦 **Asset Compression Pipeline**: GLB and texture optimization for web delivery.

---

## 🎮 Experience Concept

The visitor enters a fading sakura world as Rei, a mysterious floating spirit.

The experience follows this general loop:

```text
Explore
  ↓
Discover an interactive location
  ↓
Investigate a story or portfolio fragment
  ↓
Reveal engineering work, projects, or personal information
  ↓
Restore part of the world
  ↓
Unlock the next discovery
```

The first playable environment should remain small and polished before the world is expanded.

---

## 🚀 Getting Started

### Prerequisites

Install [Node.js](https://nodejs.org/) version 18 or higher.

### Installation

```bash
npm install --force
```

### Local Development

```bash
npm run dev
```

The Vite development server runs on the configured port, currently `3000`, and is accessible through the terminal URL.

### Production Build

```bash
npm run build
```

The production output is generated in `dist/`.

### Preview the Production Build

```bash
npm run preview
```

---

## 🎨 Asset Processing

After adding or changing assets inside `static/`, run:

```bash
npm run compress
```

The compression pipeline processes:

- GLB models with Draco geometry compression and ETC1S texture compression.
- PNG and JPG textures into KTX2 formats.
- UI images into WebP where supported by the processing script.

Original assets should be preserved. Use compressed assets only after validating visual quality, loading behavior, and runtime compatibility.

---

## 🛠️ Tech Stack

- **Rendering:** [Three.js](https://threejs.org/) using `three/webgpu` and TSL
- **Physics:** [Rapier3D](https://rapier.rs/)
- **Audio:** [Howler.js](https://howlerjs.com/)
- **Bundler:** [Vite](https://vitejs.dev/)
- **Animation:** GSAP and Three.js animation systems
- **Asset Authoring:** Blender → GLB
- **Debugging:** Tweakpane and stats-gl
- **Typography:** Amatic SC and Nunito

---

## 📁 Project Layout

```text
sakura-veil/
├── sources/       # Application source and game systems
├── static/        # Public 3D assets, textures, audio, and UI resources
├── scripts/       # Asset processing scripts
├── dist/          # Production build output
├── docs/          # Design, architecture, and performance documentation
├── package.json
├── vite.config.js
└── CLAUDE.md
```

---

## ⚙️ Environment Variables

Environment variables are stored in `.env`. Use `.env.example` as the template when available.

Important variables include:

- `VITE_SERVER_URL`
- `VITE_COMPRESSED`
- `VITE_GAME_PUBLIC`
- `VITE_LOG`
- `VITE_PLAYER_SPAWN`
- `VITE_DAY_CYCLE_PROGRESS`
- `VITE_YEAR_CYCLE_PROGRESS`
- `VITE_WHISPERS_COUNT`
- `VITE_MUSIC`

Do not commit secrets or private environment files.

---

## 📌 Development Principles

1. Prioritize a polished small environment over a large unfinished map.
2. Keep Rei visually readable against the sakura environment.
3. Use purple as atmospheric lighting, not as the material color for every object.
4. Keep interactive objects visually distinct and discoverable.
5. Profile draw calls, transparency, shadows, foliage, and post-processing before adding visual effects.
6. Preserve accessibility through readable UI and a non-3D fallback where practical.
7. Keep portfolio content separate from frame-by-frame rendering logic.

---

## 📄 License

This project is available under the [MIT License](license.md).
