import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { WorldLayout } from './WorldLayout.js'

/**
 * RockFormations: Natural stylized stone boulders, modular blocky pond stones,
 * river pebbles, and magical fantasy runestones placed across Sakura Veil.
 */
export class RockFormations
{
    constructor()
    {
        this.game = Game.getInstance()
        this.group = new THREE.Group()
        this.group.name = 'rockFormations'

        this.initPrototypes()

        // 1. Lotus Park / Pond: Modular blocky stones edging and stepping stones
        this.setLotusParkBlockyRocks()

        // 2. River banks and Arched Bridge
        this.setRiverAndBridgeRocks()

        // 3. Waterfalls: Mountain cascade and gorge cataract boulders
        this.setWaterfallRocks()

        // 4. Roads, Paths & prominent Sakura trees
        this.setRoadAndTreeRocks()

        // 5. Mystical Fantasy Runestones & Crystal Spires
        this.setFantasyRunestones()

        // 6. Traditional Japanese Stone Toro Lanterns
        this.setJapaneseStoneLamps()

        this.game.scene.add(this.group)
    }

    initPrototypes()
    {
        // Extract blocky rock submeshes (12 unique rock models in the set)
        this.blockyMeshes = []
        if(this.game.resources.blockyRocksModel?.scene)
        {
            this.game.resources.blockyRocksModel.scene.traverse((child) =>
            {
                if(child.isMesh)
                {
                    child.castShadow = true
                    child.receiveShadow = true
                    this.blockyMeshes.push(child)
                }
            })
        }

        // Stylized Rock (smooth hand-painted anime boulder)
        this.stylizedMesh = null
        if(this.game.resources.stylizedRockModel?.scene)
        {
            this.game.resources.stylizedRockModel.scene.traverse((child) =>
            {
                if(child.isMesh && !this.stylizedMesh)
                {
                    child.castShadow = true
                    child.receiveShadow = true
                    this.stylizedMesh = child
                }
            })
        }

        // Low Poly Stylized Rock (tall faceted cliff boulder)
        this.lowPolyMesh = null
        if(this.game.resources.lowPolyRockModel?.scene)
        {
            this.game.resources.lowPolyRockModel.scene.traverse((child) =>
            {
                if(child.isMesh && !this.lowPolyMesh)
                {
                    child.castShadow = true
                    child.receiveShadow = true
                    this.lowPolyMesh = child
                }
            })
        }

        // Small Rock 2 (ground pebbles & roadside detail)
        this.smallMesh = null
        if(this.game.resources.smallRockModel?.scene)
        {
            this.game.resources.smallRockModel.scene.traverse((child) =>
            {
                if(child.isMesh && !this.smallMesh)
                {
                    child.castShadow = true
                    child.receiveShadow = true
                    this.smallMesh = child
                }
            })
        }
    }

    createBlockyRock(index, scale = 0.015)
    {
        if(!this.blockyMeshes.length)
            return null

        const source = this.blockyMeshes[index % this.blockyMeshes.length]
        const mesh = new THREE.Mesh(source.geometry, source.material)
        mesh.castShadow = true
        mesh.receiveShadow = true
        mesh.scale.setScalar(scale)
        return mesh
    }

    createStylizedRock(scale = 1.0)
    {
        if(!this.stylizedMesh)
            return null

        const mesh = new THREE.Mesh(this.stylizedMesh.geometry, this.stylizedMesh.material)
        mesh.castShadow = true
        mesh.receiveShadow = true
        mesh.scale.setScalar(scale)
        return mesh
    }

    createLowPolyRock(scale = 1.0)
    {
        if(!this.lowPolyMesh)
            return null

        const mesh = new THREE.Mesh(this.lowPolyMesh.geometry, this.lowPolyMesh.material)
        mesh.castShadow = true
        mesh.receiveShadow = true
        mesh.scale.setScalar(scale)
        return mesh
    }

    createSmallPebble(scale = 0.35)
    {
        if(!this.smallMesh)
            return null

        const mesh = new THREE.Mesh(this.smallMesh.geometry, this.smallMesh.material)
        mesh.castShadow = true
        mesh.receiveShadow = true
        mesh.scale.setScalar(scale)
        return mesh
    }

