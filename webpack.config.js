var path = require('path');
// var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
// var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

module.exports = {
    // 入口
    entry: {
        main: './main',
    },
    // 输出
    output: {
        path: path.join(__dirname, './dist'),
        filename: '[name].js',
        publicPath: '/dist/'
    },
    module: {
        // 加载器
        loaders: [
            { test: /\.vue$/, loader: 'vue' },
            { test: /\.js$/, loader: 'babel', exclude: /node_modules/ },
            // { test: /\.css$/, loader: 'style!css'},
            // { test: /\.less/, loader: 'style!css!autoprefixer!less'},
            { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader')},
            { test: /\.less$/, exclude: /node_modules/, loader: ExtractTextPlugin.extract('style-loader', 'css!autoprefixer!less')},
            { test: /\.(png|jpg|gif)$/, loader: 'url-loader?limit=4096&name=./img/[hash].[ext]'},
            { test: /\.(html|tpl)$/, loader: 'html-loader' },
        ]
    },
    vue: {
        loaders: {
            css: 'style!css!autoprefixer!less'
        }
    },
    plugins: [
        new ExtractTextPlugin('style.css')
    ],
    babel: {
        presets: ['es2015'],
        plugins: [
            'transform-runtime'
        ]
    },
    resolve: {
        // require时省略的扩展名，如：require('module') 不需要module.js
        extensions: ['', '.js', '.vue'],
        // 别名
        alias: {
            // components: path.join(__dirname, './components'),
            // Vue: path.join(__dirname, './lib/vue/vue'),
            // VueRouter: path.join(__dirname, './lib/vue/vue-router.min.js'),
            // VueResource: path.join(__dirname, './lib/vue/vue-resource.min.js'),
            //jquery: path.join(__dirname, './lib/jquery.min.js'),
            lodash: path.join(__dirname, './lib/lodash.min.js'),
            hammerjs: path.join(__dirname, './lib/vue/hammer.min.js'),
            src: path.join(__dirname, './src'),
            style: path.join(__dirname, './style'),
            lib: path.join(__dirname, './lib'),
            myLib: path.join(__dirname, './lib/myLib'),
            myStyle: path.join(__dirname, './style/myStyle'),
        }
    },
    externals: {
        //'jquery': 'jQuery',
        zepto: 'Zepto',
    },
    // 开启source-map，webpack有多种source-map，在官网文档可以查到
    devtool: '#source-map'
};
