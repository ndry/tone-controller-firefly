module $safeprojectname$.Client {
    import blendModes = PIXI.blendModes;

    export class Level01 extends Phaser.State {

        background: Phaser.Sprite;
        farBackground: Phaser.Sprite;
        farBackground1: Phaser.Sprite;
        nearBackground: Phaser.Sprite;
        nearBackground1: Phaser.Sprite;
        nearBackgroundHalo: Phaser.Sprite;
        nearBackgroundHalo1: Phaser.Sprite;
        shadowTexture: Phaser.BitmapData;
        nearBackgroundShadowed: Phaser.BitmapData;
        nearBackgroundShadowed1: Phaser.BitmapData;

        music: Phaser.Sound;
        player: Player;
        enemies: Enemy[];
        crash: number;

        score: number;
        scoreText: Phaser.Text;
        highScore: number;
        highScoreText: Phaser.Text;

        toneTexts: Phaser.Text[];

        create() {
            this.physics.startSystem(Phaser.Physics.ARCADE);

            this.stage.backgroundColor = "#020408";

            this.background = this.add.sprite(350, this.game.height * .25, 'moon');
            this.background.anchor.set(0.5);
            this.background.scale.set(this.game.height / this.background.height / 5);

            this.farBackground = this.add.sprite(0, 0, 'far-background-transparent');
            this.farBackground.scale.set(this.game.height / this.farBackground.height);
            this.farBackground1 = this.add.sprite(this.farBackground.width - 1, 0, 'far-background-transparent');
            this.farBackground1.scale.set(this.game.height / this.farBackground1.height);



            this.nearBackground = this.add.sprite(0, - this.game.height, 'near-background-no-halo');
            this.nearBackground.scale.set(this.game.height / this.nearBackground.height * 2);
            this.nearBackground.visible = false;
            this.nearBackground1 = this.add.sprite(this.nearBackground.width - 1, - this.game.height, 'near-background-no-halo');
            this.nearBackground1.scale.set(this.game.height / this.nearBackground1.height * 2);
            this.nearBackground1.visible = false;

            

            this.player = new Player(this.game);

            this.enemies = [];

            for (let i = 0; i < 15; i++) {
                let enemy = new Enemy(this.game, Math.floor(Math.random() * 12), "#ccff00");
                enemy.position.x = 300 + Math.random() * (this.game.width - 300);
                this.enemies.push(enemy);
            }
            
            


            // Create the shadow texture
            this.shadowTexture = this.game.add.bitmapData(this.game.width, this.game.height);
            this.nearBackgroundShadowed = this.game.add.bitmapData(this.game.width, this.game.height);
            this.nearBackgroundShadowed1 = this.game.add.bitmapData(this.game.width, this.game.height);

            // Create an object that will use the bitmap as a texture
            var lightSprite = this.game.add.image(0, 0, this.nearBackgroundShadowed);

            this.nearBackgroundHalo = this.add.sprite(0, - this.game.height, 'near-background-just-halo');
            this.nearBackgroundHalo.scale.set(this.game.height / this.nearBackgroundHalo.height * 2);
            this.nearBackgroundHalo1 = this.add.sprite(this.nearBackgroundHalo.width - 1, - this.game.height, 'near-background-just-halo');
            this.nearBackgroundHalo1.scale.set(this.game.height / this.nearBackgroundHalo1.height * 2);

            // Set the blend mode to MULTIPLY. This will darken the colors of
            // everything below this sprite.
            //lightSprite.blendMode = blendModes.MULTIPLY;

            // Simulate a pointer click/tap input at the center of the stage
            // when the example begins running.
            this.game.input.activePointer.x = this.game.width / 2;
            this.game.input.activePointer.y = this.game.height / 2;

            this.score = 0;
            this.highScore = 0;
            this.crash = 0;

            this.scoreText = this.game.add.text(this.game.width - 170, 20, "", { font: "35px Tahoma", fill: this.player.color, align: "right" });
            this.highScoreText = this.game.add.text(this.game.width - 170, 50, "", { font: "35px Tahoma", fill: this.player.color, align: "right" });

            let toneNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            this.toneTexts = [];
            for (let i = 0; i < toneNames.length; i++) {
                this.toneTexts[i] = this.game.add.text(10,
                    this.game.height / 12 * i + this.game.height / 24 - 10,
                    toneNames[i] + "4",
                    { font: "20px Tahoma", fill: "#777777", align: "left" });
            }

            this.lastInputText = this.game.add.text(this.game.width - 220, this.game.height - 40, "", { font: "20px Tahoma", fill: this.player.color, align: "right" });
        }

        updateShadowTexture() {
            // This function updates the shadow texture (this.shadowTexture).
            // First, it fills the entire texture with a dark shadow color.
            // Then it draws a white circle centered on the pointer position.
            // Because the texture is drawn to the screen using the MULTIPLY
            // blend mode, the dark areas of the texture make all of the colors
            // underneath it darker, while the white area is unaffected.

            this.nearBackgroundShadowed.cls();
            this.nearBackgroundShadowed.draw(this.nearBackground);
            this.nearBackgroundShadowed.draw(this.nearBackground1);
            
            this.nearBackgroundShadowed1.cls();
            this.nearBackgroundShadowed1.draw(this.nearBackground);
            this.nearBackgroundShadowed1.draw(this.nearBackground1);
            
            // Draw shadow
            this.shadowTexture.context.fillStyle = 'rgb(0, 0, 0)';
            this.shadowTexture.context.fillRect(0, 0, this.game.width, this.game.height);

            {
                var gradient = this.shadowTexture.context.createLinearGradient(200, 0, 500, 25);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
                gradient.addColorStop(.5, 'rgba(255, 255, 255, 0.5)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
                this.shadowTexture.context.fillStyle = gradient;
                this.shadowTexture.context.fillRect(0, 0, this.game.width, this.game.height);
            }

            let fireflies = this.enemies.concat([this.player]);
            for (let i = 0; i < fireflies.length; i++) {
                let firefly = fireflies[i];

                this.nearBackgroundShadowed.draw(firefly);
                this.nearBackgroundShadowed1.draw(firefly);

                var radius = 100 * Math.max(firefly.light * 2 - 1, 0) + Math.random() * 2 + 1, 
                    heroX = (firefly.trace.length > 0) ? firefly.trace[0].x : firefly.x,
                    heroY = (firefly.trace.length > 0) ? firefly.trace[0].y : firefly.y;

                var gradient = this.shadowTexture.context.createRadialGradient(
                    heroX,
                    heroY,
                    radius * 0.3,
                    heroX,
                    heroY,
                    radius);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

                // Draw circle of light
                this.shadowTexture.context.beginPath();
                this.shadowTexture.context.fillStyle = gradient;
                this.shadowTexture.context.arc(heroX,
                    heroY,
                    radius,
                    0,
                    Math.PI * 2);
                this.shadowTexture.context.fill();
            }

            {
                var radius = 200, // + this.game.rnd.integerInRange(1, 20),
                    heroX = this.game.input.activePointer.x + this.game.rnd.integerInRange(1, 5),
                    heroY = this.game.input.activePointer.y + this.game.rnd.integerInRange(1, 5);

                var gradient = this.shadowTexture.context.createRadialGradient(
                    heroX,
                    heroY,
                    100 * 0.3,
                    heroX,
                    heroY,
                    radius);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

                // Draw circle of light
                this.shadowTexture.context.beginPath();
                this.shadowTexture.context.fillStyle = gradient;
                this.shadowTexture.context.arc(heroX,
                    heroY,
                    radius,
                    0,
                    Math.PI * 2);
                this.shadowTexture.context.fill();
            }


            //this.shadowTexture.alphaMask(this.shadowTexture, this.nearBackgroundShadowed);
            this.nearBackgroundShadowed1.draw(this.shadowTexture, 0, 0, this.game.width, this.game.height, "multiply");
            this.nearBackgroundShadowed.alphaMask(this.nearBackgroundShadowed1, this.nearBackgroundShadowed);

            // This just tells the engine it should update the texture cache
            this.nearBackgroundShadowed.dirty = true;
        }

        
        update() {
            this.farBackground.x -= 0.5;
            this.farBackground1.x -= 0.5;
            this.nearBackground.x -= 1;
            this.nearBackground1.x -= 1;
            this.nearBackgroundHalo.x -= 1;
            this.nearBackgroundHalo1.x -= 1;

            if (this.farBackground.x + this.farBackground.width <= 0) {
                this.farBackground.x = this.farBackground1.x + this.farBackground1.width - 1;
            }
            if (this.farBackground1.x + this.farBackground1.width <= 0) {
                this.farBackground1.x = this.farBackground.x + this.farBackground.width - 1;
            }

            
            if (this.nearBackground.x + this.nearBackground.width <= 0) {
                this.nearBackground.x = this.nearBackground1.x + this.nearBackground1.width - 1;
            }
            if (this.nearBackground1.x + this.nearBackground1.width <= 0) {
                this.nearBackground1.x = this.nearBackground.x + this.nearBackground.width - 1;
            }

            if (this.nearBackgroundHalo.x + this.nearBackgroundHalo.width <= 0) {
                this.nearBackgroundHalo.x = this.nearBackgroundHalo1.x + this.nearBackgroundHalo1.width - 1;
            }
            if (this.nearBackgroundHalo1.x + this.nearBackgroundHalo1.width <= 0) {
                this.nearBackgroundHalo1.x = this.nearBackgroundHalo.x + this.nearBackgroundHalo.width - 1;
            }

            this.enemies = this.enemies.filter(e => e.position.x > -100);

            if (Math.random() < 0.02 * (1 + this.score / 1000)) {
                this.enemies.push(new Enemy(this.game, Math.floor(Math.random() * 12), Math.random() > .1 ? "#ccff00" : this.player.color));
            }

            if (this.crash > 0) {
                this.crash -= this.game.time.elapsed / 1000; 
                
                if (this.crash <= 0) {
                    this.player.position.x = 100;
                    this.scoreText.setStyle({ font: "35px Tahoma", fill: this.player.color, align: "right" });
                }
            } else {
                this.score += 1;

                for (let i = 0; i < this.enemies.length; i++) {
                    let enemy = this.enemies[i];
                    if (this.player.position.distance(enemy.position) < (this.game.height / 12)*.85) {
                        if (this.player.color === enemy.color) {
                            this.score += 100;
                        } else {
                            this.score = 0;
                            this.scoreText.setStyle({ font: "35px Tahoma", fill: "#777777", align: "right" });
                            this.crash = 5;
                            this.player.position.x = -200;
                        }
                        enemy.position.x = -200;
                    }
                }
            }

            if (this.score > this.highScore) {
                this.highScore = this.score;
                this.highScoreText.setStyle({ font: "35px Tahoma", fill: this.player.color, align: "right" });
            } else {
                this.highScoreText.setStyle({ font: "35px Tahoma", fill: "#777777", align: "right" });
            }

            this.scoreText.text = ("00000000" + this.score).substr(-7);
            this.highScoreText.text = ("00000000" + this.highScore).substr(-7);


            this.updateShadowTexture();

            for (let i = 0; i < this.toneTexts.length; i++) {
                this.toneTexts[i].setStyle({ font: "20px Tahoma", fill: "#777777", align: "left" });
            }
            this.toneTexts[this.player.targetTrack].setStyle({ font: "20px Tahoma", fill: this.player.color, align: "left" });

            this.lastInputText.text = this.player.lastInputText;
            this.lastInputText.setStyle({
                font: "20px Tahoma",
                fill: this.player.lastInputTextActual ? this.player.color : "#777777",
                align: "right"
            });
        }

        lastInputText: Phaser.Text;
    }

}