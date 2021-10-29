const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const DEBUG = !process.argv.includes('--release');
const SCRIPTS_ROOT = './gearbox/scripts';
const DIST_ROOT = path.resolve(__dirname, 'dist');

module.exports = {
    mode: DEBUG ? 'development' : 'production',
    target: 'browserslist',
    entry: {
        popup: SCRIPTS_ROOT + '/src/popup.tsx',
        content: SCRIPTS_ROOT + '/src/content.tsx',
        background: SCRIPTS_ROOT + '/src/background.ts',
    },
    output: {
        publicPath: '/',
        sourcePrefix: '  ',
        // clean: true,

        path: DIST_ROOT,
        filename: DEBUG ? 'scripts/[name].js?[contenthash]' : 'scripts/[name].js',
        assetModuleFilename: 'assets/[hash][ext][query]',
        chunkFilename: 'bundle.[id].[hash].js',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /manifest\.json/,
                type: 'asset/json',
                generator: {
                    filename: '[name].[ext]',
                },
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        fallback: {
            path: 'path-browserify',
            process: 'process/browser',
            events: 'events',
        },
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
            jQuery: 'jquery',
        }),
        new HtmlWebpackPlugin({
            title: 'GearBox - Chrome plugin sandbox',
            filename: 'popup.html',
            chunks: ['popup'],
            template: require.resolve('./gearbox/popup.html'),
        }),
    ],
};
