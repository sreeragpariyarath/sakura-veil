import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { WorldLayout } from './WorldLayout.js'

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

        // Base transform and shadow configuration. Material conversion is
        // left to game.materials.updateObject() below - this scene's custom
        // WebGPU/TSL lighting only lights MeshDefaultMaterial-derived
        // materials, so a raw imported MeshStandardMaterial (however bright
        // it looks in a standalone glTF viewer) renders essentially unlit
        // here. Do NOT set material.userData.prevent = true: that flag is
        // exactly what tells updateObject() to skip the conversion.
        const isTrunkMesh = (child) =>
        {
            const name = (child.name || '').toLowerCase()
            const matName = (child.material?.name || '').toLowerCase()

            return name.includes('trunk') || name.includes('bark') || name.includes('wood') || name.includes('branch') ||
                   matName.includes('trunk') || matName.includes('bark') || matName.includes('wood') || matName.includes('branch')
        }

        this.model.traverse((child) =>
        {
            if(child.isMesh)
            {
                const isTrunk = isTrunkMesh(child)

                if(isTrunk)
                {
                    child.castShadow = true
                    child.receiveShadow = true
                }
                else
                {
                    // Leaves/blossoms: disable self-shadowing to prevent dark black spots
                    child.castShadow = false
                    child.receiveShadow = false
                }

                // Cutout transparency for leaves/blossoms, read by createFromMaterial()
                if(child.material && !isTrunk)
                {
                    child.material.transparent = true
                }
            }
        })

        // Convert every mesh's material into the game's lit TSL material system
        this.game.materials.updateObject(this.model)

        // Double-sided leaves/blossoms (createFromMaterial doesn't carry `side` over)
        this.model.traverse((child) =>
        {
            if(child.isMesh && child.material && !isTrunkMesh(child))
                child.material.side = THREE.DoubleSide
        })

        this.baseScale = 0.25 // Global size multiplier for all Sakura trees

        this.setTrees()
    }

    setTrees()
    {
        const placements = []

        // Helper: check if a candidate position is inside any combat clearing
        const isInsideArena = (x, z) =>
        {
            for(const arena of WorldLayout.arenas)
            {
                const dist = Math.hypot(x - arena.x, z - arena.z)
                if(dist < arena.radius + 3)
                    return true
            }
            return false
        }

        // Helper: check if candidate position is inside or right on the river/ponds
        const isNearWater = (x, z) =>
        {
            for(const pond of WorldLayout.ponds)
            {
                if(Math.hypot(x - pond.x, z - pond.z) < pond.radius + 2)
                    return true
            }
            const pts = WorldLayout.river.points
            for(let i = 0; i < pts.length - 1; i++)
            {
                const p1 = pts[i]
                const p2 = pts[i + 1]
                const l2 = (p2.x - p1.x)**2 + (p2.z - p1.z)**2
                if(l2 === 0) continue
                const t = Math.max(0, Math.min(1, ((x - p1.x)*(p2.x - p1.x) + (z - p1.z)*(p2.z - p1.z)) / l2))
                const projX = p1.x + t * (p2.x - p1.x)
                const projZ = p1.z + t * (p2.z - p1.z)
                if(Math.hypot(x - projX, z - projZ) < WorldLayout.river.width * 0.75 + 2)
                    return true
            }
            return false
        }

        const tryAdd = (x, z, scale = 1.2, rotation = Math.random() * Math.PI * 2) =>
        {
            // Must be strictly on dry island landmass
            const angle = Math.atan2(z, x)
            const islandRadius = WorldLayout.getIslandRadius(angle)
            if(Math.hypot(x, z) > islandRadius - 12)
                return
            // Keep the south sandy beach cove open
            if(z > 170 && Math.abs(x) < 70)
                return
            if(isInsideArena(x, z) || isNearWater(x, z))
                return
            // Don't pack trees too tightly
            for(const existing of placements)
            {
                if(Math.hypot(existing.position.x - x, existing.position.z - z) < 7)
                    return
            }
            const y = WorldLayout.getElevation(x, z)
            placements.push({ position: new THREE.Vector3(x, y, z), scale, rotation })
        }

        // 1. Frame the perimeters of all arenas (trees ring outside the combat clearings)
        for(const arena of WorldLayout.arenas)
        {
            const ringCount = arena.id === 'grove' ? 24 : 12
            for(let i = 0; i < ringCount; i++)
            {
                const angle = (i / ringCount) * Math.PI * 2 + 0.2
                const dist = arena.radius + 3 + (i % 3) * 2
                tryAdd(arena.x + Math.cos(angle) * dist, arena.z + Math.sin(angle) * dist, 1.2 + (i % 4) * 0.12)
            }
        }

        // 2. Line each path on both sides (forming grand, dense cherry blossom avenues)
        for(const [ idA, idB ] of WorldLayout.paths)
        {
            const a = WorldLayout.getArena(idA)
            const b = WorldLayout.getArena(idB)
            if(!a || !b) continue

            const dx = b.x - a.x
            const dz = b.z - a.z
            const dist = Math.hypot(dx, dz)
            const nx = - dz / dist // Normal perpendicular to path
            const nz = dx / dist

            const steps = Math.floor(dist / 9)
            for(let i = 1; i < steps; i++)
            {
                const t = i / steps
                const cx = a.x + dx * t
                const cz = a.z + dz * t

                // Left flank
                tryAdd(cx + nx * (6.5 + (i % 2) * 2.5), cz + nz * (6.5 + (i % 2) * 2.5), 1.2 + (i % 3) * 0.15)
                // Right flank
                tryAdd(cx - nx * (6.5 + ((i + 1) % 2) * 2.5), cz - nz * (6.5 + ((i + 1) % 2) * 2.5), 1.2 + (i % 2) * 0.18)
            }
        }

        // 3. Dense magical forest throughout Sakura Blossom Grove (X: 0, Z: 15)
        for(let ox = -60; ox <= 60; ox += 12)
        {
            for(let oz = -60; oz <= 60; oz += 12)
            {
                const jx = (Math.sin(ox * 3.7 + oz) * 0.5) * 4
                const jz = (Math.cos(ox + oz * 4.1) * 0.5) * 4
                tryAdd(ox + jx, 15 + oz + jz, 1.3 + ((ox + oz) % 3) * 0.15)
            }
        }

        // 4. Awakening Beach Entrance Grove (flanking north trail from the beach)
        for(let oz = 150; oz <= 210; oz += 10)
        {
            tryAdd(-12, oz, 1.3)
            tryAdd( 12, oz, 1.3)
            tryAdd(-20, oz, 1.25)
            tryAdd( 20, oz, 1.25)
        }

        // 5. Western Hills & Fox Shrine woods
        for(let ox = -170; ox <= -100; ox += 14)
        {
            for(let oz = 80; oz <= 150; oz += 14)
            {
                tryAdd(ox, oz, 1.25)
            }
        }

        // 6. Perimeter treeline framing the island skyline
        const perimeterSteps = 55
        for(let i = 0; i < perimeterSteps; i++)
        {
            const angle = (i / perimeterSteps) * Math.PI * 2
            // Keep the south sandy beach surf open
            if(angle > 0.8 && angle < 2.3) continue
            const r = WorldLayout.getIslandRadius(angle) - 15 - (i % 3) * 6
            tryAdd(Math.cos(angle) * r, Math.sin(angle) * r, 1.35)
        }

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
