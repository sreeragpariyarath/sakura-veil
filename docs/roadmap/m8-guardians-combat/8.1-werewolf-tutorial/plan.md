# 8.1 Shadow Werewolf Tutorial Encounter

**Goal:** Implement the opening combat encounter where Rei awakens in Sauraka Veil and faces the aggressive Shadow Werewolf (Lycan Spirit), introducing basic movement, dodging, claw combo avoidance, and Kohaku's arrival.

**Narrative Context:** [sakura_veil_story_and_characters.md#11](../../../sakura_veil_story_and_characters.md#L380-L405).

## Steps

1. [ ] **Model & Animations Setup**:
   - Import the rigged werewolf GLTF with Draco/KTX2 compression.
   - Verify and map the animation mixer actions: `idle`, `walk`/`run`, `attack_left_claw`, `attack_left_combo`, `attack_right_back`, `attack_right_claw`.
   - Setup a `Werewolf.js` entity class in `sources/Game/World/Enemies/`.
2. [ ] **Combat State Machine**:
   - Implement simple state transitions: `PATROL` / `IDLE` → `AGGRO` (detects Rei within detection radius) → `CHASE` → `ATTACK_COMBO` → `RECOVERY`.
   - Add telegraphing indicator before multi-hit claw attacks.
3. [ ] **Hitbox & Damage Interaction**:
   - Add Rapier3D sensor collider to the werewolf's claws during active attack frames.
   - Emit hit events (`player.takeDamage(amount)`) with camera shake and audio hit sound.
4. [ ] **Kohaku Rescue Cutscene / Trigger**:
   - When Rei's health reaches a critical threshold or after surviving 2 combo cycles, trigger Kohaku's appearance sequence.
   - Kohaku drives the werewolf away into the spirit mist, unlocking dialogue and the quest for the Five Veils.

## Done when

- [ ] Werewolf spawns near the awakening grove with idle/patrol animations.
- [ ] Approaching the werewolf triggers aggro and claw combo attacks.
- [ ] Player can dodge attacks using flight controls and boost.
- [ ] Kohaku rescue sequence triggers cleanly without breaking player control.
