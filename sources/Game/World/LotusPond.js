import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { WorldLayout } from './WorldLayout.js'
import { color, float, Fn, mix, sin, smoothstep, texture, time, uniform, uv, vec2, vec4 } from 'three/tsl'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'

/**
 * LotusPond: The serene mountain lake at Ancient Gate & Lotus Pond (X: -990, Z: -900).
 * Features:
 * - Crystal clear turquoise lake surface at Y = 23.5m (155m radius)
 * - Grand red Water Torii gate standing serenely in the water
 * - Floating green lily pads and blooming pink/white lotus blossoms
 * - Perimeter mossy rocks and stone lanterns
 */
export class LotusPond
{
    constructor()
    {
        this.game = Game.getInstance()
        this.group = new THREE.Group()
        this.group.name = 'lotusPond'

        this.pondX = -990
        this.pondZ = -900
        this.pondRadius = 155
        this.waterY = 23.5

        this.setMaterials()
        this.setWaterSurface()
        this.setWaterTorii()
        this.setLotusPlants()
        this.setPerimeterStones()

        this.game.scene.add(this.group)
    }

    setMaterials()
    {
        // 1. Shimmering pond water shader
        const pondColorNode = Fn(() =>
        {
            const vUv = uv()
            const centerDist = vUv.sub(vec2(0.5)).length().mul(2.0)

            const waveSpeed = uniform(0.12)
            const waveUv = vec2(vUv.x.mul(12.0).add(time.mul(waveSpeed)), vUv.y.mul(12.0).add(time.mul(waveSpeed.mul(0.8))))
            const waveNoise = texture(this.game.noises.perlin, waveUv.mul(0.18)).r

            const waterDeep = color('#0369a1')
            const waterShallow = color('#38bdf8')
            const waterRgb = mix(waterDeep, waterShallow, waveNoise.mul(0.7).add(0.15))

            // Gentle edge fade
            const edgeAlpha = smoothstep(1.0, 0.85, centerDist)
            const alpha = mix(float(0.80), float(0.92), waveNoise).mul(edgeAlpha)

            return vec4(waterRgb, alpha)
        })()

        this.waterMaterial = new THREE.MeshBasicNodeMaterial({
            colorNode: pondColorNode,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide
        })

        // 2. Lily Pad Material (waxy emerald green)
        this.lilyPadMaterial = new MeshDefaultMaterial({
            colorNode: color('#2d7a36'),
            hasWater: false,
            hasLightBounce: true
        })

        // 3. Lotus Flower Petal Material (soft glowing pink)
        this.lotusFlowerMaterial = new MeshDefaultMaterial({
            colorNode: color('#ff9fc0'),
            hasWater: false,
            hasLightBounce: true
        })

        // 4. Vermilion Torii Material
        this.toriiMaterial = new MeshDefaultMaterial({
            colorNode: color('#c53020'),
            hasWater: false,
            hasLightBounce: true
        })

        this.toriiRoofMaterial = new MeshDefaultMaterial({
            colorNode: color('#272b33'),
            hasWater: false,
            hasLightBounce: true
        })
    }

    setWaterSurface()
    {
        const geometry = new THREE.CircleGeometry(this.pondRadius, 48)
        geometry.rotateX(-Math.PI * 0.5)

        const pondMesh = new THREE.Mesh(geometry, this.waterMaterial)
        pondMesh.position.set(this.pondX, this.waterY, this.pondZ)
        this.group.add(pondMesh)
    }

    setWaterTorii()
    {
        // Grand Sacred Torii standing in the pond waters
        const torii = new THREE.Group()
        torii.position.set(this.pondX, this.waterY, this.pondZ + 20)
        torii.rotation.y = Math.PI * 0.15

        const postRadius = 1.1
        const postHeight = 22
        const postSpacing = 24

        // Two vertical pillars (Hashira)
        const postGeom = new THREE.CylinderGeometry(postRadius * 0.85, postRadius, postHeight, 16)
        for(const px of [ -postSpacing * 0.5, postSpacing * 0.5 ])
        {
            const post = new THREE.Mesh(postGeom, this.toriiMaterial)
            post.position.set(px, postHeight * 0.5 - 2, 0)
            post.castShadow = true
            torii.add(post)

            // Black stone/wood pedestal (Kamebara)
            const baseGeom = new THREE.CylinderGeometry(postRadius * 1.5, postRadius * 1.7, 3, 16)
            const base = new THREE.Mesh(baseGeom, this.toriiRoofMaterial)
            base.position.set(px, 1.5, 0)
            base.receiveShadow = true
            torii.add(base)
        }

        // Top curved lintel (Kasagi) with dark cap roof
        const topLength = postSpacing + 14
        const topLintelGeom = new THREE.BoxGeometry(topLength, 1.8, 2.4)
        const topLintel = new THREE.Mesh(topLintelGeom, this.toriiMaterial)
        topLintel.position.set(0, postHeight - 1, 0)
        topLintel.castShadow = true
        torii.add(topLintel)

        // Upper dark curved roof plate
        const roofGeom = new THREE.BoxGeometry(topLength + 2, 0.7, 3.2)
        const roof = new THREE.Mesh(roofGeom, this.toriiRoofMaterial)
        roof.position.set(0, postHeight + 0.2, 0)
        roof.castShadow = true
        torii.add(roof)

        // Lower straight crossbeam (Nuki)
        const subLength = postSpacing + 4
        const subLintelGeom = new THREE.BoxGeometry(subLength, 1.2, 1.6)
        const subLintel = new THREE.Mesh(subLintelGeom, this.toriiMaterial)
        subLintel.position.set(0, postHeight - 5.5, 0)
        subLintel.castShadow = true
        torii.add(subLintel)

        // Central plaque strut (Gakuzuka)
        const strutGeom = new THREE.BoxGeometry(1.6, 3.6, 1.4)
        const strut = new THREE.Mesh(strutGeom, this.toriiMaterial)
        strut.position.set(0, postHeight - 3.2, 0)
        torii.add(strut)

        this.group.add(torii)
    }

