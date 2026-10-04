# 8.3 Guardians 1 to 3: Agile Spirit, Mountain Oni, Buried Beast

**Goal:** Implement the first three Level Guardians guarding Veil I (Memory), Veil II (Identity), and Veil III (Emotion).

## The Three Guardians

1. **Level 1: Agile Spirit Guardian (Veil I: Memory)**
   - Location: Forest Shrine area.
   - Combat style: High mobility, dash slashes, teleport strikes.
   - Teaches: Attack anticipation, dodge timing, counter-windows.
   - Narrative: Challenges Rei on whether memories define a person.

2. **Level 2: Mountain Oni (Veil II: Identity)**
   - Location: Mountain Pass / Rocky plateau (Minotaur asset).
   - Combat style: Heavy ground pounds, shockwaves, charging rush.
   - Teaches: Spacing, vertical flight evasion (ascending above shockwaves).
   - Narrative: Symbolizes the heavy emotional burden of Kaori's past.

3. **Level 3: Buried Beast (Veil III: Emotion)**
   - Location: Underground Ruins / Cavern deep below the Torii path.
   - Combat style: Subterranean burrowing, emerging swipes, area spikes.
   - Teaches: Environmental awareness, target switching.
   - Narrative: Symbolizes suppressed emotions and unresolved desires.

## Steps

1. [ ] Create a reusable `Guardian.js` base class inheriting from enemy logic with health bars, phase triggers, and relic drop events.
2. [ ] Implement Level 1: Agile Spirit Guardian with fast animation state machine.
3. [ ] Implement Level 2: Mountain Oni with shockwave particle effects and charge collision.
4. [ ] Implement Level 3: Buried Beast with underground burrowing / resurfacing logic.
5. [ ] Connect defeating each guardian to unlocking its associated Veil (Relic/Lock) and opening the corresponding portfolio card.

## Done when

- [ ] All three guardians function with distinct attack profiles and telegraphs.
- [ ] Defeating a guardian unlocks its Veil and reveals a memory fragment of Kaori.
