const path = require('path');
const webpack = require('webpack');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "util": require.resolve("util/"),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer"),
        "process": require.resolve("process/browser.js"),
        "fs": false,
        "tty": require.resolve("tty-browserify"),
        "assert": require.resolve("assert"),
        "path": require.resolve("path-browserify"),
        "child_process": false,
        "constants": require.resolve("constants-browserify"),
        "os": require.resolve("os-browserify"),
        "readline": false,
      };

      // <-- ВАЖНО: ProvidePlugin ВСЕГДА!
      webpackConfig.plugins = [
        ...(webpackConfig.plugins || []),
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser.js',
        }),
      ];

      return webpackConfig;
    },
  },
};