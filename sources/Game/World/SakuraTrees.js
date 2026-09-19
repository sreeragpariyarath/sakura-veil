import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'

export class SakuraTrees
{
    constructor()
    {
        this.game = Game.getInstance()
        this.model = this.game.resources.sakuraModel?.scene

        if(!this.model)
            return

        this.group = new THREE.Group()
        this.group.name = 'sakuraTrees'

        // Base transform and shadow configuration
        this.model.traverse((child) =>
        {
            if(child.isMesh)
            {
                child.castShadow = true
                child.receiveShadow = true
                if(child.material)
                {
                    child.material.side = THREE.DoubleSide
                }
            }
        })

        this.baseScale = 0.25 // Global size multiplier for all Sakura trees

        this.setTrees()
    }

    setTrees()
    {
        const placements = [
            // Prominent Sakura tree near the pond (left)
            { position: new THREE.Vector3(-15.5, 0, -16), scale: 1.4, rotation: 0.8 },
            { position: new THREE.Vector3(-21.0, 0, -26), scale: 1.25, rotation: 2.3 },

            // Left side along playable paths & bushes
            { position: new THREE.Vector3(-24.0, 0, -5),   scale: 1.1, rotation: 1.2 },
            { position: new THREE.Vector3(-27.0, 0, 18),   scale: 1.15, rotation: 4.1 },
            { position: new THREE.Vector3(-31.0, 0, 38),   scale: 1.2, rotation: 0.5 },
            { position: new THREE.Vector3(-23.0, 0, -42),  scale: 1.05, rotation: 3.2 },
            { position: new THREE.Vector3(-36.0, 0, -62),  scale: 1.3, rotation: 2.7 },
            { position: new THREE.Vector3(-44.0, 0, -82),  scale: 1.2, rotation: 1.8 },

            // Right side along paths & open space
            { position: new THREE.Vector3(19.0, 0, -14),   scale: 1.1, rotation: 3.5 },
            { position: new THREE.Vector3(26.0, 0, 8),     scale: 1.0, rotation: 0.9 },
            { position: new THREE.Vector3(32.0, 0, -32),   scale: 1.25, rotation: 5.0 },
            { position: new THREE.Vector3(36.0, 0, 28),    scale: 1.15, rotation: 2.1 },
            { position: new THREE.Vector3(43.0, 0, -58),   scale: 1.3, rotation: 1.4 },
            { position: new THREE.Vector3(52.0, 0, -84),   scale: 1.2, rotation: 4.8 },

            // Middle distance & horizon background
            { position: new THREE.Vector3(-14.0, 0, -72),  scale: 1.3, rotation: 2.0 },
            { position: new THREE.Vector3(6.0, 0, -92),    scale: 1.35, rotation: 0.4 },
            { position: new THREE.Vector3(22.0, 0, -82),   scale: 1.25, rotation: 3.7 },
            { position: new THREE.Vector3(-48.0, 0, -108), scale: 1.4, rotation: 1.1 },
            { position: new THREE.Vector3(-22.0, 0, -122), scale: 1.35, rotation: 5.2 },
            { position: new THREE.Vector3(12.0, 0, -128),  scale: 1.4, rotation: 2.9 },
            { position: new THREE.Vector3(42.0, 0, -112),  scale: 1.3, rotation: 0.3 },
            { position: new THREE.Vector3(62.0, 0, -88),   scale: 1.2, rotation: 4.0 },
        ]

        for(const treeConfig of placements)
        {
            const finalScale = treeConfig.scale * this.baseScale

            const instance = this.model.clone(true)
            instance.position.copy(treeConfig.position)
            instance.rotation.y = treeConfig.rotation
            instance.scale.setScalar(finalScale)

            this.group.add(instance)

            // Physical trunk collider
            this.game.objects.add(
                null,
                {
                    type: 'fixed',
                    position: treeConfig.position.clone().add(new THREE.Vector3(0, 2.5, 0)),
                    rotation: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), treeConfig.rotation),
                    friction: 0.7,
                    sleeping: true,
                    colliders: [ { shape: 'cylinder', parameters: [ 2.5, 0.4 * finalScale ], category: 'object' } ]
                }
            )
        }

        this.game.scene.add(this.group)
    }
}
