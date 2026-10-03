import { Game } from './Game.js'

// Lantern progress bar (image: static/images/ui/lantern-progress-bar.webp). The five lanterns are painted
// in the image; lit ones get a warm glow on top. Updated on `lit` events only.
export class LanternCounter
{
    // Centre of each painted lantern's glass, in % of the trimmed image (measured on lantern-progress-bar.webp)
    static LANTERN_X = [ 24.4, 35.7, 46.3, 57.6, 69.2 ]

    constructor()
    {
        this.game = Game.getInstance()
        this.lanterns = this.game.world.lanterns

        this.element = document.createElement('div')
        this.element.className = 'lantern-counter'
        this.game.modals.element.before(this.element)

        this.glows = new Map()
        let index = 0
        for(const item of this.lanterns.items.values())
        {
            const glow = document.createElement('div')
            glow.className = 'glow'
            glow.title = item.label
            glow.style.left = `${LanternCounter.LANTERN_X[index]}%`
            this.element.append(glow)
            this.glows.set(item.id, glow)
            index++
        }

        this.label = document.createElement('div')
        this.label.className = 'label'
        this.element.append(this.label)

        this.update()

        this.lanterns.events.on('lit', () =>
        {
            this.update()
        })

        // Fade in once the world has appeared, not instantly
        setTimeout(() => this.element.classList.add('is-visible'), 2500)
    }

    update()
    {
        for(const item of this.lanterns.items.values())
            this.glows.get(item.id).classList.toggle('is-lit', item.lit)

        this.label.textContent = `${this.lanterns.getLitCount()}/${this.lanterns.items.size}`
    }
}
