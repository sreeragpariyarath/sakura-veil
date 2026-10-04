import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { WorldLayout } from './WorldLayout.js'
import { color, float, Fn, mix, sin, smoothstep, texture, time, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'

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
        const waterColorNode = Fn(() =>
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

            // Edge transparency fade
            const edgeFade = sin(vUv.x.mul(Math.PI))

            // Colors: clear turquoise water and pure white aeration foam
            const waterBase = color('#38bdf8')
            const waterFoam = color('#ffffff')
            const finalRgb = mix(waterBase, waterFoam, foam)

            const alpha = mix(float(0.72), float(0.98), foam).mul(edgeFade)

            return vec4(finalRgb, alpha)
        })()

        this.waterfallMaterial = new THREE.MeshBasicNodeMaterial({
            colorNode: waterColorNode,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide
        })

        // Plunge pool foaming ripple material
        const rippleColorNode = Fn(() =>
        {
            const vUv = uv()
            const centerDist = vUv.sub(vec2(0.5)).length()
            const expandingWave = sin(centerDist.mul(35.0).sub(time.mul(5.0)))
            const ringMask = smoothstep(0.1, 0.45, centerDist).mul(smoothstep(0.5, 0.35, centerDist))

            const foamColor = color('#ffffff')
            const poolColor = color('#38bdf8')
            const rgb = mix(poolColor, foamColor, expandingWave.mul(0.5).add(0.5))

            return vec4(rgb, ringMask.mul(0.75))
        })()

        this.rippleMaterial = new THREE.MeshBasicNodeMaterial({
            colorNode: rippleColorNode,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide
        })
    }

    setGreatMountainWaterfall()
    {
        // Great Mountain Waterfall: drops from high cliff shelf (Y ~ 72m) to river pool (Y ~ 26m)
        const topX = 110
        const topZ = -1180
        const topY = 72

        const botX = 135
        const botZ = -1160
        const botY = 27

        const height = topY - botY
        const width = 28

        // Curved waterfall sheet geometry
        const segments = 24
        const geometry = new THREE.PlaneGeometry(width, height, 4, segments)

        // Curve outward slightly as water arcs off the cliff
        const posAttr = geometry.attributes.position
        for(let i = 0; i < posAttr.count; i++)
        {
            const y = posAttr.getY(i) // from -height/2 to +height/2
            const normY = (y + height * 0.5) / height // 0 at bottom, 1 at top
            // Parabolic arc outward
            const outward = Math.sin(normY * Math.PI) * 4.5
            posAttr.setZ(i, posAttr.getZ(i) + outward)
        }
        geometry.computeVertexNormals()

        const waterfallMesh = new THREE.Mesh(geometry, this.waterfallMaterial)
        waterfallMesh.position.set((topX + botX) * 0.5, (topY + botY) * 0.5, (topZ + botZ) * 0.5)
        waterfallMesh.rotation.y = Math.atan2(botX - topX, botZ - topZ)
        this.group.add(waterfallMesh)

        // Second overlapping stream for volume depth
        const waterfallMesh2 = waterfallMesh.clone()
        waterfallMesh2.scale.set(0.85, 0.98, 1)
        waterfallMesh2.position.x += 3
        waterfallMesh2.position.z -= 2
        this.group.add(waterfallMesh2)

        // Plunge pool expanding ripple disk
        const poolGeom = new THREE.CircleGeometry(32, 32)
        poolGeom.rotateX(-Math.PI * 0.5)
        const poolMesh = new THREE.Mesh(poolGeom, this.rippleMaterial)
        poolMesh.position.set(botX, botY + 0.1, botZ)
        this.group.add(poolMesh)

        // Clustered rock boulders flanking the waterfall
        const rockGeom = new THREE.DodecahedronGeometry(1, 1)
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x5a6370, roughness: 0.85 })

        const boulderOffsets = [
            [ -18, 0, -4, 9 ], [ 18, 0, 4, 10 ],
            [ -14, 18, -6, 12 ], [ 16, 20, 2, 11 ],
            [ -12, 36, -8, 14 ], [ 14, 38, 0, 13 ],
        ]
        for(const [ ox, oy, oz, scale ] of boulderOffsets)
        {
            const boulder = new THREE.Mesh(rockGeom, rockMat)
            boulder.position.set(botX + ox, botY + oy, botZ + oz)
            boulder.scale.set(scale, scale * 1.3, scale * 0.9)
            boulder.castShadow = true
            boulder.receiveShadow = true
            this.group.add(boulder)
        }
    }

    setGorgeCataracts()
    {
        // Stepped cascade further down the river gorge (X: 380, Z: -830)
        const cascadeGeom = new THREE.PlaneGeometry(35, 14, 3, 8)
        cascadeGeom.rotateX(-Math.PI * 0.2)

        const cascadeMesh = new THREE.Mesh(cascadeGeom, this.waterfallMaterial)
        const cy = WorldLayout.getElevation(380, -830)
        cascadeMesh.position.set(380, cy + 4, -830)
        cascadeMesh.rotation.y = 0.5
        this.group.add(cascadeMesh)

        // Foam splash disk
        const splashGeom = new THREE.CircleGeometry(24, 24)
        splashGeom.rotateX(-Math.PI * 0.5)
        const splashMesh = new THREE.Mesh(splashGeom, this.rippleMaterial)
        splashMesh.position.set(390, cy + 0.1, -815)
        this.group.add(splashMesh)
    }
}
