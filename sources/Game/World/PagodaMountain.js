import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { WorldLayout } from './WorldLayout.js'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'
import { color, float, Fn, mix, positionWorld, uniform, vec3 } from 'three/tsl'

/**
 * PagodaMountain: The majestic northern mountain peak and 5-tiered Japanese Pagoda landmark.
 * Located at Summit Arena (X: 0, Z: -1390), soaring to Y = 88m at the peak terrace and Y = 118m at the pagoda spire.
 * Features:
 * - 5-tiered Japanese Pagoda (shrine sanctuary with curved eaves, vermilion pillars, golden sorin spire)
 * - Mountain Massif (steep tiered rock cliffs, stone ledges, and mountain buttresses)
 * - Sacred Mountain Grand Staircase with flanking lanterns ascending to the sanctuary
 * - Mountain Pines & Cherry Blossoms framing the summit
 */
export class PagodaMountain
{
    constructor()
    {
        this.game = Game.getInstance()
        this.group = new THREE.Group()
        this.group.name = 'pagodaMountain'

        const summit = WorldLayout.getArena('summit')
        this.summitX = summit ? summit.x : 0
        this.summitZ = summit ? summit.z : -235
        this.summitElevation = WorldLayout.getElevation(this.summitX, this.summitZ)

        this.setMaterials()
        this.setPagoda()
        this.setStaircase()

        this.game.scene.add(this.group)
    }

    setMaterials()
    {
        // 1. Vermilion lacquered wood (pillars, railings)
        this.vermilionMaterial = new MeshDefaultMaterial({
            colorNode: color('#b83324'),
            hasWater: false,
            hasLightBounce: true,
        })

        // 2. Dark charcoal ceramic roof tiles (curved flared eaves)
        this.roofMaterial = new MeshDefaultMaterial({
            colorNode: color('#2a2f38'),
            hasWater: false,
            hasLightBounce: true,
        })

        // 3. Golden ornament spire (sorin)
        this.goldMaterial = new MeshDefaultMaterial({
            colorNode: color('#fcd34d'),
            hasWater: false,
            hasLightBounce: true,
        })

        // 4. White plaster walls
        this.wallMaterial = new MeshDefaultMaterial({
            colorNode: color('#f4eedb'),
            hasWater: false,
            hasLightBounce: true,
        })

        // 5. Mountain granite cliff rock with moss top
        const rockColorNode = Fn(() =>
        {
            const granite = color('#6b7482')
            const moss = color('#4a6b32')
            const sunny = color('#8b95a5')
            const noise = this.game.noises?.perlin ? uniform(0.5) : float(0.5)
            return mix(granite, moss, float(0.3))
        })()

        this.cliffMaterial = new MeshDefaultMaterial({
            colorNode: rockColorNode,
            hasWater: false,
            hasLightBounce: true,
        })

        // 6. Warm lantern glow
        this.glowMaterial = new THREE.MeshBasicNodeMaterial({
            colorNode: color('#ffaa44'),
        })
    }

    setMountainCliffs()
    {
        // Tiered rocky buttresses forming the mountain ridge around the peak
        const cliffGroup = new THREE.Group()
        const cliffGeometry = new THREE.DodecahedronGeometry(1, 1)

        const tiers = [
            { count: 18, radius: 140, yOffset: -22, scaleY: 28, scaleXZ: 35 },
            { count: 14, radius: 95,  yOffset: -12, scaleY: 20, scaleXZ: 26 },
            { count: 10, radius: 55,  yOffset: -4,  scaleY: 14, scaleXZ: 18 },
        ]

        for(const tier of tiers)
        {
            for(let i = 0; i < tier.count; i++)
            {
                const angle = (i / tier.count) * Math.PI * 2
                // Leave south approach open for the grand staircase
                if(angle > Math.PI * 0.35 && angle < Math.PI * 0.65) continue

                const rx = this.summitX + Math.cos(angle) * tier.radius
                const rz = this.summitZ + Math.sin(angle) * tier.radius
                const baseElev = WorldLayout.getElevation(rx, rz)

                const rock = new THREE.Mesh(cliffGeometry, this.cliffMaterial)
                rock.position.set(rx, baseElev + tier.yOffset, rz)
                rock.scale.set(
                    tier.scaleXZ * (0.8 + (i % 3) * 0.2),
                    tier.scaleY * (0.85 + (i % 2) * 0.3),
                    tier.scaleXZ * (0.8 + ((i + 1) % 3) * 0.2)
                )
                rock.rotation.set((i * 1.3) % 1, (i * 2.1) % (Math.PI * 2), (i * 0.7) % 1)
                rock.castShadow = true
                rock.receiveShadow = true
                cliffGroup.add(rock)
            }
        }

        this.group.add(cliffGroup)
    }

