import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { color, float, Fn, materialNormal, min, mix, mul, normalWorld, positionLocal, positionWorld, texture, uniform, uv, vec3, vec4 } from 'three/tsl'
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
        // Padded well beyond the strict optimal-area radius: tall objects
        // (e.g. sakura trees) stay visible in silhouette above the ground's
        // horizon even when their base sits past the tightly-computed view
        // radius, so the ground must extend further than "just enough".
        this.size = Math.round(this.game.view.optimalArea.radius * 3.2) + 30
        this.halfSize = this.size * 0.5
        this.cellSize = 1.5
        this.subdivisions = this.size / this.cellSize

        // Geometry
        let geometry = new THREE.PlaneGeometry(this.size, this.size, this.subdivisions, this.subdivisions)
        geometry.rotateX(-Math.PI * 0.5)
        geometry.deleteAttribute('normal')

        // Terrain data
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
            // return vec3(slabsTexture.mul(slabStrength))

            const slab = slabTerrain.mul(slabNoise)
            // return vec3(slab)
            
            const finalColor = mix(baseColor, slabColor, slab)
            return finalColor
        })()

        // Material
        const material = new MeshDefaultMaterial({
            colorNode: colorNode,
            normalNode: vec3(0, 1, 0),
            shadowNode: terrainData.g,
            hasWater: false,
            hasLightBounce: false,
            wireframe: false
        })
        // Displacement
        material.positionNode = Fn(() =>
        {
            const uvDim = min(min(uv().x, uv().y).mul(20), 1)

            const newPosition = positionLocal
            newPosition.y.addAssign(terrainData.b.mul(-1.5).mul(uvDim))

            return newPosition
        })()

        // Mesh
        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.receiveShadow = true
        // this.mesh.castShadow = true
        this.game.scene.add(this.mesh)

        // Resize
        this.game.viewport.events.on('throttleChange', () =>
        {
            this.size = Math.round(this.game.view.optimalArea.radius * 3.2) + 30
            this.halfSize = this.size * 0.5
            this.subdivisions = this.size
            
            geometry.dispose()
            
            geometry = new THREE.PlaneGeometry(this.size, this.size, this.subdivisions, this.subdivisions)
            geometry.rotateX(-Math.PI * 0.5)
            geometry.deleteAttribute('normal')

            this.mesh.geometry = geometry
        }, 2)

        if(this.game.debug.active)
        {
            this.debugPanel.addBinding(slabTextureFrequency, 'value', { label: 'slabTextureFrequency', min: 0, max: 1, step: 0.001 })
            this.debugPanel.addBinding(slabNoiseFrequency, 'value', { label: 'slabNoiseFrequency', min: 0, max: 0.1, step: 0.001 })
            this.game.debug.addThreeColorBinding(this.debugPanel, slabHighColor.value, 'slabHighColor')
            this.game.debug.addThreeColorBinding(this.debugPanel, slabLowColor.value, 'slabLowColor')
        }
    }

    setPhysical()
    {
        // One flat slab under the whole realm, top face at y = 0. Rei flies, so the shallow
        // visual dips of the river and pond (see the displacement above) don't need matching colliders.
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
        // Invisible walls at WorldLayout.boundary, taller than PhysicsFlight.maxAltitude
        const boundary = WorldLayout.boundary
        const halfHeight = 40
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
        this.mesh.position.x = Math.round(this.game.view.optimalArea.position.x / this.cellSize) * this.cellSize
        this.mesh.position.z = Math.round(this.game.view.optimalArea.position.z / this.cellSize) * this.cellSize
    }
}