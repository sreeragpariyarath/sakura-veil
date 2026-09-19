import { Game } from './Game.js'
import gsap from 'gsap'
import * as THREE from 'three/webgpu'

export class Player
{
    static STATE_DEFAULT = 1
    static STATE_LOCKED = 2

    constructor()
    {
        this.game = Game.getInstance()
        
        this.state = Player.STATE_DEFAULT
        this.accelerating = 0
        this.steering = 0
        this.boosting = 0
        this.ascending = 0
        this.descending = 0
        this.moveVector = new THREE.Vector3()
        this.targetYaw = 0
        this.currentYaw = 0
        this.isMoving = false

        const respawn = this.game.respawns.getDefault()

        this.position = respawn.position.clone()
        this.basePosition = this.position.clone()
        this.position2 = new THREE.Vector2(this.position.x, this.position.z)
        this.rotationY = 0
        this.heading = 0

        this.setSounds()
        this.setInputs()
        this.setDistanceDriven()
        this.setUnstuck()
        this.setTimePlayed()

        this.game.physicalVehicle.chassis.physical.initialState.position.x = respawn.position.x
        this.game.physicalVehicle.chassis.physical.initialState.position.y = respawn.position.y
        this.game.physicalVehicle.chassis.physical.initialState.position.z = respawn.position.z
        this.game.physicalVehicle.moveTo(respawn.position, respawn.rotation)
        if(this.game.view && this.game.view.spherical)
            this.game.view.spherical.theta = respawn.rotation + Math.PI

        this.game.ticker.events.on('tick', () =>
        {
            this.updatePrePhysics()
        }, 1)

        this.game.ticker.events.on('tick', () =>
        {
            this.updatePostPhysics()
        }, 6)
    }

    setSounds()
    {
        // Car engine/wheel/suspension/horn sounds removed with the vehicle physics.
        // A flight soundscape (hum/whoosh) is deferred to a follow-up pass.
        this.sounds = {}
    }

    setInputs()
    {
        this.game.inputs.addActions([
            { name: 'forward',               categories: [ 'wandering', 'racing', 'cinematic' ], keys: [ 'Keyboard.ArrowUp', 'Keyboard.KeyW', 'Gamepad.up', 'Gamepad.r2' ] },
            { name: 'right',                 categories: [ 'wandering', 'racing', 'cinematic' ], keys: [ 'Keyboard.ArrowRight', 'Keyboard.KeyD', 'Gamepad.right' ] },
            { name: 'backward',              categories: [ 'wandering', 'racing', 'cinematic' ], keys: [ 'Keyboard.ArrowDown', 'Keyboard.KeyS', 'Gamepad.down', 'Gamepad.l2' ] },
            { name: 'left',                  categories: [ 'wandering', 'racing', 'cinematic' ], keys: [ 'Keyboard.ArrowLeft', 'Keyboard.KeyA', 'Gamepad.left' ] },
            { name: 'boost',                 categories: [ 'wandering', 'racing'              ], keys: [ 'Keyboard.ShiftLeft', 'Keyboard.ShiftRight', 'Gamepad.circle' ] },
            { name: 'ascend',                categories: [ 'wandering', 'racing'              ], keys: [ 'Keyboard.Space', 'Gamepad.triangle', 'Gamepad.r1' ] },
            { name: 'brake',                 categories: [ 'wandering', 'racing'              ], keys: [ 'Keyboard.KeyB', 'Keyboard.ControlLeft', 'Gamepad.square', 'Gamepad.l1' ] },
            { name: 'respawn',               categories: [ 'wandering',                       ], keys: [ 'Keyboard.KeyR', 'Gamepad.select' ] },
            { name: 'interact',              categories: [ 'wandering', 'racing', 'cinematic' ], keys: [ 'Keyboard.Enter', 'Keyboard.KeyE', 'Keyboard.KeyF', 'Gamepad.cross' ] },
            { name: 'honk',                  categories: [ 'wandering', 'racing', 'cinematic' ], keys: [ 'Keyboard.KeyH', 'Gamepad.l3' ] },
        ])

        // Respawn
        this.game.inputs.events.on('respawn', (action) =>
        {
            if(this.state !== Player.STATE_DEFAULT)
                return

            if(action.active)
            {
                this.respawn()
            }
        })

        // Honk
        this.game.inputs.events.on('honk', (action) =>
        {
            if(action.active)
                this.honk()
        })

        // Nipple tap ascend
        this.game.inputs.nipple.events.on('tap', () =>
        {
            this.game.inputs.nipple.jump()
        })
    }

