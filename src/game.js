import 'createjs';
import Unit from 'src/unit.js';
import gameState from 'src/gameState.js';

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
        this.stage = stage;
        this.state = 'ready';
        this.pointLine = gameState.staticConfig.player.x;
        this.obstacles = [];
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
        this.player.state = 'over';
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
        // this.player.update();
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
        let cur = new Obstacle(createjs.loadStorage.images['dango_1'], this);
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

export default Game;