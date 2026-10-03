import * as THREE from 'three/webgpu'
import { color, float, mix, uniform, uv, vec4 } from 'three/tsl'
import gsap from 'gsap'
import { Game } from '../Game.js'
import { Events } from '../Events.js'
import { References } from '../References.js'
import { InteractivePoints } from '../InteractivePoints.js'

// The five festival lanterns of the Sakura Festival story (docs/story/STORY.md).
// Each one opens one portfolio card; lighting all five starts the celebration.
export class Lanterns
{
    static STORAGE_KEY = 'sakura-veil-lanterns'

    // Placeholder positions, one per future zone (docs/roadmap/m1-festival-garden), 40–80 m from the spawn on dry ground
    static ITEMS = [
        { id: 'about',      label: 'About me',   position: new THREE.Vector3(- 40, 0, 10),  rotation: 0.4 }, // Sakura Grove
        { id: 'experience', label: 'Experience', position: new THREE.Vector3(45, 0, - 45),  rotation: 2.1 }, // River Crossing
        { id: 'skills',     label: 'Skills',     position: new THREE.Vector3(- 65, 0, - 50), rotation: 4.0 }, // Torii Path
        { id: 'projects',   label: 'Projects',   position: new THREE.Vector3(50, 0, 40),    rotation: 1.2 }, // Koi Pond
        { id: 'contact',    label: 'Contact',    position: new THREE.Vector3(- 15, 0, 65),  rotation: 3.1 }, // Pagoda Hill
    ]

