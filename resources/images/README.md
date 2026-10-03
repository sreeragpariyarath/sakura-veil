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
| Ninja Kage (demo) | `resources/fonts/ninja-kage-demo/` | `static/fonts/ninja-kage/NinjaKageDemo-Regular.woff2` | Letters of the "Festival Brush" family. Demo: letters only. Free for personal use only; buy the full version for commercial use. |
| Shojumaru | `resources/fonts/shojumaru/` (with `OFL.txt`) | `static/fonts/shojumaru/Shojumaru-Regular.woff2` | Digits and punctuation of "Festival Brush" (SIL Open Font License, free to use). |

"Festival Brush" is defined in `sources/style/fonts.styl`: two `@font-face` rules with the same name, split by `unicode-range`, so all UI text can use one family.
