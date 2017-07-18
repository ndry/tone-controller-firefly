module $safeprojectname$.Client {

    export class Preloader extends Phaser.State {
        loaderText: Phaser.Text;

        preload() {
            
            this.loaderText = this.game.add.text(this.world.centerX, 200, "Loading...",
                { font: "18px Arial", fill: "#A9A91111", align: "center" });
            this.loaderText.anchor.setTo(0.5);

            this.load.image('titlepage', './assets/ui/titlePage.png');
            this.load.image('logo', './assets/ui/gameLogo.png');
            this.load.audio('click', './assets/sounds/click.ogg', true);

            this.load.image('dark-near-background', './assets/sprites/dark-near-background.png');
            this.load.image('near-background', './assets/sprites/near-background.png');
            this.load.image('near-background-no-halo', './assets/sprites/near-background-no-halo.png');
            this.load.image('near-background-just-halo', './assets/sprites/near-background-just-halo.png');
            this.load.image('far-background-transparent', './assets/sprites/far-background-transparent.png');
            this.load.image('moon', './assets/sprites/moon.png');
            this.load.image('full-moon-background', './assets/sprites/full-moon-background.png');
            

            this.load.atlasJSONHash('level01-sprites', './assets/sprites/level01-sprites.png', './assets/sprites/level01-sprites.json');
        }

        create() {
            var tween = this.add.tween(this.loaderText).to({ alpha: 0 }, 2000,
                Phaser.Easing.Linear.None, true);
            tween.onComplete.add(this.startMainMenu, this);
        }

        startMainMenu() {
            this.game.state.start('Level01', true, false);
        }

    }

}