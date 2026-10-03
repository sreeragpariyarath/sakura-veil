import { Game } from './Game.js'
import { Modals } from './Modals.js'

// Floating story lines of the Sakura Festival (docs/story/STORY.md).
// One DOM element, CSS transitions only: nothing runs per frame.
export class StoryText
{
    constructor()
    {
        this.game = Game.getInstance()
        this.lanterns = this.game.world.lanterns

        this.queue = []
        this.showing = false
        this.holdDuration = 3200
        this.fadeDuration = 600 // Matches the CSS transition

        this.element = document.createElement('div')
        this.element.className = 'story-text'
        this.game.modals.element.before(this.element) // Below the cards in the stacking order

        this.setLanternsEvents()
        this.setIntro()
    }

    setIntro()
    {
        const count = this.lanterns.getLitCount()
        const total = this.lanterns.items.size

        // Returning visitors skip the welcome lines
        if(count === 0)
        {
            this.push('Welcome to the Sakura Festival!')
            this.push('Light the five festival lanterns to begin the celebration.')
        }
        else if(count < total)
        {
            this.push(`Welcome back! ${count}/${total} lanterns glow.`)
        }
        else
        {
            this.push('Welcome back to the festival!')
        }

        // Let the world appear first
        this.paused = true
        setTimeout(() =>
        {
            this.paused = false
            this.next()
        }, 1500)
    }

    setLanternsEvents()
    {
        this.lanterns.events.on('lit', (item, count, restored) =>
        {
            if(!restored)
                this.push(`A lantern glows! (${count}/${this.lanterns.items.size})`)
        })

        this.lanterns.events.on('finale', () =>
        {
            this.push('The festival begins! Thank you for visiting.')
        })

        // Lines wait while a card is open
        this.game.modals.events.on('close', () =>
        {
            setTimeout(() => this.next(), this.fadeDuration)
        })
    }

    push(line)
    {
        this.queue.push(line)
        this.next()
    }

    next()
    {
        if(this.showing || this.paused || this.queue.length === 0)
            return

        const modalState = this.game.modals.state
        if(modalState === Modals.OPEN || modalState === Modals.OPENING)
            return

        this.showing = true
        this.element.textContent = this.queue.shift()
        this.element.classList.add('is-visible')

        setTimeout(() =>
        {
            this.element.classList.remove('is-visible')

            setTimeout(() =>
            {
                this.showing = false
                this.next()
            }, this.fadeDuration)
        }, this.holdDuration)
    }
}