    constructor()
    {
        this.game = Game.getInstance()
        this.events = new Events()

        if(!this.game.resources.japanOldLampModel?.scene)
            return

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🏮 Lanterns',
                expanded: false,
            })
        }

        this.height = 2.6 // Lantern height in metres
        this.items = new Map()

        this.markerColor = uniform(color('#ff7eb6'))
        this.lightColor = uniform(color('#ffb347'))

        this.setBase()
        this.setGlowGeometries()
        this.setPlacements()
        this.setItems()
        this.setFinale()
        this.restore()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 10)

        if(this.debugPanel)
        {
            this.game.debug.addThreeColorBinding(this.debugPanel, this.markerColor.value, 'markerColor')
            this.game.debug.addThreeColorBinding(this.debugPanel, this.lightColor.value, 'lightColor')
            this.debugPanel.addButton({ title: 'Light all' }).on('click', () => { for(const item of this.items.values()) this.light(item) })
            this.debugPanel.addButton({ title: 'Replay finale' }).on('click', () => { this.triggerFinale() })
            this.debugPanel.addButton({ title: 'Reset lanterns' }).on('click', () => { this.reset() })
        }
    }

    /**
     * Saved progress: lit lantern ids and whether the finale was seen, in localStorage.
     * Every access is guarded: storage can be missing or throw (private windows, blocked site data).
     */
    load()
    {
        try
        {
            const data = JSON.parse(localStorage.getItem(Lanterns.STORAGE_KEY))
            if(data && Array.isArray(data.lit))
                return { lit: data.lit, finaleSeen: data.finaleSeen === true }
        }
        catch(error) {}

        return { lit: [], finaleSeen: false }
    }

    save()
    {
        try
        {
            const lit = [ ...this.items.values() ].filter(item => item.lit).map(item => item.id)
            localStorage.setItem(Lanterns.STORAGE_KEY, JSON.stringify({ lit, finaleSeen: this.finale.seen }))
        }
        catch(error) {}
    }

    restore()
    {
        const data = this.load()
        this.finale.seen = data.finaleSeen

        // Instantly, without burst or sound
        for(const id of data.lit)
        {
            const item = this.items.get(id)
            if(item)
                this.light(item, false)
        }

        // All lit but the finale was missed (page left before the last card closed) => play it shortly
        if(this.getLitCount() === this.items.size && !this.finale.seen)
            gsap.delayedCall(3, () => this.triggerFinale())
    }

    reset()
    {
        for(const item of this.items.values())
        {
            item.lit = false
            gsap.killTweensOf(item.litProgress)
            gsap.killTweensOf(item.marker.scale)
            item.litProgress.value = 0
            item.marker.visible = true
            item.marker.scale.setScalar(0.035)
        }

        this.finale.seen = false
        this.finale.pending = false
        this.save()
    }

    /**
     * Finale: fires once, after the card of the fifth lantern closes.
     * M4 (fireworks) and M6 (story text, music) listen to `lanterns.events.on('finale', …)`.
     */
    setFinale()
    {
        this.finale = { seen: false, pending: false }

        this.game.modals.events.on('close', () =>
        {
            if(!this.finale.pending)
                return

            this.finale.pending = false
            gsap.delayedCall(0.6, () => this.triggerFinale())
        })
    }

    triggerFinale()
    {
        this.finale.seen = true
        this.save()

        this.events.trigger('finale')

        // Placeholder celebration until the fireworks (roadmap M4) and story text (M6) exist
        console.log('🎆 The festival begins! Thank you for visiting.')
        if(this.game.world.confetti)
        {
            const position = this.game.player.position
            this.game.world.confetti.pop(position.clone())
            gsap.delayedCall(0.4, () => this.game.world.confetti.pop(position.clone().add(new THREE.Vector3(1.5, - 1, 1.5))))
            gsap.delayedCall(0.8, () => this.game.world.confetti.pop(position.clone().add(new THREE.Vector3(- 1.5, - 1, - 1.5))))
        }
    }

    setGlowGeometries()
    {
        // Light box wrapping the lamp's glass (the lamp GLB is one mesh, so the light is added in code).
        // Measured on japan_old_lamp.glb: glass spans 77.5–87.5% of the height, half-width ≈ 6.6% of the height
        const halfWidth = this.height * 0.066 * 1.04 // Just outside the glass so it shows through
        this.lightBoxGeometry = new THREE.BoxGeometry(halfWidth * 2, this.height * 0.096, halfWidth * 2)
        this.lightBoxY = this.height * 0.825
    }

    setBase()
    {
        // The Sketchfab lamp is authored in large units (about 178 tall, base at y = -65):
        // bake the scale into a single geometry so every lantern shares it
        const source = this.game.resources.japanOldLampModel.scene
        source.updateMatrixWorld(true)
        const bounds = new THREE.Box3().setFromObject(source)
        const size = bounds.getSize(new THREE.Vector3())
        const scale = this.height / size.y

        this.base = new THREE.Group()
        source.traverse((child) =>
        {
            if(child.isMesh)
            {
                const geometry = child.geometry.clone()
                geometry.applyMatrix4(child.matrixWorld)
                geometry.translate(- (bounds.min.x + bounds.max.x) * 0.5, - bounds.min.y, - (bounds.min.z + bounds.max.z) * 0.5) // Centred, base on the ground
                geometry.scale(scale, scale, scale)

                this.base.add(new THREE.Mesh(geometry, child.material))
            }
        })

        this.halfWidth = Math.max(size.x, size.z) * scale * 0.5
    }

    setPlacements()
    {
        // Final positions come from `refLantern1`…`refLantern5` empties in the garden GLB (roadmap M1.1);
        // until it exists, the placeholder positions in ITEMS are used
        this.placements = Lanterns.ITEMS.map(item => ({ ...item, position: item.position.clone() }))

        const gardenScene = this.game.resources.gardenModel?.scene
        if(!gardenScene)
            return

        gardenScene.updateMatrixWorld(true)
        const references = new References(gardenScene).items.get('lantern') ?? []
        references.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

        references.forEach((reference, index) =>
        {
            const placement = this.placements[index]
            if(!placement)
                return

            reference.getWorldPosition(placement.position)
            placement.rotation = new THREE.Euler().setFromQuaternion(reference.getWorldQuaternion(new THREE.Quaternion()), 'YXZ').y
        })
    }

    setItems()
    {
        for(const placement of this.placements)
        {
            const model = this.base.clone()
            model.name = `lantern-${placement.id}`

            const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), placement.rotation)

            const object = this.game.objects.add(
                { model },
                {
                    type: 'fixed',
                    position: placement.position,
                    rotation: quaternion,
                    colliders: [ { shape: 'cuboid', parameters: [ this.halfWidth * 0.8, this.height * 0.5, this.halfWidth * 0.8 ], position: { x: 0, y: this.height * 0.5, z: 0 }, category: 'object' } ],
                }
            )

            const item = {
                id: placement.id,
                label: placement.label,
                position: placement.position,
                modal: `lantern-${placement.id}`,
                object,
                lit: false,
                litProgress: uniform(0),
                bobOffset: Math.random() * Math.PI * 2,
            }
            this.items.set(item.id, item)

            this.setGlow(item)
            this.setInteractivePoint(item)

            if(this.debugPanel)
            {
                const folder = this.debugPanel.addFolder({ title: placement.label, expanded: false })
                folder.addBinding(item.position, 'x', { min: - 100, max: 100, step: 0.1 }).on('change', () => this.updatePosition(item))
                folder.addBinding(item.position, 'z', { min: - 140, max: 140, step: 0.1 }).on('change', () => this.updatePosition(item))
            }
        }
    }

    setGlow(item)
    {
        // Added after Objects.add() so materials.updateObject() doesn't convert these unlit materials
        item.effects = new THREE.Group()
        item.effects.position.copy(item.position)
        this.game.scene.add(item.effects)

        // Warm light over the glass, faded in when lit (invisible while unlit so the lamp keeps its look)
        const lightMaterial = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false })
        lightMaterial.outputNode = vec4(mix(this.lightColor, color('#fff4d6'), 0.35), item.litProgress)
        const lightBox = new THREE.Mesh(this.lightBoxGeometry, lightMaterial)
        lightBox.position.y = this.lightBoxY
        item.effects.add(lightBox)

        // Halo around the lamp head, only once lit
        const haloMaterial = new THREE.SpriteNodeMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
        const haloStrength = float(1).sub(uv().sub(0.5).length().mul(2)).clamp(0, 1).pow(2)
        haloMaterial.outputNode = vec4(this.lightColor, haloStrength.mul(item.litProgress))
        const halo = new THREE.Sprite(haloMaterial)
        halo.position.y = this.lightBoxY
        halo.scale.setScalar(2.2)
        item.effects.add(halo)

        // Marker floating above unlit lanterns: fixed screen size and no fog, so it can be spotted from far away
        const markerMaterial = new THREE.SpriteNodeMaterial({ transparent: true, depthWrite: false, sizeAttenuation: false })
        const markerDistance = uv().sub(0.5).length().mul(2)
        const markerCore = float(1).sub(markerDistance.mul(2.5)).clamp(0, 1)
        const markerGlow = float(1).sub(markerDistance).clamp(0, 1).pow(2)
        markerMaterial.outputNode = vec4(mix(this.markerColor, color('#ffffff'), markerCore), markerGlow.add(markerCore).clamp(0, 1))
        item.marker = new THREE.Sprite(markerMaterial)
        item.marker.position.y = this.height + 1.6
        item.marker.scale.setScalar(0.035)
        item.marker.renderOrder = 5
        item.effects.add(item.marker)
    }

    light(item, animate = true)
    {
        if(item.lit)
            return

        item.lit = true

        if(animate)
        {
            gsap.to(item.litProgress, { value: 1, duration: 1.2, ease: 'power2.out' })
            gsap.to(item.marker.scale, { x: 0, y: 0, z: 0, duration: 0.5, ease: 'back.in(2)', onComplete: () => { item.marker.visible = false } })

            if(this.game.world.confetti)
                this.game.world.confetti.pop(item.position.clone().add(new THREE.Vector3(0, this.lightBoxY, 0)))
        }
        else
        {
            item.litProgress.value = 1
            item.marker.visible = false
        }

        const count = this.getLitCount()

        if(animate)
        {
            this.save()

            // Last lantern lit for the first time => finale once its card closes
            if(count === this.items.size && !this.finale.seen)
                this.finale.pending = true
        }

        this.events.trigger('lit', [ item, count, ! animate ])
    }

    getLitCount()
    {
        let count = 0
        for(const item of this.items.values())
            if(item.lit)
                count++

        return count
    }

    update()
    {
        // Gentle bob of the unlit markers (no allocations)
        const time = this.game.ticker.elapsedScaled
        for(const item of this.items.values())
        {
            if(item.marker.visible)
                item.marker.position.y = this.height + 1.6 + Math.sin(time * 1.5 + item.bobOffset) * 0.15
        }
    }

    setInteractivePoint(item)
    {
        // "Press E" label floating above the lamp; opens the lantern's card (`.js-modal` in index.html)
        item.interactivePoint = this.game.interactivePoints.create(
            item.position.clone().add(new THREE.Vector3(0, this.height + 1.3, 0)),
            item.label,
            InteractivePoints.ALIGN_LEFT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.modals.open(item.modal)
                this.light(item)
                this.events.trigger('interact', [ item ])
            }
        )
    }

    updatePosition(item)
    {
        item.object.physical.body.setTranslation(item.position, true)
        item.object.visual.object3D.position.copy(item.position)
        item.effects.position.copy(item.position)

        const point = item.interactivePoint
        point.position.set(item.position.x, item.position.z)
        point.group.position.x = item.position.x
        point.group.position.z = item.position.z
        this.game.interactivePoints.needsTest = true
    }
}
