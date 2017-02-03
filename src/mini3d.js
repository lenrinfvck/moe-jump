import 'PIXI';

let Container3d = function() {
    this.view = new PIXI.DisplayObjectContainer; 
    this.children = [];
    this.focalLength = 400;
    this.position3d = {
        x: 0,
        y: 0,
        z: 0
    }; 
    this.rotation3d = {
        x: 0,
        y: 0,
        z: 0
    };
};
Container3d.constructor = Container3d;
Container3d.prototype.addChild = function(child) {
    child.position3d || (child.position3d = {
        x: 0,
        y: 0,
        z: 0
    });
    child.anchor.set(0.5);
    this.view.addChild(child);
    this.children.push(child);
};
Container3d.prototype.update = function() {
    // t - posx; e - posy; i - posz; c - xSin; d - xCos; p - ySin; f - yCos; m - zSin; v - zCos;
    let posx, posy, posz, n, o, s, a, h, l, u, scaleX, scaleY,
        xSin = Math.sin(this.rotation3d.x), 
        xCos = Math.cos(this.rotation3d.x), 
        ySin = Math.sin(this.rotation3d.y), 
        yCos = Math.cos(this.rotation3d.y), 
        zSin = Math.sin(this.rotation3d.z), 
        zCos = Math.cos(this.rotation3d.z);

    for (let j = 0; j < this.children.length; j++) {
        let child = this.children[j];
        posx = child.position3d.x - this.position3d.x;
        posy = child.position3d.y - this.position3d.y;
        posz = child.position3d.z - this.position3d.z;
        n = xCos * posy - xSin * posz;
        o = xSin * posy + xCos * posz;
        a = yCos * o - ySin * posx;
        s = ySin * o + yCos * posx;
        h = zCos * s - zSin * n; 
        l = zSin * s + zCos * n; 
        u = this.focalLength / (this.focalLength + a); 
        posx = h * u; 
        posy = l * u; 
        posz = a;
        //模拟X,Y轴旋转
        //scaleRatio - 缩放比例 2
        //scaleOffset - 缩放偏移 new PIXI.Point(1, 1)
        scaleX = scaleY = u * child.scaleRatio; 
        scaleX *= child.scaleOffset.x; 
        scaleY *= child.scaleOffset.y;
        child.scale.x = scaleX * child.scale2d.x;
        child.scale.y = scaleY * child.scale2d.y;
        child.depth = -posz;
        child.position.x = posx; 
        child.position.y = posy;
    }
    this.view.children.sort(sortByZindex);
    function sortByZindex(a, b) {
        return a.depth - b.depth
    }
};
  
let Sprite3d = function(textrue) {
    PIXI.Sprite.call(this, textrue);
    this.position3d = {
        x: 0,
        y: 0,
        z: 0
    };
    this.scale2d = {
        x: 1,
        y: 1
    }
    this.scaleRatio = 1;
    this.scaleOffset = new PIXI.Point(1, 1);
};
Sprite3d.constructor = Container3d;
Sprite3d.prototype = new PIXI.Sprite();
Sprite3d.prototype.scaleSet = function(x, y) {
    this.scale2d.x = x;
    this.scale2d.y = y;
};

export default {
    Container3d,
    Sprite3d
}
