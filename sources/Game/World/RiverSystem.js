import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { WorldLayout } from './WorldLayout.js'
import { color, float, Fn, mix, sin, smoothstep, texture, time, uniform, uv, vec2, vec4 } from 'three/tsl'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'

/**
 * RiverSystem: Mountain river flowing from the Northern Waterfall down through
 * the Sunken Torii gorge, under the River Crossing arched bridge, out into the sea.
 * Features:
 * - Continuous 3D river water surface with turquoise clarity
 * - Animated downstream current flow & rapid foam
 * - Floating pink sakura petals drifting with the current
 * - Arched traditional Japanese red wooden bridge spanning the River Crossing
 * - Riverbed boulders and stepping stones
 */
export class RiverSystem
{
    constructor()
    {
        this.game = Game.getInstance()
        this.group = new THREE.Group()
        this.group.name = 'riverSystem'

        this.setMaterial()
        this.setRiverMesh()
        this.setArchedBridge()
        this.setRiverBoulders()

        this.game.scene.add(this.group)
    }

    setMaterial()
    {
        // Flowing river water shader in TSL
        const riverColorNode = Fn(() =>
        {
            const vUv = uv()

            // Downstream flow UV
            const flowSpeed = uniform(0.22)
            const flowUv1 = vec2(vUv.x.mul(2.5), vUv.y.mul(25.0).sub(time.mul(flowSpeed)))
            const flowUv2 = vec2(vUv.x.mul(3.5).add(0.3), vUv.y.mul(35.0).sub(time.mul(flowSpeed.mul(1.3))))

            const noise1 = texture(this.game.noises.perlin, flowUv1.mul(0.12)).r
            const noise2 = texture(this.game.noises.perlin, flowUv2.mul(0.15)).r

            // Foaming rapids and shoreline foam
            const shoreDist = sin(vUv.x.mul(Math.PI))
            const foamMask = noise1.add(noise2).mul(0.5)
            const shoreFoam = smoothstep(0.18, 0.02, shoreDist).mul(noise1)
            const rapidsFoam = smoothstep(0.65, 0.85, foamMask)
            const totalFoam = shoreFoam.add(rapidsFoam).clamp(0.0, 1.0)

            // Scattered floating pink sakura petals drifting downstream
            const petalUv = vec2(vUv.x.mul(6.0), vUv.y.mul(40.0).sub(time.mul(flowSpeed.mul(0.9))))
            const petalNoise = texture(this.game.noises.perlin, petalUv.mul(0.35)).r
            const petalMask = smoothstep(0.79, 0.88, petalNoise)

            // Color palette: crystal turquoise cyan with azure depth & white foam
            const waterDeep = color('#0284c7')
            const waterShallow = color('#38bdf8')
            const foamColor = color('#ffffff')
            const petalColor = color('#ffaec9')

            const waterRgb = mix(waterDeep, waterShallow, noise1.mul(0.6))
            const withFoam = mix(waterRgb, foamColor, totalFoam.mul(0.75))
            const finalRgb = mix(withFoam, petalColor, petalMask.mul(0.85))

            const alpha = mix(float(0.75), float(0.96), totalFoam)

            return vec4(finalRgb, alpha)
        })()

        this.riverMaterial = new THREE.MeshBasicNodeMaterial({
            colorNode: riverColorNode,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide
        })
    }

    setRiverMesh()
    {
        const pts = WorldLayout.river.points
        const width = WorldLayout.river.width * 0.9

        // Interpolate smooth river centerline
        const curvePoints = []
        for(const pt of pts)
        {
            // Sample terrain elevation along river channel and offset up into water bed
            const groundY = WorldLayout.getElevation(pt.x, pt.z)
            curvePoints.push(new THREE.Vector3(pt.x, groundY + 0.8, pt.z))
        }

        const curve = new THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0.5)
        const sampleCount = 180
        const sampledPoints = curve.getPoints(sampleCount)

        // Build ribbon geometry with left/right bank vertices
        const positions = new Float32Array((sampleCount + 1) * 2 * 3)
        const uvs = new Float32Array((sampleCount + 1) * 2 * 2)
        const indices = []

        for(let i = 0; i <= sampleCount; i++)
        {
            const t = i / sampleCount
            const pt = sampledPoints[i]
            const tangent = curve.getTangent(t)
            // Perpendicular vector in horizontal plane
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize()

            const halfW = (width * 0.5) * (0.85 + Math.sin(t * Math.PI * 6) * 0.15)
            const left = pt.clone().addScaledVector(normal, -halfW)
            const right = pt.clone().addScaledVector(normal, halfW)

            const idx = i * 2

            // Left vertex
            positions[idx * 3    ] = left.x
            positions[idx * 3 + 1] = left.y
            positions[idx * 3 + 2] = left.z
            uvs[idx * 2    ] = 0
            uvs[idx * 2 + 1] = t

            // Right vertex
            positions[(idx + 1) * 3    ] = right.x
            positions[(idx + 1) * 3 + 1] = right.y
            positions[(idx + 1) * 3 + 2] = right.z
            uvs[(idx + 1) * 2    ] = 1
            uvs[(idx + 1) * 2 + 1] = t

            if(i < sampleCount)
            {
                indices.push(idx, idx + 1, idx + 2)
                indices.push(idx + 1, idx + 3, idx + 2)
            }
        }

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
        geometry.setIndex(indices)
        geometry.computeVertexNormals()

