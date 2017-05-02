'use strict'

//https://codereview.chromium.org/545973003/patch/260001/270026
//http://www.trex-game.skipser.com/
import 'style/main.less';

// import 'myLib/rem.module.js';
import 'createjs';
// import mini3d from 'src/mini3d.js';
import Unit from 'src/unit.js';
import manifest from 'src/loader_manifest.json';

// let renderer = PIXI.autoDetectRenderer(1000, 360, {transparent: true});
// let stage = new PIXI.Container();
let resources;
let stage = new createjs.StageGL('moe-stage');
let loader = new createjs.LoadQueue(false);

// let con3d = new mini3d.Container3d();
// let con = new PIXI.Container;
// let resources = PIXI.loader.resources;
let game, player;


// document.body.appendChild(renderer.view);
// renderer.autoResize = true;
// renderer.resize(window.innerWidth, window.innerHeight);

loader.addEventListener('fileload', updateLoadStorage);
loader.addEventListener('complete', init);
loader.loadManifest(manifest);
window.loader = loader;
/*PIXI.loader
    .add('qibi', './img/qibi.png')
    .add('box', './img/box.png')
    .load(init);*/
function updateLoadStorage(evt) {
    if(!createjs) {
        return;
    }
    createjs.loadStorage || (createjs.loadStorage = {});
    if(evt.item.type == 'image') {
        createjs.loadStorage.images || (createjs.loadStorage.images = {});
        createjs.loadStorage.images[evt.item.id] = evt.result;
    }
}

class Player extends createjs.Sprite {
    constructor(texture) {
        let spriteSheet = new createjs.SpriteSheet(texture);
        super(spriteSheet, 'run');
        this.animeSpeed = 1;
        this.width = texture.frames.width;
        this.height = texture.frames.height;
        this.vy = 0;
        this.regX = this.width;
        this.scaleX = -1;
        this.maxJump = 150;
        this.state = 'run';
        this.oriY = this.y;
    }

    jump() {
        if(this.state == 'run') {
            this.state = 'jumpUp';
            this.vy = -this.maxJump / 10;
            this.oriY = this.y;
        }
    }
    update() {
        let resY = this.y + this.vy;
        let offset = resY - this.oriY + this.maxJump;
        if(this.vy < 0) {
            this.vy = -offset / 10;
            this.vy < -1 || (this.vy = -1);
        }else if(this.vy > 0) {
            this.vy = offset / 10;
            this.vy > 1 || (this.vy = 1);
        }
        if(this.state === 'jumpUp' && resY <= this.oriY - this.maxJump) {
            this.state = 'jumpDown';
            this.vy = -this.vy;
        }else if(this.state === 'jumpDown' && resY >= this.oriY) {
            this.state = 'run';
            this.vy = 0;
            resY = this.oriY;
        }
        this.y = resY + this.vy;
    }
}
class Obstacle extends createjs.Bitmap {
    constructor(texture, game) {
        super(texture);
        this.width = texture.width;
        this.height = texture.height;
        this.x = stage.width + 500 * Math.random();
        this.y = game.baseline - this.height;
        if(game.level >= 1) {
            Math.random() > 0.9 && (this.y -= 150);
        }
        this.vx = game.globalSpeed || 1;
    }
    update() {
        this.x -= this.vx;
        if(this.x <= -100) {
            stage.removeChild(this);
            game.obstacles.splice(game.obstacles.indexOf(this), 1);
        }
    }
}
class Game {
    constructor(con, player) {
        this.player = player;
        // this.con3d = con3d;
        this.con = con;
        this.state = 'ready';
        this.globalSpeed = 10;
        this.baseline = stage.height - 60;
        this.pointLine = 100;
        this.obstacles = [];
        this.point = 0;
        this.level = 0;
        this.levelPoint = [10000, 15000, 30000, 40000];
        this.pointText = new createjs.Text('0000', '16px Arial', 'white');
        this.pointText.x = stage.width - 100;
        this.pointText.y = 20;
        this.con.addChild(this.pointText);
    }

    play() {
        var _this = this;
        this.obstacles.forEach(function(item) {
            _this.con.removeChild(item);
        });
        this.obstacles = [];
        this.point = 0;
        this.level = 0;
        this.pointText.text = '0000';
        this.state = 'playing';
    }

    over() {
        this.state = 'over';
        console.log('over');
    }

    update() {
        if(this.state !== 'playing') {
            return;
        }
        this.point += this.globalSpeed;
        this.player.update();
        if(this.obstacles.length > 0) {
            let last = this.obstacles.slice(-1)[0];
            if(this.pointLine + 300 - last.x >= 0) {
                this.addObstacle();
            }
            if(last.x <= this.pointLine && this.addcout > this.point) {
                this.point++;
            }
        }else {
            this.addObstacle();
        }
        this.obstacles.forEach((item) => {
            item.update();
            if(Unit.hitTest(this.player, item)) {
                this.over();
            }
        });
        this.pointText.text = parseInt(this.point / 50);
        // this.con3d.update();
        this.levelUp();
    }
    //添加障碍物
    addObstacle() {
        let cur = new Obstacle(resources['box'], this);
        stage.addChild(cur);
        this.obstacles.push(cur);
    }

    levelUp() {
        this.levelPoint[this.level + 1] || this.levelPoint.push(this.levelPoint.slice(-1)[0] * 10);
        if(this.point >= this.levelPoint[this.level]) {
            this.level++;
        }
        this.globalSpeed = 10 + 3 * this.level;
    }
}

function init() {
    resources = createjs.loadStorage.images;
    let key_space = Unit.keyboard(32);
    player = new Player({
        images: [resources['jump']],
        frames: {
            width: 210,
            height: 260
        },
        animations: {
            run: [0, 16]
        },
        framerate: 10
    });
    stage.width = stage.canvas.width;
    stage.height = stage.canvas.height;
    stage.addChild(player);
    game = new Game(stage, player);
    player.y = game.baseline - player.height;
    player.x = game.pointLine;
    key_space.press = () => player.jump();
    key_space.release = () => player.jump();
    game.play();
    document.querySelector('#restart').addEventListener('click', function() {
        game.play();
    })
    //开始循环
    createjs.Ticker.setFPS(30);
    createjs.Ticker.on('tick', gameLoop);
    /*let test = new Obstacle(resources['box'], game);
    test.position3d = {x: 300, y: 100, z: 0};
    con3d.addChild(test);*/
/*    player.interactive = true;
    player.buttonMode = true;
    player.click = (e) => console.log(e));*/
    // gameLoop();
}


function gameLoop() {
    if(game.state === 'over') {
        game.state = 'ready';
        console.log(game.point);
    }
    game.update();
    stage.update();
}

