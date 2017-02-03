/*
 * PIXI常用辅助方法
 * 收集自: https://github.com/kittykatattack/learningPixi#checkingcollisions
 */

/**
 * 按键绑定:
 *     let key_enter = new keyboard(13);
 *     key_enter.press = cb; //按键时触发
 *     key_enter.release = cb; //松键时触发
 * @param  {Num} keyCode 按键码
 * @return {Obj}         创建一个方便写回调的对象
 */
function keyboard(keyCode) {
    let key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    key.downHandler = function(event) {
        if (event.keyCode === key.code) {
            key.isUp && key.press && key.press();
            key.isDown = true;
            key.isUp = false;
        }
        event.preventDefault();
    };

    key.upHandler = function(event) {
        if (event.keyCode === key.code) {
            key.isDown && key.release && key.release();
            key.isDown = false;
            key.isUp = true;
        }
        event.preventDefault();
    };

    window.addEventListener(
        'keydown', key.downHandler.bind(key), false
    );
    window.addEventListener(
        'keyup', key.upHandler.bind(key), false
    );
    return key;
}

/**
 * 碰撞检测
 * @param  {Sprite} r1 PIXI显示元素
 * @param  {Sprite} r2 PIXI显示元素
 * @return {boolean}    是否重叠
 */
function hitTest(r1, r2) {
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
    hit = false;
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    if (Math.abs(vx) < combinedHalfWidths) {
        if (Math.abs(vy) < combinedHalfHeights) {
            hit = true;
        } else {
            hit = false;
        }
    } else {
        hit = false;
    }
    return hit;
}

export default {
    keyboard,
    hitTest
}
