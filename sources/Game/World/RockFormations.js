import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { WorldLayout } from './WorldLayout.js'
import { color, float, Fn, mix, positionWorld, texture, uniform, vec3 } from 'three/tsl'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'

/**
 * RockFormations: Natural stone boulders, coastal sea stacks, and hill crags
 * that give Sakura Veil its authentic Japanese garden and rugged island landscape.
 * Features:
 * - Coastal Sea Stacks in Awakening Beach shallow waters (matching concept art)
 * - Western Hill Region mossy granite outcrops
 * - Mountain foothills rock shelves
 * - Path-lining garden stones
 */
export class RockFormations
{
    constructor()
    {
        this.game = Game.getInstance()
        this.group = new THREE.Group()
        this.group.name = 'rockFormations'

        this.setMaterial()
        this.setCoastalSeaStacks()
        this.setHillRegionRocks()
        this.setPathGardenStones()

        this.game.scene.add(this.group)
    }

    setMaterial()
    {
        // Stylized slate-gray rock with moss green highlights on upward faces
        const rockColorNode = Fn(() =>
        {
            const slate = color('#606b7a')
            const slateDark = color('#434c57')
            const mossGreen = color('#4e7336')

            // Micro grain noise
            const noise = texture(this.game.noises.perlin, positionWorld.xz.mul(0.12)).r
            const baseSlate = mix(slateDark, slate, noise)

            return mix(baseSlate, mossGreen, float(0.25))
        })()

        this.rockMaterial = new MeshDefaultMaterial({
            colorNode: rockColorNode,
            hasWater: false,
            hasLightBounce: true
        })
    }

    setCoastalSeaStacks()
    {
        // Coastal rocks rising from the shallow waters along Awakening Beach (matching concept art!)
        const rockGeom = new THREE.DodecahedronGeometry(1, 1)
        const seaStackPositions = [
            { x: -320, z: 1420, scale: 18 },
            { x: -180, z: 1460, scale: 14 },
            { x:  -80, z: 1490, scale: 22 },
            { x:  120, z: 1480, scale: 16 },
            { x:  280, z: 1440, scale: 20 },
            { x:  450, z: 1380, scale: 24 },
            { x: -480, z: 1320, scale: 26 },
        ]

        for(let i = 0; i < seaStackPositions.length; i++)
        {
            const stack = seaStackPositions[i]
            const y = WorldLayout.getElevation(stack.x, stack.z)

            const rock = new THREE.Mesh(rockGeom, this.rockMaterial)
            rock.position.set(stack.x, y + stack.scale * 0.4, stack.z)
            rock.scale.set(stack.scale, stack.scale * 1.4, stack.scale * 0.85)
            rock.rotation.set((i * 1.5) % 1, (i * 2.4) % (Math.PI * 2), (i * 0.9) % 1)
            rock.castShadow = true
            rock.receiveShadow = true
            this.group.add(rock)

            // Companion cluster rocks
            for(let c = 0; c < 3; c++)
            {
                const cx = stack.x + (Math.sin(c * 2.5) * 0.5) * stack.scale * 1.2
                const cz = stack.z + (Math.cos(c * 2.2) * 0.5) * stack.scale * 1.2
                const cy = WorldLayout.getElevation(cx, cz)
                const cs = stack.scale * 0.45

                const comp = new THREE.Mesh(rockGeom, this.rockMaterial)
                comp.position.set(cx, cy + cs * 0.4, cz)
                comp.scale.set(cs, cs * 1.1, cs * 0.8)
                comp.rotation.set(c, c * 1.5, 0)
                comp.castShadow = true
                comp.receiveShadow = true
                this.group.add(comp)
            }
        }
    }

    setHillRegionRocks()
    {
        // Rugged rock outcrops across the Western Hill Region (Fox Shrine & Ancient Gate approaches)
        const rockGeom = new THREE.DodecahedronGeometry(1, 1)

        const hillCenters = [
            { x: -620, z:  480, count: 12, radius: 120, scale: 14 },
            { x: -840, z:  120, count: 14, radius: 140, scale: 16 },
            { x: -720, z: -350, count: 10, radius: 110, scale: 15 },
            { x:  620, z: -480, count: 14, radius: 150, scale: 18 }, // Shadow woods rocky ridge
        ]

        for(const hill of hillCenters)
        {
            for(let i = 0; i < hill.count; i++)
            {
                const angle = (i / hill.count) * Math.PI * 2 + Math.sin(i * 3.1) * 0.4
                const r = hill.radius * (0.6 + (i % 3) * 0.2)
                const rx = hill.x + Math.cos(angle) * r
                const rz = hill.z + Math.sin(angle) * r
                const ry = WorldLayout.getElevation(rx, rz)

                const rock = new THREE.Mesh(rockGeom, this.rockMaterial)
                const s = hill.scale * (0.75 + (i % 3) * 0.25)
                rock.position.set(rx, ry + s * 0.35, rz)
                rock.scale.set(s, s * 0.9, s * 1.1)
                rock.rotation.set((i * 1.1) % 2, (i * 2.7) % (Math.PI * 2), 0)
                rock.castShadow = true
                rock.receiveShadow = true
                this.group.add(rock)
            }
        }
    }

    setPathGardenStones()
    {
        // Natural garden stones flanking path crossings (matching concept art screenshots 3 & 4)
        const rockGeom = new THREE.DodecahedronGeometry(1, 1)

        const gardenClusters = [
            { x:   35, z:  950 }, // Entrance to Sakura Blossom Grove
            { x:  -80, z:  650 },
            { x:  150, z:  320 },
            { x: -280, z:  420 },
        ]

        for(const center of gardenClusters)
        {
            for(let s = 0; s < 5; s++)
            {
                const sx = center.x + (Math.sin(s * 2.7) * 0.5) * 32
                const sz = center.z + (Math.cos(s * 2.1) * 0.5) * 32
                const sy = WorldLayout.getElevation(sx, sz)

                const rock = new THREE.Mesh(rockGeom, this.rockMaterial)
                const scale = 3.5 + (s % 3) * 1.8
                rock.position.set(sx, sy + scale * 0.3, sz)
                rock.scale.set(scale, scale * 0.7, scale * 1.2)
                rock.rotation.set(s, s * 1.8, 0)
                rock.castShadow = true
                rock.receiveShadow = true
                this.group.add(rock)
            }
        }
    }
}
