const path = require('path-browserify');
const webpack = require('webpack');

module.exports = {
    webpack: {
        configure: {
            resolve: {
                fallback: {
                    path: require.resolve('path-browserify'),
                    os: require.resolve('os-browserify/browser'),
                    crypto: require.resolve('crypto-browserify'),
                    stream: require.resolve('stream-browserify'),
                    vm: require.resolve('vm-browserify'),
                    process: require.resolve('process'),
                },
            },
        },
        plugins: [
            new webpack.ProvidePlugin({
                process: 'process/browser.js', // Explicitly add `.js`
            }),
        ],        
    },
};
