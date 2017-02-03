'use strict'

//https://codereview.chromium.org/545973003/patch/260001/270026
//http://www.trex-game.skipser.com/
import 'style/main.less';

// import 'myLib/rem.module.js';
import 'PIXI';
import mini3d from 'src/mini3d.js';
import Unit from 'src/unit.js';

let renderer = PIXI.autoDetectRenderer(1000, 360, {transparent: true});
let stage = new PIXI.Container();
let con3d = new mini3d.Container3d();
let con = new PIXI.Container;
let resources = PIXI.loader.resources;
let game, player;

document.body.appendChild(renderer.view);
stage.addChild(con);
// renderer.autoResize = true;
// renderer.resize(window.innerWidth, window.innerHeight);

PIXI.loader
    .add('qibi', './img/qibi.png')
    .add('box', './img/box.png')
    .load(init);

class Game {
    constructor(con, player) {
        this.player = player;
        // this.con3d = con3d;
        this.con = con;
        this.state = 'ready';
        this.globalSpeed = 10;
        this.baseline = renderer.height - 60;
        this.pointLine = 100;
        this.obstacles = [];
        this.point = 0;
        this.level = 0;
        this.levelPoint = [10000, 15000, 30000, 40000];
        this.pointText = new PIXI.Text('0000', {fontFamily: "Arial", fontSize: 16, fill: 'white'});
        this.pointText.x = renderer.width - 100;
        this.pointText.y = 20;
        this.con.addChild(this.pointText);
    }

    play() {
        this.state = 'playing';
    }

    over() {
        this.state = 'over';
        console.log('over');
    }

    update() {
        if(this.state === 'over') {
            return false;
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
        let cur = new Obstacle(resources['box'].texture, this);
        con.addChild(cur);
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

class Player extends PIXI.Sprite {
    constructor(texture) {
        super(texture);
        this.animeSpeed = 1;
        this.vy = 0;
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
class Obstacle extends PIXI.Sprite {
    constructor(texture, game) {
        super(texture);
        this.x = renderer.width + 500 * Math.random();
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

function init() {
    let key_space = Unit.keyboard(32);
    player = new Player(resources['qibi'].texture);
    // stage.addChild(player);
    con.addChild(player);
    game = new Game(con, player);
    player.y = game.baseline - player.height;
    player.x = game.pointLine;
    key_space.press = () => player.jump();
    key_space.release = () => player.jump();
    /*let test = new Obstacle(resources['box'], game);
    test.position3d = {x: 300, y: 100, z: 0};
    con3d.addChild(test);*/
/*    player.interactive = true;
    player.buttonMode = true;
    player.click = (e) => console.log(e));*/
    gameLoop();
}


function gameLoop() {
    if(game.state === 'over') {
        console.log(game.point);
    }else {
        requestAnimationFrame(gameLoop);
    }
    game.update();
    renderer.render(stage);
}