    /**
     * 1. Lotus Park / Pond:
     * Traditional Japanese stone garden perimeter edging and submerged stepping stones.
     */
    setLotusParkBlockyRocks()
    {
        const pondData = WorldLayout.ponds[0]
        const pondX = pondData ? pondData.x : -165
        const pondZ = pondData ? pondData.z : -155
        const radius = pondData ? pondData.radius : 28
        const waterY = WorldLayout.getElevation(pondX, pondZ) + 0.8

        // A. Perimeter rocks framing the pond shoreline
        const perimeterCount = 28
        for(let i = 0; i < perimeterCount; i++)
        {
            const angle = (i / perimeterCount) * Math.PI * 2 + Math.sin(i * 3.4) * 0.15
            const r = radius + 0.5 + Math.sin(i * 2.7) * 2.2
            const rx = pondX + Math.cos(angle) * r
            const rz = pondZ + Math.sin(angle) * r
            const ry = WorldLayout.getElevation(rx, rz)

            const scale = 0.012 + (i % 4) * 0.003
            const rock = this.createBlockyRock(i, scale)
            if(rock)
            {
                rock.position.set(rx, ry + scale * 15, rz)
                rock.rotation.set((i * 0.2) % 0.4, angle + Math.PI * 0.5, (i * 0.3) % 0.3)
                this.group.add(rock)
            }
        }

        // B. Stepping stones extending into the shallow water
        const steppingAngles = [ -0.3, -0.22, -0.14, -0.06, 0.02 ]
        steppingAngles.forEach((a, idx) =>
        {
            const r = radius - 2 - idx * 2.8
            const sx = pondX + Math.cos(a) * r
            const sz = pondZ + Math.sin(a) * r

            const rock = this.createBlockyRock(idx * 2 + 1, 0.014)
            if(rock)
            {
                rock.position.set(sx, waterY + 0.15, sz)
                rock.rotation.y = idx * 1.1
                this.group.add(rock)
            }
        })

        // C. Zen meditation rock arrangement near pond entrance
        const zenViewX = pondX + 24
        const zenViewZ = pondZ + 18
        for(let z = 0; z < 3; z++)
        {
            const rock = this.createBlockyRock(z + 4, 0.018 - z * 0.003)
            if(rock)
            {
                const zx = zenViewX + (z - 1) * 3.2
                const zz = zenViewZ + (z % 2) * 1.8
                const zy = WorldLayout.getElevation(zx, zz)
                rock.position.set(zx, zy + 0.3, zz)
                rock.rotation.set(0.1, z * 2.1, -0.1)
                this.group.add(rock)
            }
        }
    }

    /**
     * 2. River banks and Arched Bridge:
     * Stylized boulders framing the river curves and bridge abutments.
     */
    setRiverAndBridgeRocks()
    {
        // A. Bridge Abutments (framing the red arched bridge at X: 130, Z: 80)
        const bridgePositions = [
            { x: 122, z: 86, scale: 2.2, type: 'stylized' },
            { x: 120, z: 74, scale: 1.8, type: 'lowpoly' },
            { x: 138, z: 88, scale: 2.0, type: 'stylized' },
            { x: 140, z: 72, scale: 2.4, type: 'lowpoly' },
            { x: 125, z: 92, scale: 0.45, type: 'pebble' },
            { x: 118, z: 70, scale: 0.5, type: 'pebble' },
            { x: 135, z: 94, scale: 0.4, type: 'pebble' },
            { x: 142, z: 68, scale: 0.48, type: 'pebble' },
        ]

        bridgePositions.forEach((pos, idx) =>
        {
            let rock = null
            if(pos.type === 'stylized') rock = this.createStylizedRock(pos.scale)
            else if(pos.type === 'lowpoly') rock = this.createLowPolyRock(pos.scale)
            else rock = this.createSmallPebble(pos.scale)

            if(rock)
            {
                const y = WorldLayout.getElevation(pos.x, pos.z)
                rock.position.set(pos.x, y + (pos.type === 'pebble' ? 0.05 : 0.4), pos.z)
                rock.rotation.set(idx * 0.3, idx * 1.7, (idx * 0.4) % 0.5)
                this.group.add(rock)
            }
        })

        // B. Riverbank Boulders along the river path
        const riverWaypoints = [
            { x: 32, z: -185 },
            { x: 50, z: -160 },
            { x: 75, z: -125 },
            { x: 95, z: -80 },
            { x: 110, z: -30 },
            { x: 118, z: 25 },
            { x: 145, z: 125 },
            { x: 175, z: 175 },
            { x: 215, z: 225 },
            { x: 245, z: 260 }
        ]

        riverWaypoints.forEach((pt, i) =>
        {
            // Left bank rock
            const lScale = 1.3 + (i % 3) * 0.45
            const lRock = (i % 2 === 0) ? this.createStylizedRock(lScale) : this.createLowPolyRock(lScale)
            if(lRock)
            {
                const lx = pt.x - 7.5 + Math.sin(i) * 2
                const lz = pt.z + Math.cos(i) * 2
                const ly = WorldLayout.getElevation(lx, lz)
                lRock.position.set(lx, ly + 0.3, lz)
                lRock.rotation.set(i * 0.4, i * 2.2, 0)
                this.group.add(lRock)
            }

            // Right bank rock
            const rScale = 1.1 + ((i + 1) % 3) * 0.5
            const rRock = (i % 2 === 1) ? this.createStylizedRock(rScale) : this.createLowPolyRock(rScale)
            if(rRock)
            {
                const rx = pt.x + 7.5 + Math.cos(i) * 2
                const rz = pt.z - Math.sin(i) * 2
                const ry = WorldLayout.getElevation(rx, rz)
                rRock.position.set(rx, ry + 0.3, rz)
                rRock.rotation.set(i * 0.5, i * 1.5, 0)
                this.group.add(rRock)
            }

            // River shoreline pebbles
            for(let p = 0; p < 2; p++)
            {
                const pebble = this.createSmallPebble(0.3 + p * 0.15)
                if(pebble)
                {
                    const px = pt.x + (p === 0 ? -5 : 5) + Math.sin(i + p) * 1.5
                    const pz = pt.z + Math.cos(i + p) * 1.5
                    const py = WorldLayout.getElevation(px, pz)
                    pebble.position.set(px, py + 0.05, pz)
                    pebble.rotation.y = (i + p) * 1.8
                    this.group.add(pebble)
                }
            }
        })
    }

