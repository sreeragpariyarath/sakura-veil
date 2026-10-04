import { Game } from '../Game.js'

export class Scenery
{
    constructor()
    {
        this.game = Game.getInstance()
        // Legacy car scenery.glb retired per user design.
        // World geometry is now modularly composed of WorldLayout arenas, Sakura trees, water surfaces, and landmarks.
    }

    update()
    {
    }
}