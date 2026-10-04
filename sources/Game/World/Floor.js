import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { color, float, Fn, mix, normalWorld, positionWorld, select, sin, smoothstep, step, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'
import { WorldLayout } from './WorldLayout.js'

export class Floor
{
    constructor()
    {
        this.game = Game.getInstance()

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '⏥ Floor',
                expanded: false,
            })
        }

        this.setVisual()
        this.setPhysical()
        this.setBoundary()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 10)
    }

    setVisual()
    {
        // Full realm scale: 3,600 x 3,600m static 3D terrain
        this.size = WorldLayout.size
        this.subdivisions = 180 // ~20m vertex grid (32,761 vertices)

        // 1. Geometry with real physical 3D elevation evaluated across all vertices
        const geometry = new THREE.PlaneGeometry(this.size, this.size, this.subdivisions, this.subdivisions)
        geometry.rotateX(-Math.PI * 0.5)

        const posAttr = geometry.attributes.position
        for(let i = 0; i < posAttr.count; i++)
        {
            const x = posAttr.getX(i)
            const z = posAttr.getZ(i)
            const y = WorldLayout.getElevation(x, z)
            posAttr.setY(i, y)
        }
        geometry.computeVertexNormals()

        // 2. Terrain Data & Visual Colors
        const terrainData = this.game.terrain.terrainNode(positionWorld.xz)

        const colorNode = Fn(() =>
        {
            const baseColor = this.game.terrain.colorNode(terrainData)

            // Procedural Organic Flagstones (cobblestone pavers with irregular rounded shapes)
            const stoneFreq = uniform(0.38)
            const stoneUv = positionWorld.xz.mul(stoneFreq)
            const stoneNoise = texture(this.game.noises.perlin, stoneUv.mul(0.55)).r
            const stoneNoiseFine = texture(this.game.noises.perlin, stoneUv.mul(2.1)).r

            const perturbedUv = stoneUv.add(vec2(stoneNoise, stoneNoiseFine).sub(0.5).mul(0.38))
            const stoneGrid = sin(perturbedUv.x.mul(Math.PI)).mul(sin(perturbedUv.y.mul(Math.PI))).abs()
            const stoneGroove = smoothstep(0.05, 0.24, stoneGrid)

            // Warm weathered granite & sandstone tints
            const stoneColorWarm = color('#d4c0ab')
            const stoneColorCool = color('#9e8c79')
            const stoneSurface = mix(stoneColorCool, stoneColorWarm, stoneNoiseFine)

            // Loam earth & moss in cracks
            const crackDirt = color('#3d2c1f')
            const crackMoss = color('#355a22')
            const crackColor = mix(crackDirt, crackMoss, stoneNoise.mul(0.6))
            const flagstoneColor = mix(crackColor, stoneSurface, stoneGroove)

            // Falling pink sakura petals on the stone paths
            const petalUv = positionWorld.xz.mul(1.4)
            const petalNoise = texture(this.game.noises.perlin, petalUv).r
            const petalMask = smoothstep(0.77, 0.86, petalNoise)
            const petalColor = color('#ff9fc2')
            const pathColor = mix(flagstoneColor, petalColor, petalMask.mul(0.85))

            // Keep Awakening Beach (south coast Z > 1050) as pure golden sand
            const isSouthBeach = positionWorld.z.greaterThan(1050)
            const pathMask = terrainData.r.mul(select(isSouthBeach, 0.0, 1.0))
            const blendedPath = mix(baseColor, pathColor, pathMask.smoothstep(0.12, 0.72))

            // Wildflower speckles across meadows (soft white daisies & sakura blossom specks)
            const meadowUv = positionWorld.xz.mul(0.9)
            const flowerNoise = texture(this.game.noises.perlin, meadowUv).r
            const flowerMask = smoothstep(0.82, 0.90, flowerNoise).mul(terrainData.g)
            const flowerColor = mix(color('#fffdf2'), color('#ffb3cb'), step(0.86, flowerNoise))
            const finalColor = mix(blendedPath, flowerColor, flowerMask.mul(0.88))

            return finalColor
        })()

        // Material using real vertex normals, no light bounce overexposure, no water blowout
        const material = new MeshDefaultMaterial({
            colorNode: colorNode,
            normalNode: normalWorld,
            shadowNode: terrainData.g,
            hasWater: false,
            hasLightBounce: false,
            hasFog: true,
            wireframe: false
        })

        // Mesh
        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.receiveShadow = true
        this.mesh.name = 'floor'
        this.game.scene.add(this.mesh)
    }

    setPhysical()
    {
        // Physical floor collider
        const halfExtent = WorldLayout.size * 0.5 + 50

        const object = this.game.objects.add(
            null,
            {
                type: 'fixed',
                friction: 0.2,
                restitution: 0.15,
                colliders: [
                    { shape: 'cuboid', parameters: [ halfExtent, 1, halfExtent ], position: { x: 0, y: - 1, z: 0 }, category: 'floor' }
                ]
            }
        )
        this.physical = object.physical
    }

    setBoundary()
    {
        // Invisible walls at WorldLayout.boundary, taller than maximum flight altitude
        const boundary = WorldLayout.boundary
        const halfHeight = 120
        const halfThickness = 1
        const halfLength = boundary + halfThickness

        this.boundary = this.game.objects.add(
            null,
            {
                type: 'fixed',
                friction: 0,
                restitution: 0,
                colliders: [
                    { shape: 'cuboid', parameters: [ halfThickness, halfHeight, halfLength ], position: { x:   boundary + halfThickness, y: halfHeight, z: 0 }, category: 'floor' },
                    { shape: 'cuboid', parameters: [ halfThickness, halfHeight, halfLength ], position: { x: - boundary - halfThickness, y: halfHeight, z: 0 }, category: 'floor' },
                    { shape: 'cuboid', parameters: [ halfLength, halfHeight, halfThickness ], position: { x: 0, y: halfHeight, z:   boundary + halfThickness }, category: 'floor' },
                    { shape: 'cuboid', parameters: [ halfLength, halfHeight, halfThickness ], position: { x: 0, y: halfHeight, z: - boundary - halfThickness }, category: 'floor' },
                ]
            }
        )
    }

    update()
    {
        // Terrain is a static 3,600 x 3,600m mesh covering the full world
    }
}