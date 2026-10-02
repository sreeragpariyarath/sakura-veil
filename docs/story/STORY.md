# Sakura Veil: Story Design

80% game, 20% portfolio. The portfolio is never a menu you open: it is what the player **finds**, and every piece of it restores part of the world.

Target playtime: **15–20 minutes** for the full story, with free roam after the ending. Recruiters in a hurry can switch to **Portfolio Mode** from the menu at any time (see [Skipping the game](#skipping-the-game)).

---

## The premise

> *Some spirits don't just haunt places. They make them more beautiful.*

**The Veil** is a hidden sakura world that lives between remembering and forgetting. Everything a creator ever built, learned or dreamed about leaves a memory here: a shrine for who they are, a path for the road they walked, a garden for the things they made just for fun.

But the Veil is **fading**. The creator got busy, forgot why they started, and the memories lost their light. The petals turned grey, the lanterns went out, the great sakura tree at the heart of the Veil stopped blooming.

**Rei** wakes up under a broken torii gate with no memory of who they are. A tiny fox spirit, **Kitsu**, finds them and explains: whoever relights the Veil's lanterns will remember everything.

Rei's goal: find the lost **Memory Lanterns**, restore each area, and bring the light back to the **Great Sakura**.

**The twist (finale):** Rei is not a lost stranger. Rei is the creator's own *curiosity*, the spark that made them start building things in the first place. By restoring the Veil, Rei and the player have literally walked through the creator's life. The creator is you (the portfolio owner).

---

## Characters

| Character | Role | How it is built (no modeller needed) |
|---|---|---|
| **Rei** | The player. A hooded floating spirit with no memory. Never speaks. | Existing ghost model + shader motion (Phase 1, postponed) |
| **Kitsu** | Small fox spirit guide. Gives short hints, reacts to discoveries, a bit cheeky. Max 12 words per line. | Free low-poly fox (Quaternius Animals / Poly Pizza) + floating speech bubble (`World/Bubble.js`) |
| **Kodama** | Tiny glowing tree spirits hidden around the world. Optional collectibles; once found they follow Rei in a little line. | Instanced emissive spheres with two dot eyes |
| **The Creator** | Never seen. Present through notes, ema plaques, sketches and the final reveal. | Text + images in the portfolio data |
| **Other visitors** | Real players leave short whispers (messages) at flames. They are "other spirits passing through". | Existing `World/Whispers.js` |

---

## How the story is told

- **No cutscene longer than 30 seconds.** Story comes from Kitsu's lines, short floating text and the world changing colour.
- **Bloom is the reward.** Each area starts faded (desaturated, few petals, quiet). Restoring it plays a 5–10 second "bloom" moment: colour washes back, petals burst, a music layer joins.
- **Portfolio cards are short.** Picking up a memory shows a small card (title, one image, max 40 words). A "Read more" button opens the full modal. Closing it returns to play instantly.
- **Progress is saved** (`localStorage`), so the player can leave and come back.

### Kitsu, sample lines

| Moment | Line |
|---|---|
| First meeting | "Oh! A new spirit. You look as lost as the petals." |
| Teaching flight | "Hold Space to float up. Don't worry, nobody falls here." |
| First lantern lit | "See? The Veil remembers you." |
| Player idles a long time | "The lanterns won't light themselves, you know." |
| Before the finale | "Every light you found... they all feel familiar, don't they?" |
| After the reveal | "Welcome back. You were never lost. Just forgotten." |

---

## Chapters

The world is a **hub**: the Sakura Entrance sits in the centre and each chapter area branches off it. A chapter's gate opens when the previous chapter is restored, so the order is guided but the player can return anywhere later.

### Prologue: Awakening (Sakura Entrance, ~2 min)
- **Story:** Rei wakes under a broken torii. Everything is pale grey-pink. Kitsu appears.
- **Gameplay:** follow a trail of drifting petals that teaches move, look, float up/down and interact. At the end of the path, light the first lantern.
- **Restore moment:** the entrance blooms; the torii glows; the title "Sakura Veil" rises in the sky with the creator's name underneath.
- **Portfolio (tiny):** just the creator's name and one-line title (e.g. "Software Engineer").

### Chapter 1: The Forgotten Shrine (*"Who was I?"*, ~3 min)
- **Story:** Kitsu: "Shrines keep wishes. Maybe yours are still here."
- **Gameplay:** find **3 ema** (wooden wish plaques) blown around the shrine grounds, one on a rooftop, one under the bridge, one behind a waterfall. Bring them back and ring the shrine bell.
- **Portfolio:** **About me.** Each ema is one fragment: where you are from, why you started building, what you care about.
- **Restore moment:** the bell rings, the shrine lanterns light one by one.

### Chapter 2: The Spirit Path (*"The road I walked"*, ~3 min)
- **Story:** a long path of unlit stone lanterns winding up a hill. "Someone walked this road for years."
- **Gameplay:** fly through floating spirit rings that light the lanterns in order. No timer and no fail state; it is about the flow of flying.
- **Portfolio:** **Career timeline.** Each lantern is a milestone (school, first job, big moves). Its year and one line float up as you pass.
- **Restore moment:** the whole path lights up at once, visible from the hub.

### Chapter 3: The Memory Garden (*"Things made for fun"*, ~3 min)
- **Story:** a zen garden with a koi pond. "These memories are playful. Try catching one."
- **Gameplay:** glowing koi swim in the pond. Glide low over the water to guide each one to the small shrine at the pond's edge. Optional Kodama hide here.
- **Portfolio:** **Lab and side experiments.** Each koi is one experiment: a small card with a GIF and a link.
- **Restore moment:** the pond lights up with lily flowers and floating petals.

### Chapter 4: The Engineering Archive (*"How things are built"*, ~3 min)
- **Story:** a library pavilion whose scroll pages were scattered by wind.
- **Gameplay:** collect the glowing scroll pages drifting on the wind (they move, so Rei has to chase them). Each page returned lights a star in a constellation on the ceiling.
- **Portfolio:** **Skills and tech stack.** The constellation is your skill map: groups like Frontend, 3D/Graphics and Backend. Stars connect into a shape when complete.
- **Restore moment:** the ceiling opens and the constellation projects into the night sky over the whole Veil.

### Chapter 5: The Project Chambers (*"The great works"*, ~4 min)
- **Story:** a row of sealed pavilions. "These are the brightest memories. They're locked tight."
- **Gameplay:** each pavilion holds a small puzzle themed to one project. Example: connect glowing spirit threads between pillars to "wire" a system together, or align mirror lanterns to send a light beam to the door. One simple puzzle per pavilion, 30–60 seconds each.
- **Portfolio:** **Main projects (3–5).** Opening a pavilion reveals the project scroll: title, role, stack, images, links. **This is the core of the portfolio**, so these cards get the full modal.
- **Restore moment:** each pavilion's roof lantern turns on; all five together point a beam toward the Great Sakura.

### Finale: The Restored Core (*"Why I started"*, ~2 min)
- **Story:** the Great Sakura is dark and bare. Rei carries all the Memory Lanterns to it.
- **Gameplay:** fly up around the trunk, placing lanterns on the branches (one press each).
- **The reveal:** the tree blooms in a petal storm (a 20–30 second camera move). Rei's hood lifts slightly, the eyes glow brighter. Kitsu: "Welcome back. You were never lost. Just forgotten." The text reveals that Rei is the creator's curiosity.
- **Portfolio:** **Contact.** An ema board under the tree: "Leave a wish." The player can write a message (which goes to your email or a contact form), or open links (GitHub, LinkedIn, CV).
- **After the ending:** free roam with the whole Veil in full bloom, all memories re-readable, Kodama hunt for completionists.

---

## Pacing overview

| Part | Time | Game : portfolio |
|---|---|---|
| Prologue | 2 min | 95 : 5 |
| Shrine | 3 min | 75 : 25 |
| Spirit Path | 3 min | 80 : 20 |
| Memory Garden | 3 min | 80 : 20 |
| Archive | 3 min | 80 : 20 |
| Project Chambers | 4 min | 65 : 35 |
| Finale | 2 min | 85 : 15 |
| **Total** | **~20 min** | **~80 : 20** |

---

## Skipping the game

Not every visitor will play for 20 minutes. Two escape hatches keep the portfolio usable:

1. **Portfolio Mode** (menu button, always visible): a plain, scrollable 2D page with all content (about, timeline, skills, projects, contact). Good for recruiters on mobile.
2. **Map fast travel:** after an area is restored, the map lets you jump straight to it.

---

## World state

One value per area drives everything visual and audio:

```
area.bloom: 0 (faded) → 1 (restored)
```

| Driven by `bloom` | System in the code |
|---|---|
| Colour saturation and brightness | material/palette uniforms, `DayCycles` properties |
| Petal amount | `World/Leaves.js` count/opacity |
| Lantern glow | emissive uniforms on lantern props |
| Fog tint | `Fog.js` colours |
| Music layers | `Audio.js` (one stem per area, volume follows bloom) |

Global progress = number of areas restored (0–6), saved to `localStorage`.

---

## Mapping to existing code

| Story need | Already in the codebase |
|---|---|
| Areas with triggers | `World/Areas/Area.js`, `Zones.js` |
| "Press E" pickups | `InteractivePoints.js` |
| Kitsu speech bubbles | `World/Bubble.js` |
| Short cards and full project pages | `Modals.js` |
| Collectibles progress, Kodama count | `Achievements.js` |
| Visitor messages | `World/Whispers.js` (needs `VITE_SERVER_URL`) |
| Finale camera move | `View.js` cinematic mode |
| Area unlock fades | `Overlay.js`, `Reveal.js` |
| Portfolio text and images | `sources/data/*.js` |

New systems needed: a **StoryManager** (chapter state, gate unlocking, save/load), a **Bloom** controller per area, the Kitsu follower, and Portfolio Mode.

---

## Content you need to write

Fill these in before building each chapter; the story works with any content.

- [ ] **Name, one-line title** (Prologue)
- [ ] **3 about-me fragments**, 40 words each (Shrine)
- [ ] **5–8 career milestones**: year + one line (Spirit Path)
- [ ] **3–6 experiments**: title, GIF/image, link (Memory Garden)
- [ ] **Skills** grouped into 3–4 constellations (Archive)
- [ ] **3–5 main projects**: title, role, stack, 2–4 images, links, 80–150 words (Project Chambers)
- [ ] **Contact**: email/form endpoint, GitHub, LinkedIn, CV link (Finale)

---

## Build order

Build the story in the same order the player meets it, and make each chapter playable before starting the next:

1. **StoryManager + Bloom controller + save/load**: the backbone.
2. **Prologue** in the existing entrance area: proves the faded → bloom moment feels good.
3. **Kitsu**: follower and speech bubbles.
4. **Portfolio Mode**: so the site is usable as a portfolio from early on.
5. Chapters 1 → 5, then the Finale.

Each item becomes a sub-phase in `docs/roadmap/` with its own `plan.md` when it starts.
