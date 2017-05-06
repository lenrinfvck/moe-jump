const gameState = {
    global: {
        // 全局速度
        speed: 10,
        // 得分
        points: 0,
        level: 0,
    },
    staticConfig: {
        stage: {
            width: 900,
            height: 360
        },
        // 视差速度偏差值
        speedOffset: {
            //player: 1,
            obstacle: 1,
            floor: 1,
            winBehind: 0.9,
            winFront: 1.1,
            bg: 0.05,
        },
        // 最大跳跃高度
        player: {
            maxJump: 150,
            hitW: 36,
            htiH: 100,
            scaleX: -0.5,
            scaleY: 0.5,
            x: 100,
        },
        obstacle: {
            // 上方障碍物的偏移位置
            y2: -200
        },
        playerFrame: {
            frames: {
                width: 210,
                height: 260
            },
            animations: {
                run: [0, 16]
            },
            framerate: 20
        }
    }
};
let config = gameState.staticConfig;
// 计算属性
config.baseline = config.stage.height - 30;

export default gameState;