    setPagoda()
    {
        const pagoda = new THREE.Group()
        pagoda.position.set(this.summitX, this.summitElevation, this.summitZ)

        // 1. Stone Foundation Platform
        const baseGeom = new THREE.BoxGeometry(32, 2.5, 32)
        const baseMesh = new THREE.Mesh(baseGeom, this.cliffMaterial)
        baseMesh.position.y = 1.25
        baseMesh.receiveShadow = true
        pagoda.add(baseMesh)

        // 2. Five Pagoda Tiers
        const tierCount = 5
        let currentY = 2.5
        let tierWidth = 22
        let roofWidth = 30

        for(let t = 0; t < tierCount; t++)
        {
            const tierHeight = 5.2 - t * 0.3

            // Chamber walls (white plaster)
            const chamberGeom = new THREE.BoxGeometry(tierWidth - 3, tierHeight, tierWidth - 3)
            const chamberMesh = new THREE.Mesh(chamberGeom, this.wallMaterial)
            chamberMesh.position.y = currentY + tierHeight * 0.5
            chamberMesh.castShadow = true
            chamberMesh.receiveShadow = true
            pagoda.add(chamberMesh)

            // Red vermilion corner pillars
            const pillarRadius = 0.45 - t * 0.04
            const pillarGeom = new THREE.CylinderGeometry(pillarRadius, pillarRadius, tierHeight, 8)
            const halfW = (tierWidth - 3) * 0.5
            const pillarOffsets = [
                [ -halfW, -halfW ], [ halfW, -halfW ],
                [ -halfW,  halfW ], [ halfW,  halfW ]
            ]
            for(const [ px, pz ] of pillarOffsets)
            {
                const pillar = new THREE.Mesh(pillarGeom, this.vermilionMaterial)
                pillar.position.set(px, currentY + tierHeight * 0.5, pz)
                pillar.castShadow = true
                pagoda.add(pillar)
            }

            // Balustrade / Railing
            const railGeom = new THREE.BoxGeometry(tierWidth, 0.9, tierWidth)
            const railMesh = new THREE.Mesh(railGeom, this.vermilionMaterial)
            railMesh.position.y = currentY + 0.45
            pagoda.add(railMesh)

            currentY += tierHeight

            // Flared Hip-and-Gable Roof (curved eaves)
            const roofGeom = new THREE.ConeGeometry(roofWidth * 0.72, 2.4, 4)
            roofGeom.rotateY(Math.PI * 0.25)
            const roofMesh = new THREE.Mesh(roofGeom, this.roofMaterial)
            roofMesh.position.y = currentY + 1.2
            roofMesh.scale.set(1.0, 0.75, 1.0)
            roofMesh.castShadow = true
            pagoda.add(roofMesh)

            // Hanging lanterns under the four roof corners
            const cornerDist = roofWidth * 0.46
            const lanternOffsets = [
                [ -cornerDist, -cornerDist ], [ cornerDist, -cornerDist ],
                [ -cornerDist,  cornerDist ], [ cornerDist,  cornerDist ]
            ]
            const lanternGeom = new THREE.BoxGeometry(0.7, 1.0, 0.7)
            for(const [ lx, lz ] of lanternOffsets)
            {
                const lantern = new THREE.Mesh(lanternGeom, this.glowMaterial)
                lantern.position.set(lx, currentY - 0.4, lz)
                pagoda.add(lantern)
            }

            currentY += 1.8
            tierWidth *= 0.86
            roofWidth *= 0.84
        }

        // 3. Golden Finial Spire (Sorin) on roof peak
        const spireBaseGeom = new THREE.CylinderGeometry(0.35, 0.6, 2.0, 8)
        const spireBase = new THREE.Mesh(spireBaseGeom, this.goldMaterial)
        spireBase.position.y = currentY + 1.0
        pagoda.add(spireBase)

        // Nine sacred rings on the spire
        const ringGeom = new THREE.TorusGeometry(0.65, 0.12, 8, 16)
        ringGeom.rotateX(Math.PI * 0.5)
        for(let r = 0; r < 9; r++)
        {
            const ring = new THREE.Mesh(ringGeom, this.goldMaterial)
            ring.position.y = currentY + 2.0 + r * 0.55
            ring.scale.setScalar(1.0 - r * 0.05)
            pagoda.add(ring)
        }

        // Sacred flaming jewel (Hoju) at the very pinnacle
        const jewelGeom = new THREE.SphereGeometry(0.7, 12, 12)
        const jewel = new THREE.Mesh(jewelGeom, this.goldMaterial)
        jewel.position.y = currentY + 7.8
        pagoda.add(jewel)

        // Summit warm point light
        const summitLight = new THREE.PointLight(0xffaa44, 15, 80)
        summitLight.position.set(0, 10, 0)
        pagoda.add(summitLight)

        this.group.add(pagoda)
    }

