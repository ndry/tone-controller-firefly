module $safeprojectname$.Client {

    export class Firefly extends Phaser.Sprite {
        track: number;
        bitmapData: Phaser.BitmapData;
        flyFrequencies: number[];
        lightFrequencies: number[];
        light: number;
        trace: Phaser.Point[];
        color: string;

        constructor(game: Phaser.Game, x: number, track: number, color: string) {
            let bitmapData = game.add.bitmapData(200, 200);
            super(game, x, (track * game.world.height / 12) + game.world.height / 24, bitmapData);
            this.track = track;
            this.color = color;
            this.bitmapData = bitmapData;
            this.anchor.setTo(0.5);
            game.add.existing(this);
            // Physics
            game.physics.enable(this);
            this.body.setCircle(50);
            

            this.flyFrequencies = [0.01, Math.random() * 2.5 + 0.1, Math.random() * 2.5 + 0.1, Math.random() * 2.5 + 0.1];
            this.lightFrequencies = [1, Math.random() * 4 + 1, Math.random() * 4 + 1];

            this.trace = [];

            this.visible = false;

            this.light = 1;
        }

        update() {
            let position = this.position.clone();
            for (let i = 0; i < this.flyFrequencies.length; i++) {
                let flyFrequency = this.flyFrequencies[i];
                position = position.add(
                    Math.sqrt(flyFrequency * 10) * Math.sin(this.game.time.now / flyFrequency / 1000),
                    Math.sqrt(flyFrequency * 10) * Math.cos(this.game.time.now / flyFrequency / 1000));
            }

            let light = 0;
            for (let i = 0; i < this.lightFrequencies.length; i++) {
                let lightFrequency = this.lightFrequencies[i];
                light += Math.sin(this.game.time.now / lightFrequency / 1000) / 2 + .5;
            }
            light /= this.lightFrequencies.length;
            this.light = light;

            this.trace.unshift(position.clone());
            if (this.trace.length > 5) {
                this.trace.pop();
            }

            this.bitmapData.cls();

            let centerX = this.bitmapData.width / 2;
            let centerY = this.bitmapData.height / 2;
            for (let i = this.trace.length - 1; i >= 0; i--) {
                let pos = this.position.clone().subtract(this.trace[i].x, this.trace[i].y);

                this.bitmapData.context.beginPath();
                this.bitmapData.context.fillStyle = this.color;
                this.bitmapData.context.arc(centerX - pos.x, centerY - pos.y, 5 * (1 - i / this.trace.length) * Math.max(this.light, 0.5), 0, Math.PI * 2);
                this.bitmapData.context.fill();
            }
        }
    }

}