# Game images (served)

Web-optimised images used by the game, loaded as `images/<folder>/<name>`. Originals live in `resources/images/` (see its README).

| File | Size | Used by |
|---|---|---|
| `ui/scroll-banner.webp` | 1200 × 600 | Big story moments on the scroll (`StoryText.js`) |
| `ui/banner-single-line.webp` | 900 × 255, trimmed | Short story updates, e.g. "A lantern glows!" (`StoryText.js`) |
| `ui/lantern-progress-bar.webp` | 900 × 173, trimmed | Lantern counter (`LanternCounter.js`); lantern and plaque positions are measured on this exact image, re-measure if it changes |

Styles for all three: `sources/style/lanterns.styl`.

# Music

Music files live in `static/sounds/musics/`. `festival-bgm-1.mp3` is the festival background music (`sources/Game/FestivalMusic.js`).
