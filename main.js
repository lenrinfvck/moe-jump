'use strict'

import 'style/main.less';

// import 'myLib/rem.module.js';
import 'createjs';
import Loader from 'src/loadStorage.js';
import Unit from 'src/unit.js';
import manifest from 'src/loader_manifest.json';
import gameState from 'src/gameState.js';

let resources;
let stage = new createjs.Stage('moe-stage');
let bkStage = new createjs.StageGL('moe-background');
let floorStage = new createjs.StageGL('moe-floor');
floorStage.background = 'rgba(0, 0, 0, 0)';

// Test Layer
/*(function() {
    let stageTest = new createjs.Stage('moe-test');
    let text = new createjs.Text('0000', '20px Arial', '#ffffff');
    text.x = 100;
    text.y = 200;
    stageTest.addChild(text);
    createjs.Ticker.on('tick', stageTest);
})();*/

let loader = new Loader(false);
let game, player, allBg;

let justGo = false;
let debug = false;

loader.addEventListener('progress', function(evt) {
    document.querySelector('.fullwidth .expand').style.width = evt.progress * 100 + '%';
});
loader.addEventListener('complete', function() {
    init();
    setTimeout(() => {
        document.querySelector('.progress').style.opacity = 0;
        document.querySelector('.ctrl-con').style.display = 'block';
    }, 500);
});
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
        // player - shadow
        this.shadow = this.clone();
        this.shadow.maxJump = config.player.maxJump;
        this.shadow.scaleY = -this.scaleY;
        this.shadow.x = config.player.x + 150;
        this.shadow.y = config.baseline - this.height / 2 - 20;
        this.shadow.vy = 0;
        this.shadow.alpha = 0.8;
        this.shadow.shadow = new createjs.Shadow('rgba(0,0,0,0.5)', 0, 0, 10);
    }

    jump() {
        if(this.state == 'run') {
            this.state = 'jumpUp';
            this.vy = -this.maxJump / 10;
            this.oriY = this.y;
            this.stop();

            this.shadow.state = 'jumpUp';
            this.shadow.vy = this.maxJump / 10;
            this.shadow.oriY = this.shadow.y;
            this.shadow.stop();
        }
    }
    // TODO: 可使用tween改写
    update() {
        /*let resY = this.y + this.vy;
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
        this.y = resY + this.vy;*/
        posRes(this);
        posRes2(this.shadow, true);
        function posRes(player, reverse) {
            let resY = player.y + player.vy;
            let offset = reverse ? player.oriY - resY + player.maxJump : resY - player.oriY + player.maxJump;
            if(player.vy < 0) {
                player.vy = -offset / 10;
                player.vy < -1 || (player.vy = -1);
            }else if(player.vy > 0) {
                player.vy = offset / 10;
                player.vy > 1 || (player.vy = 1);
            }
            if(player.state === 'jumpUp' && reverse ? resY >= player.oriY + player.maxJump : resY <= player.oriY - player.maxJump) {
                player.state = 'jumpDown';
                player.vy = -player.vy;
                player.play();
            }else if(player.state === 'jumpDown' && reverse ? resY <= player.oriY : resY >= player.oriY) {
                player.state = 'run';
                player.vy = 0;
                resY = player.oriY;
            }
            player.y = resY + player.vy;
        }
        function posRes2(player) {
            let resY = player.y + player.vy;
            let offset = player.oriY - resY + player.maxJump;
            if(player.vy < 0) {
                player.vy = -offset / 10;
                player.vy < -1 || (player.vy = -1);
            }else if(player.vy > 0) {
                player.vy = offset / 10;
                player.vy > 1 || (player.vy = 1);
            }
            if(player.state === 'jumpUp' && resY >= player.oriY + player.maxJump) {
                player.state = 'jumpDown';
                player.vy = -player.vy;
                player.play();
            }else if(player.state === 'jumpDown' && resY <= player.oriY) {
                player.state = 'run';
                player.vy = 0;
                resY = player.oriY;
            }
            player.y = resY + player.vy;
        }
    }
}
class Obstacle extends createjs.Bitmap {
    constructor(texture, game) {
        let config = gameState.staticConfig;
        super(texture);
        this.game = game;
        this.scaleX = 60 / texture.width;
        this.scaleY = 60 / texture.height;
        this.width = texture.width * this.scaleX;
        this.height = texture.height * this.scaleY;
        this.x = config.stage.width + 800 * Math.random();
        this.y = config.baseline - this.height + 10;
        this.alpha = 1;
        this.shadow = new createjs.Shadow('rbga(0, 0, 0, 1)', 10, 10, 5);
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
            game.obCon.removeChild(this);
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
        this.pointText = new createjs.Text('0', '20px Arial', '#ffffff');
        this.pointText.x = stage.width - 100;
        this.pointText.y = 20;
        this.stage.addChild(this.pointText);
        this.obCon = new createjs.Container();
        this.stage.addChild(this.obCon);
    }

    play() {
        let _this = this,
            globalData = gameState.global;

        _this.obstacles.forEach(function(item) {
            _this.obCon.removeChild(item);
        });
        _this.obstacles = [];
        globalData.points = 0;
        globalData.level = 0;
        globalData.speed = 10;
        _this.pointText.text = '0000';
        _this.state = 'playing';
        _this.player.play();
        _this.player.shadow.play();
    }

