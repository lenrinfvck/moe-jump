import 'createjs';
import gameState from 'src/gameState.js';

/**
 * player构造函数
 * @class
 * @param {Obj} createjs.Sprite支持的所有材质;
 */
class Player extends createjs.Sprite {
    constructor(texture) {
        let spriteSheet = new createjs.SpriteSheet(texture);
        let config = gameState.staticConfig;
        super(spriteSheet, 'run');
        // 继承配置
        Object.assign(this, config.player);
        window.player = this;
        this.width = texture.frames.width * this.scaleY;
        this.height = texture.frames.height * this.scaleY;
        this.regX = this.width;
        this.state = 'run';
        this.y = config.baseline - this.height;
        this.oriY = this.y;
        // player - shadow
        this.shadow = this.clone();
        this.shadow.scaleY = -this.scaleY;
        this.shadow.x = config.player.x + 150;
        this.shadow.y = config.baseline - this.height / 2 - 10;
        this.shadow.alpha = 0.8;
        // 阴影边缘模糊
        this.shadow.shadow = new createjs.Shadow('rgba(0,0,0,0.5)', 0, 0, 10);
    }
    // 角色跳跃，控制人物和影子的位置变化动画
    jump() {
        let _this = this;
        let _shadow = this.shadow;
        if (this.state == 'run') {
            this.state = 'jump';
            this.oriY = this.y;
            this.stop();
            this.curAnime =  createjs.Tween.get(this)
                .to({ y: _this.oriY - _this.maxJump }, 300, createjs.Ease.quartOut)
                .to({ y: _this.oriY }, 250, createjs.Ease.quartIn)
                .call(() => {
                    _this.state = 'run';
                    _this.play();
                });

            this.shadow.oriY = this.shadow.y;
            this.curAnimeShadow = createjs.Tween.get(_shadow)
                .to({ y: _shadow.oriY + _this.maxJump }, 300, createjs.Ease.quartOut)
                .to({ y: _shadow.oriY }, 250, createjs.Ease.quartIn);
        }
    }
    // 开始动画帧以及跳跃动画
    play() {
        super.play();
        this.shadow.play();
        this.curAnime && this.curAnime.play();
        this.curAnimeShadow && this.curAnimeShadow.play();
    }
    // 停止动画帧以及跳跃动画
    stop() {
        super.stop();
        this.shadow.stop();
        this.curAnime && this.curAnime.setPaused(true);
        this.curAnimeShadow && this.curAnimeShadow.setPaused(true);
    }
}

export default Player;
