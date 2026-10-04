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

        const pondData = WorldLayout.ponds[0]
        this.pondX = pondData ? pondData.x : -165
        this.pondZ = pondData ? pondData.z : -155
        this.pondRadius = pondData ? pondData.radius : 28
        this.waterY = WorldLayout.getElevation(this.pondX, this.pondZ) + 0.8

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
        const waterRgbNode = Fn(() =>
        {
            const vUv = uv()
            const waveSpeed = uniform(0.12)
            const waveUv = vec2(vUv.x.mul(10.0).add(time.mul(waveSpeed)), vUv.y.mul(10.0).add(time.mul(waveSpeed.mul(0.8))))
            const waveNoise = texture(this.game.noises.perlin, waveUv.mul(0.18)).r

            const waterDeep = color('#0284c7')
            const waterShallow = color('#38bdf8')
            return mix(waterDeep, waterShallow, waveNoise.mul(0.65).add(0.2))
        })()

        const waterAlphaNode = Fn(() =>
        {
            const vUv = uv()
            const centerDist = vUv.sub(vec2(0.5)).length().mul(2.0)
            const edgeAlpha = smoothstep(1.0, 0.85, centerDist)
            return float(0.85).mul(edgeAlpha)
        })()

        this.waterMaterial = new MeshDefaultMaterial({
            colorNode: waterRgbNode,
            alphaNode: waterAlphaNode,
            transparent: true,
            alphaTest: 0,
            depthWrite: false,
            side: THREE.DoubleSide,
            hasFog: true,
            hasWater: false,
            hasLightBounce: false,
            hasCoreShadows: false,
            hasDropShadows: false
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
        torii.position.set(this.pondX, this.waterY, this.pondZ + 5)
        torii.rotation.y = Math.PI * 0.15

        const postRadius = 0.35
        const postHeight = 7.5
        const postSpacing = 7.0

        // Two vertical pillars (Hashira)
        const postGeom = new THREE.CylinderGeometry(postRadius * 0.85, postRadius, postHeight, 16)
        for(const px of [ -postSpacing * 0.5, postSpacing * 0.5 ])
        {
            const post = new THREE.Mesh(postGeom, this.toriiMaterial)
            post.position.set(px, postHeight * 0.5 - 0.5, 0)
            post.castShadow = true
            torii.add(post)

            // Black stone/wood pedestal (Kamebara)
            const baseGeom = new THREE.CylinderGeometry(postRadius * 1.5, postRadius * 1.7, 1.0, 16)
            const base = new THREE.Mesh(baseGeom, this.toriiRoofMaterial)
            base.position.set(px, 0.5, 0)
            base.receiveShadow = true
            torii.add(base)
        }

        // Top curved lintel (Kasagi) with dark cap roof
        const topLength = postSpacing + 4.5
        const topLintelGeom = new THREE.BoxGeometry(topLength, 0.6, 0.8)
        const topLintel = new THREE.Mesh(topLintelGeom, this.toriiMaterial)
        topLintel.position.set(0, postHeight - 0.3, 0)
        topLintel.castShadow = true
        torii.add(topLintel)

        // Upper dark curved roof plate
        const roofGeom = new THREE.BoxGeometry(topLength + 0.8, 0.25, 1.1)
        const roof = new THREE.Mesh(roofGeom, this.toriiRoofMaterial)
        roof.position.set(0, postHeight + 0.1, 0)
        roof.castShadow = true
        torii.add(roof)

        // Lower straight crossbeam (Nuki)
        const subLength = postSpacing + 1.2
        const subLintelGeom = new THREE.BoxGeometry(subLength, 0.4, 0.5)
        const subLintel = new THREE.Mesh(subLintelGeom, this.toriiMaterial)
        subLintel.position.set(0, postHeight - 1.8, 0)
        subLintel.castShadow = true
        torii.add(subLintel)

        this.group.add(torii)
    }

    setLotusPlants()
    {
        // Clustered floating lily pads and blooming lotus flowers
        const lotusGroup = new THREE.Group()

        // Lily pad geometry (circular disc with slight curvature)
        const padGeom = new THREE.CircleGeometry(1.2, 16)
        padGeom.rotateX(-Math.PI * 0.5)

        // Lotus flower geometry (central core + cone petals)
        const flowerCoreGeom = new THREE.CylinderGeometry(0.18, 0.1, 0.2, 8)
        const petalGeom = new THREE.ConeGeometry(0.25, 0.7, 4)

        const flowerMaster = new THREE.Group()
        const coreMat = new MeshDefaultMaterial({
            colorNode: color('#fcd34d'),
            hasFog: true,
            hasWater: false,
            hasLightBounce: false
        })
        const core = new THREE.Mesh(flowerCoreGeom, coreMat)
        flowerMaster.add(core)

        for(let p = 0; p < 8; p++)
        {
            const angle = (p / 8) * Math.PI * 2
            const petal = new THREE.Mesh(petalGeom, this.lotusFlowerMaterial)
            petal.position.set(Math.cos(angle) * 0.25, 0.25, Math.sin(angle) * 0.25)
            petal.rotation.set(Math.sin(angle) * 0.4, angle, -Math.cos(angle) * 0.4)
            flowerMaster.add(petal)
        }

        // Place 24 lily pad clusters around the pond
        const clusters = 24
        for(let c = 0; c < clusters; c++)
        {
            const angle = (c / clusters) * Math.PI * 2 + Math.sin(c * 2.3) * 0.4
            const dist = 6 + (c % 5) * 3.8
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
        // Bulky low-poly boulders removed per design specification
    }
}
