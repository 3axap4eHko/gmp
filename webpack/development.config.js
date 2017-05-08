const webpackMerge = require('webpack-merge');
const Path = require('path');
const { NamedModulesPlugin } = require('webpack');
const WebpackPlugin = require('./webpack.plugin');
const baseConfig = require('./base.config');


module.exports = webpackMerge(baseConfig, {
  devtool: 'source-map',
  entry: {
    background: Path.resolve(__dirname, '../src/app/background/index.js'),
    popup: Path.resolve(__dirname, '../src/app/popup/index.jsx'),
  },
  plugins: [
    new NamedModulesPlugin(),
    new WebpackPlugin({
      clean: ['build', 'cache', 'coverage'],
    }),
  ]
});