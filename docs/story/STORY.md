# Sakura Veil: Story (simple version)

One world, one goal, five lanterns. No new characters, no puzzles, no cutscenes.

## The story in four lines

Shown as floating text, one line at a time:

1. On start: *"The Veil has lost its colour."*
2. Same moment: *"Five lanterns have gone dark. Light them, little spirit."*
3. After each lantern: *"One memory returns." (2/5)*
4. After the last one: *"The Veil remembers. Thank you for visiting."*

## How it plays

- The world starts **faded**: low colour and few petals.
- **5 lanterns** stand around the existing map. Each one glows softly so it can be seen from far away.
- Fly to a lantern and press **E**. It lights up and opens one portfolio card.
- Each lit lantern makes the world a little more colourful (20% per lantern).
- When all 5 are lit, the world reaches full colour with a burst of petals and the final line appears.
- After that the player keeps exploring freely, and every lantern can be reopened.

## The five lanterns

| Lantern | Portfolio card |
|---|---|
| 1 | About me |
| 2 | Experience |
| 3 | Skills |
| 4 | Projects (can list several inside the card) |
| 5 | Contact |

## What it needs in code

| Piece | Built from |
|---|---|
| Lantern + "press E" | `InteractivePoints.js` + the existing `japanOldLampModel` |
| Portfolio card | `Modals.js` |
| Floating story text | a small HTML overlay |
| Faded → colourful | one `bloom` value (0 to 1) fed into colour saturation and petal amount |
| Save progress | `localStorage`, the list of lit lanterns |

New code is one small `Lanterns.js` system. No new models are needed.

## Content to write

- [ ] About me: 40–80 words
- [ ] Experience: 3–5 items, each a year plus one line
- [ ] Skills: a short grouped list
- [ ] Projects: 2–4 projects, each with a title, one image, one line and a link
- [ ] Contact: email, GitHub, LinkedIn, CV

## Possible additions later

Only if time allows: a fox guide, more areas, small puzzles per lantern, a Portfolio Mode page.
