var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        var GameEngine = (function (_super) {
            __extends(GameEngine, _super);
            function GameEngine() {
                var _this = _super.call(this, 1024, 800, Phaser.AUTO, 'content', null) || this;
                _this.state.add('Boot', Client.Boot, false);
                _this.state.add('Level01', Client.Level01, false);
                _this.state.start('Boot');
                return _this;
            }
            return GameEngine;
        }(Phaser.Game));
        Client.GameEngine = GameEngine;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
window.onload = function () {
    var game = new $safeprojectname$.Client.GameEngine();
};
var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        var Firefly = (function (_super) {
            __extends(Firefly, _super);
            function Firefly(game, x, track, color) {
                var _this = this;
                var bitmapData = game.add.bitmapData(200, 200);
                _this = _super.call(this, game, x, (track * game.world.height / 12) + game.world.height / 24, bitmapData) || this;
                _this.track = track;
                _this.color = color;
                _this.bitmapData = bitmapData;
                _this.anchor.setTo(0.5);
                game.add.existing(_this);
                game.physics.enable(_this);
                _this.body.setCircle(50);
                _this.flyFrequencies = [0.01, Math.random() * 2.5 + 0.1, Math.random() * 2.5 + 0.1, Math.random() * 2.5 + 0.1];
                _this.lightFrequencies = [1, Math.random() * 4 + 1, Math.random() * 4 + 1];
                _this.trace = [];
                _this.visible = false;
                _this.light = 1;
                return _this;
            }
            Firefly.prototype.update = function () {
                var position = this.position.clone();
                for (var i = 0; i < this.flyFrequencies.length; i++) {
                    var flyFrequency = this.flyFrequencies[i];
                    position = position.add(Math.sqrt(flyFrequency * 10) * Math.sin(this.game.time.now / flyFrequency / 1000), Math.sqrt(flyFrequency * 10) * Math.cos(this.game.time.now / flyFrequency / 1000));
                }
                var light = 0;
                for (var i = 0; i < this.lightFrequencies.length; i++) {
                    var lightFrequency = this.lightFrequencies[i];
                    light += Math.sin(this.game.time.now / lightFrequency / 1000) / 2 + .5;
                }
                light /= this.lightFrequencies.length;
                this.light = light;
                this.trace.unshift(position.clone());
                if (this.trace.length > 5) {
                    this.trace.pop();
                }
                this.bitmapData.cls();
                var centerX = this.bitmapData.width / 2;
                var centerY = this.bitmapData.height / 2;
                for (var i = this.trace.length - 1; i >= 0; i--) {
                    var pos = this.position.clone().subtract(this.trace[i].x, this.trace[i].y);
                    this.bitmapData.context.beginPath();
                    this.bitmapData.context.fillStyle = this.color;
                    this.bitmapData.context.arc(centerX - pos.x, centerY - pos.y, 5 * (1 - i / this.trace.length) * Math.max(this.light, 0.5), 0, Math.PI * 2);
                    this.bitmapData.context.fill();
                }
            };
            return Firefly;
        }(Phaser.Sprite));
        Client.Firefly = Firefly;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        var Enemy = (function (_super) {
            __extends(Enemy, _super);
            function Enemy(game, track, color) {
                var _this = _super.call(this, game, game.world.width + 200, track, color) || this;
                _this.body.velocity.x = -160;
                return _this;
            }
            return Enemy;
        }(Client.Firefly));
        Client.Enemy = Enemy;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        var Player = (function (_super) {
            __extends(Player, _super);
            function Player(game) {
                var _this = _super.call(this, game, 100, 6, "#ffee00") || this;
                _this.lastInputText = "";
                _this.lastInputTextActual = false;
                _this.targetTrack = _this.track;
                _this.audioContext = new AudioContext();
                var sourceAudioNode, micStream;
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(function (stream) {
                    micStream = stream;
                    _this.analyserAudioNode = _this.audioContext.createAnalyser();
                    _this.analyserAudioNode.fftSize = 512 * 4 * 4;
                    sourceAudioNode = _this.audioContext.createMediaStreamSource(micStream);
                    sourceAudioNode.connect(_this.analyserAudioNode);
                    _this.gotStream = true;
                });
                return _this;
            }
            Player.prototype.findFundamentalFreq = function (buffer, sampleRate) {
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
                        break;
                    }
                }
                if (bestR > 0.0025) {
                    var fundamentalFreq = sampleRate / bestK;
                    return fundamentalFreq;
                }
                else {
                    return -1;
                }
            };
            Player.prototype.detectPitch = function () {
                var buffer = new Uint8Array(this.analyserAudioNode.fftSize);
                this.analyserAudioNode.getByteTimeDomainData(buffer);
                return this.findFundamentalFreq(buffer, this.audioContext.sampleRate);
            };
            Player.prototype.update = function () {
                if (this.gotStream) {
                    console.log(this.pitch = this.detectPitch());
                }
                var a4 = 440;
                var toneNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                if (this.pitch >= 0) {
                    var cents = 1200 * Math.log(this.pitch / a4) / Math.log(2);
                    var tone = Math.round(cents / 100);
                    var toneNameIndex = tone + 9;
                    var relCents = cents - tone * 100;
                    var octave = 4;
                    while (toneNameIndex >= toneNames.length) {
                        octave++;
                        toneNameIndex -= toneNames.length;
                    }
                    while (toneNameIndex < 0) {
                        octave--;
                        toneNameIndex += toneNames.length;
                    }
                    var fullToneName = "" + toneNames[toneNameIndex] + octave;
                    var centText = "" + ((relCents > 0) ? "+" : "") + Math.round(relCents) + " cents";
                    if (octave == 4) {
                        this.targetTrack = toneNameIndex;
                    }
                    this.lastInputText = fullToneName + " " + centText + " (" + Math.round(this.pitch) + " Hz)";
                    this.lastInputTextActual = true;
                }
                else {
                    this.lastInputTextActual = false;
                }
                if (this.game.input.keyboard.isDown(Phaser.Keyboard.ONE)) {
                    this.targetTrack = 0;
                }
                else if (this.game.input.keyboard.isDown(Phaser.Keyboard.TWO)) {
                    this.targetTrack = 1;
                }
                else if (this.game.input.keyboard.isDown(Phaser.Keyboard.THREE)) {
                    this.targetTrack = 2;
                }
                else if (this.game.input.keyboard.isDown(Phaser.Keyboard.FOUR)) {
                    this.targetTrack = 3;
                }
                else if (this.game.input.keyboard.isDown(Phaser.Keyboard.FIVE)) {
                    this.targetTrack = 4;
                }
                else if (this.game.input.keyboard.isDown(Phaser.Keyboard.SIX)) {
                    this.targetTrack = 5;
                }
                else if (this.game.input.keyboard.isDown(Phaser.Keyboard.SEVEN)) {
                    this.targetTrack = 6;
                }
                else if (this.game.input.keyboard.isDown(Phaser.Keyboard.EIGHT)) {
                    this.targetTrack = 7;
                }
                else if (this.game.input.keyboard.isDown(Phaser.Keyboard.NINE)) {
                    this.targetTrack = 8;
                }
                else if (this.game.input.keyboard.isDown(Phaser.Keyboard.ZERO)) {
                    this.targetTrack = 9;
                }
                else if (this.game.input.keyboard.isDown(Phaser.Keyboard.MINUS)) {
                    this.targetTrack = 10;
                }
                else if (this.game.input.keyboard.isDown(Phaser.Keyboard.EQUALS)) {
                    this.targetTrack = 11;
                }
                var targetY = (this.targetTrack * this.game.world.height / 12) + this.game.world.height / 24;
                if (this.position.y < targetY - this.game.world.height / 24 / 2) {
                    this.body.velocity.y = 500;
                }
                else if (this.position.y > targetY + this.game.world.height / 24 / 2) {
                    this.body.velocity.y = -500;
                }
                else {
                    this.body.velocity.y = targetY - this.position.y;
                }
                _super.prototype.update.call(this);
            };
            return Player;
        }(Client.Firefly));
        Client.Player = Player;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        var Boot = (function (_super) {
            __extends(Boot, _super);
            function Boot() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Boot.prototype.preload = function () {
                if (this.game.device.desktop) {
                    this.scale.pageAlignHorizontally = true;
                    this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
                }
                else {
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
            };
            Boot.prototype.create = function () {
                var _this = this;
                this.input.maxPointers = 1;
                this.stage.disableVisibilityChange = true;
                this.stage.setBackgroundColor(0x020408);
                this.loaderText = this.game.add.text(this.world.centerX, 200, "Loading...", { font: "18px Arial", fill: "#FFFFFF", align: "center" });
                this.loaderText.anchor.setTo(0.5);
                this.logo = this.add.sprite(this.world.centerX, this.world.centerY, 'logo');
                this.logo.anchor.setTo(0.5);
                var tween = this.add.tween(this.loaderText).to({ alpha: 0.3 }, 2000, Phaser.Easing.Linear.None, true);
                tween.onComplete.add(function () { return _this.game.state.start('Level01', true, false); }, this);
            };
            return Boot;
        }(Phaser.State));
        Client.Boot = Boot;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        var Level01 = (function (_super) {
            __extends(Level01, _super);
            function Level01() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Level01.prototype.create = function () {
                this.physics.startSystem(Phaser.Physics.ARCADE);
                this.stage.backgroundColor = "#020408";
                this.background = this.add.sprite(350, this.game.height * .25, 'moon');
                this.background.anchor.set(0.5);
                this.background.scale.set(this.game.height / this.background.height / 5);
                this.farBackground = this.add.sprite(0, 0, 'far-background-transparent');
                this.farBackground.scale.set(this.game.height / this.farBackground.height);
                this.farBackground1 = this.add.sprite(this.farBackground.width - 1, 0, 'far-background-transparent');
                this.farBackground1.scale.set(this.game.height / this.farBackground1.height);
                this.nearBackground = this.add.sprite(0, -this.game.height, 'near-background-no-halo');
                this.nearBackground.scale.set(this.game.height / this.nearBackground.height * 2);
                this.nearBackground.visible = false;
                this.nearBackground1 = this.add.sprite(this.nearBackground.width - 1, -this.game.height, 'near-background-no-halo');
                this.nearBackground1.scale.set(this.game.height / this.nearBackground1.height * 2);
                this.nearBackground1.visible = false;
                this.player = new Client.Player(this.game);
                this.enemies = [];
                for (var i = 0; i < 15; i++) {
                    var enemy = new Client.Enemy(this.game, Math.floor(Math.random() * 12), "#ccff00");
                    enemy.position.x = 300 + Math.random() * (this.game.width - 300);
                    this.enemies.push(enemy);
                }
                this.shadowTexture = this.game.add.bitmapData(this.game.width, this.game.height);
                this.nearBackgroundShadowed = this.game.add.bitmapData(this.game.width, this.game.height);
                this.nearBackgroundShadowed1 = this.game.add.bitmapData(this.game.width, this.game.height);
                var lightSprite = this.game.add.image(0, 0, this.nearBackgroundShadowed);
                this.nearBackgroundHalo = this.add.sprite(0, -this.game.height, 'near-background-just-halo');
                this.nearBackgroundHalo.scale.set(this.game.height / this.nearBackgroundHalo.height * 2);
                this.nearBackgroundHalo1 = this.add.sprite(this.nearBackgroundHalo.width - 1, -this.game.height, 'near-background-just-halo');
                this.nearBackgroundHalo1.scale.set(this.game.height / this.nearBackgroundHalo1.height * 2);
                this.game.input.activePointer.x = this.game.width / 2;
                this.game.input.activePointer.y = this.game.height / 2;
                this.score = 0;
                this.highScore = 0;
                this.crash = 0;
                this.scoreText = this.game.add.text(this.game.width - 170, 20, "", { font: "35px Tahoma", fill: this.player.color, align: "right" });
                this.highScoreText = this.game.add.text(this.game.width - 170, 50, "", { font: "35px Tahoma", fill: this.player.color, align: "right" });
                var toneNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                this.toneTexts = [];
                for (var i = 0; i < toneNames.length; i++) {
                    this.toneTexts[i] = this.game.add.text(10, this.game.height / 12 * i + this.game.height / 24 - 10, toneNames[i] + "4", { font: "20px Tahoma", fill: "#777777", align: "left" });
                }
                this.lastInputText = this.game.add.text(this.game.width - 220, this.game.height - 40, "", { font: "20px Tahoma", fill: this.player.color, align: "right" });
            };
            Level01.prototype.updateShadowTexture = function () {
                this.nearBackgroundShadowed.cls();
                this.nearBackgroundShadowed.draw(this.nearBackground);
                this.nearBackgroundShadowed.draw(this.nearBackground1);
                this.nearBackgroundShadowed1.cls();
                this.nearBackgroundShadowed1.draw(this.nearBackground);
                this.nearBackgroundShadowed1.draw(this.nearBackground1);
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
                var fireflies = this.enemies.concat([this.player]);
                for (var i = 0; i < fireflies.length; i++) {
                    var firefly = fireflies[i];
                    this.nearBackgroundShadowed.draw(firefly);
                    this.nearBackgroundShadowed1.draw(firefly);
                    var radius = 100 * Math.max(firefly.light * 2 - 1, 0) + Math.random() * 2 + 1, heroX = (firefly.trace.length > 0) ? firefly.trace[0].x : firefly.x, heroY = (firefly.trace.length > 0) ? firefly.trace[0].y : firefly.y;
                    var gradient = this.shadowTexture.context.createRadialGradient(heroX, heroY, radius * 0.3, heroX, heroY, radius);
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
                    this.shadowTexture.context.beginPath();
                    this.shadowTexture.context.fillStyle = gradient;
                    this.shadowTexture.context.arc(heroX, heroY, radius, 0, Math.PI * 2);
                    this.shadowTexture.context.fill();
                }
                {
                    var radius = 200, heroX = this.game.input.activePointer.x + this.game.rnd.integerInRange(1, 5), heroY = this.game.input.activePointer.y + this.game.rnd.integerInRange(1, 5);
                    var gradient = this.shadowTexture.context.createRadialGradient(heroX, heroY, 100 * 0.3, heroX, heroY, radius);
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
                    this.shadowTexture.context.beginPath();
                    this.shadowTexture.context.fillStyle = gradient;
                    this.shadowTexture.context.arc(heroX, heroY, radius, 0, Math.PI * 2);
                    this.shadowTexture.context.fill();
                }
                this.nearBackgroundShadowed1.draw(this.shadowTexture, 0, 0, this.game.width, this.game.height, "multiply");
                this.nearBackgroundShadowed.alphaMask(this.nearBackgroundShadowed1, this.nearBackgroundShadowed);
                this.nearBackgroundShadowed.dirty = true;
            };
            Level01.prototype.update = function () {
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
                this.enemies = this.enemies.filter(function (e) { return e.position.x > -100; });
                if (Math.random() < 0.02 * (1 + this.score / 1000)) {
                    this.enemies.push(new Client.Enemy(this.game, Math.floor(Math.random() * 12), Math.random() > .1 ? "#ccff00" : this.player.color));
                }
                if (this.crash > 0) {
                    this.crash -= this.game.time.elapsed / 1000;
                    if (this.crash <= 0) {
                        this.player.position.x = 100;
                        this.scoreText.setStyle({ font: "35px Tahoma", fill: this.player.color, align: "right" });
                    }
                }
                else {
                    this.score += 1;
                    for (var i = 0; i < this.enemies.length; i++) {
                        var enemy = this.enemies[i];
                        if (this.player.position.distance(enemy.position) < (this.game.height / 12) * .85) {
                            if (this.player.color === enemy.color) {
                                this.score += 100;
                            }
                            else {
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
                }
                else {
                    this.highScoreText.setStyle({ font: "35px Tahoma", fill: "#777777", align: "right" });
                }
                this.scoreText.text = ("00000000" + this.score).substr(-7);
                this.highScoreText.text = ("00000000" + this.highScore).substr(-7);
                this.updateShadowTexture();
                for (var i = 0; i < this.toneTexts.length; i++) {
                    this.toneTexts[i].setStyle({ font: "20px Tahoma", fill: "#777777", align: "left" });
                }
                this.toneTexts[this.player.targetTrack].setStyle({ font: "20px Tahoma", fill: this.player.color, align: "left" });
                this.lastInputText.text = this.player.lastInputText;
                this.lastInputText.setStyle({
                    font: "20px Tahoma",
                    fill: this.player.lastInputTextActual ? this.player.color : "#777777",
                    align: "right"
                });
            };
            return Level01;
        }(Phaser.State));
        Client.Level01 = Level01;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
//# sourceMappingURL=game.js.map