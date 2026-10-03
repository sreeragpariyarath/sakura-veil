# Sakura Veil: Story

A happy, bright world from the first second. No darkness, nothing lost, nothing broken.

## The idea: the Sakura Festival

It's the spring **sakura festival** in the Veil. Rei, a friendly floating spirit, has been invited to help prepare the celebration: the festival starts once all **five festival lanterns** are lit. Each lantern holds a little story about the person who made this world (you).

The world is full colour, sunny and blooming from the start, exactly like the concept image. Lighting lanterns adds **more joy** on top: petal bursts, sparkles, music.

## The story in four lines

Shown as small floating text:

1. On start: *"Welcome to the Sakura Festival!"*
2. Right after: *"Light the five festival lanterns to begin the celebration."*
3. After each lantern: *"A lantern glows! (2/5)"*
4. After the last one: *"The festival begins! Thank you for visiting."* and fireworks over the pagoda.

## The garden: five zones

One big garden (about 250 × 250 m, about 30 s to cross even with boost), split into five zones. Each zone has a landmark and hides one lantern, so finding all five is a real tour.

| Zone | Landmark | Lantern |
|---|---|---|
| Sakura Grove (start) | Big sakura trees, stone path | About me |
| River Crossing | Turquoise river, red arched bridge | Experience (under or beside the bridge) |
| Torii Path | A row of torii gates up stone stairs | Skills |
| Koi Pond | Pond with stepping stones, rocks | Projects |
| Pagoda Hill | Pagoda on the hilltop | Contact (finale and fireworks here) |

Between the zones there is something worth flying to: tall trees to fly through, the river to follow, the hill to climb. Small optional secrets (a fox statue, a wind chime) can come later.

## How it plays

- 5 lanterns are hidden around the garden, one per zone, behind trees, by the bridge or up on the hill. Each has a soft glow and a floating marker so it can be spotted from far away.
- Fly to a lantern and press **E**. It lights up with a burst of petals and sparkles, and opens one portfolio card.
- Each lit lantern adds a little celebration to the world: more falling petals, warm lantern light, an extra layer of festival music.
- When all 5 are lit: fireworks over the pagoda, a big petal shower, and the final line.
- Afterwards the player keeps exploring freely, and every lantern can be reopened.

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
| Celebration level | one `festival` value (0 to 1) that raises petal amount, lantern glow and music volume |
| Fireworks | instanced glowing particles (simple, about 200) |
| Save progress | `localStorage`, the list of lit lanterns |

New code is one small `Lanterns.js` system plus the fireworks. No new models are needed.

## Content to write

- [ ] About me: 40–80 words
- [ ] Experience: 3–5 items, each a year plus one line
- [ ] Skills: a short grouped list
- [ ] Projects: 2–4 projects, each with a title, one image, one line and a link
- [ ] Contact: email, GitHub, LinkedIn, CV
