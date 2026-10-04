import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { WorldLayout } from './WorldLayout.js'
import { color, float, Fn, mix, sin, smoothstep, texture, time, uniform, uv, vec2, vec3 } from 'three/tsl'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'

/**
 * Waterfalls: Cascading mountain waterfalls and gorge cataracts.
 * Features:
 * - The Great Mountain Waterfall (46m vertical cascade pouring from Pagoda Mountain cliff into the river headwater)
 * - Secondary Gorge Cataracts (tiered cascades stepping down the river canyon)
 * - Animated UV scrolling whitewater foam and turquoise tumbling currents
 * - Foaming plunge pool ripple rings and water spray
 */
export class Waterfalls
{
    constructor()
    {
        this.game = Game.getInstance()
        this.group = new THREE.Group()
        this.group.name = 'waterfalls'

        this.setMaterial()
        this.setGreatMountainWaterfall()
        this.setGorgeCataracts()

        this.game.scene.add(this.group)
    }

    setMaterial()
    {
        // Animated cascading water shader in TSL
        const waterfallRgbNode = Fn(() =>
        {
            const vUv = uv()

            // Downward scrolling UVs at high speed
            const scrollSpeed = uniform(1.8)
            const scrolledUv1 = vec2(vUv.x.mul(3.0), vUv.y.mul(6.0).sub(time.mul(scrollSpeed)))
            const scrolledUv2 = vec2(vUv.x.mul(5.0).add(0.4), vUv.y.mul(10.0).sub(time.mul(scrollSpeed.mul(1.4))))

            const noise1 = texture(this.game.noises.perlin, scrolledUv1.mul(0.15)).r
            const noise2 = texture(this.game.noises.perlin, scrolledUv2.mul(0.18)).r

            // Foaming water rapids (high white foam crests)
            const foamMask = noise1.add(noise2.mul(0.6)).mul(0.65)
            const foam = smoothstep(0.42, 0.72, foamMask)

            // Colors: clear turquoise water and pure white aeration foam
            const waterBase = color('#38bdf8')
            const waterFoam = color('#ffffff')
            return mix(waterBase, waterFoam, foam)
        })()

        const waterfallAlphaNode = Fn(() =>
        {
            const vUv = uv()
            const edgeFade = sin(vUv.x.mul(Math.PI))
            return float(0.85).mul(edgeFade)
        })()

        this.waterfallMaterial = new MeshDefaultMaterial({
            colorNode: waterfallRgbNode,
            alphaNode: waterfallAlphaNode,
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

        // Plunge pool foaming ripple material
        const rippleRgbNode = Fn(() =>
        {
            const vUv = uv()
            const centerDist = vUv.sub(vec2(0.5)).length()
            const expandingWave = sin(centerDist.mul(35.0).sub(time.mul(5.0)))

            const foamColor = color('#ffffff')
            const poolColor = color('#38bdf8')
            return mix(poolColor, foamColor, expandingWave.mul(0.5).add(0.5))
        })()

        const rippleAlphaNode = Fn(() =>
        {
            const vUv = uv()
            const centerDist = vUv.sub(vec2(0.5)).length()
            const ringMask = smoothstep(0.05, 0.45, centerDist).mul(smoothstep(0.5, 0.35, centerDist))
            return ringMask.mul(0.75)
        })()

        this.rippleMaterial = new MeshDefaultMaterial({
            colorNode: rippleRgbNode,
            alphaNode: rippleAlphaNode,
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
    }

    setGreatMountainWaterfall()
    {
        // Great Mountain Waterfall: drops from high cliff shelf to river pool
        const topX = 20
        const topZ = -208
        const topY = WorldLayout.getElevation(topX, topZ) + 8

        const botX = 25
        const botZ = -198
        const botY = WorldLayout.getElevation(botX, botZ)

        const height = Math.max(6, topY - botY)
        const width = 8

        // Curved waterfall sheet geometry
        const segments = 16
        const geometry = new THREE.PlaneGeometry(width, height, 4, segments)

        // Curve outward slightly as water arcs off the cliff
        const posAttr = geometry.attributes.position
        for(let i = 0; i < posAttr.count; i++)
        {
            const y = posAttr.getY(i)
            const normY = (y + height * 0.5) / height
            const outward = Math.sin(normY * Math.PI) * 1.5
            posAttr.setZ(i, posAttr.getZ(i) + outward)
        }
        geometry.computeVertexNormals()

        const waterfallMesh = new THREE.Mesh(geometry, this.waterfallMaterial)
        waterfallMesh.position.set((topX + botX) * 0.5, (topY + botY) * 0.5, (topZ + botZ) * 0.5)
        waterfallMesh.rotation.y = Math.atan2(botX - topX, botZ - topZ)
        this.group.add(waterfallMesh)

        // Plunge pool expanding ripple disk
        const poolGeom = new THREE.CircleGeometry(8, 24)
        poolGeom.rotateX(-Math.PI * 0.5)
        const poolMesh = new THREE.Mesh(poolGeom, this.rippleMaterial)
        poolMesh.position.set(botX, botY + 0.1, botZ)
        this.group.add(poolMesh)

        // Bulky low-poly rock boulders removed per design specification
    }

    setGorgeCataracts()
    {
        // Stepped cascade further down the river gorge (X: 70, Z: -140)
        const cascadeGeom = new THREE.PlaneGeometry(10, 4, 3, 8)
        cascadeGeom.rotateX(-Math.PI * 0.2)

        const cascadeMesh = new THREE.Mesh(cascadeGeom, this.waterfallMaterial)
        const cy = WorldLayout.getElevation(68, -145)
        cascadeMesh.position.set(68, cy + 1.2, -145)
        cascadeMesh.rotation.y = 0.5
        this.group.add(cascadeMesh)

        // Foam splash disk
        const splashGeom = new THREE.CircleGeometry(7, 20)
        splashGeom.rotateX(-Math.PI * 0.5)
        const splashMesh = new THREE.Mesh(splashGeom, this.rippleMaterial)
        splashMesh.position.set(70, cy + 0.1, -140)
        this.group.add(splashMesh)
    }
}
