# Image sources

Original, full-size images for the game (concept art, UI art, textures before export). Not served by Vite.

| Folder | Contents |
|---|---|
| `ui/` | UI art: banners, frames, icons |

For each image used in the game, export a web-optimised copy into `static/images/<same folder>/` (WebP, sized for its use) and keep the original here.

```bash
# Example: 1200 px wide WebP with transparency
node -e "require('sharp')('resources/images/ui/scroll-banner.png').resize({ width: 1200 }).webp({ quality: 85, alphaQuality: 90 }).toFile('static/images/ui/scroll-banner.webp')"
```

# Fonts

Original font files live in `resources/fonts/`; web copies (WOFF2) in `static/fonts/`.

| Font | Source | Web copy | Notes |
|---|---|---|---|
| Ninja Kage (demo) | `resources/fonts/ninja-kage-demo/` | `static/fonts/ninja-kage/NinjaKageDemo-Regular.woff2` | Festival titles. Demo: letters only (digits and punctuation are empty, so `fonts.styl` limits it to letters and Georgia draws the rest). Free for personal use only; buy the full version for commercial use or to get digits. |
