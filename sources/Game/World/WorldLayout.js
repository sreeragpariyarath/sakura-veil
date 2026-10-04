// Layout of Sauraka Veil (sakura_veil_story_and_characters.md, docs/roadmap/m1-festival-garden/1.1-island-coastline-and-world-structure.md).
// Cozy Island Realm: ~700 x 700 m realm canvas, ~550 m diameter island.
// Pure data in world metres: X = east (+), Z = south (+) [Player arrives at the south beach and journeys north (-Z)].
// Crossing takes ~25-35 seconds with flight, allowing all landmarks to be clearly seen and explored.

export const WorldLayout = {
    // Total realm canvas (700 x 700 m centered at origin)
    size: 700,

    // Invisible physical world boundary (placed out in ocean)
    boundary: 340,

    // Narrative arenas and landmarks matching the canon map (scaled for cozy 550m island)
    arenas: [
        { id: 'landing',  name: 'Awakening Beach',             x:    0, z:   220, radius: 36, facing: Math.PI },
        { id: 'fox',      name: 'The Fox Shrine',              x: -135, z:   115, radius: 28, facing: Math.PI * 0.75 },
        { id: 'grove',    name: 'Sakura Blossom Grove',        x:    0, z:    15, radius: 38, facing: Math.PI,        guardian: 1, lantern: 'about',      lanternOffset: { x: -12, z: -20 } },
        { id: 'river',    name: 'River Crossing',              x:  130, z:    80, radius: 28, facing: Math.PI * 1.25, guardian: 2, lantern: 'experience', lanternOffset: { x:  12, z: -18 } },
        { id: 'torii',    name: 'Sunken Torii Chasm',          x:  -25, z:   -70, radius: 28, facing: Math.PI,        guardian: 3, lantern: 'skills',     lanternOffset: { x:  -9, z: -18 } },
        { id: 'gate',     name: 'Ancient Gate & Lotus Pond',   x: -165, z:  -130, radius: 32, facing: Math.PI * 0.85, guardian: 4, lantern: 'projects',   lanternOffset: { x:   9, z: -20 } },
        { id: 'werewolf', name: 'Shadow Woods',                x:  165, z:  -115, radius: 35, facing: Math.PI * 1.15 },
        { id: 'summit',   name: 'Pagoda Mountain Peak',        x:    0, z:  -235, radius: 42, facing: Math.PI,        guardian: 5, lantern: 'contact',    lanternOffset: { x:   0, z: -25 } },
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
    pathWidth: 9,

    // Island coastline shape: returns the island radius (in metres from origin) at polar angle theta
    getIslandRadius(angle)
    {
        // Base radius 260m (~520-550m island diameter) with natural organic harmonic bays & capes
        let r = 260
            + 15 * Math.sin(angle * 3 + 0.4)
            + 12 * Math.cos(angle * 5 - 1.1)
            + 6 * Math.sin(angle * 7 + 2.0)

        // Broader, flatter beach shelf to the south (angle around +PI/2)
        if(angle > 0.4 && angle < 2.7)
        {
            r += 14 * Math.sin((angle - 0.4) / 2.3 * Math.PI)
        }

        return Math.min(290, Math.max(230, r))
    },

    // Check if coordinates (x, z) are on the dry island landmass
    isLand(x, z)
    {
        const dist = Math.hypot(x, z)
        const angle = Math.atan2(z, x)
        return dist < this.getIslandRadius(angle)
    },

    // River flowing from northern mountain waterfall down east past River Crossing into the sea
    river: {
        width: 14,
        points: [
            { x:  25, z: -200 },
            { x:  70, z: -140 },
            { x: 125, z:  -45 },
            { x: 150, z:   40 },
            { x: 175, z:  100 },
            { x: 230, z:  165 },
            { x: 300, z:  220 },
        ],
    },

    // Lotus Pond in the northwest beside the Ancient Gate
    ponds: [
        { x: -165, z: -155, radius: 28 },
    ],

    getArena(id)
    {
        return this.arenas.find(arena => arena.id === id)
    },

    // Distance from world position (x, z) to the nearest river centerline segment
    getRiverDistance(x, z)
    {
        let minDist = Infinity
        const pts = this.river.points
        for(let i = 0; i < pts.length - 1; i++)
        {
            const a = pts[i]
            const b = pts[i + 1]
            const abx = b.x - a.x
            const abz = b.z - a.z
            const lenSq = abx * abx + abz * abz
            if(lenSq === 0) continue

            const apx = x - a.x
            const apz = z - a.z
            const t = Math.max(0, Math.min(1, (apx * abx + apz * abz) / lenSq))
            const projX = a.x + abx * t
            const projZ = a.z + abz * t
            const dist = Math.hypot(x - projX, z - projZ)
            if(dist < minDist) minDist = dist
        }
        return minDist
    },

    /**
     * Compute ground elevation (Y in world metres) for any (x, z) coordinates.
     * Evaluated identically on CPU and in shaders.
     */
    getElevation(x, z)
    {
        const dist = Math.hypot(x, z)
        const angle = Math.atan2(z, x)
        const islandR = this.getIslandRadius(angle)

        // 1. Deep ocean dropoff outside island coastline
        if(dist >= islandR)
        {
            const oceanDist = dist - islandR
            return Math.max(-12, - 0.4 - oceanDist * 0.12)
        }

        // Coastal beach shelf (smooth ramp from sea level inland)
        const coastDist = islandR - dist
        const coastFactor = Math.min(1, Math.max(0, coastDist / 20))

        // 2. Continental Northward Rise:
        // Awakening Beach (Z = 220): south shore
        // Northern mountain range (Z = -235): peak massif
        const northProgress = Math.min(1, Math.max(0, (230 - z) / 465))
        let baseElevation = Math.pow(northProgress, 1.8) * 16 // climbs from 0 to 16m

        // 3. Pagoda Mountain Massif (Northern summit area: X: 0, Z: -235)
        const mountainDist = Math.hypot(x, z - (-230))
        if(mountainDist < 110)
        {
            const mtFactor = 1 - mountainDist / 110
            baseElevation += Math.pow(mtFactor, 1.5) * 22
        }

        // 4. Western Hill Region (Fox Shrine & Ancient Gate foothills)
        const westDist = Math.hypot(x - (-140), z - 10)
        if(westDist < 140)
        {
            const westFactor = 1 - westDist / 140
            baseElevation += Math.pow(westFactor, 1.6) * 6
        }

        // 5. Eastern Shadow Woods Craggy Foothills (X: 165, Z: -115)
        const eastDist = Math.hypot(x - 165, z - (-115))
        if(eastDist < 120)
        {
            const eastFactor = 1 - eastDist / 120
            baseElevation += Math.pow(eastFactor, 1.5) * 8
        }

        // 6. Organic Curvy Undulations & Rolling Hills
        const rollingWaves = Math.sin(x * 0.045 + 0.5) * Math.cos(z * 0.042 - 0.3) * 0.8
                           + Math.sin((x + z) * 0.085) * 0.4

        let total = (baseElevation + 0.6 + rollingWaves) * coastFactor

        // 7. Carve River Gorge (sloped natural canyon)
        const riverDist = this.getRiverDistance(x, z)
        const riverHalfWidth = this.river.width * 0.9
        if(riverDist < riverHalfWidth)
        {
            const riverFactor = 1 - riverDist / riverHalfWidth
            const riverDepression = 2.0 * Math.pow(riverFactor, 1.5)
            total -= riverDepression
        }

        // 8. Carve Lotus Pond Basin (sunken lake)
        const pond = this.ponds[0]
        const pondDist = Math.hypot(x - pond.x, z - pond.z)
        if(pondDist < pond.radius * 1.3)
        {
            const pondFactor = Math.min(1, Math.max(0, 1 - pondDist / (pond.radius * 1.3)))
            total -= Math.pow(pondFactor, 1.4) * 2.5
        }

        return Math.max(-8, total)
    },
}
