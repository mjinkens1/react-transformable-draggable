const path = require('path')
const glob = require('glob')

const jsRegex = /\.js?$/
const jsModulesRegex = /(node_modules)/
const sassRegex = /\.scss$/

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve('lib'),
        filename: 'index.js',
        libraryTarget: 'commonjs',
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
    resolve: {
        extensions: ['.js'],
    },
}
