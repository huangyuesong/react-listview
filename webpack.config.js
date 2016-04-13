/* jshint node: true */
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var JS2HtmlPlugin = require('js2html-webpack-plugin');
var devIp = require('dev-ip');

var env = process.env.NODE_ENV;
var ip = devIp()[0] || 'localhost';


var baseConfig = {
    context: path.join(__dirname),
    entry: './lib/ListView.js',
    output: {
        path: path.join(__dirname),
        filename: 'dist/react-listview.js',
        libraryTarget: 'commonjs',
        library: 'ReactListView'
    },
    resolve: {
        root: path.resolve('./node_modules'),
        fallback: path.join(__dirname, "node_modules")
    },
    module: {
        loaders: [
            {
                test: /\.scss$/,
                // Query parameters are passed to node-sass
                loader: 'style!css!sass?outputStyle=expanded&' +
                'includePaths[]=' + (path.resolve(__dirname, './bower_components')) + '&' +
                'includePaths[]=' + (path.resolve(__dirname, './node_modules'))
            },
            {
                test: /(\.js)|(\.jsx)$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['react', 'es2015', 'stage-0']
                }
            }
        ]
    }
};


if (env === 'development') {
    baseConfig.output = {
        path: path.join(__dirname),
        filename: 'react-listview.js'
    };

    baseConfig.plugins = [
        new HtmlWebpackPlugin({
            template: path.resolve('./examples/simple/index.html'),
            hash: true,
            filename: 'index.html',
            inject: 'body'
        })
    ];
    baseConfig.entry = './examples/simple/index.js';
    baseConfig.devServer = {
        host: ip
    }
}

if (env === 'production') {
    baseConfig.externals = {
        'react': 'react',
        'react-dom': 'react-dom'
    };
}

if (env === 'production-ex') {
    baseConfig.entry = {
        simple: './examples/simple/index.js'
    };
    baseConfig.output = {
        path: path.join(__dirname),
        filename: 'build/examples/[name].js'
    };
    baseConfig.plugins = [
        new JS2HtmlPlugin({
            template: path.resolve('./examples/simple/index.html')
        })
    ];
}


module.exports = baseConfig;
