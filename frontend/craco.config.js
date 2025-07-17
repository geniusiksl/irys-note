// Load configuration from environment or config file
const path = require('path');
const webpack = require('webpack');
// Environment variable overrides
const config = {
  disableHotReload: process.env.DISABLE_HOT_RELOAD === 'true',
};

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig) => {
      
      // Add polyfills for Node.js modules in Webpack 5
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
      
      // Disable hot reload completely if environment variable is set
      if (config.disableHotReload) {
        // Remove hot reload related plugins
        webpackConfig.plugins = [
          ...(webpackConfig.plugins || []),
          new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser.js', // <-- добавьте .js!
          }),
        ];
      } else {
        // Add ignored patterns to reduce watched directories
        webpackConfig.watchOptions = {
          ...webpackConfig.watchOptions,
          ignored: [
            '**/node_modules/**',
            '**/.git/**',
            '**/build/**',
            '**/dist/**',
            '**/coverage/**',
            '**/public/**',
          ],
        };
      }
      return webpackConfig;
    },
  },
};