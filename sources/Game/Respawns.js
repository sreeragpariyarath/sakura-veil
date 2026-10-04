import * as THREE from 'three/webgpu'
import { Game } from './Game.js'
import { WorldLayout } from './World/WorldLayout.js'

export class Respawns
{
    constructor(defaultName = 'landing')
    {
        this.game = Game.getInstance()
        this.defaultName = defaultName

        this.setItems()
    }

    setItems()
    {
        this.items = new Map()

        // Populate respawns from the world layout arenas
        for(const arena of WorldLayout.arenas)
        {
            const item = {
                name: arena.id,
                label: arena.name,
                position: new THREE.Vector3(arena.x, 4, arena.z),
                rotation: arena.facing ?? 0
            }
            this.items.set(arena.id, item)
        }

        // Retain any supplementary references if provided by models
        if(this.game.resources && this.game.resources.respawnsReferencesModel?.scene)
        {
            for(const child of this.game.resources.respawnsReferencesModel.scene.children)
            {
                child.rotation.reorder('YXZ')

                let name = child.name.replace(/^respawn(.+)$/i, '$1')
                name = name.charAt(0).toLowerCase() + name.slice(1)

                if(!this.items.has(name))
                {
                    const item = {
                        name: name,
                        position: new THREE.Vector3(
                            child.position.x,
                            4,
                            child.position.z
                        ),
                        rotation: child.rotation.y
                    }
                    this.items.set(name, item)
                }
            }
        }
    }

    getByName(name)
    {
        return this.items.get(name) || this.items.get('landing')
    }

    getDefault()
    {
        return this.items.get(this.defaultName) || this.items.get('landing')
    }

    getClosest(position)
    {
        let closestItem = null
        let closestDistance = Infinity

        this.items.forEach((item) =>
        {
            const distance = Math.hypot(item.position.x - position.x, item.position.z - position.z)

            if(distance < closestDistance)
            {
                closestDistance = distance
                closestItem = item
            }
        })

        return closestItem
    }
}