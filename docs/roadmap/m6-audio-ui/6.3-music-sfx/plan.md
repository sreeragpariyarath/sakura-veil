# 6.3 Festival music and SFX

**Goal:** sound that gets more festive with each lantern.

**Files:** `sources/Game/Audio.js` (Howler).

## Steps
1. [ ] Ambience: wind, birds, river (Freesound / Pixabay CC0); log credits.
2. [ ] Music in 3–5 synced layers (e.g. koto, flute, percussion); each layer's volume follows `festival`.
3. [ ] SFX: lantern light chime, confetti pop, fireworks whoosh and bangs, card open/close.
4. [ ] Respect the existing mute toggle; start audio only after the first user input.

## Done when
- [ ] At 0 lanterns the garden is calm; at 5 it sounds like a festival.

## Progress
- [x] First festival track (`static/sounds/musics/festival-bgm-1.mp3`) with a play/pause button under the map button (`FestivalMusic.js`): 2 s fade in, 1 s fade out, choice remembered.
- [ ] Layers that follow the festival level, ambience and SFX (steps above).
