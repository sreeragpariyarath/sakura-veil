import { color, equirectUV, float, Fn, mix, positionWorld, rangeFogFactor, screenCoordinate, smoothstep, texture, time, uniform, vec2, vec3, viewportUV } from 'three/tsl'
import { Game } from './Game.js'

export class Fog
{
    constructor()
    {
        this.game = Game.getInstance()
        
        this.colorA = uniform(color('#ff0000'))
        this.colorB = uniform(color('#0000ff'))
        this.radialCenter = uniform(vec2(0, 0))
        this.radialStart = uniform(0)
        this.radialEnd = uniform(1)

        const colorMix = vec2(viewportUV.xy).sub(this.radialCenter).length().smoothstep(this.radialStart, this.radialEnd)
        this.color = mix(this.colorA, this.colorB, colorMix)

        // Equirectangular anime sky background with cloud drift
        const backgroundNode = Fn(() =>
        {
            if(this.game.resources?.skyboxTexture)
            {
                const uvCoord = equirectUV()
                // Slow subtle cloud drift across the sky
                const scrolledU = uvCoord.x.add(time.mul(0.0012)).fract()
                const skySample = texture(this.game.resources.skyboxTexture, vec2(scrolledU, uvCoord.y)).rgb

                // Fade bottom half into atmospheric ocean fog (uvCoord.y = 0.5 is horizon)
                const horizonFade = uvCoord.y.smoothstep(0.40, 0.52)
                return mix(this.color, skySample, horizonFade)
            }
            return this.color
        })()

        this.game.scene.backgroundNode = backgroundNode

        this.near = uniform(450)
        this.far = uniform(900)
        this.strength = rangeFogFactor(this.near, this.far)

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 10)

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.game.debug.panel.addFolder({
                title: '☁️ Fog',
                expanded: false,
            })
            debugPanel.addBinding(this.radialCenter, 'value', { value: 'offset', min: 0, max: 1 })
        }
    }

    update()
    {
        // Apply day cycles sky background colors
        this.colorA.value.copy(this.game.dayCycles.properties.fogColorA.value)
        this.colorB.value.copy(this.game.dayCycles.properties.fogColorB.value)
        // Atmospheric fog beyond the island coastline (450m to 900m)
        this.near.value = 450
        this.far.value = 900
    }
}