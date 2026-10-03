# Game images (served)

Web-optimised images used by the game, loaded as `images/<folder>/<name>`. Originals live in `resources/images/` (see its README).

| File | Size | Used by |
|---|---|---|
| `ui/scroll-banner.webp` | 1200 × 600 | Big story moments on the scroll (`StoryText.js`) |
| `ui/banner-single-line.webp` | 900 × 255, trimmed | Short story updates, e.g. "A lantern glows!" (`StoryText.js`) |
| `ui/lantern-progress-bar.webp` | 900 × 173, trimmed | Lantern counter (`LanternCounter.js`); lantern and plaque positions are measured on this exact image, re-measure if it changes |

| `ui/interaction-label.webp` | 1200 × 539, trimmed | "Press E" label above lanterns (`InteractivePoints.js`, drawn into a canvas, 3-sliced: the plain bar between x 800 and 950 stretches for longer text) |
| `ui/interaction-diamond.webp` | 512 × 571, trimmed | Small diamond marker on concealed interaction points (`InteractivePoints.js`) |
| `ui/card-frame.webp` | 1400 × 677 | Portfolio cards (`lanterns.styl`, CSS border-image 9-slice). Generated from `resources/images/ui/card-frame.webp` with `scripts/card-frame-band.cjs`, which inserts the clean 8 px stretch band at y 357 |

Styles for the story frames and cards: `sources/style/lanterns.styl`.

# Music

Music files live in `static/sounds/musics/`. `festival-bgm-1.mp3` is the festival background music (`sources/Game/FestivalMusic.js`).
