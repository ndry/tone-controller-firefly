module $safeprojectname$.Client {

    export class Enemy extends Firefly {
        constructor(game: Phaser.Game, track: number, color: string) {
            super(game, game.world.width + 200, track, color);

            this.body.velocity.x = -160;
        }
    }

}