import $private from 'yyf/private-scope';
import { on, go, un } from 'yyf/event';
import * as Check from 'yyf/check';
import * as Cast from 'yyf/cast';
import { each, keys, filter, reduce } from 'yyf/iterate';
import { GUID } from 'yyf/random';

if (DEBUG) {
  console.log('Chrome browser');
}


const chrome = window.chrome;
const $p = $private();

typeof document !== Check.TYPE_UNDEFINED && document.addEventListener('DOMContentLoaded', (...args) => go(document, 'ready', ...args));

export const onDocumentReady = listener => {
  if (typeof document !== Check.TYPE_UNDEFINED) {
    on(document, 'ready', listener);
  }
};

export const isContextMenu = () => !!chrome.contextMenus;
export const addContextMenu = (title, onClick) => {
  chrome.contextMenus.create({
    title: title,
    contexts: ['browser_action'],
    onclick: onClick
  });
};
export const clearContextMenu = () => {
  chrome.contextMenus.removeAll();
};

export const postForm = data => {
  const form = document.createElement('form');
  form.style.display = 'none';
  document.body.appendChild(form);

  const { url, target, fields } = data;
  form.setAttribute('method', 'POST');
  form.setAttribute('action', url);
  form.setAttribute('target', target);

  Object.keys(fields).forEach(name => {
    const field = document.createElement('input');
    field.setAttribute('name', name);
    field.setAttribute('value', fields[name]);
    form.appendChild(field);
  });

  HTMLFormElement.prototype.submit.call(form);
  setTimeout(() => form.remove(), 100);
};

const messageScope = {};

export const Message = {
  send(action, ...args) {
    return new Promise(resolve => chrome.runtime.sendMessage({ action, args }, resolve));
  },
  on(action, listener) {
    on(messageScope, action, event => listener(event.args, event.response));
    return this;
  },
  proxy(target) {
    each(target, (value, key) => Message.on(key, (args, response) => Promise.resolve(value(...args)).then(response)));
  }
};

onDocumentReady(() => {
  chrome.runtime.onMessage.addListener((request, sender, response) => {
    if (sender.id !== chrome.runtime.id) return;
    const { action, args } = request || {};
    go(messageScope, action, { args: Cast.toArray(args), response });
    return true;
  });
});


const notifyDefaultOptions = {
  title: 'Notification title',
  message: 'Notification message',
  iconUrl: '',
  isClickable: true,
  requireInteraction: true,
  liveTime: 15,
  onClick: () => {
  },
  onClose: () => {
  },
  onCreate: () => {
  },
  buttons: []
};
const notifyAllowedOptions = ['type', 'iconUrl', 'expandedMessage', 'appIconMaskUrl', 'title', 'message', 'contextMessage', 'priority', 'eventTime', 'buttons', 'imageUrl', 'items', 'progress', 'isClickable', 'requireInteraction'];

const notifyScope = {};

function filterOptions(options) {
  const filteredOptions = notifyAllowedOptions.reduce((filteredOptions, key) => {
    if (options.hasOwnProperty(key)) {
      filteredOptions[key] = options[key];
    }
    return filteredOptions;
  }, {});

  filteredOptions.buttons = filteredOptions.buttons.map(({ title, iconUrl }) => ({ title, iconUrl }));
  filteredOptions.type = filteredOptions.type || 'basic';
  filteredOptions.eventTime = Date.now();

  return filteredOptions;
}

export class Notify {
  static createButton(title, iconUrl, onClick = () => {
  }) {
    return { title, iconUrl, onClick };
  }

  static createListItem(title, message) {
    return { title, message };
  }

  static close(id) {
    return new Promise(resolve => chrome.notifications.clear(id, resolve));
  }

  constructor(options) {
    options = Object.assign({}, notifyDefaultOptions, options);
    const { onCreate, onClick, onClose, liveTime, buttons } = options;
    const notifyOptions = filterOptions(options);
    const { id = GUID() } = options;
    const timerId = liveTime ? setTimeout(() => Notify.close(id), Cast.toInt(liveTime) * 1000) : 0;
    const context = {
      id,
      onClick: () => {
        Notify.close(id);
        onClick(this);
      },
      onClose: () => {
        clearTimeout(timerId);

        un(notifyScope, `click_${id}`);
        un(notifyScope, `close_${id}`);
        un(notifyScope, `button_${id}`);

        onClose(this);
      },
      onButton: buttonIdx => {
        Notify.close(id);
        buttons[buttonIdx].onClick(this);
      }
    };
    $p(this, context);

    on(notifyScope, `click_${id}`, context.onClick);
    on(notifyScope, `close_${id}`, context.onClose);
    on(notifyScope, `button_${id}`, context.onButton);

    Notify.close(id)
      .then(() => chrome.notifications.create(id, notifyOptions, () => onCreate(this)))
      .catch(error => console.error(error, options)); // eslint-disable-line no-console
  }

  get id() {
    return $p(this).id;
  }
}

onDocumentReady(() => {
  chrome.notifications.onClosed.addListener((id, byUser) => {
    go(notifyScope, `close_${id}`, byUser);
  });
  chrome.notifications.onClicked.addListener(id => {
    go(notifyScope, `click_${id}`);
  });
  chrome.notifications.onButtonClicked.addListener((id, buttonIdx) => {
    go(notifyScope, `button_${id}`, buttonIdx);
  });
});