    setDistanceDriven()
    {
        this.distanceDriven = {}

        const localDistanceDriven = localStorage.getItem('distanceDriven')
        this.distanceDriven.value = localDistanceDriven ? parseInt(localDistanceDriven) : 0
        this.distanceDriven.floored = Math.floor(this.distanceDriven.value)
        this.distanceDriven.reset = () =>
        {
            localStorage.removeItem('distanceDriven')
            this.distanceDriven.value = 0
            this.distanceDriven.floored = 0
        }
        
    }

    setUnstuck()
    {
        this.game.physicalVehicle.events.on('stuck', () =>
        {
            this.game.inputs.interactiveButtons.addItems(['unstuck'])
        })

        this.game.physicalVehicle.events.on('unstuck', () =>
        {
            this.game.inputs.interactiveButtons.removeItems(['unstuck'])
        })

        this.game.inputs.interactiveButtons.events.on('unstuck', () =>
        {
            this.game.inputs.interactiveButtons.removeItems(['unstuck'])
            this.respawn()
        })
    }

    setTimePlayed()
    {
        const localTimePlayed = localStorage.getItem('timePlayed')
        this.timePlayed = {}
        this.timePlayed.all = localTimePlayed ? parseFloat(localTimePlayed) : 0
        this.timePlayed.session = 0
        this.timePlayed.achieved = false

        setInterval(() =>
        {
            localStorage.setItem('timePlayed', this.timePlayed.all)
        }, 1000)
    }

    respawn(respawnName = null, callback = null)
    {
        this.game.overlay.show(() =>
        {
            if(typeof callback === 'function')
                callback()

            // Find respawn
            let respawn = respawnName ? this.game.respawns.getByName(respawnName) : this.game.respawns.getClosest(this.position)

            // Update physical vehicle
            this.game.physicalVehicle.moveTo(
                respawn.position,
                respawn.rotation
            )
            if(this.game.view && this.game.view.spherical)
                this.game.view.spherical.theta = respawn.rotation + Math.PI
            
            this.state = Player.STATE_DEFAULT
            this.game.overlay.hide()
        })
    }

    die()
    {
        this.state = Player.STATE_LOCKED
        
        gsap.delayedCall(2, () =>
        {
            this.respawn(null, () =>
            {
                this.state = Player.STATE_DEFAULT
            })
        })
    }

    honk()
    {
        // Car horn removed with the vehicle physics; a ghost-appropriate
        // sound/achievement is deferred to a follow-up pass.
    }

