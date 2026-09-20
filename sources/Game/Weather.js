import gsap from 'gsap'
import { Game } from './Game.js'
import { lerp, remapClamp } from './utilities/maths.js'

export class Weather
{
    constructor()
    {
        this.game = Game.getInstance()

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🌦️ Weather',
                expanded: false,
            })
        }

        this.properties = []
        this.setOverride()

        // Temperature
        this.addProperty(
            'temperature',
            -15,
            40,
            () => 22
        )

        // Humidity
        this.addProperty(
            'humidity',
            0,
            1,
            () => 0.2
        )

        // Electric field
        this.addProperty(
            'electricField',
            -1,
            1,
            () => 0
        )

        // Clouds
        this.addProperty(
            'clouds',
            -1,
            1,
            () => 0
        )

        // Wind
        this.addProperty(
            'wind',
            0,
            1,
            () => 0.1
        )

        // Rain
        this.addProperty(
            'rain',
            0,
            1,
            () => 0
        )

        // Snow
        this.addProperty(
            'snow',
            -1,
            1,
            () => 0
        )
        
        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 8)
    }

    noise(x)
    {
        return Math.sin(x) * Math.sin(x * 1.678) * Math.sin(x * 2.345)
    }

    addProperty(name, min, max, get)
    {
        const property = {}
        property.name = name
        property.manual = false
        property.min = min
        property.max = max

        property.value = get()
        property.overrideValue = null

        // Debug
        property.binding = this.game.debug.addManualBinding(
            this.debugPanel,
            property,
            'value',
            { label: name, min: property.min, max: property.max, step: 0.001 },
            () =>
            {
                let value = get()
                
                if(this.override.strength > 0 && property.overrideValue !== null)
                {
                    value = lerp(value, property.overrideValue, this.override.strength)

                    // if(name === 'humidity')
                    // {
                    //     console.log(value)
                    // }
                }
                
                return value
            }
        )

        if(this.game.debug.active)
        {
            this.debugPanel.addBinding(property, 'value', { readonly: true })
            this.debugPanel.addBinding(
                property,
                'value',
                {
                    label: `${property.min} -> ${property.max}`,
                    readonly: true,
                    view: 'graph',
                    min: property.min,
                    max: property.max,
                }
            )
            this.debugPanel.addBlade({ view: 'separator' })
        }

        this[name] = property
        this.properties.push(property)
    }

    setOverride()
    {
        this.override = {}
        this.override.strength = 0
        
        this.override.start = (values = {}, duration = 5) =>
        {
            for(const property of this.properties)
            {
                if(typeof values[property.name] !== 'undefined')
                    property.overrideValue = values[property.name]
                else
                    property.overrideValue = null
            }

            if(duration === 0)
                this.override.strength = 1
            else
                gsap.to(this.override, { strength: 1, duration, overwrite: true })
        }

        this.override.end = (duration = 5) =>
        {
            if(duration === 0)
                this.override.strength = 0
            else
                gsap.to(this.override, { strength: 0, duration, overwrite: true })
        }
    }

    update()
    {
        for(const property of this.properties)
            property.binding.update()
    }
}