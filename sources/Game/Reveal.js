import * as THREE from 'three/webgpu'
import { color, uniform, vec2 } from 'three/tsl'
import { Game } from './Game.js'
import gsap from 'gsap'

export class Reveal
{
    constructor()
    {
        this.game = Game.getInstance()
        
        this.step = -1
        const respawn = this.game.respawns.getDefault()
        this.position = respawn.position.clone()
        this.position2Uniform = uniform(vec2(this.position.x, this.position.z))
        this.distance = uniform(99999)
        this.thickness = uniform(0.05)
        this.color = uniform(color('#e88eff'))
        this.intensity = uniform(5.5)
        this.intensityMultiplier = 1
        this.sound = this.game.audio.register({
            path: 'sounds/reveal/reveal-1.mp3',
            autoplay: false,
            loop: false,
            volume: 0.5,
            preload: true
        })

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '📜 Reveal',
                expanded: false,
            })

            this.debugPanel.addBinding(this.distance, 'value', { label: 'distance', min: 0, max: 20, step: 0.01 })
            this.debugPanel.addBinding(this.thickness, 'value', { label: 'thickness', min: 0, max: 1, step: 0.001 })
            // this.game.debug.addThreeColorBinding(this.debugPanel, this.color.value, 'color')
            this.debugPanel.addBinding(this.intensity, 'value', { label: 'intensity', min: 1, max: 20, step: 0.001 })
        }

        this.update = this.update.bind(this)
        this.game.ticker.events.on('tick', this.update, 10)
    }

    updateStep(step)
    {
        // Skip intro loading circle sequence completely
        this.distance.value = 99999

        // Inputs
        this.game.inputs.filters.clear()
        this.game.inputs.filters.add('wandering')

        // View
        this.game.view.focusPoint.isTracking = true
        this.game.view.focusPoint.magnet.active = false
        this.game.view.zoom.baseRatio = 0
        this.game.view.zoom.smoothedRatio = 0

        // Cherry trees
        if(this.game.world && this.game.world.cherryTrees)
        {
            this.game.world.cherryTrees.leaves.seeThroughMultiplier = 1
        }

        if(this.game.interactivePoints)
            this.game.interactivePoints.recover()
        
        if(this.game.world)
        {
            this.game.world.step(2)
            if(this.game.world.grid) {
                this.game.world.grid.destroy()
                this.game.world.grid = null
            }
            if(this.game.world.intro) {
                this.game.world.intro.destroy()
                this.game.world.intro = null
            }
        }

        if(this.game.overlay)
            this.game.overlay.moveOnTop()

        if(this.game.server)
            this.game.server.start()

        if(this.game.menu)
            this.game.menu.preopen()

        this.game.ticker.events.off('tick', this.update)

        this.step = 2
    }

    update()
    {
        this.color.value.copy(this.game.dayCycles.properties.revealColor.value)
        this.intensity.value = this.game.dayCycles.properties.revealIntensity.value * this.intensityMultiplier
    }
}