    updatePrePhysics()
    {
        this.accelerating = 0
        this.steering = 0
        this.boosting = 0
        this.ascending = 0
        this.descending = 0

        if(this.state !== Player.STATE_DEFAULT)
        {
            this.isMoving = false
            this.moveVector.set(0, 0, 0)
            return
        }

        let forwardInput = 0
        let strafeInput = 0

        if(this.game.inputs.actions.get('forward').active)
            forwardInput += this.game.inputs.actions.get('forward').value

        if(this.game.inputs.actions.get('backward').active)
            forwardInput -= this.game.inputs.actions.get('backward').value

        if(this.game.inputs.actions.get('right').active)
            strafeInput += this.game.inputs.actions.get('right').value

        if(this.game.inputs.actions.get('left').active)
            strafeInput -= this.game.inputs.actions.get('left').value

        // Gamepad joystick
        if(strafeInput === 0 && forwardInput === 0 && this.game.inputs.gamepad.joysticks.left.active)
        {
            strafeInput = this.game.inputs.gamepad.joysticks.left.safeX
            forwardInput = - this.game.inputs.gamepad.joysticks.left.safeY
        }

        // Normalize raw diagonal inputs
        const rawLen = Math.hypot(strafeInput, forwardInput)
        if(rawLen > 1)
        {
            strafeInput /= rawLen
            forwardInput /= rawLen
        }

        // Camera-relative direction
        if(rawLen > 0.01)
        {
            const dirs = this.game.view.getHorizontalDirections()
            const moveDir = dirs.forward.clone().multiplyScalar(forwardInput).add(dirs.right.clone().multiplyScalar(strafeInput))
            
            const moveLen = moveDir.length()
            if(moveLen > 0.05)
            {
                this.isMoving = true
                this.moveVector.copy(moveDir.normalize())
                this.targetYaw = Math.atan2(this.moveVector.x, this.moveVector.z)
                this.accelerating = Math.min(rawLen, 1)
            }
            else
            {
                this.isMoving = false
                this.moveVector.set(0, 0, 0)
            }
        }
        else
        {
            this.isMoving = false
            this.moveVector.set(0, 0, 0)
        }

        /**
         * Boosting
         */
        if(this.game.inputs.actions.get('boost').active)
            this.boosting = 1

        /**
         * Vertical (ascend/descend)
         */
        if(this.game.inputs.actions.get('ascend').active)
            this.ascending = 1

        if(this.game.inputs.actions.get('brake').active)
            this.descending = 1
    }

    updatePostPhysics()
    {
        // Position
        this.position.copy(this.game.physicalVehicle.position)
        this.position2 = new THREE.Vector2(this.position.x, this.position.z)
        
        // View > Focus point
        this.game.view.focusPoint.trackedPosition.copy(this.position)

        // View > Speed lines
        if(this.boosting && this.accelerating && this.game.physicalVehicle.speed > 15)
            this.game.view.speedLines.strength = 1
        else
            this.game.view.speedLines.strength = 0

        this.game.view.speedLines.worldTarget.copy(this.position)

        // Tracks > Focus point
        this.game.tracks.focusPoint.set(this.position.x, this.position.z)

        // Inputs touch joystick
        this.rotationY = Math.atan2(this.game.physicalVehicle.forward.z, this.game.physicalVehicle.forward.x)
        this.heading = this.rotationY
        this.game.inputs.nipple.setCoordinates(this.position.x, this.position.y, this.position.z, this.rotationY)

        // Time played
        this.timePlayed.all += this.game.ticker.delta
        this.timePlayed.session += this.game.ticker.delta

        if(!this.timePlayed.achieved && this.timePlayed.session > this.game.dayCycles.duration)
        {
            this.timePlayed.achieved = true
            this.game.achievements.setProgress('fullDay', 1)
        }

        // Sea achievement
        const distanceToCenter = this.position2.length()
        if(distanceToCenter > 120)
            this.game.achievements.setProgress('sea', 1)

        // Go high achievements
        const elevation = Math.floor(this.position.y)
        if(this.game.achievements.groups.get('goHigh') && elevation > this.game.achievements.groups.get('goHigh').progress)
            this.game.achievements.setProgress('goHigh', elevation)

        // // Speed achievement
        // const speedKmPerHour = Math.floor(this.game.physicalVehicle.xzSpeed / 1000 * 3600)

        // if(this.game.achievements.groups.get('speed') && speedKmPerHour > this.game.achievements.groups.get('speed').progress)
        //     this.game.achievements.setProgress('speed', speedKmPerHour)

        // Distance driven (full 3D, so vertical flight counts too)
        this.distanceDriven.value += this.game.physicalVehicle.speed * this.game.ticker.deltaScaled
        const flooredDistanceDriven = Math.floor(this.distanceDriven.value)

        if(flooredDistanceDriven !== this.distanceDriven.floored)
        {
            localStorage.setItem('distanceDriven', flooredDistanceDriven)
            this.distanceDriven.floored = flooredDistanceDriven
        }
        
        // Achievement
        const distanceDrivenKm = Math.floor(this.distanceDriven.value / 1000)

        if(this.game.achievements.groups.get('distanceDriven') && distanceDrivenKm > this.game.achievements.groups.get('distanceDriven').progress)
        {
            this.game.achievements.setProgress('distanceDriven', distanceDrivenKm)

        }
    }
}