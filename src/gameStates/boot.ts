module $safeprojectname$.Client {

    export class Boot extends Phaser.State {
        logo: Phaser.Sprite;
        loaderText: Phaser.Text;

        preload() {
            if (this.game.device.desktop) {
                this.scale.pageAlignHorizontally = true;
                this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
            } else {
                // mobile
                //this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                this.scale.minWidth = 480;
                this.scale.minHeight = 260;
                this.scale.maxWidth = 1024;
                this.scale.maxHeight = 768;
                this.scale.forceLandscape = true;
                this.scale.pageAlignHorizontally = true;
                this.scale.refresh();
            }


            this.load.image('logo', './assets/ui/gameLogo.png');





            this.load.image('near-background-no-halo', './assets/sprites/near-background-no-halo.png');
            this.load.image('near-background-just-halo', './assets/sprites/near-background-just-halo.png');
            this.load.image('far-background-transparent', './assets/sprites/far-background-transparent.png');
            this.load.image('moon', './assets/sprites/moon.png');
        }

        create() {
            this.input.maxPointers = 1;
            this.stage.disableVisibilityChange = true;

            this.stage.setBackgroundColor(0x020408);

            this.loaderText = this.game.add.text(this.world.centerX,
                200,
                "Loading...",
                { font: "18px Arial", fill: "#FFFFFF", align: "center" });
            this.loaderText.anchor.setTo(0.5);

            this.logo = this.add.sprite(this.world.centerX, this.world.centerY, 'logo');
            this.logo.anchor.setTo(0.5);
            
            var tween = this.add.tween(this.loaderText).to({ alpha: 0.3 }, 2000,
                Phaser.Easing.Linear.None, true);
            tween.onComplete.add(() => this.game.state.start('Level01', true, false), this);
        }

    }

}