    /**
     * 3. Waterfalls:
     * Massive crags and spray boulders flanking Great Mountain Waterfall and Gorge Cataracts.
     */
    setWaterfallRocks()
    {
        // Great Mountain Waterfall plunge pool & cliff flank (X: 20–25, Z: -208 to -198)
        const fallPositions = [
            // Left cliff flank
            { x: 14, z: -205, scale: 2.8, type: 'lowpoly' },
            { x: 12, z: -198, scale: 2.2, type: 'stylized' },
            { x: 16, z: -192, scale: 1.9, type: 'stylized' },
            // Right cliff flank
            { x: 32, z: -206, scale: 3.0, type: 'lowpoly' },
            { x: 34, z: -199, scale: 2.4, type: 'stylized' },
            { x: 30, z: -193, scale: 2.1, type: 'stylized' },
            // Pool border stepping boulders
            { x: 20, z: -188, scale: 1.6, type: 'stylized' },
            { x: 28, z: -189, scale: 1.5, type: 'lowpoly' },
            // Water spray pebbles
            { x: 18, z: -190, scale: 0.45, type: 'pebble' },
            { x: 24, z: -186, scale: 0.4, type: 'pebble' },
            { x: 31, z: -188, scale: 0.42, type: 'pebble' }
        ]

        fallPositions.forEach((pos, idx) =>
        {
            let rock = null
            if(pos.type === 'stylized') rock = this.createStylizedRock(pos.scale)
            else if(pos.type === 'lowpoly') rock = this.createLowPolyRock(pos.scale)
            else rock = this.createSmallPebble(pos.scale)

            if(rock)
            {
                const y = WorldLayout.getElevation(pos.x, pos.z)
                rock.position.set(pos.x, y + (pos.type === 'pebble' ? 0.05 : 0.45), pos.z)
                rock.rotation.set((idx * 0.4) % 0.8, idx * 2.1, 0)
                this.group.add(rock)
            }
        })

        // Gorge Cataract cascade crags (X: 70, Z: -140)
        const cataractRocks = [
            { x: 63, z: -144, scale: 2.5, type: 'lowpoly' },
            { x: 65, z: -136, scale: 2.0, type: 'stylized' },
            { x: 77, z: -143, scale: 2.6, type: 'lowpoly' },
            { x: 76, z: -135, scale: 1.9, type: 'stylized' },
            { x: 68, z: -138, scale: 1.4, type: 'stylized' } // in-stream breaker rock
        ]

        cataractRocks.forEach((pos, idx) =>
        {
            const rock = (pos.type === 'lowpoly') ? this.createLowPolyRock(pos.scale) : this.createStylizedRock(pos.scale)
            if(rock)
            {
                const y = WorldLayout.getElevation(pos.x, pos.z)
                rock.position.set(pos.x, y + 0.35, pos.z)
                rock.rotation.set(idx * 0.3, idx * 1.9, 0)
                this.group.add(rock)
            }
        })
    }

