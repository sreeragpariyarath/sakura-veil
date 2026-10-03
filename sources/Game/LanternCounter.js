import { Game } from './Game.js'

// Five lantern icons showing how many festival lanterns are lit. Updated on `lit` events only.
export class LanternCounter
{
    static ICON = /* html */`
        <svg viewBox="0 0 24 32" aria-hidden="true">
            <path class="roof" d="M3 9 L12 3 L21 9 Z" />
            <rect class="glass" x="7" y="10" width="10" height="11" rx="1.5" />
            <rect class="post" x="10.5" y="21" width="3" height="9" />
        </svg>`

    constructor()
    {
        this.game = Game.getInstance()
        this.lanterns = this.game.world.lanterns

        this.element = document.createElement('div')
        this.element.className = 'lantern-counter'
        this.game.modals.element.before(this.element)

        this.icons = new Map()
        for(const item of this.lanterns.items.values())
        {
            const icon = document.createElement('div')
            icon.className = 'icon'
            icon.title = item.label
            icon.innerHTML = LanternCounter.ICON
            this.element.append(icon)
            this.icons.set(item.id, icon)
        }

        this.label = document.createElement('div')
        this.label.className = 'label'
        this.element.append(this.label)

        this.update()

        this.lanterns.events.on('lit', () =>
        {
            this.update()
        })
    }

    update()
    {
        for(const item of this.lanterns.items.values())
            this.icons.get(item.id).classList.toggle('is-lit', item.lit)

        this.label.textContent = `${this.lanterns.getLitCount()}/${this.lanterns.items.size}`
    }
}
