import 'createjs';
import gameState from 'src/gameState.js'

// 循环背景
class LoopBg extends createjs.Container{
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
class LoopBgWin extends createjs.Container {
    constructor(texture, stage, speedOffset) {
        super();
        this.texture = texture;
        this.speedOffset = speedOffset || 1;
        this.curStage = stage;
        this.creatWin();
    }

    creatWin() {
        let texture = this.texture;
        let config = gameState.staticConfig;
        let win = new createjs.Bitmap(texture);
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

export {LoopBg, LoopBgWin};