import * as THREE from 'three/webgpu'
import { Game } from './Game.js'
import { color, distance, float, Fn, max, min, mix, mul, normalWorld, positionWorld, step, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import gsap from 'gsap'
import { Inputs } from './Inputs/Inputs.js'

export class InteractivePoints
{
    // Measured on static/images/ui/interaction-label.webp (1200 × 539): diamond centre, text area, plain stretch zone
    static LABEL_ART = { width: 1200, height: 539, diamondX: 265, diamondY: 205, textLeft: 470, textRight: 1000, textY: 232, stretchFrom: 800, stretchTo: 950, fontSize: 118 }
    static LABEL_HEIGHT = 1.8 // World units (the group is scaled by 0.85)
    static DIAMOND_ASPECT = 571 / 512 // interaction-diamond.webp

    static ALIGN_LEFT = 1
    static ALIGN_RIGHT = 2

    static STATE_HIDDEN = 3
    static STATE_OPEN = 4
    static STATE_CONCEALED = 5

    constructor()
    {
        this.game = Game.getInstance()

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🔹 Interactive Areas',
                expanded: false,
            })
        }

        this.items = []
        this.activeItem = null
        this.revealed = false
        this.temporaryHidden = true
        this.needsTest = false

        this.setLabelArt()
        this.setSounds()
        this.setGeometries()
        this.setMaterials()
        this.setKeyIcon()
        this.setInputs()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 9)
    }

    setLabelArt()
    {
        // Festival label frame and brush font for the canvas labels
        this.labelImage = new Image()
        this.labelImage.src = 'images/ui/interaction-label.webp'

        const imageReady = this.labelImage.decode().catch(() => {})
        const fontReady = document.fonts ? document.fonts.load(`400 ${InteractivePoints.LABEL_ART.fontSize}px "Festival Brush"`, 'Aa1').catch(() => {}) : Promise.resolve()
        this.labelArtReady = Promise.all([ imageReady, fontReady ])

        // Diamond marker texture
        this.diamondTexture = new THREE.TextureLoader().load('images/ui/interaction-diamond.webp')
        this.diamondTexture.colorSpace = THREE.SRGBColorSpace
    }

    drawLabelCanvas(text)
    {
        const art = InteractivePoints.LABEL_ART
        const font = `400 ${art.fontSize}px "Festival Brush", Georgia, serif`

        // Measure, then widen only the plain middle of the bar
        const canvas = document.createElement('canvas')
        let context = canvas.getContext('2d')
        context.font = font
        const textWidth = Math.ceil(context.measureText(text).width)
        const available = art.textRight - art.textLeft - 60
        const extra = Math.max(0, textWidth - available)

        canvas.width = art.width + extra
        canvas.height = art.height
        context = canvas.getContext('2d')

        const image = this.labelImage
        if(image.complete && image.naturalWidth)
        {
            const stretchWidth = art.stretchTo - art.stretchFrom
            context.drawImage(image, 0, 0, art.stretchFrom, art.height, 0, 0, art.stretchFrom, art.height)
            context.drawImage(image, art.stretchFrom, 0, stretchWidth, art.height, art.stretchFrom, 0, stretchWidth + extra, art.height)
            context.drawImage(image, art.stretchTo, 0, art.width - art.stretchTo, art.height, art.stretchTo + extra, 0, art.width - art.stretchTo, art.height)
        }

        context.font = font
        context.fillStyle = '#8c1d3a'
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText(text, (art.textLeft + art.textRight + extra) * 0.5, art.textY)

        return canvas
    }

    setSounds()
    {
        this.sounds = {}

        this.sounds.reveal = this.game.audio.register({
            group: 'reveal',
            path: 'sounds/paper/PaperMovement_fNAyV_01-3.mp3',
            autoplay: false,
            volume: 0.25
        })

        this.sounds.conceal = this.game.audio.register({
            group: 'reveal',
            path: 'sounds/paper/PaperMovement_fNAyV_01-2.mp3',
            autoplay: false,
            volume: 0.25
        })
    }

    setGeometries()
    {
        // const size = 2.25
        this.geometries = {}

        // Bottom
        this.geometries.plane = new THREE.PlaneGeometry(2, 2)

        // Label
        this.geometries.label = new THREE.PlaneGeometry(1, 1, 1, 1)
        this.geometries.label.translate(0.5, 0, 0)
    }

    setMaterials()
    {
        this.materials = {}

        // Uniforms
        this.playerPosition = uniform(vec2())
        this.backColor = uniform(color('#251f2b'))
        this.frontColor = uniform(color('#8c1d3a')) // Key icon colour, on the paper of the label's diamond

        // Debug
        if(this.game.debug.active)
        {
            this.game.debug.addThreeColorBinding(this.debugPanel, this.backColor.value, 'backColor')
            this.game.debug.addThreeColorBinding(this.debugPanel, this.frontColor.value, 'lineColor')
        }
    }

    setKeyIcon()
    {
        // Material
        const material = new THREE.MeshLambertNodeMaterial({ transparent: true, depthTest: false })

        const iconOutput = Fn(([iconAlpha]) =>
        {
            // Discard
            iconAlpha.lessThan(0.5).discard()

            return vec4(vec3(this.frontColor), 1)
        })

        material.outputNode = iconOutput(texture(this.game.resources.interactivePointsKeyIconEnterTexture, vec2(uv().x, uv().y.oneMinus())).r)

        // Mesh
        const mesh = new THREE.Mesh(
            this.geometries.plane,
            material
        )
        mesh.renderOrder = 8
        mesh.scale.setScalar(0)
        mesh.position.z = 0.01
        mesh.visible = false

        this.game.inputs.gamepad.events.on('typeChange', () =>
        {
            if(this.game.inputs.mode === Inputs.MODE_GAMEPAD)
            {
                let iconTexture = this.game.resources.interactivePointsKeyIconCrossTexture
                
                if(this.game.inputs.gamepad.type === 'xbox')
                     iconTexture = this.game.resources.interactivePointsKeyIconATexture

                material.outputNode = iconOutput(texture(iconTexture, vec2(uv().x, uv().y.oneMinus())).r)
                material.needsUpdate = true
            }
        })

        this.game.inputs.events.on('modeChange', () =>
        {
            if(this.game.inputs.mode === Inputs.MODE_GAMEPAD)
            {
                let iconTexture = this.game.resources.interactivePointsKeyIconCrossTexture
                
                if(this.game.inputs.gamepad.type === 'xbox')
                     iconTexture = this.game.resources.interactivePointsKeyIconATexture

                material.outputNode = iconOutput(texture(iconTexture, vec2(uv().x, uv().y.oneMinus())).r)
                material.needsUpdate = true
            }
            else if(this.game.inputs.mode === Inputs.MODE_MOUSEKEYBOARD)
            {
                material.outputNode = iconOutput(texture(this.game.resources.interactivePointsKeyIconEnterTexture, vec2(uv().x, uv().y.oneMinus())).r)
                material.needsUpdate = true
            }
            else if(this.game.inputs.mode === Inputs.MODE_TOUCH)
            {
                mesh.visible = false
            }
        })

        // Save
        this.keyIcon = mesh
    }

    setInputs()
    {
        this.game.inputs.events.on('interact', (action) =>
        {
            if(action.active && this.activeItem && this.activeItem.state === InteractivePoints.STATE_OPEN)
            {
                this.activeItem.interact()
            }
        })

        this.game.inputs.interactiveButtons.events.on('interact', () =>
        {
            if(this.activeItem && this.activeItem.state === InteractivePoints.STATE_OPEN)
            {
                this.activeItem.interact()
            }
        })
    }

    create(
        position,
        text = '',
        align = InteractivePoints.ALIGN_LEFT,
        state = InteractivePoints.STATE_CONCEALED,
        interactCallback = null,
        revealCallback = null,
        concealCallback = null,
        hideCallback = null
    )
    {
        const newPosition = position.clone()
        // newPosition.y = 2.25

        /**
         * Group
         */
        const group = new THREE.Group()
        group.rotation.reorder('YXZ')
        group.rotation.x = - Math.PI * 0.15
        group.rotation.y = Math.PI * 0.25
        group.position.copy(newPosition)
        group.scale.setScalar(0.85)
        this.game.scene.add(group)

        // Materials
        const materials = []

        /**
         * Label: the festival label art (static/images/ui/interaction-label.webp), 3-sliced so longer text
         * stretches the plain middle of the bar while the diamond and the right cap keep their shape.
         * Drawn into a canvas texture; redrawn once the art and the brush font have loaded.
         */
        const labelMaterial = new THREE.MeshLambertNodeMaterial({ transparent: true, depthTest: true })
        materials.push(labelMaterial)

        const labelOffset = uniform(1)
        const labelOutput = (labelTexture) => Fn(() =>
        {
            // Slide in from the diamond side
            const _uv = vec2(
                uv().x.sub(labelOffset),
                uv().y
            )
            _uv.x.greaterThan(1).discard()
            _uv.x.lessThan(0).discard()

            const art = texture(labelTexture, _uv)
            art.a.lessThan(0.5).discard()

            return vec4(art.rgb, 1)
        })()

        const label = new THREE.Mesh(
            this.geometries.label,
            labelMaterial
        )
        label.renderOrder = 6
        label.position.z = -0.01
        label.visible = false
        group.add(label)

        const drawLabel = () =>
        {
            const canvas = this.drawLabelCanvas(text)
            const labelTexture = new THREE.CanvasTexture(canvas)
            labelTexture.colorSpace = THREE.SRGBColorSpace
            labelTexture.generateMipmaps = false
            labelTexture.minFilter = THREE.LinearFilter

            labelMaterial.outputNode = labelOutput(labelTexture)
            labelMaterial.needsUpdate = true

            // Size and place it so the art's diamond is centred on the point (the key icon sits in it)
            const art = InteractivePoints.LABEL_ART
            label.scale.y = InteractivePoints.LABEL_HEIGHT
            label.scale.x = label.scale.y * canvas.width / canvas.height
            label.position.x = - art.diamondX / canvas.width * label.scale.x
            label.position.y = (0.5 - art.diamondY / canvas.height) * - label.scale.y
        }
        drawLabel()
        this.labelArtReady.then(drawLabel)

        /**
         * Diamond: marker shown while the point is concealed (static/images/ui/interaction-diamond.webp).
         * `threshold` scales it: 0 hidden, 0.25 small marker, 0.5 full size.
         */
        const diamondMaterial = new THREE.MeshLambertNodeMaterial({ transparent: true, depthTest: true })
        materials.push(diamondMaterial)

        const threshold = uniform(0)
        const lineThickness = uniform(0.150) // Kept for the existing reveal/conceal tweens
        const lineOffset = uniform(0.175)

        diamondMaterial.outputNode = Fn(() =>
        {
            const center = vec2(0.5, 0.5)
            const _uv = uv().sub(center).div(threshold.mul(2).max(0.0001)).add(center)

            _uv.x.greaterThan(1).discard()
            _uv.x.lessThan(0).discard()
            _uv.y.greaterThan(1).discard()
            _uv.y.lessThan(0).discard()

            const art = texture(this.diamondTexture, vec2(_uv.x, _uv.y.oneMinus()))
            art.a.lessThan(0.5).discard()

            return vec4(art.rgb, 1)
        })()

        const diamond = new THREE.Mesh(
            this.geometries.plane,
            diamondMaterial
        )
        diamond.renderOrder = 7
        diamond.scale.set(0.75, 0.75 * InteractivePoints.DIAMOND_ASPECT, 1)
        diamond.visible = false
        group.add(diamond)

        /**
         * Item
         */
        const item = {}
        item.group = group
        item.position = new THREE.Vector2(position.x, position.z)
        item.positionY = position.y
        item.interactCallback = interactCallback
        item.revealCallback = revealCallback
        item.concealCallback = concealCallback
        item.hideCallback = hideCallback
        item.isIn = false
        item.state = this.temporaryHidden ? InteractivePoints.STATE_HIDDEN : state
        item.recoveryState = state
        item.materials = materials
        this.items.push(item)

        /**
         * Cursor
         */
        item.intersect = this.game.rayCursor.addIntersect({
            active: false,
            shape: new THREE.Sphere(newPosition, 0.75),
            onClick: () =>
            {
                if(item.state !== InteractivePoints.STATE_HIDDEN)
                {
                    item.interact()
                }
            },
            onEnter: () =>
            {
                if(item.state !== InteractivePoints.STATE_HIDDEN)
                {
                    if(item !== this.activeItem && this.activeItem !== null)
                    {
                        this.activeItem.conceal()
                    }

                    this.activeItem = item
                    item.reveal()
                }

            },
            onLeave: () =>
            {
                if(
                    this.activeItem === item &&
                    item.state !== InteractivePoints.STATE_HIDDEN
                )
                {
                    item.conceal()
                    this.activeItem = null
                }
            }
        })

        /**
         * Methods
         */
        // Hide
        item.hide = () =>
        {
            if(item.state === InteractivePoints.STATE_HIDDEN)
                return

            item.state = InteractivePoints.STATE_HIDDEN

            item.intersect.active = false

            gsap.to(threshold, { value: 0, ease: 'back.in(4.5)', duration: 0.6, overwrite: true })
            gsap.to(lineThickness, { value: 0.150, ease: 'back.in(4.5)', duration: 0.6, overwrite: true })
            gsap.to(lineOffset, { value: 0.175, ease: 'back.in(4.5)', duration: 0.6, overwrite: true, onComplete: () =>
            {
                diamond.visible = false
                // key.visible = false
                label.visible = false
            } })

            gsap.to(this.keyIcon.scale, { x: 0, y: 0, z: 0, ease: 'power2.in', duration: 0.6, overwrite: true, onComplete: () =>
            {
                this.keyIcon.visible = false
            } })

            gsap.to(labelOffset, { value: 1, ease: 'power2.in', duration: 0.6, overwrite: true })

            // Active item
            if(this.activeItem && this.activeItem === item)
                this.activeItem = null

            // Callback
            if(typeof item.hideCallback === 'function')
                item.hideCallback()
        }

        // Open
        item.reveal = () =>
        {
            if(item.state === InteractivePoints.STATE_OPEN)
                return
                
            item.state = InteractivePoints.STATE_OPEN

            item.intersect.active = true

            diamond.visible = true
            label.visible = true
            gsap.delayedCall(0.3, () =>
            {
                if(item.state === InteractivePoints.STATE_OPEN)
                    diamond.visible = false
            })

            group.add(this.keyIcon)

            gsap.to(threshold, { value: 0.5, ease: 'elastic.out(1.3,0.4)', duration: 1.5, overwrite: true })
            gsap.to(lineThickness, { value: 0.075, ease: 'elastic.out(1.3,0.4)', duration: 1.5, overwrite: true })
            gsap.to(lineOffset, { value: 0.150, ease: 'elastic.out(1.3,0.4)', duration: 1.5, overwrite: true })
            
            if(this.game.inputs.mode !== Inputs.MODE_TOUCH)
            {
                this.keyIcon.visible = true
                this.keyIcon.scale.setScalar(0)
                gsap.to(this.keyIcon.scale, { x: 0.25, y: 0.25, z: 0.25, ease: 'elastic.out(1.3,0.8)', duration: 1.5, delay: 0.6, overwrite: true })
            }
            
            gsap.to(labelOffset, { value: 0, ease: 'power2.out', duration: 0.6, delay: 0.2, overwrite: true })

            // Materials
            for(const material of item.materials)
            {
                material.depthTest = false
                material.needsUpdate = true
            }

            // Reveal
            this.sounds.reveal.play()

            // Callback
            if(typeof item.revealCallback === 'function')
                item.revealCallback()
        }

        // Close
        item.conceal = () =>
        {
            if(item.state === InteractivePoints.STATE_CONCEALED)
                return
                
            const previousState = item.state
            item.state = InteractivePoints.STATE_CONCEALED

            item.intersect.active = true
            
            diamond.visible = true

            const ease = previousState === InteractivePoints.STATE_HIDDEN ? 'power2.out' : 'back.in(4.5)'

            gsap.to(threshold, { value: 0.250, ease: ease, duration: 0.6, delay: 0.2, overwrite: true })
            gsap.to(lineThickness, { value: 0.150, ease: ease, duration: 0.6, delay: 0.2, overwrite: true })
            gsap.to(lineOffset, { value: 0.175, ease: ease, duration: 0.6, delay: 0.2, overwrite: true, onComplete: () =>
            {
                label.visible = false

                // Materials
                for(const material of item.materials)
                {
                    material.depthTest = true
                    material.needsUpdate = true
                }
            } })

            if(this.activeItem === item)
            {
                gsap.to(this.keyIcon.scale, { x: 0, y: 0, z: 0, ease: 'power2.in', duration: 0.6, overwrite: true, onComplete: () =>
                {
                    this.keyIcon.visible = false
                } })
            }

            gsap.to(labelOffset, { value: align === InteractivePoints.ALIGN_LEFT ? - 1 : 1, ease: 'power2.in', duration: 0.6, overwrite: true })
            
            // Reveal
            this.sounds.conceal.play()

            // Callback
            if(typeof item.concealCallback === 'function')
                item.concealCallback()
        }

        // Interact
        item.interact = () =>
        {
            gsap.to(threshold, { value: 0.6, ease: 'power2.out', duration: 0.1, overwrite: true, onComplete: () =>
            {
                gsap.to(threshold, { value: 0.5, ease: 'elastic.out(1.3,0.6)', duration: 1.5, overwrite: true })
            } })

            // Callback
            if(typeof item.interactCallback === 'function')
                item.interactCallback()
        }

        // Show
        item.show = () =>
        {
            if(item.isIn)
                item.reveal()
            else
                item.conceal()

            this.needsTest = true
        }

        /**
         * Default state
         */
        if(state === InteractivePoints.STATE_CONCEALED)
        {
            // Points not revealed yet => Force hidden and wait
            if(!this.revealed)
            {
                item.state = InteractivePoints.STATE_HIDDEN
                item.showAfterReveal = true
            }

            // Points already revealed => Activate
            else
            {
                item.state = state
                item.intersect.active = false
                diamond.visible = true
                // key.visible = true
                threshold.value = 0.25
            }
        }

        /**
         * Debug
         */
        if(this.game.debug.active)
        {
            // this.game.debug.addThreeColorBinding(this.debugPanel, this.baseColor.value, 'this.baseColor')
            this.debugPanel.addBinding(threshold, 'value', { label: 'threshold', min: 0, max: 1, step: 0.001 })
            this.debugPanel.addBinding(lineThickness, 'value', { label: 'lineThickness', min: 0, max: 1, step: 0.001 })
            this.debugPanel.addBinding(lineOffset, 'value', { label: 'lineOffset', min: 0, max: 1, step: 0.001 })
            this.debugPanel.addBinding(labelOffset, 'value', { label: 'labelOffset', min: 0, max: 1, step: 0.001 })
        }

        return item
    }

    update()
    {
        // Billboard: the original fixed 45° orientation suited the isometric driving camera,
        // but the free third-person camera often saw the labels from behind (back-face culled)
        const cameraQuaternion = this.game.view.camera.quaternion
        for(const item of this.items)
            item.group.quaternion.copy(cameraQuaternion)

        // Player testing (not cursor intersect)
        const distanceTraveled = Math.hypot(
            this.playerPosition.value.x - this.game.player.position2.x,
            this.playerPosition.value.y - this.game.player.position2.y
        )

        // Only update is moved enough
        if(distanceTraveled > 0.2 || this.needsTest)
        {
            this.needsTest = false
            this.playerPosition.value.copy(this.game.player.position2)

            let distance = Infinity
            let activeItem = null
            for(const item of this.items)
            {
                const itemDistance = Math.hypot(item.position.x - this.game.player.position2.x, item.position.y - this.game.player.position2.y)
                const verticalDistance = Math.abs(item.positionY - this.game.player.position.y)
                const isIn = itemDistance < 2.5 && verticalDistance < 4
                
                if(isIn)
                {
                    if(itemDistance < distance && item.state !== InteractivePoints.STATE_HIDDEN)
                    {
                        activeItem = item
                    }
                }
                else
                {
                    if(item.isIn)
                    {
                        item.isIn = false

                        if(item.state !== InteractivePoints.STATE_HIDDEN)
                        {
                            item.conceal()
                        }
                    }
                }
            }

            if(activeItem)
            {
                // Activate item change => Deactivate old
                if(activeItem !== this.activeItem && this.activeItem !== null)
                {
                    this.activeItem.isIn = false
                    this.activeItem.conceal()
                }

                // Activate new active item
                if(!activeItem.isIn || this.activeItem === null)
                {
                    this.activeItem = activeItem

                    activeItem.isIn = true
                    activeItem.reveal()
                }
            }
            else
            {
                this.activeItem = null
            }
        }
    }

    temporaryHide()
    {
        this.temporaryHidden = true
        
        for(const item of this.items)
        {
            item.recoveryState = item.state
            item.hide()
        }
    }

    recover()
    {
        this.temporaryHidden = false

        for(const item of this.items)
        {
            if(item.recoveryState !== InteractivePoints.STATE_HIDDEN)
                item.show()
        }
    }
}