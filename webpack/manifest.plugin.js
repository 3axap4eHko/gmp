const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const packageJson = require('../package.json');

/**
 applications
 author
 background
 browser_action
 commands
 content_scripts
 content_security_policy
 default_locale
 description
 developer
 homepage_url
 icons
 manifest_version
 name
 omnibox
 options_ui
 page_action
 permissions
 short_name
 version
 web_accessible_resources
 */

function ManifestPlugin(options) {
  if (typeof options === 'string') {
    options = JSON.parse(readFileSync(options));
  }
  this.options = options;
}

ManifestPlugin.prototype.apply = function (compiler) {
  const {
    author,
    version,
    default_locale,
    manifest_version,
    name,
    short_name,
    description,
    browser_action,
    icons,
    web_accessible_resources,
    content_scripts,
    content_security_policy,
    permissions,
    options_page,
    background
  } = Object.assign({}, packageJson, this.options);

  compiler.plugin('emit', (compilation, callback) => {
    const content = JSON.stringify({
      author,
      version,
      default_locale,
      manifest_version,
      name,
      short_name,
      description,
      browser_action,
      icons,
      web_accessible_resources,
      content_scripts,
      content_security_policy,
      permissions,
      options_page,
      background
    }, null, '  ');
    compilation.assets['manifest.json'] = {
      source: function() {
        return content;
      },
      size: function() {
        return content.length;
      }
    };
    callback();
  });
};

module.exports = ManifestPlugin;