    setLotusPlants()
    {
        // Clustered floating lily pads and blooming lotus flowers
        const lotusGroup = new THREE.Group()

        // Lily pad geometry (circular disc with slight curvature)
        const padGeom = new THREE.CircleGeometry(2.4, 16)
        padGeom.rotateX(-Math.PI * 0.5)

        // Lotus flower geometry (central core + cone petals)
        const flowerCoreGeom = new THREE.CylinderGeometry(0.35, 0.2, 0.4, 8)
        const petalGeom = new THREE.ConeGeometry(0.5, 1.4, 4)

        const flowerMaster = new THREE.Group()
        const core = new THREE.Mesh(flowerCoreGeom, new THREE.MeshBasicNodeMaterial({ colorNode: color('#fcd34d') }))
        flowerMaster.add(core)

        for(let p = 0; p < 8; p++)
        {
            const angle = (p / 8) * Math.PI * 2
            const petal = new THREE.Mesh(petalGeom, this.lotusFlowerMaterial)
            petal.position.set(Math.cos(angle) * 0.5, 0.5, Math.sin(angle) * 0.5)
            petal.rotation.set(Math.sin(angle) * 0.4, angle, -Math.cos(angle) * 0.4)
            flowerMaster.add(petal)
        }

        // Place 38 lily pad clusters around the pond
        const clusters = 38
        for(let c = 0; c < clusters; c++)
        {
            const angle = (c / clusters) * Math.PI * 2 + Math.sin(c * 2.3) * 0.4
            const dist = 35 + (c % 5) * 22
            const cx = this.pondX + Math.cos(angle) * dist
            const cz = this.pondZ + Math.sin(angle) * dist

            // 3-5 pads per cluster
            const padsInCluster = 3 + (c % 3)
            for(let p = 0; p < padsInCluster; p++)
            {
                const px = cx + (Math.sin(p * 2.1) * 0.5) * 7
                const pz = cz + (Math.cos(p * 1.8) * 0.5) * 7

                const pad = new THREE.Mesh(padGeom, this.lilyPadMaterial)
                const scale = 1.0 + (p % 3) * 0.35
                pad.scale.set(scale, 1, scale)
                pad.position.set(px, this.waterY + 0.08, pz)
                pad.rotation.y = (c + p) * 1.2
                lotusGroup.add(pad)

                // Flower on every other pad
                if(p === 0)
                {
                    const flower = flowerMaster.clone()
                    flower.position.set(px, this.waterY + 0.15, pz)
                    lotusGroup.add(flower)
                }
            }
        }

        this.group.add(lotusGroup)
    }

    setPerimeterStones()
    {
        // Ring of mossy boulders bordering the pond
        const stoneGeom = new THREE.DodecahedronGeometry(1, 1)
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x56606d, roughness: 0.85 })

        const count = 32
        for(let i = 0; i < count; i++)
        {
            const angle = (i / count) * Math.PI * 2
            const r = this.pondRadius + 4 + (i % 3) * 8
            const sx = this.pondX + Math.cos(angle) * r
            const sz = this.pondZ + Math.sin(angle) * r
            const sy = WorldLayout.getElevation(sx, sz)

            const stone = new THREE.Mesh(stoneGeom, stoneMat)
            const s = 6 + (i % 4) * 3
            stone.position.set(sx, sy + s * 0.35, sz)
            stone.scale.set(s, s * 0.75, s * 1.1)
            stone.rotation.set((i * 1.3) % 1, (i * 2.2) % (Math.PI * 2), 0)
            stone.castShadow = true
            stone.receiveShadow = true
            this.group.add(stone)
        }
    }
}
