const path = require('path')
const glob = require('glob')

const jsRegex = /\.js?$/
const jsModulesRegex = /(node_modules)/
const sassRegex = /\.scss$/

// Plugins
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const CircularDependencyPlugin = require('circular-dependency-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    externals: {
        'lodash.throttle': {
            commonjs: 'lodash.throttle',
            commonjs2: 'lodash.throttle',
        },
        'lodash-uuid': {
            commonjs: 'lodash-uuid',
            commonjs2: 'lodash-uuid',
        },
        react: {
            commonjs: 'react',
            commonjs2: 'react',
            amd: 'React',
            root: 'React',
        },
        'react-dom': {
            commonjs: 'react-dom',
            commonjs2: 'react-dom',
            amd: 'ReactDOM',
            root: 'ReactDOM',
        },
        'react-dnd': {
            commonjs: 'react-dnd',
            commonjs2: 'react-dnd',
            amd: 'ReactDnd',
            root: 'ReactDnd',
        },
        'react-dnd-html5-backend': {
            commonjs: 'react-dnd-html5-backend',
            commonjs2: 'react-dnd-html5-backend',
        },
        'react-dnd-touch-backend': {
            commonjs: 'react-dnd-touch-backend',
            commonjs2: 'react-dnd-touch-backend',
        },
    },
    module: {
        rules: [
            {
                test: jsRegex,
                exclude: jsModulesRegex,
                use: [
                    {
                        loader: 'babel-loader',
                    },
                ],
            },
            {
                test: sassRegex,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
        ],
    },
    output: {
        path: path.resolve('lib'),
        filename: 'index.js',
        library: 'react-transformable-draggable',
        libraryTarget: 'umd',
        publicPath: '/lib/',
        umdNamedDefine: true,
    },
    resolve: {
        extensions: ['.js'],
    },
    plugins: [
        new BundleAnalyzerPlugin(),
        new CleanWebpackPlugin(),
        new CircularDependencyPlugin({
            exclude: /node_modules/,
            include: /lib/,
            failOnError: true,
            allowAsyncCycles: false,
            cwd: process.cwd(),
        }),
    ],
}
