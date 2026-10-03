import { Game } from './Game.js'
import { Modals } from './Modals.js'

// Story lines of the Sakura Festival (docs/story/STORY.md): big moments on the cherry blossom scroll,
// short updates on the single-line banner (images in static/images/ui/).
// One DOM element, CSS transitions only: nothing runs per frame.
export class StoryText
{
    constructor()
    {
        this.game = Game.getInstance()
        this.lanterns = this.game.world.lanterns

        this.queue = []
        this.showing = false
        this.holdDuration = 3800
        this.fadeDuration = 1200 // Covers the CSS roll-up and fade-out (lanterns.styl)

        this.element = document.createElement('div')
        this.element.className = 'story-text'
        this.element.innerHTML = /* html */`
            <div class="frame">
                <div class="title"></div>
                <div class="divider"><span></span></div>
                <div class="subtitle"></div>
            </div>
        `
        this.titleElement = this.element.querySelector('.title')
        this.subtitleElement = this.element.querySelector('.subtitle')
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
            this.push('Welcome to the Sakura Festival!', 'Light the five festival lanterns to begin the celebration.')
        else if(count < total)
            this.push('Welcome back!', `${count} of ${total} lanterns glow`, 'banner')
        else
            this.push('Welcome back to the festival!', 'All five lanterns glow. Enjoy the garden.')

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
                this.push('A lantern glows!', `${count} of ${this.lanterns.items.size}`, 'banner')
        })

        this.lanterns.events.on('finale', () =>
        {
            this.push('The festival begins!', 'Thank you for visiting.')
        })

        // Lines wait while a card is open
        this.game.modals.events.on('close', () =>
        {
            setTimeout(() => this.next(), this.fadeDuration)
        })
    }

    push(title, subtitle = '', style = 'scroll')
    {
        this.queue.push({ title, subtitle, style })
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
        const line = this.queue.shift()
        this.titleElement.textContent = line.title
        this.subtitleElement.textContent = line.subtitle
        this.subtitleElement.style.display = line.subtitle ? '' : 'none'
        this.element.classList.toggle('is-banner', line.style === 'banner')
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
