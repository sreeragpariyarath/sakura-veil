import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { Events } from '../Events.js'
import { lerp } from '../utilities/maths.js'
import { WorldLayout } from '../World/WorldLayout.js'

export class PhysicsFlight
{
    constructor()
    {
        this.game = Game.getInstance()

        this.events = new Events()

        this.topSpeed = 8
        this.topSpeedBoost = 20
        this.turnSpeed = 2.4
        this.bankAmount = 0.5
        this.bankSmoothing = 6
        this.gravityScale = 0
        this.acceleration = 5
        this.deceleration = 7
        this.climbSpeed = 6
        this.verticalAcceleration = 6
        this.maxAltitude = 180

        this.yaw = 0
        this.bank = 0

        this.sideward = new THREE.Vector3(0, 0, 1)
        this.upward = new THREE.Vector3(0, 1, 0)
        this.forward = new THREE.Vector3(1, 0, 0)
        this.position = new THREE.Vector3(0, 4, 0)
        this.quaternion = new THREE.Quaternion()
        this.velocity = new THREE.Vector3()
        this.direction = this.forward.clone()
        this.speed = 0
        this.xzSpeed = 0
        this.verticalSpeed = 0

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.physics.debugPanel.addFolder({
                title: 'Flight',
                expanded: true,
            })

            this.debugPanel.addBinding(this, 'topSpeed', { min: 0, max: 30, step: 0.1 })
            this.debugPanel.addBinding(this, 'topSpeedBoost', { min: 0, max: 30, step: 0.1 })
            this.debugPanel.addBinding(this, 'acceleration', { min: 0.5, max: 20, step: 0.1 })
            this.debugPanel.addBinding(this, 'deceleration', { min: 0.5, max: 20, step: 0.1 })
            this.debugPanel.addBinding(this, 'climbSpeed', { min: 0, max: 20, step: 0.1 })
            this.debugPanel.addBinding(this, 'verticalAcceleration', { min: 0.5, max: 20, step: 0.1 })
            this.debugPanel.addBinding(this, 'turnSpeed', { min: 0, max: 6, step: 0.01 })
            this.debugPanel.addBinding(this, 'bankAmount', { min: 0, max: 2, step: 0.01 })
            this.debugPanel.addBinding(this, 'bankSmoothing', { min: 0, max: 20, step: 0.01 })
            this.debugPanel.addBinding(this, 'gravityScale', { min: -1, max: 1, step: 0.001 }).on('change', () =>
            {
                this.chassis.physical.body.setGravityScale(this.gravityScale, true)
            })
        }

        this.setChassis()

        if(this.game.debug.active)
        {
            this.debugPanel.addBinding(this.chassis.physical, 'linearDamping', { min: 0, max: 10, step: 0.01 })
            this.debugPanel.addBinding(this.chassis.physical, 'angularDamping', { min: 0, max: 10, step: 0.01 })
        }

        this.setStuck()

