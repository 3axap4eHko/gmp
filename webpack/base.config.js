const Path = require('path');
const { DefinePlugin } = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ExtractPostCss = new ExtractTextPlugin('css/[name].css');
const Html = require('html-webpack-plugin');
const Copy = require('copy-webpack-plugin');
const ManifestPlugin = require('./manifest.plugin');

const { name, version } = require('../package.json');
const browser = process.env.BROWSER || 'chrome';

module.exports = {
  output: {
    path: Path.resolve(__dirname, `../build/${browser}`).replace(/^\w:/, '').replace(/\\/g, '/'),
    publicPath: '/',
    filename: 'js/[name].js',
    chunkFilename: 'js/[id].js'
  },
  module: {
    rules: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader', options: { cacheDirectory: 'cache' } },
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader', options: { cacheDirectory: 'cache' } },
      { test: /\.css$/, loader: ExtractPostCss.extract({ use: ['css-loader', 'postcss-loader'], publicPath: '/' }) },
      { test: /\.(svg|jpg|png|gif)$/, loader: 'file-loader', options: { name: 'images/[name].[ext]' } },
      { test: /\.woff2$/, loader: 'file-loader', options: { name: 'fonts/[name].[ext]' } },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new ManifestPlugin(Path.resolve(__dirname, '../src/template.manifest.json')),
    new DefinePlugin({
      'BROWSER': JSON.stringify(browser),
      'VERSION': JSON.stringify(version),
      'DEBUG': JSON.stringify(!!process.env.DEBUG),
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }),
    ExtractPostCss,
    new Html({
      chunks: ['background'],
      filename: 'background.html',
      template: 'src/background.html'
    }),
    new Html({
      chunks: ['popup'],
      filename: 'popup.html',
      template: 'src/popup.html'
    }),
    new Copy([
      { from: './src/images', to: './images' },
      { from: './src/_locales', to: './_locales' },
    ])
  ]
};
