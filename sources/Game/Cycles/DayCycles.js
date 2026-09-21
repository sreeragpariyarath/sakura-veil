import * as THREE from 'three/webgpu'
import { Cycles } from './Cycles.js'

const presets = {
    day:   { revealColor: new THREE.Color('#5f7dff'), revealIntensity: 12, electricField: 0, temperature: 22, lightColor: new THREE.Color('#fff0e6'), lightIntensity: 1.5, shadowColor: new THREE.Color('#a892d1'), fogColorA: new THREE.Color('#bfe1ff'), fogColorB: new THREE.Color('#4a90e2'), fogNearRatio: 0.315, fogFarRatio: 1.25 },
    dusk:  { revealColor: new THREE.Color('#5f7dff'), revealIntensity: 12, electricField: 0, temperature: 22, lightColor: new THREE.Color('#fff0e6'), lightIntensity: 1.5, shadowColor: new THREE.Color('#a892d1'), fogColorA: new THREE.Color('#bfe1ff'), fogColorB: new THREE.Color('#4a90e2'), fogNearRatio: 0.315, fogFarRatio: 1.25 },
    night: { revealColor: new THREE.Color('#5f7dff'), revealIntensity: 12, electricField: 0, temperature: 22, lightColor: new THREE.Color('#fff0e6'), lightIntensity: 1.5, shadowColor: new THREE.Color('#a892d1'), fogColorA: new THREE.Color('#bfe1ff'), fogColorB: new THREE.Color('#4a90e2'), fogNearRatio: 0.315, fogFarRatio: 1.25 },
    dawn:  { revealColor: new THREE.Color('#5f7dff'), revealIntensity: 12, electricField: 0, temperature: 22, lightColor: new THREE.Color('#fff0e6'), lightIntensity: 1.5, shadowColor: new THREE.Color('#a892d1'), fogColorA: new THREE.Color('#bfe1ff'), fogColorB: new THREE.Color('#4a90e2'), fogNearRatio: 0.315, fogFarRatio: 1.25 },
}

export class DayCycles extends Cycles
{
    constructor()
    {
        const forcedProgress = 0.0
        super('🕜 Day Cycles', 4 * 60, forcedProgress, false)
    }

    get presets()
    {
        return presets
    }

    getKeyframesDescriptions()
    {
        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel.addBinding(this, 'duration', { min: 1, max: 60 * 10, step: 1 })

            for(const presetKey in presets)
            {
                const preset = presets[presetKey]
                const presetsDebugPanel = this.debugPanel.addFolder({
                    title: presetKey,
                    expanded: true,
                })

                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.revealColor, 'revealColor')
                presetsDebugPanel.addBinding(preset, 'revealIntensity', { min: 0, max: 20, step: 0.001 })
                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.lightColor, 'lightColor')
                presetsDebugPanel.addBinding(preset, 'lightIntensity', { min: 0, max: 20 })
                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.shadowColor, 'shadowColor')
                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.fogColorA, 'fogColorA')
                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.fogColorB, 'fogColorB')
                presetsDebugPanel.addBinding(preset, 'fogNearRatio', { label: 'near', min: -2, max: 2, step: 0.001 })
                presetsDebugPanel.addBinding(preset, 'fogFarRatio', { label: 'far', min: -2, max: 2, step: 0.001 })
            }
        }

        return [
            [
                { properties: presets.day, stop: 0.0 },
                { properties: presets.day, stop: 1.0 },
            ]
        ]
    }

    getIntervalDescriptions()
    {
        return [
            { name: 'night', start: 0.25, end: 0.7 },
            { name: 'deepNight', start: 0.35, end: 0.6 },
        ]
    }
}