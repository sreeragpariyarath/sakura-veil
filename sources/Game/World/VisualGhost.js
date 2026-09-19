import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'

export class VisualGhost
{
    constructor(model)
    {
        this.game = Game.getInstance()

        this.model = model

        this.setModel()
        this.setAnimation()
        this.setScreenPosition()

        this.tickCallback = () =>
        {
            this.update()
        }
        this.game.ticker.events.on('tick', this.tickCallback, 8)
    }

    destroy()
    {
        this.game.ticker.events.off('tick', this.tickCallback)
        this.model.removeFromParent()
    }

    setModel()
    {
        // Recenter: Sketchfab export has the mesh offset from the scene root,
        // so ground it (feet at y=0) and center it on x/z before driving the
        // root transform with physics every frame
        const box = new THREE.Box3().setFromObject(this.model)
        const center = box.getCenter(new THREE.Vector3())
        const offset = new THREE.Vector3(-center.x, -box.min.y, -center.z)

        for(const child of [ ...this.model.children ])
            child.position.add(offset)

        // Scale up: source mesh is tiny (~0.3 units tall), tune to taste
        this.model.scale.setScalar(66)

        this.model.traverse((child) =>
        {
            if(child.isMesh)
            {
                child.receiveShadow = true
                child.castShadow = true
            }
        })

        this.model.rotation.reorder('YXZ')
        this.game.scene.add(this.model)
    }

    setAnimation()
    {
        const clips = this.game.resources.vehicle.animations

        if(!clips || !clips.length)
            return

        this.mixer = new THREE.AnimationMixer(this.model)
        this.action = this.mixer.clipAction(clips[0])
        this.action.play()
    }

    setScreenPosition()
    {
        this.screenPosition = new THREE.Vector2(0, 0)
    }

    update()
    {
        const physicalVehicle = this.game.physicalVehicle

        this.model.position.copy(physicalVehicle.position)

        // Visual floating / bobbing offset (independent of base physics position)
        const floatOffset = Math.sin(this.game.ticker.elapsed * 0.003) * 0.15
        this.model.position.y += floatOffset

        this.model.quaternion.copy(physicalVehicle.quaternion)

        if(this.mixer)
            this.mixer.update(this.game.ticker.deltaScaled)

        // Screen position (used by Foliage's see-through effect)
        const vector = new THREE.Vector3()
        vector.setFromMatrixPosition(this.model.matrixWorld)
        vector.project(this.game.view.camera)

        this.screenPosition.x = (vector.x * 0.5 + 0.5)
        this.screenPosition.y = (vector.y * -0.5 + 0.5)
    }
}
