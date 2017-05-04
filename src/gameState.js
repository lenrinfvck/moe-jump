const gameState = {
    global: {
        speed: 10
    },
    staticConfig: {
        // 视察速度偏差值
        speedOffset: {
            //player: 1,
            obstacle: 1,
            bg: 0.1,
            floor: 1,
            winBehind: 1,
            winFront: 1
        }
    }
};

export default gameState;