    /**
     * 4. Roads, Paths & prominent Sakura trees:
     * Natural stone arrangements flanking path crossings and scenic cherry trees.
     */
    setRoadAndTreeRocks()
    {
        const scenicSpots = [
            { x: 35, z: 950 },   // Sakura Blossom Grove entrance
            { x: -80, z: 650 },  // Awakening Beach path rise
            { x: 150, z: 320 },  // East Torii path junction
            { x: -280, z: 420 }, // West Hill approach
            { x: -20, z: 450 },  // Central shrine crossroads
            { x: 70, z: 220 },   // South river meander
            { x: -220, z: 180 }, // Bamboo/Sakura border
        ]

        scenicSpots.forEach((spot, i) =>
        {
            // Medium stylized anchor stone
            const anchor = (i % 2 === 0) ? this.createStylizedRock(1.6) : this.createLowPolyRock(1.5)
            if(anchor)
            {
                const ax = spot.x + 3.5
                const az = spot.z + 2.0
                const ay = WorldLayout.getElevation(ax, az)
                anchor.position.set(ax, ay + 0.3, az)
                anchor.rotation.set(0.1, i * 1.8, 0)
                this.group.add(anchor)
            }

            // 2-3 companion small pebbles
            for(let p = 0; p < 3; p++)
            {
                const pebble = this.createSmallPebble(0.28 + p * 0.1)
                if(pebble)
                {
                    const px = spot.x + (Math.sin(p * 2.3) * 2.2)
                    const pz = spot.z + (Math.cos(p * 2.1) * 2.2)
                    const py = WorldLayout.getElevation(px, pz)
                    pebble.position.set(px, py + 0.05, pz)
                    pebble.rotation.y = (i + p) * 1.4
                    this.group.add(pebble)
                }
            }
        })
    }

    /**
     * 5. Mystical Fantasy Runestones & Crystal Spires:
     * Glowing magical standing stones marking sacred gateways and secret shrines.
     */
    setFantasyRunestones()
    {
        // A. Fantasy Runestone (mossy monolith with glowing blue rune)
        const runeModel = this.game.resources.fantasyRockModel?.scene
        if(runeModel)
        {
            const runeSites = [
                { x: 42, z: -175, rotY: 0.6, scale: 1.3 },   // Sunken Torii gorge entrance
                { x: -110, z: -125, rotY: -0.8, scale: 1.2 }, // Ancient Gate & Lotus Pond path
                { x: 38, z: -202, rotY: 2.2, scale: 1.4 },   // Great Waterfall secret alcove
                { x: -145, z: 80, rotY: 1.5, scale: 1.2 }     // West Guardian shrine path
            ]

            runeSites.forEach((site) =>
            {
                const clone = runeModel.clone(true)
                clone.traverse((child) =>
                {
                    if(child.isMesh)
                    {
                        child.castShadow = true
                        child.receiveShadow = true
                        if(child.material)
                        {
                            child.material.emissiveIntensity = 2.5
                        }
                    }
                })

                const y = WorldLayout.getElevation(site.x, site.z)
                clone.position.set(site.x, y + 1.2, site.z)
                clone.rotation.y = site.rotY
                clone.scale.setScalar(site.scale)
                this.group.add(clone)
            })
        }

        // B. Fantasy Crystal Spire (dark crystal monolith with glowing white sigil)
        const spireModel = this.game.resources.fantasySpireModel?.scene
        if(spireModel)
        {
            const spireSites = [
                { x: -150, z: -180, rotY: 0.2, scale: 0.9 }, // Overlooking Lotus Pond
                { x: 110, z: 65, rotY: -1.2, scale: 0.85 },  // Overlooking Arched Bridge
                { x: 12, z: -212, rotY: 1.8, scale: 1.0 }    // High Pagoda cliff ledge
            ]

            spireSites.forEach((site) =>
            {
                const clone = spireModel.clone(true)
                clone.traverse((child) =>
                {
                    if(child.isMesh)
                    {
                        child.castShadow = true
                        child.receiveShadow = true
                    }
                })

                const y = WorldLayout.getElevation(site.x, site.z)
                clone.position.set(site.x, y - 0.4, site.z)
                clone.rotation.y = site.rotY
                clone.scale.setScalar(site.scale)
                this.group.add(clone)
            })
        }
    }

    /**
     * 6. Traditional Japanese Stone Toro Lanterns:
     * Authentic weathered stone lanterns placed beside the Lotus Pond and Bridge.
     */
    setJapaneseStoneLamps()
    {
        const lampModel = this.game.resources.japaneseStoneLampModel?.scene
        if(!lampModel)
            return

        const lampSites = [
            { x: -142, z: -145, rotY: -0.6 }, // Lotus Pond viewing perch
            { x: -178, z: -172, rotY: 1.2 },  // Lotus Pond far bank
            { x: 124, z: 98, rotY: 0.4 },     // Arched Bridge northern entrance
            { x: 136, z: 62, rotY: 2.1 }      // Arched Bridge southern entrance
        ]

        lampSites.forEach((site) =>
        {
            const clone = lampModel.clone(true)
            clone.traverse((child) =>
            {
                if(child.isMesh)
                {
                    child.castShadow = true
                    child.receiveShadow = true
                    if(child.material?.emissive)
                    {
                        child.material.emissiveIntensity = 2.0
                    }
                }
            })

            const y = WorldLayout.getElevation(site.x, site.z)
            clone.position.set(site.x, y, site.z)
            clone.rotation.y = site.rotY
            clone.scale.setScalar(0.045) // Scale down from FBX 50-unit height to ~2.25m
            this.group.add(clone)
        })
    }
}
