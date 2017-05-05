'use strict'

import 'style/main.less';

// import 'myLib/rem.module.js';
import 'createjs';
import Loader from 'src/loadStorage.js';
import Unit from 'src/unit.js';
import manifest from 'src/loader_manifest.json';
import gameState from 'src/gameState.js';

let resources;
let stage = new createjs.StageGL('moe-stage');

// Test Layer
(function() {
    let stageTest = new createjs.Stage('moe-test');
    let text = new createjs.Text('0000', '20px Arial', '#ffffff');
    text.x = 100;
    text.y = 200;
    stageTest.addChild(text);
    createjs.Ticker.on('tick', stageTest);
})();

let loader = new Loader(false);
let game, player, allBg;

loader.addEventListener('complete', init);
loader.loadManifest(manifest);

// for debug
window.loader = loader;
window.stage = stage;
window.gameState = gameState;

class Player extends createjs.Sprite{
    constructor(texture) {
        let spriteSheet = new createjs.SpriteSheet(texture);
        let config = gameState.staticConfig;
        super(spriteSheet, 'run');
        // 继承配置
        Object.assign(this, config.player);
        this.width = texture.frames.width * this.scaleY;
        this.height = texture.frames.height * this.scaleY;
        this.vy = 0;
        this.regX = this.width;
        this.state = 'run';
        this.y = config.baseline - this.height;
        this.oriY = this.y;
    }

    jump() {
        if(this.state == 'run') {
            this.state = 'jumpUp';
            this.vy = -this.maxJump / 10;
            this.oriY = this.y;
            this.stop();
        }
    }
    // TODO: 可使用tween改写
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
            this.play();
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
        let config = gameState.staticConfig;
        super(texture);
        this.game = game;
        this.width = texture.width;
        this.height = texture.height;
        this.x = config.stage.width + 800 * Math.random();
        this.y = config.baseline - this.height;
        if(gameState.global.level >= 1) {
            // TODO: 0.9系数随level增加
            Math.random() > 0.8 && (this.y += config.obstacle.y2);
        }
    }
    update() {
        let game = this.game,
            globalData = gameState.global,
            vx = globalData.speed;
        this.x -= vx;
        if(this.x <= -this.width) {
            game.stage.removeChild(this);
            game.obstacles.splice(game.obstacles.indexOf(this), 1);
        }
    }
}
class Game {
    constructor(stage, player) {
        this.player = player;
        // this.con3d = con3d;
        this.stage = stage;
        this.state = 'ready';
        // this.baseline = stage.height - 60;
        this.pointLine = gameState.staticConfig.player.x;
        this.obstacles = [];
        // this.point = 0;
        // this.level = 0;
        this.levelPoint = [6000, 12000, 20000, 32000];
        this.pointText = new createjs.Text('0000', '20px Arial', '#ffffff');
        this.pointText.x = stage.width - 100;
        this.pointText.y = 20;
        this.stage.addChild(this.pointText);
    }

    play() {
        let _this = this,
            globalData = gameState.global;

        _this.obstacles.forEach(function(item) {
            _this.stage.removeChild(item);
        });
        _this.obstacles = [];
        globalData.points = 0;
        globalData.level = 0;
        globalData.speed = 10;
        _this.pointText.text = '0000';
        _this.state = 'playing';
        _this.player.play();
    }

    over() {
        this.state = 'over';
        gameState.global.speed = 0;
        this.player.stop();
        console.log('over');
    }

    update() {
        if(this.state !== 'playing') {
            return;
        }
        let globalData = gameState.global;
        globalData.points += globalData.speed;

        if(this.obstacles.length > 0) {
            let last = this.obstacles.slice(-1)[0];
            // 越过障碍时追加新障碍
            if(this.pointLine - 100 - last.x >= 0) {
                this.addObstacle();
            }
        }else {
            this.addObstacle();
        }

        // 刷新子元素
        this.player.update();
        for(let item of this.obstacles) {
            item.update();
            if(Unit.hitTest(this.player, item)) {
                this.over();
                return;
            }
        }

        this.pointText.text = parseInt(globalData.points / 50);
        this.levelUp();
    }
    //添加障碍物
    addObstacle() {
        let cur = new Obstacle(resources['box'], this);
        this.stage.addChild(cur);
        this.obstacles.push(cur);
    }

    levelUp() {
        let globalData = gameState.global;
        this.levelPoint[globalData.level + 1] || this.levelPoint.push(this.levelPoint.slice(-1)[0] * 10);
        if(globalData.points >= this.levelPoint[globalData.level]) {
            globalData.level++;
        }
        globalData.speed = 10 + 3 * globalData.level;
    }
}

// bk - container 只与globalSpeed有关
// 循环背景
class loopBg extends createjs.Container{
    constructor(texture, stage, speedOffset) {
        super();
        this.bg_1 = new createjs.Bitmap(texture);
        this.bg_2 = new createjs.Bitmap(texture);
        this.addChild(this.bg_2);
        this.addChild(this.bg_1);
        this.curStage = stage;
        this.speedOffset = speedOffset;
        this.loopWidth = texture.width;
        this.bg_2.x = this.loopWidth;
    }

    update() {
        let speed = gameState.global.speed * this.speedOffset;
        if(this.bg_1.x <= -this.loopWidth) {
            this.bg_1.x = this.loopWidth + this.bg_2.x;
        }else if(this.bg_2.x <= -this.loopWidth) {
            this.bg_2.x = this.loopWidth + this.bg_1.x;
        }
        this.bg_1.x -= speed;
        this.bg_2.x -= speed;
    }
}

// 绘制背景
function createBg(stage) {
    let allBg = [];
    let config = gameState.staticConfig;
    let bg_sky = new loopBg(resources['sky'], stage, config.speedOffset.bg);
    let bg_floor = new loopBg(resources['floor'], stage, config.speedOffset.floor);
    bg_sky.width = stage.width;
    bg_sky.height = stage.height;
    bg_floor.y = config.baseline;
    allBg.push(bg_sky);
    allBg.push(bg_floor);
    allBg.forEach((item) => {
        stage.addChild(item);
    });
    return allBg;
}

function init() {
    resources = createjs.loadStorage.images;
    let key_space = Unit.keyboard(32);
    let config = gameState.staticConfig;
    player = new Player(Object.assign({
        images: [resources['jump']]
    }, config.playerFrame));
    stage.width = config.stage.width;
    stage.height = config.stage.height;
    allBg = createBg(stage);
    stage.addChild(player);
    game = new Game(stage, player);
    key_space.press = () => player.jump();
    key_space.release = () => player.jump();
    game.play();
    document.querySelector('#restart').addEventListener('click', function() {
        game.play();
    })
    //开始循环
    createjs.Ticker.framerate = 60;
    createjs.Ticker.on('tick', gameLoop);
}


function gameLoop(evt) {
    if(game.state === 'over') {
        game.state = 'ready';
        console.log(gameState.global.points, parseInt(gameState.global.points / 50));
    }
    game.update();
    allBg.forEach((item) => {
        item.update();
    });
    // 惊了，不传evt会导致内部spriteSheet的帧率与stage同步
    stage.update(evt);
}

