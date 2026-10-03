# 2.3 Lit state

**Goal:** a lantern clearly changes from "unlit" to "lit" the first time it's used.

**Files:** `sources/Game/World/Lanterns.js`.

## Steps
1. [ ] Unlit look: a soft glow and a gentle floating marker above it so it's easy to find from far away.
2. [ ] Lit look: warm emissive light inside the lamp (TSL uniform 0 → 1, eased with GSAP), plus a small halo sprite. No real point lights.
3. [ ] On first light: a small burst with `world.confetti.pop(position)`.
4. [ ] Hide the floating marker once lit; the lantern can still be reopened.
5. [ ] Emit `lanterns.events.trigger('lit', [ id, count ])` for M4 and M6.

## Done when
- [ ] From a distance you can tell which lanterns are lit and which are not.
