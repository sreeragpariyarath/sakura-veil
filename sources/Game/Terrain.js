import * as THREE from 'three/webgpu'
import { Game } from './Game.js'
import MeshGridMaterial, { MeshGridMaterialLine } from './Materials/MeshGridMaterial.js'
import { color, Fn, mix, round, smoothstep, texture, uniform, uv, vec2 } from 'three/tsl'
import { WorldLayout } from './World/WorldLayout.js'

export class Terrain
{
    constructor()
    {
        this.game = Game.getInstance()

        this.size = WorldLayout.size
        this.dataResolution = 2048 // 2048 px across 1200 m (~0.58 m per pixel)

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🏔️ Terrain Data',
                expanded: false,
            })
        }

        this.setDataTexture()
        this.setGradient()
        this.setNodes()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 10)
    }

    /**
     * Terrain data map painted from WorldLayout (replaces the legacy driving-game terrain.png).
     * R = stone path / packed earth, G = grass, B = water depth (the floor sinks and water shows where B is high).
     * Pixel (u, v) maps to world (x, z) with u = x / size + 0.5 and v = z / size + 0.5, same as Map.worldToMap().
     */
    setDataTexture()
    {
        const resolution = this.dataResolution
        const pixelsPerMetre = resolution / this.size
        const toPixel = (value) => (value / this.size + 0.5) * resolution

        const canvas = document.createElement('canvas')
        canvas.width = resolution
        canvas.height = resolution
        const context = canvas.getContext('2d')
        context.lineCap = 'round'
        context.lineJoin = 'round'

        // 1. Deep Ocean everywhere (B = 255): water shader active, seabed dips down
        context.fillStyle = 'rgb(0, 0, 255)'
        context.fillRect(0, 0, resolution, resolution)

        // Helper: draw the organic island polygon from WorldLayout
        const drawIslandPath = (radiusOffset = 0) =>
        {
            context.beginPath()
            const steps = 180
            for(let i = 0; i <= steps; i++)
            {
                const angle = (i / steps) * Math.PI * 2
                const radius = Math.max(20, WorldLayout.getIslandRadius(angle) + radiusOffset)
                const px = toPixel(Math.cos(angle) * radius)
                const pz = toPixel(Math.sin(angle) * radius)
                if(i === 0) context.moveTo(px, pz)
                else context.lineTo(px, pz)
            }
            context.closePath()
        }

        // 2. Soft sandy beach / shoreline shelf (warm sand tones: R=200, G=130, B=0)
        // Heavily blurred so the seabed slopes gently into deep water with foam
        context.filter = `blur(${Math.round(45 * pixelsPerMetre)}px)`
        context.fillStyle = 'rgb(200, 130, 0)'
        drawIslandPath(0)
        context.fill()

        // 3. Dry Island interior (lush grass: G = 255, B = 0)
        context.filter = `blur(${Math.round(20 * pixelsPerMetre)}px)`
        context.fillStyle = 'rgb(0, 255, 0)'
        drawIslandPath(-55)
        context.fill()

        // 4. Awakening Beach Cove (wide sandy beach on the south coast, no grass)
        context.filter = `blur(${Math.round(25 * pixelsPerMetre)}px)`
        context.fillStyle = 'rgb(220, 120, 0)'
        context.beginPath()
        context.ellipse(toPixel(0), toPixel(1300), 520 * pixelsPerMetre, 220 * pixelsPerMetre, 0, 0, Math.PI * 2)
        context.fill()

        // 5. Arenas: packed earth with light grass so combat space reads clearly
        context.filter = `blur(${Math.round(8 * pixelsPerMetre)}px)`
        context.fillStyle = 'rgb(200, 90, 0)'
        for(const arena of WorldLayout.arenas)
        {
            context.beginPath()
            context.arc(toPixel(arena.x), toPixel(arena.z), arena.radius * pixelsPerMetre, 0, Math.PI * 2)
            context.fill()
        }

        // 6. Stone and dirt paths linking the zones
        context.filter = `blur(${Math.round(2 * pixelsPerMetre)}px)`
        context.strokeStyle = 'rgb(255, 50, 0)'
        context.lineWidth = WorldLayout.pathWidth * pixelsPerMetre
        for(const [ fromId, toId ] of WorldLayout.paths)
        {
            const from = WorldLayout.getArena(fromId)
            const to = WorldLayout.getArena(toId)
            if(!from || !to) continue
            context.beginPath()
            context.moveTo(toPixel(from.x), toPixel(from.z))
            context.lineTo(toPixel(to.x), toPixel(to.z))
            context.stroke()
        }

        // 7. Mountain River & Lotus Pond (water depth B = 255)
        const drawWater = (widthMultiplier, blurMetres) =>
        {
            context.filter = blurMetres > 0 ? `blur(${Math.round(blurMetres * pixelsPerMetre)}px)` : 'none'
            context.strokeStyle = 'rgb(0, 0, 255)'
            context.fillStyle = 'rgb(0, 0, 255)'

            const river = WorldLayout.river
            context.lineWidth = river.width * widthMultiplier * pixelsPerMetre
            context.beginPath()
            river.points.forEach((point, index) =>
            {
                if(index === 0)
                    context.moveTo(toPixel(point.x), toPixel(point.z))
                else
                    context.lineTo(toPixel(point.x), toPixel(point.z))
            })
            context.stroke()

            for(const pond of WorldLayout.ponds)
            {
                context.beginPath()
                context.arc(toPixel(pond.x), toPixel(pond.z), pond.radius * widthMultiplier * pixelsPerMetre, 0, Math.PI * 2)
                context.fill()
            }
        }
        drawWater(1.6, 7)
        drawWater(0.8, 0)

        context.filter = 'none'

        this.dataTexture = new THREE.CanvasTexture(canvas)
        this.dataTexture.flipY = false
        this.dataTexture.colorSpace = THREE.NoColorSpace // Data, not colour
        this.dataTexture.wrapS = THREE.ClampToEdgeWrapping
        this.dataTexture.wrapT = THREE.ClampToEdgeWrapping
        this.dataTexture.magFilter = THREE.LinearFilter
        this.dataTexture.minFilter = THREE.LinearMipmapLinearFilter
        this.dataTexture.needsUpdate = true

        this.dataCanvas = canvas
    }

    setGradient()
    {
        const height = 16

        const canvas = document.createElement('canvas')
        canvas.width = 1
        canvas.height = height

        this.gradientTexture = new THREE.Texture(canvas)
        this.gradientTexture.colorSpace = THREE.SRGBColorSpace

        const context = canvas.getContext('2d')

        this.colors = [
            { stop: 0.1, value: '#ffa94e' },
            { stop: 0.3, value: '#5bc2b9' },
            { stop: 0.9, value: '#13375f' },
        ]

        const update = () =>
        {
            const gradient = context.createLinearGradient(0, 0, 0, height)
            for(const color of this.colors)
                gradient.addColorStop(color.stop, color.value)

            context.fillStyle = gradient
            context.fillRect(0, 0, 1, height)
            this.gradientTexture.needsUpdate = true
        }

        update()

        // // Debug
        // canvas.style.position = 'fixed'
        // canvas.style.zIndex = 999
        // canvas.style.top = 0
        // canvas.style.left = 0
        // canvas.style.width = '128px'
        // canvas.style.height = `256px`
        // document.body.append(canvas)
        
        if(this.game.debug.active)
        {
            for(const color of this.colors)
            {
                this.debugPanel.addBinding(color, 'stop', { min: 0, max: 1, step: 0.001 }).on('change', update)
                this.debugPanel.addBinding(color, 'value', { view: 'color' }).on('change', update)
            }
        }
    }

    setNodes()
    {
        this.grassColorUniform = uniform(color('#b8b62e'))
        this.tracksDelta = uniform(vec2(0))

        const worldPositionToUvNode = Fn(([position]) =>
        {
            return position.div(this.size).add(0.5)
        })

        this.terrainNode = Fn(([position]) =>
        {
            const textureUv = worldPositionToUvNode(position)
            const data = texture(this.dataTexture, textureUv)

            // Wheel tracks
            const groundDataColor = texture(
                this.game.tracks.renderTarget.texture,
                position.sub(- this.game.tracks.halfSize).sub(this.tracksDelta).div(this.game.tracks.size)
            )
            data.g.mulAssign(groundDataColor.r.oneMinus())

            return data
        })
        
        this.colorNode = Fn(([terrainData]) =>
        {
            // Dirt and water
            const baseColor = texture(this.gradientTexture, vec2(0, terrainData.b.oneMinus()))

            // Grass
            baseColor.assign(mix(baseColor, this.grassColorUniform, terrainData.g))

            return baseColor.rgb
        })

        if(this.game.debug.active)
        {
            this.game.debug.addThreeColorBinding(this.debugPanel, this.grassColorUniform.value, 'grassColor')
        }
    }
    
    update()
    {
        // Tracks delta
        this.tracksDelta.value.set(
            this.game.tracks.focusPoint.x,
            this.game.tracks.focusPoint.y
        )
    }
}