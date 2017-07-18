module $safeprojectname$.Client {

    export class Player extends Firefly {

        targetTrack: number;

        constructor(game: Phaser.Game) {
            super(game, 100, 6, "#ffee00");
            this.targetTrack = this.track;

            this.audioContext = new AudioContext();
            var sourceAudioNode, micStream;




            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    micStream = stream;

                    this.analyserAudioNode = this.audioContext.createAnalyser();
                    this.analyserAudioNode.fftSize = 512 * 4 * 4;

                    sourceAudioNode = this.audioContext.createMediaStreamSource(micStream);
                    sourceAudioNode.connect(this.analyserAudioNode);

                    this.gotStream = true;
                });
        }

        findFundamentalFreq(buffer, sampleRate) {
            // We use Autocorrelation to find the fundamental frequency.

            // In order to correlate the signal with itself (hence the name of the algorithm), we will check two points 'k' frames away. 
            // The autocorrelation index will be the average of these products. At the same time, we normalize the values.
            // Source: http://www.phy.mty.edu/~suits/autocorrelation.html
            // Assuming the sample rate is 48000Hz, a 'k' equal to 1000 would correspond to a 48Hz signal (48000/1000 = 48), 
            // while a 'k' equal to 8 would correspond to a 6000Hz one, which is enough to cover most (if not all) 
            // the notes we have in the notes.json file.
            var n = 5024, bestR = 0, bestK = -1;
            for (var k = 8; k <= 1000; k++) {
                var sum = 0;

                for (var i = 0; i < n; i++) {
                    sum += ((buffer[i] - 128) / 128) * ((buffer[i + k] - 128) / 128);
                }

                var r = sum / (n + k);

                if (r > bestR) {
                    bestR = r;
                    bestK = k;
                }

                if (r > 0.9) {
                    // Let's assume that this is good enough and stop right here
                    break;
                }
            }

            if (bestR > 0.0025) {
                // The period (in frames) of the fundamental frequency is 'bestK'. Getting the frequency from there is trivial.
                var fundamentalFreq = sampleRate / bestK;
                return fundamentalFreq;
            }
            else {
                // We haven't found a good correlation
                return -1;
            }
        }

        detectPitch() {
            var buffer = new Uint8Array(this.analyserAudioNode.fftSize);
            // See initializations in the AudioContent and AnalyserNode sections of the demo.
            this.analyserAudioNode.getByteTimeDomainData(buffer);
            return this.findFundamentalFreq(buffer, this.audioContext.sampleRate);
        }

 
        analyserAudioNode;
        audioContext;
        gotStream: boolean;
        pitch: number;

        update() {
            if (this.gotStream) {
                console.log(this.pitch = this.detectPitch());
            }

            let a4 = 440;
            let toneNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

            if (this.pitch >= 0) {
                let cents = 1200 * Math.log(this.pitch / a4) / Math.log(2);

                // console.log(`A4 +${cents} cents`);
                let tone = Math.round(cents / 100);
                let toneNameIndex = tone + 9;
                let relCents = cents - tone * 100;
                let octave = 4;
                while (toneNameIndex >= toneNames.length) {
                    octave++;
                    toneNameIndex -= toneNames.length;
                }
                while (toneNameIndex < 0) {
                    octave--;
                    toneNameIndex += toneNames.length;
                }
                let fullToneName = `${toneNames[toneNameIndex]}${octave}`;
                let centText = `${((relCents > 0) ? "+" : "")}${Math.round(relCents)} cents`;

                if (octave == 4) {
                    this.targetTrack = toneNameIndex;
                }
                this.lastInputText = `${fullToneName} ${centText} (${Math.round(this.pitch)} Hz)`;
                this.lastInputTextActual = true;
            } else {
                this.lastInputTextActual = false;
            }

            if (this.game.input.keyboard.isDown(Phaser.Keyboard.ONE)) {
                this.targetTrack = 0;
            } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.TWO)) {
                this.targetTrack = 1;
            } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.THREE)) {
                this.targetTrack = 2;
            } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.FOUR)) {
                this.targetTrack = 3;
            } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.FIVE)) {
                this.targetTrack = 4;
            } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.SIX)) {
                this.targetTrack = 5;
            } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.SEVEN)) {
                this.targetTrack = 6;
            } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.EIGHT)) {
                this.targetTrack = 7;
            } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.NINE)) {
                this.targetTrack = 8;
            } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.ZERO)) {
                this.targetTrack = 9;
            } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.MINUS)) {
                this.targetTrack = 10;
            } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.EQUALS)) {
                this.targetTrack = 11;
            }

            
            let targetY = (this.targetTrack * this.game.world.height / 12) + this.game.world.height / 24;
            if (this.position.y < targetY - this.game.world.height / 24 / 2) {
                this.body.velocity.y = 500;
            } else if (this.position.y > targetY + this.game.world.height / 24 / 2) {
                this.body.velocity.y = -500;
            } else {
                this.body.velocity.y = targetY - this.position.y;
            }


            super.update();
        }

        lastInputText: string = "";
        lastInputTextActual: boolean = false;
    }

}