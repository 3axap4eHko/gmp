const webpackMerge = require('webpack-merge');
const Path = require('path');
const { HashedModuleIdsPlugin } = require('webpack');
const BabiliPlugin = require("babili-webpack-plugin");
const WebpackPlugin = require('./webpack.plugin');
const baseConfig = require('./base.config');
const { version } = require('../package.json');

module.exports = webpackMerge(baseConfig, {
  entry: {
    background: Path.resolve(__dirname, '../src/app/background/index.js'),
    popup: Path.resolve(__dirname, '../src/app/popup/index.jsx'),
  },
  plugins: [
    new HashedModuleIdsPlugin(),
    new BabiliPlugin({}),
    new WebpackPlugin({
      clean: ['build', 'coverage'],
      pack: `builds/gmp-${version}.zip`
    }),
  ]
});
