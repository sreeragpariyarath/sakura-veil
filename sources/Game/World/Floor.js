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

        // 2. Terrain Data & Visual Colors (Restored Original Ground)
        const terrainData = this.game.terrain.terrainNode(positionWorld.xz)
        const slabHighColor = uniform(color('#ffcf8b'))
        const slabLowColor = uniform(color('#a87762'))
        const slabTextureFrequency = uniform(0.175)
        const slabNoiseFrequency = uniform(0.03)

        const colorNode = Fn(() =>
        {
            const baseColor = this.game.terrain.colorNode(terrainData)

            const slabTerrain = terrainData.r
            const slabNoiseUv = positionWorld.xz.mul(slabNoiseFrequency)
            const slabNoise = texture(this.game.noises.perlin, slabNoiseUv).r
            const slabsTexture = texture(this.game.resources.floorSlabsTexture, positionWorld.xz.mul(slabTextureFrequency)).r
            const slabColor = mix(slabLowColor, slabHighColor, slabsTexture)

            const slab = slabTerrain.mul(slabNoise)
            const finalColor = mix(baseColor, slabColor, slab)

            return finalColor
        })()

        if(this.game.debug.active && this.debugPanel)
        {
            this.debugPanel.addBinding(slabTextureFrequency, 'value', { label: 'slabTextureFrequency', min: 0, max: 1, step: 0.001 })
            this.debugPanel.addBinding(slabNoiseFrequency, 'value', { label: 'slabNoiseFrequency', min: 0, max: 0.1, step: 0.001 })
            this.game.debug.addThreeColorBinding(this.debugPanel, slabHighColor.value, 'slabHighColor')
            this.game.debug.addThreeColorBinding(this.debugPanel, slabLowColor.value, 'slabLowColor')
        }

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
        const halfHeight = 60
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