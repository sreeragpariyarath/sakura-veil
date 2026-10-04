// Layout of Sauraka Veil (sakura_veil_story_and_characters.md, docs/roadmap/m1-festival-garden/1.1-island-coastline-and-world-structure.md).
// Epic Open-World RPG Scale: 3,600 x 3,600 m realm, ~3,000 m (3 km) diameter island.
// Pure data in world metres: X = east (+), Z = south (+) [Player arrives at the south beach and journeys north (-Z)].
// At 20 m/s boost flight, crossing takes ~2.5 minutes; at normal 8 m/s cruise, it takes ~6.5 minutes.

export const WorldLayout = {
    // Total realm canvas (3,600 x 3,600 m centered at origin)
    size: 3600,

    // Invisible physical world boundary (placed out in deep ocean)
    boundary: 1750,

    // Narrative arenas and landmarks matching the canon map (scaled for 3km island)
    arenas: [
        { id: 'landing',  name: 'Awakening Beach',             x:    0, z:  1300, radius: 180, facing: Math.PI },
        { id: 'fox',      name: 'The Fox Shrine',              x: -750, z:   680, radius: 150, facing: Math.PI * 0.75 },
        { id: 'grove',    name: 'Sakura Blossom Grove',        x:    0, z:    90, radius: 210, facing: Math.PI,        guardian: 1, lantern: 'about',      lanternOffset: { x: -65, z: -110 } },
        { id: 'river',    name: 'River Crossing',              x:  750, z:   490, radius: 160, facing: Math.PI * 1.25, guardian: 2, lantern: 'experience', lanternOffset: { x:  65, z: -100 } },
        { id: 'torii',    name: 'Sunken Torii Chasm',          x: -140, z:  -400, radius: 160, facing: Math.PI,        guardian: 3, lantern: 'skills',     lanternOffset: { x: -50, z: -105 } },
        { id: 'gate',     name: 'Ancient Gate & Lotus Pond',   x: -990, z:  -760, radius: 190, facing: Math.PI * 0.85, guardian: 4, lantern: 'projects',   lanternOffset: { x:  50, z: -115 } },
        { id: 'werewolf', name: 'Shadow Woods',                x:  990, z:  -680, radius: 220, facing: Math.PI * 1.15 },
        { id: 'summit',   name: 'Pagoda Mountain Peak',        x:    0, z: -1390, radius: 250, facing: Math.PI,        guardian: 5, lantern: 'contact',    lanternOffset: { x:   0, z: -150 } },
    ],

    // Stone and dirt paths linking the zones
    paths: [
        [ 'landing',  'fox' ],
        [ 'landing',  'grove' ],
        [ 'landing',  'river' ],
        [ 'fox',      'gate' ],
        [ 'grove',    'torii' ],
        [ 'river',    'werewolf' ],
        [ 'gate',     'torii' ],
        [ 'torii',    'summit' ],
        [ 'gate',     'summit' ],
        [ 'werewolf', 'summit' ],
    ],
    pathWidth: 32,

    // Island coastline shape: returns the island radius (in metres from origin) at polar angle theta
    getIslandRadius(angle)
    {
        // Base radius 1,480m (~3,000m island diameter) with natural organic harmonic bays & capes
        let r = 1480
            + 85 * Math.sin(angle * 3 + 0.4)
            + 65 * Math.cos(angle * 5 - 1.1)
            + 35 * Math.sin(angle * 7 + 2.0)

        // Broader, flatter beach shelf to the south (angle around +PI/2)
        if(angle > 0.4 && angle < 2.7)
        {
            r += 75 * Math.sin((angle - 0.4) / 2.3 * Math.PI)
        }

        return Math.min(1650, Math.max(1320, r))
    },

    // Check if coordinates (x, z) are on the dry island landmass
    isLand(x, z)
    {
        const dist = Math.hypot(x, z)
        const angle = Math.atan2(z, x)
        return dist < this.getIslandRadius(angle)
    },

    // River flowing from the northern mountain waterfall down east past River Crossing into the sea
    river: {
        width: 80,
        points: [
            { x:  135, z: -1170 },
            { x:  405, z:  -810 },
            { x:  720, z:  -270 },
            { x:  855, z:   225 },
            { x:  990, z:   585 },
            { x: 1300, z:   945 },
            { x: 1750, z:  1260 },
        ],
    },

    // Lotus Pond in the northwest beside the Ancient Gate
    ponds: [
        { x: -990, z: -900, radius: 155 },
    ],

    getArena(id)
    {
        return this.arenas.find(arena => arena.id === id)
    },
}
