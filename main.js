'use strict'

import 'style/main.less';

// import 'myLib/rem.module.js';
import 'createjs';
import Loader from 'src/loadStorage.js';
import Unit from 'src/unit.js';
import manifest from 'src/loader_manifest.json';
import gameState from 'src/gameState.js';

import Player from 'src/player.js';
import Game from 'src/game.js';
import {LoopBg, LoopBgWin} from 'src/loopBg.js';

let resources;
const stage = new createjs.Stage('moe-stage', {transparent: true, antialias: true});
const bkStage = new createjs.StageGL('moe-background');
const floorStage = new createjs.StageGL('moe-floor');

const loader = new Loader(false);
const $ = (selector) => document.querySelector(selector);
let game, 
    player, 
    allBg;

let justGo = false,
    debug = false;

// 进度条加载
loader.addEventListener('progress', function(evt) {
    $('.fullwidth .expand').style.width = evt.progress * 100 + '%';
});
// 进度条加载完成
loader.addEventListener('complete', function() {
    gameInit();
    setTimeout(() => {
        $('.progress').style.opacity = 0;
        $('.ctrl-con').style.display = 'block';
    }, 500);
});
// 加载资源文件
loader.loadManifest(manifest);

// for debug
window.loader = loader;
window.stage = stage;
window.gameState = gameState;

// 绘制背景
function createBg(stage) {
    let allBg = [],
        allFloor = [];
    let config = gameState.staticConfig;
    let bg_sky = new LoopBg(resources['sky'], stage, config.speedOffset.bg);
    let bg_floor = new LoopBg(resources['floor'], floorStage, config.speedOffset.floor);
    let bg_win = new LoopBgWin(resources['win'], stage, config.speedOffset.winBehind);
    let bg_win_shadow = new LoopBgWin(resources['win_s'], floorStage, config.speedOffset.floor);
    let bg_win_front = new LoopBgWin(resources['win_front'], stage, config.speedOffset.floor);
    bg_sky.width = stage.width;
    bg_sky.height = stage.height;
    bkStage.compositeOperation = 'lighter';
    bg_win_shadow.alpha = 0.8;

    bg_floor.addChild(bg_win_shadow);

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
    let floorDom = new createjs.DOMElement($('#bg-floor'));
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

function gameInit() {
    resources = createjs.loadStorage.images;
    let key_space = Unit.keyboard(32);
    let config = gameState.staticConfig;
    floorStage.width = 1200;
    floorStage.height = 360;
    player = new Player(Object.assign({
        images: [resources['jump']]
    }, config.playerFrame), gameState);
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
    $('body').addEventListener('touchstart', function(e) {
        e.preventDefault();
        if(game.state === 'ready') {
            game.play();
        }
        player.jump();
    });
    // game.play();
    /*$('#restart').addEventListener('click', function() {
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

