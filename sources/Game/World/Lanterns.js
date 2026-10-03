import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { Events } from '../Events.js'
import { References } from '../References.js'
import { InteractivePoints } from '../InteractivePoints.js'

// The five festival lanterns of the Sakura Festival story (docs/story/STORY.md).
// Each one opens one portfolio card; lighting all five starts the celebration.
export class Lanterns
{
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

        this.setBase()
        this.setPlacements()
        this.setItems()
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
            }
            this.items.set(item.id, item)

            this.setInteractivePoint(item)

            if(this.debugPanel)
            {
                const folder = this.debugPanel.addFolder({ title: placement.label, expanded: false })
                folder.addBinding(item.position, 'x', { min: - 100, max: 100, step: 0.1 }).on('change', () => this.updatePosition(item))
                folder.addBinding(item.position, 'z', { min: - 140, max: 140, step: 0.1 }).on('change', () => this.updatePosition(item))
            }
        }
    }

    setInteractivePoint(item)
    {
        // "Press E" label floating above the lamp; opens the lantern's card (`.js-modal` in index.html)
        item.interactivePoint = this.game.interactivePoints.create(
            item.position.clone().add(new THREE.Vector3(0, this.height + 0.8, 0)),
            item.label,
            InteractivePoints.ALIGN_LEFT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.modals.open(item.modal)
                this.events.trigger('interact', [ item ])
            }
        )
    }

    updatePosition(item)
    {
        item.object.physical.body.setTranslation(item.position, true)
        item.object.visual.object3D.position.copy(item.position)

        const point = item.interactivePoint
        point.position.set(item.position.x, item.position.z)
        point.group.position.x = item.position.x
        point.group.position.z = item.position.z
        this.game.interactivePoints.needsTest = true
    }
}
