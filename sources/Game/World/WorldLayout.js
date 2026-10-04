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
     * Evaluated identically on CPU (physics, player hover, trees, landmarks) and in shaders.
     * Features:
     * - South shoreline at Y = 0 to 2m (gentle beach shelf at Awakening Beach)
     * - Central Plains & Sakura Blossom Grove at Y = 12 to 16m with rolling hills
     * - Western Hill Region (Fox Shrine & Ancient Gate) at Y = 20 to 35m
     * - Shadow Woods eastern rocky crags at Y = 30 to 48m
     * - Pagoda Mountain Peak soaring to Y = 85 to 95m at the northern summit
     * - Curvy organic undulations (no flat tabletop ground anywhere!)
     * - Carved river gorge and sunken lotus pond basin
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
            return Math.max(-12, - 0.4 - oceanDist * 0.08)
        }

        // Coastal beach shelf (smooth ramp from sea level inland)
        const coastDist = islandR - dist
        const coastFactor = Math.min(1, Math.max(0, coastDist / 65))

        // 2. Continental Northward Rise:
        // Awakening Beach (Z = 1300): south shore
        // Northern mountain range (Z = -1300): peak massif
        const northProgress = Math.min(1, Math.max(0, (1350 - z) / 2650))
        let baseElevation = Math.pow(northProgress, 1.8) * 48 // climbs from 0 to 48m

        // 3. Pagoda Mountain Massif (Northern summit area: X: 0, Z: -1300)
        const mountainDist = Math.hypot(x, z - (-1250))
        if(mountainDist < 580)
        {
            const mtFactor = 1 - mountainDist / 580
            // Dramatic steep mountain peak rising up to +88m summit
            baseElevation += Math.pow(mtFactor, 1.5) * 44
        }

        // 4. Western Hill Region (Fox Shrine & Ancient Gate foothills)
        const westDist = Math.hypot(x - (-780), z - 50)
        if(westDist < 750)
        {
            const westFactor = 1 - westDist / 750
            baseElevation += Math.pow(westFactor, 1.6) * 18
        }

        // 5. Eastern Shadow Woods Craggy Foothills (X: 950, Z: -600)
        const eastDist = Math.hypot(x - 950, z - (-600))
        if(eastDist < 620)
        {
            const eastFactor = 1 - eastDist / 620
            baseElevation += Math.pow(eastFactor, 1.5) * 22
        }

        // 6. Organic Curvy Undulations & Rolling Hills (multi-frequency harmonics)
        // Eliminates flat tabletop surfaces everywhere across the realm
        const rollingWaves = Math.sin(x * 0.0085 + 0.5) * Math.cos(z * 0.0078 - 0.3) * 4.2
                           + Math.sin((x + z) * 0.017) * 2.0
                           + Math.cos((x - z) * 0.032) * 1.0

        let total = (baseElevation + rollingWaves) * coastFactor

        // 7. Carve River Gorge (sloped natural canyon 3.5 to 6m deep)
        const riverDist = this.getRiverDistance(x, z)
        const riverHalfWidth = this.river.width * 0.9
        if(riverDist < riverHalfWidth)
        {
            const riverFactor = 1 - riverDist / riverHalfWidth
            const riverDepression = (3.5 + Math.sin(z * 0.01) * 1.0) * Math.pow(riverFactor, 1.5)
            total -= riverDepression
        }

        // 8. Carve Lotus Pond Basin (sunken mountain lake)
        const pond = this.ponds[0]
        const pondDist = Math.hypot(x - pond.x, z - pond.z)
        if(pondDist < pond.radius * 1.3)
        {
            const pondFactor = Math.min(1, Math.max(0, 1 - pondDist / (pond.radius * 1.3)))
            total -= Math.pow(pondFactor, 1.4) * 4.5
        }

        return Math.max(-10, total)
    },
}