        this.game.ticker.events.on('tick', () =>
        {
            this.updatePrePhysics()
        }, 2)
        this.game.ticker.events.on('tick', () =>
        {
            this.updatePostPhysics()
        }, 5)
    }

    setChassis()
    {
        this.chassis = {}
        const object = this.game.objects.add(null, {
            type: 'dynamic',
            position: this.position,
            friction: 0.4,
            restitution: 0.15,
            linearDamping: 0, // Velocity is driven directly in updatePrePhysics
            angularDamping: 6,
            rotation: new THREE.Quaternion(),
            colliders: [
                { shape: 'cuboid', mass: 2.5, parameters: [ 1.3, 0.4, 0.85 ], position: { x: 0, y: -0.1, z: 0 }, centerOfMass: { x: 0, y: -0.5, z: 0 } }, // Main
                { shape: 'cuboid', mass: 0, parameters: [ 0.5, 0.15, 0.65 ], position: { x: 0, y: 0.4, z: 0 } }, // Top
                { shape: 'cuboid', mass: 0, parameters: [ 1.5, 0.5, 0.9 ], position: { x: 0.1, y: -0.2, z: 0 }, category: 'bumper' }, // Bumper
            ],
            canSleep: false,
            onCollision: (force, position) =>
            {
                this.game.audio.groups.get('hitDefault').playRandomNext(force, position)
            }
        })
        this.chassis.physical = object.physical
        this.chassis.mass = this.chassis.physical.body.mass()

        this.chassis.physical.body.setGravityScale(this.gravityScale, true)
    }

    setStuck()
    {
        this.stuck = {}
        this.stuck.durationTest = 3
        this.stuck.durationSaved = 0
        this.stuck.savedItems = []
        this.stuck.distance = 0
        this.stuck.distanceThreshold = 0.5
        this.stuck.active = false

        this.stuck.accumulate = (traveled, time) =>
        {
            this.stuck.savedItems.unshift([traveled, time])
            this.stuck.distance = 0
            this.stuck.durationSaved = 0

            for(let i = 0; i < this.stuck.savedItems.length; i++)
            {
                const item = this.stuck.savedItems[i]

                if(this.stuck.durationSaved >= this.stuck.durationTest)
                {
                    this.stuck.savedItems.splice(i)
                    break
                }
                else
                {
                    this.stuck.distance += item[0]
                    this.stuck.durationSaved += item[1]
                }
            }
        }

        this.stuck.test = () =>
        {
            if(this.stuck.durationSaved >= this.stuck.durationTest && this.stuck.distance < this.stuck.distanceThreshold)
            {
                if(!this.stuck.active)
                {
                    this.stuck.active = true
                    this.events.trigger('stuck')
                }
            }
            else
            {
                if(this.stuck.active)
                {
                    this.stuck.active = false
                    this.events.trigger('unstuck')
                }
            }
        }
    }

    moveTo(position, rotation = 0)
    {
        this.yaw = rotation
        this.bank = 0

        const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotation)
        this.chassis.physical.body.setTranslation(position)
        this.chassis.physical.body.setRotation(quaternion)
        this.chassis.physical.body.setLinvel({ x: 0, y: 0, z: 0 })
        this.chassis.physical.body.setAngvel({ x: 0, y: 0, z: 0 })

        this.position.copy(position)
        this.quaternion.copy(quaternion)
    }

    updatePrePhysics()
    {
        const body = this.chassis.physical.body

        // Smooth shortest-path yaw rotation toward movement direction
        if(this.game.player.isMoving)
        {
            let diff = this.game.player.targetYaw - this.yaw
            while(diff < - Math.PI) diff += Math.PI * 2
            while(diff > Math.PI) diff -= Math.PI * 2
            this.yaw += diff * Math.min(1, this.game.ticker.deltaScaled * 12)
        }

        const targetQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw)
        body.setRotation(targetQuaternion, true)
        body.setAngvel({ x: 0, y: 0, z: 0 }, true)

        // Velocity-based steering: ease the current velocity toward a target velocity.
        // Responsive to start/stop like third-person games, with no force/damping drift.
        const delta = this.game.ticker.deltaScaled
        const current = body.linvel()
        const topSpeed = lerp(this.topSpeed, this.topSpeedBoost, this.game.player.boosting)

        const target = new THREE.Vector3()
        if(this.game.player.isMoving)
            target.copy(this.game.player.moveVector).multiplyScalar(topSpeed * this.game.player.accelerating)

        const horizontalRate = this.game.player.isMoving ? this.acceleration : this.deceleration
        const horizontalBlend = 1 - Math.exp(- horizontalRate * delta)
        const newVelocity = {
            x: current.x + (target.x - current.x) * horizontalBlend,
            y: 0,
            z: current.z + (target.z - current.z) * horizontalBlend
        }

        // Vertical: input drives climb/descent, no input hovers in place
        const verticalInput = this.game.player.ascending - this.game.player.descending
        const verticalTarget = verticalInput * this.climbSpeed
        const verticalBlend = 1 - Math.exp(- this.verticalAcceleration * delta)
        newVelocity.y = current.y + (verticalTarget - current.y) * verticalBlend

        // Terrain Awareness & Contour Following:
        // Automatically smoothly glide over hills and mountain slopes
        const groundHeight = WorldLayout.getElevation(this.position.x, this.position.z)
        const minAltitude = groundHeight + 1.2
        const idealHover = groundHeight + 2.6

        if(this.position.y < minAltitude)
        {
            // Push up briskly if below minimum terrain altitude
            const pushUp = (minAltitude - this.position.y) * 14.0
            newVelocity.y = Math.max(newVelocity.y, pushUp)
        }
        else if(this.game.player.isMoving && verticalInput === 0)
        {
            // Smoothly lift as terrain ascends ahead
            if(this.position.y < idealHover)
            {
                const hillLift = (idealHover - this.position.y) * 5.0
                newVelocity.y = Math.max(newVelocity.y, hillLift)
            }
        }

        // Ceiling
        if(this.position.y > this.maxAltitude && newVelocity.y > 0)
            newVelocity.y = 0

        body.resetForces(true)
        body.setLinvel(newVelocity, true)
    }

    updatePostPhysics()
    {
        // Various measures
        const newPosition = new THREE.Vector3().copy(this.chassis.physical.body.translation())
        this.velocity = newPosition.clone().sub(this.position)
        this.direction = this.velocity.clone().normalize()
        this.position.copy(newPosition)
        this.quaternion.copy(this.chassis.physical.body.rotation())
        this.sideward.set(0, 0, 1).applyQuaternion(this.quaternion)
        this.upward.set(0, 1, 0).applyQuaternion(this.quaternion)
        this.forward.set(1, 0, 0).applyQuaternion(this.quaternion)
        this.speed = this.velocity.length() / this.game.ticker.deltaScaled
        this.xzSpeed = Math.hypot(this.velocity.x, this.velocity.z) / this.game.ticker.deltaScaled
        this.verticalSpeed = this.velocity.y / this.game.ticker.deltaScaled
        this.forwardRatio = this.direction.dot(this.forward)
        this.goingForward = this.forwardRatio > 0.5
        this.forwardSpeed = this.speed * this.forwardRatio

        this.xRotation = new THREE.Euler().setFromQuaternion(this.quaternion, 'XYZ').x
        this.yRotation = new THREE.Euler().setFromQuaternion(this.quaternion, 'YXZ').y
        this.zRotation = new THREE.Euler().setFromQuaternion(this.quaternion, 'ZYX').z

        if(Math.abs(this.game.player.accelerating) > 0.1 || this.game.player.ascending || this.game.player.descending)
            this.stuck.accumulate(this.velocity.length(), this.game.ticker.deltaScaled)

        this.stuck.test()
    }

    activate()
    {
        this.chassis.physical.body.setLinvel({ x: 0, y: 0, z: 0 })
        this.chassis.physical.body.setAngvel({ x: 0, y: 0, z: 0 })
        this.chassis.physical.body.setEnabled(true)
    }

    deactivate()
    {
        this.chassis.physical.body.setEnabled(false)
    }
}