    over() {
        this.state = 'over';
        gameState.global.speed = 0;
        this.player.stop();
        this.player.shadow.stop();
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
            }
        }
        if(this.state !== 'playing') {
            return;
        }
        this.pointText.text = parseInt(globalData.points / 50);
        this.levelUp();
    }
    //添加障碍物
    addObstacle() {
        if(this.state !== 'playing') {
            return;
        }
        let cur = new Obstacle(resources['dango_1'], this);
        this.obCon.addChild(cur);
        this.obstacles.push(cur);
    }

    levelUp() {
        let globalData = gameState.global;
        this.levelPoint[globalData.level + 1] || this.levelPoint.push(this.levelPoint.slice(-1)[0] * 10);
        if(globalData.points >= this.levelPoint[globalData.level]) {
            globalData.level++;
        }
        globalData.speed = 10 + 5 * globalData.level;
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
        this.loopHeight = texture.height;
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
class winloopBg extends createjs.Container {
    constructor(texture, stage, speedOffset) {
        super();
        this.texture = texture;
        this.speedOffset = speedOffset || 1;
        this.curStage = stage;
        this.creatWin();
        // this.y = config.baseline - this.height;
    }

    creatWin() {
        let texture = this.texture;
        let config = gameState.staticConfig;
        let win = new createjs.Bitmap(texture);
        // win.scaleX = this.speedOffset;
        // win.scaleY = this.speedOffset;
        if(this.curStage.width === config.stage.width) {
            win.scaleX = 0.78;
            win.scaleY = 0.78;
        }
        win.width = texture.width;
        win.height = texture.height;
        win.x = this.curStage.width;
        this.addChild(win);
    }
    update() {
        let globalData = gameState.global,
            vx = globalData.speed * this.speedOffset;
        let _this = this;
        _this.children.forEach((item) => {
            item.x -= vx;
            if(item.x <= -item.width) {
                _this.removeChild(item);
                this.creatWin();
            }
        })
        
    }
}

// 绘制背景
function createBg(stage) {
    let allBg = [],
        allFloor = [];
    let config = gameState.staticConfig;
    let bg_sky = new loopBg(resources['sky'], stage, config.speedOffset.bg);
    let bg_floor = new loopBg(resources['floor'], floorStage, config.speedOffset.floor);
    let bg_win = new winloopBg(resources['win'], stage, config.speedOffset.winBehind);
    let bg_win_shadow = new winloopBg(resources['win_s'], floorStage, config.speedOffset.floor);
    let bg_win_front = new winloopBg(resources['win_front'], stage, config.speedOffset.floor);
    bg_sky.width = stage.width;
    bg_sky.height = stage.height;
    bkStage.compositeOperation = 'lighter';
    bg_win_shadow.alpha = 0.8;
    /*bg_floor.bg_1.y = stage.height / 2 - bg_floor.loopHeight / 2;
    bg_floor.bg_2.y = stage.height / 2 - bg_floor.loopHeight / 2;
    bg_win_shadow.y = stage.height / 2 - bg_floor.loopHeight / 2;*/
    bg_floor.addChild(bg_win_shadow);
    // bg_floor.scaleX = 0.8;
    // bg_floor.scaleY = 0.8;
    // bg_floor.addChild(player.clone());
    allBg.push(bg_sky);
    allBg.push(bg_win);
    allBg.push(bg_win_front);
    allFloor.push(bg_floor);
    allFloor.push(bg_win_shadow);
    allBg.forEach((item) => {
        bkStage.addChild(item);
    });
    allFloor.forEach((item) => {
        floorStage.addChild(item);
    });
    let floorDom = new createjs.DOMElement(document.querySelector('#bg-floor'));
    stage.addChild(floorDom);
    bg_win_front.y = -200;
    bg_win_front.scaleX = 1.5;
    bg_win_front.scaleY = 1.5;
    stage.addChild(bg_win_front);
    floorDom.y = 200;
    bg_win.x = 30;
    bg_win.y = -460;

    return allBg.concat(allFloor);
}

function init() {
    resources = createjs.loadStorage.images;
    let key_space = Unit.keyboard(32);
    let config = gameState.staticConfig;
    floorStage.width = 1200;
    floorStage.height = 360;
    player = new Player(Object.assign({
        images: [resources['jump']]
    }, config.playerFrame));
    stage.width = config.stage.width;
    stage.height = config.stage.height;
    game = new Game(stage, player);
    allBg = createBg(stage);
    stage.addChild(player);
    floorStage.addChild(player.shadow);

    key_space.press = () => {
        if(game.state === 'ready') {
            game.play();
        }
        player.jump()
    };
    key_space.release = () => player.jump();
    // phone
    document.querySelector('body').addEventListener('touchstart', function(e) {
        e.preventDefault();
        if(game.state === 'ready') {
            game.play();
        }
        player.jump();
    });
    // game.play();
    /*document.querySelector('#restart').addEventListener('click', function() {
        game.play();
    })*/
    //开始循环
    createjs.Ticker.framerate = 60;
    createjs.Ticker.on('tick', gameLoop);

    //逐帧测试
    let key_next = Unit.keyboard(39);
    // let key_pre= Unit.keyboard(37);
    key_next.press = () => {
        justGo = true;
    }
}


function gameLoop(evt) {
    if(debug && !justGo) {
        return;
    }else {
        justGo = false;
    }
    if(game.state === 'over') {
        // game.state = 'ready';
        console.log(gameState.global.points, parseInt(gameState.global.points / 50));
    }
    game.update();
    allBg.forEach((item) => {
        item.update();
    });
    // 惊了，不传evt会导致内部spriteSheet的帧率与stage同步
    floorStage.update(evt);
    bkStage.update(evt);
    stage.update(evt);
}

