const { lstatSync, writeFileSync, readFileSync, mkdirSync } = require('fs');
const { relative, dirname } = require('path');
const Del = require('del');
const Glob = require('glob');
const JSZip = require('jszip');

function WebpackPlugin(options) {
  this.options = options;
}

WebpackPlugin.prototype.apply = function (compiler) {
  const { clean, dry, pack } = this.options;
  Del.sync(clean, { dryRun: dry });

  compiler.plugin('run', function (compilation, callback) {
    callback();
  });

  compiler.plugin('done', function (stats) {
    if (pack) {
      const { compilation } = stats;
      const { compiler } = compilation;
      const { outputPath } = compiler;
      const zip = new JSZip();
      Glob.sync(`${outputPath}/**/*`).forEach(filename => {
        if (lstatSync(filename).isFile()) {
          zip.file(relative(outputPath, filename), readFileSync(filename));
        }
      });
      mkdirSync(dirname(pack));
      zip.generateAsync({ type: 'nodebuffer' })
        .then(content => writeFileSync(pack, content));
    }
  });

};

module.exports = WebpackPlugin;