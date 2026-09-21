import { color, float, Fn, max, PI, positionWorld, texture, uniform, uv, vec3 } from 'three/tsl'
import { Game } from '../Game.js'
import { References } from '../References.js'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'

export class Scenery
{
    constructor()
    {
        this.game = Game.getInstance()

        if(!this.game.resources.sceneryModel?.scene)
            return

        this.game.resources.sceneryModel.scene.traverse((child) => {
            const nameLower = (child.name || '').toLowerCase()
            if(
                nameLower.includes('bruno') ||
                nameLower.includes('author') ||
                nameLower.includes('road') ||
                nameLower.includes('curb') ||
                nameLower.includes('track') ||
                nameLower.includes('tire') ||
                nameLower.includes('barrel') ||
                nameLower.includes('cone') ||
                nameLower.includes('bleacher') ||
                nameLower.includes('tent') ||
                nameLower.includes('scaffolding') ||
                nameLower.includes('gantry') ||
                nameLower.includes('leaderboard')
            )
            {
                child.visible = false
                if(child.parent) child.parent.remove(child)
            }
        })

        this.references = new References()
        const model = [...this.game.resources.sceneryModel.scene.children]
        for(const child of model)
        {
            const nameLower = (child.name || '').toLowerCase()
            if(
                nameLower.includes('bruno') ||
                nameLower.includes('author') ||
                nameLower.includes('road') ||
                nameLower.includes('curb') ||
                nameLower.includes('track') ||
                nameLower.includes('tire') ||
                nameLower.includes('barrel') ||
                nameLower.includes('cone') ||
                nameLower.includes('bleacher') ||
                nameLower.includes('tent') ||
                nameLower.includes('scaffolding') ||
                nameLower.includes('gantry') ||
                nameLower.includes('leaderboard')
            )
            {
                child.visible = false
                continue
            }

            // Add
            if(typeof child.userData.prevent === 'undefined' || child.userData.prevent === false)
            {
                // Objects
                this.game.objects.addFromModel(
                    child,
                    {

                    },
                    {
                        position: child.position,
                        rotation: child.quaternion,
                        sleeping: true,
                        mass: child.userData.mass
                    }
                )
            }

            this.references.parse(child)
        }

        this.setRoad()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        })
    }
    
    setRoad()
    {
        const roadItems = this.references.items.get('road')
        if(roadItems)
        {
            for(const item of roadItems)
            {
                item.visible = false
                item.removeFromParent()
            }
        }

        this.road = { glitterVariation: uniform(0) }
    }

    update()
    {
        if(this.road && this.road.glitterVariation)
            this.road.glitterVariation.value += this.game.ticker.deltaScaled * 0.004 + this.game.view.delta.length() * 0.004
    }
}