import { color, float, mix, positionWorld, rangeFogFactor, screenCoordinate, uniform, vec2, vec3, viewportUV } from 'three/tsl'
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
        this.game.scene.backgroundNode = this.color

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