import 'createjs';

/**
 * 创建资源库
 * 每次loader触发fileload时把图片文件按id加入资源库createjs.loadStorage.images 
 * @class
 * @param  {Num} oriArguments 原createjs.LoadQueue的参数 
 * @return {Obj} 返回createjs.LoadQueue的结果，即loader 
 */
class Loader extends createjs.LoadQueue {
    constructor(oriArguments) {
        let loader = super(oriArguments);
        loader.addEventListener('fileload', updateLoadStorage);
        function updateLoadStorage(evt) {
            if(!createjs) {
                return;
            }
            createjs.loadStorage || (createjs.loadStorage = {});
            if(evt.item.type == 'image') {
                createjs.loadStorage.images || (createjs.loadStorage.images = {});
                createjs.loadStorage.images[evt.item.id] = evt.result;
            }
        }
        return loader;
    }
}

export default Loader;