const statusScope = {};

export const Status = {
  onFocus(listener) {
    on(statusScope, 'focus', listener);
  },
  onBlur(listener) {
    on(statusScope, 'blur', listener);
  },
  onActive(listener) {
    on(statusScope, 'active', listener);
  },
  onIdle(listener) {
    on(statusScope, 'idle', listener);
  },
  onLocked(listener) {
    on(statusScope, 'locked', listener);
  }
};

onDocumentReady(() => {
  chrome.windows.onFocusChanged.addListener(window => {
    if (window != chrome.windows.WINDOW_ID_NONE) {
      go(statusScope, 'focus');
    } else {
      go(statusScope, 'blur');
    }
  });
  chrome.idle.onStateChanged.addListener(state => {
    go(statusScope, state);
  });
});

const storageScope = {};
const extractSectionExpr = /^(\w+)\.(.*)/;

function _sectionMapper(data) {
  return reduce(data, (result, value, key) => {
    const matches = key.match(extractSectionExpr);
    if (matches) {
      const [section, name] = matches.slice(1);
      if (!result[section]) {
        result[section] = {};
      }
      result[section][name] = value;
    }
    return result;
  }, {});
}

function _sectionFilter(section, data) {
  if (!Check.isValue(data)) return;
  const filterExpr = new RegExp(`^${section}\\.`);
  return _sectionMapper(filter(data, (value, key) => filterExpr.test(key)));
}

function _sectionUnmap(data) {
  return reduce(data, (result, section, sectionName) => {
    each(section, (value, key) => {
      result[`${sectionName}.${key}`] = value;
    });
    return result;
  }, {});
}

const browserStorage = chrome.storage.sync || chrome.storage.local || chrome.storage.managed;

export const Storage = {
  set (section, name, value) {
    const stack = new Error().stack;
    return new Promise(resolve => {
      let data = {};
      if (Check.isNotEmptyString(section)) {
        if (Check.isNotEmptyString(name)) {
          data = { [`${section}.${name}`]: value };
        } else if (Check.isStructure(name)) {
          data = _sectionUnmap({ [section]: name });
        }
      } else if (Check.isStructure(section)) {
        data = _sectionUnmap(section);
      }
      browserStorage.set(data, () => {
        if (chrome.runtime.lastError) {
          console.log(stack)
        }
        resolve(true);
      });
    }).catch(() => false);
  },
  remove (section, name) {
    return new Promise(resolve => {
      if (Check.isNotEmptyString(section)) {
        if (Check.isNotEmptyString(name)) {
          browserStorage.remove(`${section}.${name}`, () => resolve());
        } else {
          browserStorage.get(null, values => {
            const filterExpr = new RegExp(`^${section}\\.`);
            const keys = Object.keys(values)
              .filter(key => filterExpr.test(key));
            browserStorage.remove(keys, () => resolve());
          });
        }
      }
    });
  },
  get(section, name) {
    return new Promise(resolve => {
      if (Check.isNotEmptyString(section)) {
        if (Check.isNotEmptyString(name)) {
          browserStorage.get(`${section}.${name}`, value => resolve(value));
        } else {
          browserStorage.get(null, value => resolve(_sectionFilter(section, value)[section] || {}));
        }
      } else {
        browserStorage.get(null, value => resolve(_sectionMapper(value) || {}));
      }
    });
  },
  on(section, listener) {
    on(storageScope, section, listener);
  },
  clear () {
    return new Promise(resolve => browserStorage.clear(resolve));
  }
};

onDocumentReady(() => {
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace !== 'sync') return;
    keys(changes, section => {
      Storage.get(section).then(values => {
        go(storageScope, section, values);
      });
    });
  });
});

const extensionContext = {};

chrome.runtime.onInstalled.addListener(details => {
  go(extensionContext, 'installed', details);
});
chrome.runtime.onSuspend.addListener(() => {
  go(extensionContext, 'suspend');
});
chrome.runtime.onSuspendCanceled.addListener(() => {
  go(extensionContext, 'suspendCanceled');
});
chrome.runtime.onUpdateAvailable.addListener(() => {
  go(extensionContext, 'updateAvailable');
});

export const $i = name => chrome.i18n.getMessage(name);

export const Extension = {
  onInstalled(listener) {
    on(extensionContext, 'installed', listener);
  },
  onSuspend(listener) {
    on(extensionContext, 'suspend', listener);
  },
  onSuspendCanceled(listener) {
    on(extensionContext, 'suspendCanceled', listener);
  },
  onUpdateAvailable(listener) {
    on(extensionContext, 'updateAvailable', listener);
  },
  platformInfo() {
    return new Promise(resolve => chrome.runtime.getPlatformInfo(resolve));
  },
  set uninstallUrl(value) {
    chrome.runtime.setUninstallURL(value);
  },
  get details() {
    return chrome.runtime.getManifest();
  },
  get version() {
    return chrome.runtime.getManifest().version;
  },
  getUrl(uri) {
    return chrome.extension.getURL(uri);
  },
  setBadgeBackgroundColor(color) {
    chrome.browserAction.setBadgeBackgroundColor({ color });
  },
  setBadgeText(text) {
    chrome.browserAction.setBadgeText({ text });
  },
  getStoreUrl(extensionId = Extension.details.id) {
    return `https://chrome.google.com/webstore/detail/${extensionId}`;
  }
};