        const riverMesh = new THREE.Mesh(geometry, this.riverMaterial)
        this.group.add(riverMesh)
    }

    setArchedBridge()
    {
        // Arched red wooden bridge spanning River Crossing (X: 750, Z: 490)
        // Directly matching the concept art screenshots 3 & 4!
        const bridgeGroup = new THREE.Group()
        bridgeGroup.position.set(750, WorldLayout.getElevation(750, 490) + 1.2, 490)
        bridgeGroup.rotation.y = -0.55 // Crosses perpendicular to river

        const bridgeSpan = 70
        const bridgeWidth = 14
        const archHeight = 6.5

        const redMat = new MeshDefaultMaterial({
            colorNode: color('#c03221'), // Vermilion lacquer
            hasWater: false,
            hasLightBounce: true
        })

        const woodPlankMat = new MeshDefaultMaterial({
            colorNode: color('#a37953'), // Weathered cedar planks
            hasWater: false,
            hasLightBounce: true
        })

        // 1. Arched Deck
        const deckSegments = 32
        for(let i = 0; i < deckSegments; i++)
        {
            const t = i / (deckSegments - 1)
            const x = (t - 0.5) * bridgeSpan
            const y = Math.sin(t * Math.PI) * archHeight

            const plankGeom = new THREE.BoxGeometry(bridgeSpan / deckSegments + 0.3, 0.7, bridgeWidth)
            const plank = new THREE.Mesh(plankGeom, woodPlankMat)
            plank.position.set(x, y, 0)
            plank.castShadow = true
            plank.receiveShadow = true
            bridgeGroup.add(plank)
        }

        // 2. Arched Red Railings on both sides
        for(const side of [ - bridgeWidth * 0.5, bridgeWidth * 0.5 ])
        {
            // Railing posts
            for(let p = 0; p <= 12; p++)
            {
                const t = p / 12
                const x = (t - 0.5) * bridgeSpan
                const y = Math.sin(t * Math.PI) * archHeight

                const postGeom = new THREE.CylinderGeometry(0.3, 0.35, 2.2, 8)
                const post = new THREE.Mesh(postGeom, redMat)
                post.position.set(x, y + 1.1, side)
                post.castShadow = true
                bridgeGroup.add(post)

                // Top post finial (giboshi ornament)
                const finialGeom = new THREE.SphereGeometry(0.35, 8, 8)
                const finial = new THREE.Mesh(finialGeom, redMat)
                finial.position.set(x, y + 2.3, side)
                bridgeGroup.add(finial)
            }

            // Continuous curved top rail
            const railCurvePoints = []
            for(let r = 0; r <= 20; r++)
            {
                const t = r / 20
                railCurvePoints.push(new THREE.Vector3(
                    (t - 0.5) * bridgeSpan,
                    Math.sin(t * Math.PI) * archHeight + 1.9,
                    side
                ))
            }
            const railCurve = new THREE.CatmullRomCurve3(railCurvePoints)
            const railGeom = new THREE.TubeGeometry(railCurve, 24, 0.22, 8, false)
            const rail = new THREE.Mesh(railGeom, redMat)
            bridgeGroup.add(rail)
        }

        this.group.add(bridgeGroup)
    }

    setRiverBoulders()
    {
        // River stones and rapids boulders clustered along the riverbed
        const boulderGeom = new THREE.DodecahedronGeometry(1, 1)
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x5a6572, roughness: 0.85 })

        const boulderClusters = [
            { x: 260, z: -980, count: 6, scale: 6 },
            { x: 550, z: -540, count: 8, scale: 7 },
            { x: 730, z: -250, count: 7, scale: 8 },
            { x: 860, z: 240,  count: 9, scale: 6 }, // Around the bridge
            { x: 1040, z: 660, count: 8, scale: 7 },
            { x: 1400, z: 1020, count: 10, scale: 9 }, // Near coastal estuary
        ]

        for(const cluster of boulderClusters)
        {
            for(let b = 0; b < cluster.count; b++)
            {
                const ox = (Math.sin(b * 3.7) * 0.5) * 45
                const oz = (Math.cos(b * 2.3) * 0.5) * 45
                const bx = cluster.x + ox
                const bz = cluster.z + oz
                const by = WorldLayout.getElevation(bx, bz)

                const boulder = new THREE.Mesh(boulderGeom, stoneMat)
                const s = cluster.scale * (0.7 + (b % 3) * 0.25)
                boulder.position.set(bx, by + s * 0.35, bz)
                boulder.scale.set(s, s * 0.75, s * 1.1)
                boulder.rotation.set((b * 1.7) % 2, (b * 2.9) % (Math.PI * 2), 0)
                boulder.castShadow = true
                boulder.receiveShadow = true
                this.group.add(boulder)
            }
        }
    }
}