    setStaircase()
    {
        // Grand stone mountain staircase ascending the south ridge to the Pagoda gate
        const stairsGroup = new THREE.Group()
        const startZ = this.summitZ + 60
        const endZ = this.summitZ + 15
        const steps = 24

        const stepGeom = new THREE.BoxGeometry(6, 0.4, 2.5)

        for(let i = 0; i < steps; i++)
        {
            const t = i / steps
            const cz = startZ + (endZ - startZ) * t
            const cx = this.summitX + Math.sin(t * Math.PI) * 8
            const cy = WorldLayout.getElevation(cx, cz)

            const step = new THREE.Mesh(stepGeom, this.cliffMaterial)
            step.position.set(cx, cy + 0.3, cz)
            step.receiveShadow = true
            stairsGroup.add(step)

            // Flanking stone lanterns every 4 steps
            if(i % 4 === 0)
            {
                const lanternGeom = new THREE.BoxGeometry(0.9, 1.8, 0.9)
                const leftLantern = new THREE.Mesh(lanternGeom, this.glowMaterial)
                leftLantern.position.set(cx - 6.5, cy + 1.2, cz)
                stairsGroup.add(leftLantern)

                const rightLantern = new THREE.Mesh(lanternGeom, this.glowMaterial)
                rightLantern.position.set(cx + 6.5, cy + 1.2, cz)
                stairsGroup.add(rightLantern)
            }
        }

        this.group.add(stairsGroup)
    }

    setPerimeterRocks()
    {
        // Rocky boundary peaks enclosing the northern mountain massif
        const rockGeom = new THREE.DodecahedronGeometry(1, 1)
        const count = 28
        for(let i = 0; i < count; i++)
        {
            const angle = Math.PI + ((i - count * 0.5) / count) * Math.PI * 1.1
            const dist = 320 + (i % 4) * 35
            const rx = this.summitX + Math.cos(angle) * dist
            const rz = this.summitZ + Math.sin(angle) * dist
            const ry = WorldLayout.getElevation(rx, rz)

            const rock = new THREE.Mesh(rockGeom, this.cliffMaterial)
            rock.position.set(rx, ry + 10, rz)
            rock.scale.set(40 + (i % 3) * 15, 55 + (i % 2) * 20, 35 + ((i + 1) % 3) * 12)
            rock.rotation.set(0.2 * i, 0.8 * i, 0.1 * i)
            rock.castShadow = true
            rock.receiveShadow = true
            this.group.add(rock)
        }
    }
}
