import { Howl } from 'howler'
import { Game } from './Game.js'

// Festival background music with a play/pause button under the map button.
// On by default: browsers only allow audio after a user gesture, so it starts on the first click or key press.
// Turning it off with the button is remembered.
export class FestivalMusic
{
    static STORAGE_KEY = 'sakura-veil-music'

    constructor()
    {
        this.game = Game.getInstance()

        this.volume = 0.35
        this.playing = false

        this.sound = new Howl({
            src: [ 'sounds/musics/festival-bgm-1.mp3' ],
            html5: true, // Streams the long track instead of decoding all of it up front
            loop: true,
            preload: false,
            volume: 0
        })

        this.setButton()

        if(this.loadPreference())
        {
            const start = (event) =>
            {
                // The button's own click toggles the music itself
                if(this.button.contains(event.target))
                    return

                window.removeEventListener('pointerdown', start)
                window.removeEventListener('keydown', start)

                if(!this.playing)
                    this.play()
            }
            window.addEventListener('pointerdown', start)
            window.addEventListener('keydown', start)
        }

        if(this.game.debug.active)
        {
            const debugPanel = this.game.debug.panel.addFolder({ title: '🎵 Festival music', expanded: false })
            debugPanel.addBinding(this, 'volume', { min: 0, max: 1, step: 0.01 }).on('change', () =>
            {
                if(this.playing)
                    this.sound.volume(this.volume)
            })
        }
    }

    setButton()
    {
        this.button = document.createElement('button')
        this.button.className = 'js-music-trigger map-trigger music-trigger'
        this.button.setAttribute('aria-label', 'Play music')
        this.button.innerHTML = /* html */`
            <div class="button-inner">
                <div class="icon-container">
                    <svg class="music-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M9 18V5l11-2v13" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        <circle cx="6" cy="18" r="3" fill="#ffffff" />
                        <circle cx="17" cy="16" r="3" fill="#ffffff" />
                        <line class="slash" x1="3" y1="3" x2="21" y2="21" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
                    </svg>
                </div>
            </div>
        `
        document.querySelector('.js-map-trigger').after(this.button)

        this.button.addEventListener('click', (event) =>
        {
            event.stopPropagation()
            this.toggle()
        })
    }

    toggle()
    {
        if(this.playing)
            this.pause()
        else
            this.play()
    }

    play()
    {
        this.playing = true
        this.button.classList.add('is-playing')
        this.button.setAttribute('aria-label', 'Pause music')

        if(this.sound.state() === 'unloaded')
            this.sound.load()

        if(!this.sound.playing())
            this.sound.play()

        this.sound.fade(this.sound.volume(), this.volume, 2000)
        this.savePreference()
    }

    pause()
    {
        this.playing = false
        this.button.classList.remove('is-playing')
        this.button.setAttribute('aria-label', 'Play music')

        this.sound.fade(this.sound.volume(), 0, 1000)
        this.sound.once('fade', () =>
        {
            if(!this.playing)
                this.sound.pause()
        })
        this.savePreference()
    }

    loadPreference()
    {
        try
        {
            return localStorage.getItem(FestivalMusic.STORAGE_KEY) !== 'off'
        }
        catch(error)
        {
            return true
        }
    }

    savePreference()
    {
        try
        {
            localStorage.setItem(FestivalMusic.STORAGE_KEY, this.playing ? 'on' : 'off')
        }
        catch(error) {}
    }
}
