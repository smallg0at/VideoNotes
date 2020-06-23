'use strict'; //info: this should be written with compatibility.

var _this3 = void 0;

var DEBUGMODE = {
  keypress: false,
  inspectGeneratedURL: false,
  setting: false,
  devAction: false,
  quickRefresh: false,
  timefilterDebug: false,
  jumpDebug: false
};
var version = "1.9.0";
var settings = {
  isIE: false,
  localStorage: true,
  allowExperimentalAPI: {
    bilibili: 1
  },
  hasPasteApi: true,
  hasPermission: true,
  enableBruteForce: false,
  usingNW: false,
  lastUsedVersion: ''
};
var isFirstRun = false;
var settingUtils = {
  read: function read() {
    if (settings.localStorage) {
      if (localStorage.VNSettings != 'null' && localStorage.VNSettings) {
        settings = JSON.parse(localStorage.VNSettings);

        if (DEBUGMODE.setting) {
          console.log('READ:', JSON.parse(localStorage.VNSettings));
        }
      } else {
        localStorage.VNSettings = JSON.stringify(settings);

        if (DEBUGMODE.setting) {
          console.log('READ:FW', JSON.parse(localStorage.VNSettings));
        }
      }

      this.onRead();
    }
  },
  onRead: function onRead() {
    document.querySelector('#bilibili-ext').selectedIndex = settings.allowExperimentalAPI.bilibili;

    document.querySelector('#bilibili-ext').onchange = function () {
      settings.allowExperimentalAPI.bilibili = document.querySelector('#bilibili-ext').selectedIndex;
      settingUtils.write();
    };

    if (settings.enableBruteForce) {
      console.log();
      document.querySelector('#enable-force-method').checked = true;
    }

    document.querySelector('#enable-force-method').onchange = function () {
      settings.enableBruteForce = document.querySelector('#enable-force-method').checked;
      settingUtils.write();
    };
  },
  write: function write() {
    if (settings.localStorage) {
      localStorage.VNSettings = JSON.stringify(settings);

      if (DEBUGMODE.setting) {
        console.log('WRITE:', JSON.parse(localStorage.VNSettings));
      }
    }
  },
  reset: function reset() {
    if (settings.localStorage) {
      if (confirm('确认清除设置与笔记？本操作无法撤销！')) {
        localStorage.clear();
        alert('清除完毕，页面将会刷新。');
        location.reload();
      }
    } else {
      alert('没有资源能被重置。');
    }
  },
  interaction: {
    onDisableLocalStorage: function onDisableLocalStorage() {
      document.getElementById('localStorage-error').classList.remove('hidden');
      document.getElementById('settings-icon').style.color = 'rgb(92,92,0)';
      settings.localStorage = false;
    },
    checkIfIE: function checkIfIE() {
      if (navigator.userAgent.indexOf('Trident') != -1 && navigator.userAgent.indexOf('Edge') == -1) {
        console.log(navigator.userAgent);
        settings.isIE = true;
      }
    },
    checkLS: function checkLS() {
      try {
        localStorage.getItem('videoNotes');
      } catch (e) {
        this.onDisableLocalStorage();
        console.info('LocalStorage is now DISABLED due to exception'); // console.warn(e)
      }
    },
    grantClipboard: function grantClipboard() {
      if (navigator.clipboard) {
        navigator.clipboard.readText();
      } else {
        console.warn('Clipboard API is not available');
      }
    },
    checkPasteAPI: function checkPasteAPI() {
      if (!navigator.clipboard) {
        document.querySelector('#URLpaste').classList.add('hidden');
        settings.hasPasteApi = false;
      }
    },
    checkNW: function checkNW() {
      try {
        if (nw) {
          settings.usingNW = true;
        }
      } catch (e) {
        console.info("NW is not present on this env.");
      }
    }
  }
};
settingUtils.interaction.checkLS();
settingUtils.read();
settingUtils.interaction.checkIfIE();
settingUtils.interaction.checkPasteAPI();
settingUtils.interaction.checkNW();

if (version != settings.lastUsedVersion) {
  isFirstRun = true;
  console.log('isFirstRun:', settings.lastUsedVersion);
  settings.lastUsedVersion = version;
}

settingUtils.write();
var nwWindow = null;
var nwClip = null;

if (settings.usingNW) {
  nwWindow = nw.Window.get();
  nwClip = nw.Clipboard.get();
  nwWindow.show(true);
  nwWindow.focus();
} else {} //do nothing
// console.log('ran script')


document.querySelector('video').src = "";
var textareaItem = document.querySelector('textarea');
var frameCount = 0;

String.prototype.assignClick = function (func) {
  var a = document.querySelector(this);

  a.onclick = function (event) {
    func(event);
  };
};

if (!settings.isIE) {
  var URIDetector = {
    url: new URL(location.href),
    hasParam: false,
    param: ''
  };
  URIDetector.hasParam = URIDetector.url.searchParams.has('query');

  if (URIDetector.hasParam) {
    URIDetector.param = URIDetector.url.searchParams.get('query');
    document.querySelector('#parameter').classList.remove('hidden');
    document.querySelector('#parameter>info').innerHTML = '您正在用链接打开 ' + URIDetector.param + ' 。';
  }

  '#param-btn'.assignClick(function () {
    window.open(URIDetector.url.pathname, '_self');
  });
} else {
  document.querySelector('#sharelink').classList.add('hidden');
}

'#reset-everything'.assignClick(function (event) {
  settingUtils.reset();
});

if (settings.usingNW) {
  document.querySelector('#is-app').textContent = "本地应用。";
}

var gui = {
  el: {
    left: document.querySelector('.left'),
    right: document.querySelector('.right')
  },
  mode: '',
  updateRightHeight: function updateRightHeight() {
    if (window.matchMedia("(orientation: portrait)").matches == true) {
      var leftComp = window.getComputedStyle(document.querySelector('.left'));
      var leftHeight = parseInt(leftComp.getPropertyValue('height'));
      document.querySelector('.right').style.height = window.innerHeight - leftHeight - 5 + 'px';
    } else {
      document.querySelector('.right').setAttribute('style', '');
    }
  },
  setInnerIcon: function setInnerIcon(query, iconName) {
    var extraLabel = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var important = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    document.querySelector(query).innerHTML = "<i class=\"ms-Icon ms-Icon--".concat(iconName, "\" aria-hidden=\"true\"></i>").concat(extraLabel ? "<iconlabel".concat(important ? ' class="important"' : '', ">").concat(extraLabel, "</iconlabel>") : '');
  },
  toggleContextMenu: function toggleContextMenu() {
    // document.querySelector('#more-options').classList.toggle('hidden')
    document.querySelector('#more-options').parentElement.classList.toggle('isopen');
  },
  windowIsOnTop: false,
  toggleOnTop: function toggleOnTop() {
    nwWindow.setAlwaysOnTop(!this.windowIsOnTop);
    this.windowIsOnTop = !this.windowIsOnTop;
    gui.setInnerIcon('#winontop', this.windowIsOnTop ? 'CheckboxComposite' : 'Checkbox', '窗口置顶', true);
  },
  fullscreen: {
    toggle: function toggle() {
      if (settings.usingNW) {
        nwWindow.toggleFullscreen();

        if (!nwWindow.isFullscreen) {
          gui.setInnerIcon('#fullscreen', 'BackToWindow', '退出全屏 (f)', true); // document.querySelector('#fullscreen').innerHTML = "退出全屏"
        } else {
          gui.setInnerIcon('#fullscreen', 'FullScreen', '全屏 (f)', true); // document.querySelector('#fullscreen').innerHTML = "全屏"
        }
      } else {
        if (document.fullscreenElement || document.msFullscreenElement) {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
          } else if (document.msExitFullscreen) {
            document.msExiFullscreen();
          } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
          }
        } else {
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
          } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
          } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
          } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullScreen();
          }
        }
      }
    },
    onChange: function onChange() {
      var forceValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      console.log(forceValue);

      if (document.fullscreenElement || document.fullscreen) {
        gui.setInnerIcon('#fullscreen', 'BackToWindow', '退出全屏 (f)', true); // document.querySelector('#fullscreen').innerHTML = "退出全屏"
      } else {
        gui.setInnerIcon('#fullscreen', 'FullScreen', '全屏 (f)', true); // document.querySelector('#fullscreen').innerHTML = "全屏"
      }
    }
  },
  loadIndicator: {
    show: function show() {
      if (!settings.isIE) {
        document.querySelector('#iframe-loading').classList.remove('hidden');
        setTimeout(function () {
          document.querySelector('#iframe-loading').classList.remove('transparent');
        }, 50);
      }
    },
    hide: function hide() {
      document.querySelector('#iframe-loading').classList.add('transparent');
      setTimeout(function () {
        document.querySelector('#iframe-loading').classList.replace('transparent', 'hidden');
      }, 1050);
    }
  }
};
window.onresize = gui.updateRightHeight();
'#fullscreen'.assignClick(function () {
  return gui.fullscreen.toggle();
});
'#context-toggle'.assignClick(function () {
  return gui.toggleContextMenu();
});
'#winontop'.assignClick(function () {
  gui.toggleOnTop();
});
'#refresh'.assignClick(function () {
  var tempElement = document.createElement('div');
  tempElement.id = 'load-cover';
  tempElement.style.opacity = 0;
  document.documentElement.appendChild(tempElement);
  setTimeout(function () {
    tempElement.style.opacity = 1;
    setTimeout(function () {
      tempElement.style.opacity = 1;
      location.reload();
    }, 250);
  }, 100);
});
document.querySelectorAll('context>operation>interaction').forEach(function (item) {
  item.addEventListener('click', function () {
    gui.toggleContextMenu();
  });
});
gui.updateRightHeight();

if (!settings.usingNW) {
  document.querySelector('#winontop').classList.add('hidden');
}

document.addEventListener('fullscreenchange', function () {
  gui.fullscreen.onChange();
});
var notes = {
  container: document.querySelector('group'),
  isAlwaysOn: false,
  activeTimeout: -1,
  item: function item() {
    var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    return document.querySelectorAll('textarea').item(id);
  },
  load: function load() {
    if (settings.localStorage) {
      textareaItem.value = localStorage.videoNotes || ""; //拿到存储的文本
    }
  },
  save: function save() {
    if (settings.localStorage) {
      localStorage.videoNotes = textareaItem.value;
    }
  },
  setActive: function setActive() {
    var _this = this;

    var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var alwaysLight = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    this.save();
    this.container.classList.add('isactive');

    try {
      clearTimeout(this.activeTimeout);
    } catch (error) {
      console.error(error);
    }

    if (textareaItem.value != "" && !force && window.innerWidth > 1024 && !this.isAlwaysOn) {
      this.activeTimeout = setTimeout(function () {
        _this.container.classList.remove('isactive');
      }, 2500);
    }
  },
  init: function init() {
    this.load();

    this.item().onscroll = function () {
      return notes.setActive();
    };

    this.item().onselectionchange = function () {
      return notes.setActive();
    };

    this.item().onselect = function () {
      return notes.setActive();
    }; // this.item().ontouchstart = ()=>textAreaSetActive(true)


    this.item().ontouchmove = function () {
      return notes.setActive();
    };

    this.item().ontouchend = function () {
      return notes.setActive();
    };

    this.container.onscroll = function () {
      return notes.setActive();
    };
  },
  onFinishLoad: function onFinishLoad() {
    this.item().placeholder = '在这里记点笔记吧。' + (settings.localStorage ? '' : '\n\n您的浏览器暂不支持本地存储，因此您的文本在刷新时不会被保留！');
  },
  insertText: function insertText(target, text) {
    target.focus();

    if (typeof document.selection != "undefined") {
      document.selection.createRange().text = text;
    } else {
      target.value = target.value.substr(0, target.selectionStart) + text + target.value.substring(target.selectionStart, target.length);
    }
  }
};
notes.init();
var openFile = {
  el: {
    filePicker: document.querySelector('input[type=file]'),
    textBox: document.querySelector('#URLtextbox'),
    openButton: document.querySelector('#URLopen')
  },
  gui: {
    pasteContent: function pasteContent(e) {
      if (settings.usingNW) {
        document.querySelector('#URLtextbox').value = nwClip.get();
      } else {
        if (navigator.clipboard.readText) {} else {
          document.querySelector('#URLtextbox').select();
          document.execCommand('paste');
          setTimeout(function () {
            if (document.querySelector('#URLtextbox').value == "") {
              modal.custom.info.render("\u60A8\u7684\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u81EA\u52A8\u7C98\u8D34\uFF0C\u8BF7\u624B\u52A8\u7C98\u8D34\u3002", "\u63D0\u793A");
              document.querySelector('#URLpaste').classList.add('hidden');
            }
          }, 50);
        }
      }

      document.querySelector('#URLtextbox').select();
    }
  },
  open: {
    local: function local() {
      var selectedFile = openFile.el.filePicker.files.item(0);
      console.log(selectedFile);
      var name = selectedFile.name,
          size = selectedFile.size,
          type = selectedFile.type;
      console.log("文件名:" + name + " 大小:" + size);
      document.querySelector('#file-info').innerHTML = "\u23F3 ".concat(name, "\uFF08").concat((size / 1000000).toFixed(1), "MB\uFF09").concat(settings.enableBruteForce ? ' 正在加载中...' : '', " ").concat(size >= 100000000 && settings.enableBruteForce ? '<br>文件过大，可能加载失败或页面崩溃。' : '');
      document.querySelector('#file-info').classList.toggle('hidden');

      if (settings.enableBruteForce) {
        var reader = new FileReader(); //这是核心,读取操作就是由它完成.

        console.log('BruteForce: init');
        reader.readAsDataURL(selectedFile);

        reader.onload = function () {
          console.log('BruteForce: done, ' + this.result.length);

          if (this.result.length == 0) {
            alert('此文件没有内容或过大，加载失败。');
          } else {
            openFile.open.loadLocal(this.result, '', name);
          }
        };
      } else {
        openFile.open.loadLocal(URL.createObjectURL(selectedFile), type, name);
      }
    },
    loadLocal: function loadLocal() {
      var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new String();
      var name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
      setTimeout(function () {
        if (url.startsWith('data:video/') || type.startsWith('video/')) {
          videoPlayer.activate(url, name);
        } else {
          webFrame.load(url);
        }

        modal.close('openfile');
      }, 350);
    }
  }
};

openFile.el.filePicker.onchange = function () {
  openFile.open.local();
};

'#URLpaste'.assignClick(function (event) {
  return openFile.gui.pasteContent(event);
});
'#URLopen'.assignClick(function (event) {
  onSubmitVideoURL(event.shiftKey);
});
var shortcut = {
  list: new Map(),
  count: 0,
  defaultKeyOptions: {
    ctrl: false,
    shift: false,
    alt: false
  },
  add: function add(key, func) {
    return this.list.set(key.toLocaleLowerCase(), func);
  },
  check: function check(key) {
    return this.list.has(key);
  },
  apply: function apply() {
    var _this2 = this;

    document.onkeyup = function (event) {
      if (DEBUGMODE.keypress) {
        console.log('KEYUP:', event);
      }

      _this2.count++;

      if (_this2.list.has('any')) {
        var a = _this2.list.get('any');

        a(event);
      }

      var composedKey = event.key;

      if (event.altKey) {
        composedKey = 'alt+' + composedKey;
      }

      if (event.shiftKey) {
        composedKey = 'shift+' + composedKey;
      }

      if (event.ctrlKey) {
        composedKey = 'ctrl+' + composedKey;
      }

      composedKey = composedKey.toLocaleLowerCase();

      if (_this2.list.has(composedKey)) {
        var _a = _this2.list.get(composedKey);

        _a(event);
      }
    };
  }
};
{
  // func: Set up shortcut
  shortcut.add('Control', function (event) {
    notes.setActive();
  });
  shortcut.add(' ', function (event) {
    if (event.target.tagName != 'TEXTAREA' && event.target.tagName != 'INPUT') {
      togglePlayPause();
    }
  });
  shortcut.add('F11', function (event) {
    event.preventDefault();
  });
  shortcut.add('Enter', function (event) {
    if (event.target.id == 'URLtextbox') {
      onSubmitVideoURL(false);
    }
  });
  shortcut.add('shift+Enter', function (event) {
    if (event.target.id == 'URLtextbox') {
      onSubmitVideoURL(true);
    }
  });
  shortcut.add('o', function (event) {
    if (event.target.tagName != 'TEXTAREA' && event.target.tagName != 'INPUT') {
      event.preventDefault();
      modal.isOpen('openfile') ? modal.close('openfile') : modal.open('openfile');
    }
  });
  shortcut.add('s', function (event) {
    if (event.target.tagName != 'TEXTAREA' && event.target.tagName != 'INPUT') {
      event.preventDefault();
      modal.isOpen('settings') ? modal.close('settings') : modal.open('settings');
    }
  });
  shortcut.add('f', function (event) {
    if (event.target.tagName != 'TEXTAREA' && event.target.tagName != 'INPUT') {
      event.preventDefault();
      gui.fullscreen.toggle();
    }
  });
  shortcut.add('any', function (event) {
    if (event.target.tagName == 'TEXTAREA') {
      notes.setActive();
    }
  });
  shortcut.add('Tab', function (event) {
    if (event.target.tagName != 'TEXTAREA' && event.target.tagName != 'INPUT') {
      document.querySelector('textarea').select();
    }
  });

  if (DEBUGMODE.quickRefresh) {
    shortcut.add('ctrl+r', function (event) {
      location.reload();
    });
  }

  if (settings.usingNW) {
    shortcut.add('F11', function () {
      gui.fullscreen.toggle();
    });
  }

  shortcut.add('ctrl+i', function (event) {
    if (event.target.tagName == 'TEXTAREA') {
      var playbackTime = 0;

      if (videoPlayer.isAvailable) {
        playbackTime = videoPlayer.el.currentTime;
      } else if (settings.usingNW) {
        //disabled
        if (webFrame.isAvailable == true) {
          var timeData = null;
          var frame1 = document.querySelector('iframe').contentWindow;

          if (frame1.document.querySelector('video')) {
            timeData = frame1.document.querySelector('video').currentTime;
          } else if (frame1.document.querySelector('iframe').contentWindow.document.querySelector('video')) {
            timeData = frame1.document.querySelector('iframe').contentWindow.document.querySelector('video').currentTime;
          }

          if (DEBUGMODE.timefilterDebug) {
            console.log('InsTime: Web:', timeData);
          }

          if (timeData) {
            playbackTime = timeData;
          } else {
            modal.custom.info.render('当前网站暂时不支持插入时间。', '错误');
          }
        }
      } else {
        return 0;
      }

      if (DEBUGMODE.timefilterDebug) {
        console.log(playbackTime);
      }

      var playbackCounter = [0, 0, 0];
      playbackCounter[2] = Math.floor(playbackTime % 60);
      playbackCounter[1] = Math.floor(playbackTime / 60);

      while (playbackCounter[1] >= 60) {
        playbackCounter[1] -= 60;
        playbackCounter[0]++;
      }

      var fnstr = '';
      fnstr = playbackCounter[0] > 0 ? playbackCounter[0] + ':' : '';
      fnstr = fnstr.concat(playbackCounter[0] > 0 && playbackCounter[1] < 10 ? '0' : '' + playbackCounter[1] + ':');
      fnstr = fnstr.concat((playbackCounter[2] >= 10 ? '' : '0') + playbackCounter[2]);
      notes.insertText(event.target, fnstr);
    }
  });

  if (settings.usingNW) {
    shortcut.add('ctrl+p', function (event) {
      var targetVideoElement = null;

      if (webFrame.isAvailable == true) {
        var frame1 = document.querySelector('iframe').contentWindow;

        if (frame1.document.querySelector('video')) {
          targetVideoElement = frame1.document.querySelector('video');
        } else if (frame1.document.querySelector('iframe').contentWindow.document.querySelector('video')) {
          targetVideoElement = frame1.document.querySelector('iframe').contentWindow.document.querySelector('video');
        }
      } else if (videoPlayer.isAvailable) {
        targetVideoElement = videoPlayer.el;
      }

      if (targetVideoElement) {
        if (targetVideoElement.paused) {
          targetVideoElement.play();
        } else {
          targetVideoElement.pause();
        }
      }
    });
    shortcut.add('ctrl+r', function () {
      location.reload();
    });
  }

  shortcut.add('ctrl+]', function () {
    notes.isAlwaysOn = !notes.isAlwaysOn;
  });
  shortcut.apply();
}

document.onkeydown = function (event) {
  if (DEBUGMODE.keypress) {
    console.log('KEYDN:', event);
  }

  if (event.key == 'Control') {
    notes.setActive(true);
  }
};

notes.setActive();
setInterval(function () {
  //refreshes every 100ms, setting time bar
  if (frameCount >= 0) {
    if (videoPlayer.isAvailable) {
      var mediaPlayback = videoPlayer.el;
      document.querySelector('#play-length').setAttribute('style', 'width: ' + (mediaPlayback.currentTime / mediaPlayback.duration * 100).toFixed(2) + '%;');
      var existstr = Math.floor(mediaPlayback.currentTime / 60) + ':' + Math.floor(mediaPlayback.currentTime % 60);
      var totalstr = Math.floor(mediaPlayback.duration / 60) + ':' + Math.floor(mediaPlayback.duration % 60);
      document.querySelector('.media-playback-timing').innerHTML = existstr + ' / ' + totalstr;
    }
  }

  frameCount++;
  gui.updateRightHeight();
}, 100);

window.onbeforeunload = function () {
  if (!settings.localStorage && textareaItem.value != "") {
    return '文本框内仍有内容，确认离开？';
  }
};

function videoUrlParser() {
  var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new String();
  var targetURL;
  var lowURL = url.toLocaleLowerCase();

  if ((lowURL.startsWith('av') || lowURL.startsWith('bv') || url.indexOf('www.bilibili.com/video/') != -1 || url.indexOf('b23.tv/') != -1) && !url.startsWith('||')) {
    //bilibili mode
    // targetURL = 'https://www.bilibili.com/blackboard/newplayer.html?aid=' + targetURL
    if (settings.allowExperimentalAPI.bilibili == 1) {
      targetURL = 'http://xbeibeix.com/api/bilibilivideo.php?url=' + url; // let req = new XMLHttpRequest()
    } else {
      targetURL = url.replace('www.bilibili.com/video/', '');
      targetURL = targetURL.replace('b23.tv/', '');
      targetURL = targetURL.replace('https://', '');
      targetURL = targetURL.replace('?p=', '&page=');
      targetURL = targetURL.replace('?', '&');

      if (lowURL.indexOf('bv') != -1) {
        targetURL = targetURL.replace('BV', '');
        targetURL = targetURL.replace('bv', '');
        targetURL = 'https://player.bilibili.com/player.html?bvid=' + targetURL + '&high_quality=1';
      } else {
        targetURL = targetURL.replace('av', '');
        targetURL = 'https://player.bilibili.com/player.html?aid=' + targetURL + '&high_quality=1';
      }
    }

    if (DEBUGMODE.inspectGeneratedURL) {
      console.log('ParseURL', 'bilibili', targetURL);
    }

    return {
      mode: 'bilibili',
      parsed: targetURL,
      interaction: function interaction() {
        webFrame.load(targetURL, true);
      }
    };
  } else if ((url.startsWith('ac') || url.indexOf('www.acfun.cn/v/') != -1 || url.indexOf('m.acfun.cn/v/') != -1) && !url.startsWith('||')) {
    if (url.indexOf('m.acfun.cn') != -1) {
      targetURL = url.replace('https://m.acfun.cn/v/?ac=', '');
      targetURL = targetURL.substr(0, targetURL.indexOf('&'));
    } else {
      targetURL = url.replace('www.acfun.cn/v/', '');
      targetURL = targetURL.replace('https://', '');
      targetURL = targetURL.replace('ac', '');
      targetURL = targetURL.substr(0, targetURL.indexOf('_'));
    } // targetURL = targetURL.replace('?p=', '&page=')


    targetURL = 'https://www.acfun.cn/player/ac' + targetURL;

    if (DEBUGMODE.inspectGeneratedURL) {
      console.log('ParseURL', 'acfun', targetURL);
    }

    return {
      mode: 'acfun',
      parsed: targetURL,
      interaction: function interaction() {
        if (window.innerWidth <= 600) {
          alert('acfun 网页播放器在手机上效果不一定正常。');
        }

        webFrame.load(targetURL, true);
      }
    };
  } else if (url.indexOf('web.microsoftstream.com/video/') != -1 && !url.startsWith('||')) {
    targetURL = url.replace('web.microsoftstream.com/video/', 'web.microsoftstream.com/embed/video/'); // targetURL = targetURL.replace('?p=', '&page=')

    if (targetURL.indexOf('?st=') != -1) {
      targetURL = targetURL + '&autoplay=true&amp;showinfo=false';
    } else {
      targetURL = targetURL + '?autoplay=true&amp;showinfo=false';
    }

    if (DEBUGMODE.inspectGeneratedURL) {
      console.log('ParseURL', 'msstream', targetURL);
    }

    return {
      mode: 'ms-stream',
      parsed: targetURL,
      interaction: function interaction() {
        webFrame.load(targetURL, true);
        document.querySelector('.left').classList.add('bilibili');
      }
    };
  } else if (url.indexOf('youtube.com') != -1 && !url.startsWith('||')) {
    var urlOBJ = new URL(url);

    if (settings.isIE) {
      return {
        mode: 'frame',
        parsed: url,
        interaction: function interaction() {
          webFrame.load(targetURL, false);
          document.querySelector('.left').classList.remove('bilibili');
        }
      };
    }

    var videoID = urlOBJ.searchParams.get('v');
    var timeiter = urlOBJ.searchParams.get('t');
    targetURL = 'https://www.youtube.com/embed/' + videoID;

    if (timeiter) {
      timeiter = timeiter.replace('s', '');
      targetURL = targetURL + '?start=' + timeiter;
    }

    return {
      mode: 'youtube',
      parsed: targetURL,
      interaction: function interaction() {
        webFrame.load(targetURL, true);
        document.querySelector('.left').classList.add('bilibili');
      }
    };
  } else if (url.startsWith('||')) {
    targetURL = url.replace('||', '');

    if (DEBUGMODE.inspectGeneratedURL) {
      console.log('ParseURL', 'frame', targetURL);
    }

    return {
      mode: 'frame',
      parsed: targetURL,
      interaction: function interaction() {
        webFrame.load(targetURL, false);
        document.querySelector('.left').classList.remove('bilibili');
      }
    }; // } else if (url.startsWith('blob:')) {
    //     return {
    //         mode: 'blob',
    //         error: 'Blob is not supported by now.'
    //     }
  } else {
    return {
      mode: 'video',
      parsed: url,
      interaction: function interaction() {
        if (DEBUGMODE.inspectGeneratedURL) {
          console.log('ParseURL', 'video', url);
        }

        videoPlayer.activate(url);
      }
    };
  }
}

var webFrame = {
  url: function url() {
    _this3.el.src;
  },
  el: document.querySelector('iframe'),
  isAvailable: false,
  load: function load() {
    var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var isOnlineStream = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    videoPlayer.unload();
    document.title = 'VideoNotes - Loading...';
    document.querySelector('video').classList.add('hidden');

    if (isOnlineStream) {
      document.querySelector('.left').classList.add('bilibili');
    } else {
      document.querySelector('.left').classList.remove('bilibili');
    }

    this.el.classList.remove('hidden');
    this.el.src = url;
    gui.el.left.classList.add('hasframe');
    gui.loadIndicator.show();
    webFrame.isAvailable = true;
  },
  unload: function unload() {
    gui.el.left.classList.remove('hasframe');
    gui.el.left.classList.remove('bilibili');
    gui.loadIndicator.hide();
    this.el.classList.add('hidden');
    this.el.src = "";
    this.isAvailable = false;
  }
};

webFrame.el.contentWindow.onbeforeunload = function () {
  gui.loadIndicator.show();
};

webFrame.el.onload = function () {
  try {
    document.title = 'VideoNotes - ' + webFrame.el.contentWindow.document.title;
  } catch (e) {
    document.title = 'VideoNotes - ' + webFrame.el.src;
    console.warn(e);
  }

  gui.loadIndicator.hide();

  if (gui.mode == 'bilibili' && settings.usingNW) {
    var insertedStyle = webFrame.el.contentDocument.createElement('style');
    insertedStyle.innerHTML = ".bilibili-player .bilibili-player-area div.bilibili-player-video-control{background: black;border-color: black;opacity: 0.8}.bilibili-player-video-recommend-container, .bilibili-player-video-recommend,.bilibili-player-video-jump-to-bilibili-detail-bar,.bilibili-player-video-sendjumbar,.bilibili-player-video-pause-panel-container-qrcode,.bilibili-player-video-suspension-bar-btn-group-jumpbtn{\tdisplay: none !important;}.bilibili-player .bilibili-player-area .bilibili-player-video-control .bilibili-player-video-progress-bar{opacity: 0.6}.bilibili-player-video-sendjumpbar{display:none}div.bilibili-player-video-control{opacity: 0.5!important;transition:.25s all}div.bilibili-player-video-control:hover{opacity:0.9!important}";
    webFrame.el.contentDocument.documentElement.appendChild(insertedStyle);
  }
};

webFrame.el.contentWindow.onerror = function () {
  alert('加载页面内容时出现了点问题，请稍后再试。');
  self.onload();
};

function onSubmitVideoURL() {
  var frame = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var inputURL = openFile.el.textBox.value;

  if (inputURL) {
    if (frame) {
      if (inputURL.indexOf('://') == -1) {
        inputURL = 'http://' + inputURL;
      }

      inputURL = '||' + inputURL;
    }

    var res = videoUrlParser(inputURL);
    document.querySelector('#file-info').innerHTML = '⏳ 正在处理链接并加载中...';
    openFile.el.textBox.disabled = true;
    gui.mode = res.mode;
    history.change(inputURL);
    document.querySelector('#file-info').classList.toggle('hidden');

    if (!res.error) {
      setTimeout(function () {
        modal.close('openfile');
        res.interaction();
        document.querySelector('#file-info').classList.toggle('hidden');
        openFile.el.textBox.disabled = false;
        openFile.el.textBox.value = "";
      }, 500);
    } else {
      console.error(res.error);
      gui.setInnerIcon('#playpause', 'Error', '重新打开', true);
      alert(res.error);
    }
  }
}

function togglePlayPause() {
  //onclick playpause button
  var a = new URL(window.location.href); // console.log(a, videoPlayer.el.src)
  // console.log(videoPlayer.el.src.indexOf(a.pathname)!=1)

  if (videoPlayer.el.src.indexOf(a.pathname) != -1 || videoPlayer.inError) {
    modal.open('openfile');
  } else {
    if (videoPlayer.isPaused()) {
      videoPlayer.play();
    } else {
      videoPlayer.pause();
    } // videoPlayer.isPaused() ? videoPlayer.play() : videoPlayer.pause()

  }
}

'#playpause'.assignClick(function () {
  togglePlayPause();
});
'#openfile-sub'.assignClick(function () {
  modal.open('openfile');
});
var videoPlayer = {
  el: document.querySelector('video'),
  isAvailable: false,
  inError: false,
  isPaused: function isPaused() {
    return this.el.paused;
  },
  play: function play() {
    this.el.play();
  },
  pause: function pause() {
    this.el.pause();
  },
  onError: function onError(e) {
    gui.setInnerIcon('#playpause', 'Error', '打开', true);
    this.el.onplay = null;
    this.el.onpause = null;
    this.el.pause();
    this.inError = true;
    this.isAvailable = false;
    var f = JSON.stringify(e);
    console.log(f);
    document.title = 'VideoNotes - 错误';
    modal.custom.info.render("\u5F88\u62B1\u6B49\uFF0C\u89C6\u9891\u64AD\u653E\u65F6\u51FA\u73B0\u4E86\u9519\u8BEF\u3002<br>\u5F53\u524D\u6B63\u5728\u64AD\u653E\uFF1A<a href=\"".concat(e.srcElement.src, "\" class=\"help\">").concat(e.srcElement.src, "</a><br>Timestamp: ").concat(e.timeStamp, "<br>\u672C\u9519\u8BEF\u53EF\u80FD\u662F\u7531\u4E8E\u4E0D\u614E\u5FD8\u5728\u7F51\u9875URL\u524D\u52A0 <code>||</code> \u3001\u7F51\u7EDC\u8FDE\u63A5\u4E0D\u7545\u3001\u89C6\u9891\u7F16\u7801\u4E0D\u88AB\u652F\u6301\u5BFC\u81F4\u7684\u3002<br>\u60A8\u53EF\u5C1D\u8BD5\u5237\u65B0\u9875\u9762\u3001\u91CD\u542F\u6D4F\u89C8\u5668\u3001\u91CD\u542F\u8BA1\u7B97\u673A\u89E3\u51B3\u3002"), '出现错误');
    document.querySelector('#time-edt').classList.add('nodisplay');
    gui.updateRightHeight();
    throw e;
  },
  activate: function activate(url) {
    var _this4 = this;

    var overrideTitle = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    webFrame.el.classList.add('hidden');
    this.el.classList.remove('hidden');
    gui.el.left.classList.remove('hasframe');
    gui.el.left.classList.remove('bilibili');
    webFrame.unload();
    this.el.src = url;
    this.inError = false;
    document.querySelector('#time-edt').classList.remove('nodisplay');
    setTimeout(function () {
      gui.loadIndicator.hide();
    }, 2500);

    if (overrideTitle) {
      document.title = 'VideoNotes - ' + overrideTitle;
    } else {
      document.title = 'VideoNotes - ' + this.el.src;
    }

    this.isAvailable = true;

    this.el.onerror = function (e) {
      _this4.onError(e);
    };

    this.el.onplay = function () {
      gui.setInnerIcon('#playpause', 'Pause', '暂停'); // label.innerHTML = '暂停'
    };

    this.el.onpause = function () {
      gui.setInnerIcon('#playpause', 'Play', '播放'); // label.innerHTML = '播放'
    };

    this.el.onended = function () {
      gui.setInnerIcon('#playpause', 'Play', '重放'); // label.innerHTML = '重放'
    };

    this.el.play();
    document.querySelector('#openfile-sub').classList.remove('hidden');
  },
  unload: function unload() {
    this.el.onplay = null;
    this.el.onpause = null;
    this.el.onerror = null;
    this.el.pause();
    this.inError = false;
    this.isAvailable = false;
    this.el.src = "";
    document.querySelector('#time-edt').classList.add('nodisplay');
    document.querySelector('#openfile-sub').classList.add('hidden');
  },
  jump: function jump() {
    var pausedbef = this.isPaused();
    this.pause();
    var destTimeString = prompt('请输入目标时间（如 5:26）');

    if (destTimeString === null || destTimeString == "") {
      if (!pausedbef) {
        this.play();
      }
    } else {
      destTimeString = destTimeString.trim();
      destTimeString = destTimeString.replace('：', ':');
      var destTimeArr = destTimeString.split(':');

      if (DEBUGMODE.jumpDebug) {
        console.log(destTimeArr);
      }

      var destTime = 0;
      var destLevel = -1;

      if (DEBUGMODE.jumpDebug) {
        console.groupCollapsed('destTimeParse');
      }

      for (var i = destTimeArr.length - 1; i >= 0; i--) {
        destLevel++;
        destTime += parseInt(destTimeArr[i]) * Math.pow(60, destLevel);

        if (DEBUGMODE.jumpDebug) {
          console.log(parseInt(destTimeArr[i]) * Math.pow(60, destLevel));
        }
      }

      if (DEBUGMODE.jumpDebug) {
        console.groupEnd();
        console.log(destTime);
      }

      if (!isNaN(destTime)) {
        videoPlayer.el.currentTime = destTime;
      }
    }
  },
  seek: function seek(time) {
    this.el.currentTime += time;
  }
};
'#player-rev'.assignClick(function () {
  videoPlayer.seek(-5);
});
'#player-forw'.assignClick(function () {
  videoPlayer.seek(5);
});
'#player-jump'.assignClick(function () {
  videoPlayer.jump();
});
var modal = {
  basezindex: 10000,
  elementList: function elementList() {
    return document.querySelectorAll('modal');
  },
  custom: {
    info: {
      id: 'modal',
      render: function render(html) {
        var title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "信息";
        document.querySelector('#info h1').innerHTML = title;
        document.querySelector('#info p').innerHTML = html;
        modal.open('info');
      }
    },
    openfile: {
      id: 'openfile',
      onOpen: function onOpen() {
        openFile.el.textBox.select();
      }
    }
  },
  el: function el() {
    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    if (name != null) {
      var b = document.querySelector('modal#' + name);

      if (b == null) {
        throw 'ERROR: modal not found';
      } else {
        return b;
      }
    } else {
      throw 'ERROR: invalid argument';
    }
  },
  open: function open() {
    var _this5 = this;

    var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    if (target != null) {
      var theElement = document.querySelector('modal#' + target);
      theElement.style.zIndex = this.basezindex++;
      theElement.classList.remove('hidden');

      if (settings.isIE) {
        theElement.style.position = "relative";
      }

      setTimeout(function () {
        theElement.classList.remove('fadeout');
        var modelInf = _this5.custom[target];

        if (modelInf != undefined && modelInf.onOpen != undefined) {
          modelInf.onOpen();
        }
      }, 10);
    }
  },
  isOpen: function isOpen() {
    var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    if (target) {
      return !document.querySelector('modal#' + target).classList.contains('fadeout');
    } else {
      return undefined;
    }
  },
  close: function close() {
    var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    if (target != null) {
      document.querySelector('modal#' + target).classList.add('fadeout');
      setTimeout(function () {
        document.querySelector('modal#' + target).classList.add('hidden');
      }, 270);
    }
  },
  init: function init() {
    var _this6 = this;

    document.querySelectorAll('.close-button').forEach(function (item) {
      item.onclick = function (event) {
        _this6.close(item.parentElement.parentElement.id);
      };
    });
    document.querySelectorAll('modal').forEach(function (item) {
      item.onclick = function (event) {
        if (event.target.tagName == 'MODAL') {
          _this6.close(item.id);
        }
      };
    });
    document.querySelectorAll('[data-modal]').forEach(function (item) {
      item.onclick = function (event) {
        _this6.open(item.getAttribute('data-modal'));
      };
    });
  }
};
modal.init();

if (navigator.userAgent.indexOf('Firefox') == -1) {
  modal.open('welcome'); //Temporary fix for rendering issue

  modal.close('welcome');
  console.info('Doing settings workaround'); // document.querySelector('modal#settings').classList.add('fadeout')
}

var history = {
  cur: '',
  setup: function setup(obj) {
    if (settings.localStorage) {
      var a = localStorage.getItem('VNHistory');

      if (a) {
        this.cur = a;
        document.querySelector('#history-btn').innerHTML = a;
        document.querySelector('#history').classList.remove('hidden');
      }
    }
  },
  change: function change(str) {
    if (settings.localStorage) {
      localStorage.setItem('VNHistory', str);
      this.setup();
    }
  }
};
'#history-btn'.assignClick(function (event) {
  openFile.el.textBox.value = history.cur;
  onSubmitVideoURL();
});
history.setup();
var share = {
  establish: function establish() {
    if (history.cur != '') {
      var shareURI = 'https://smallg0at.github.io/VideoNotes/VideoNotes.html?query=' + history.cur;
      var url = new URL(shareURI);
      this.copy(url.href);
    } else {
      this.copy('https://smallg0at.github.io/VideoNotes/VideoNotes.html');
    }
  },
  copy: function copy(uri) {
    if (settings.usingNW) {
      nwClip.set(uri, 'text');
    } else {
      navigator.clipboard.writeText(uri);
    }

    alert('似乎已复制链接，可粘贴查看。');
  }
};
'#sharelink'.assignClick(function () {
  if (!settings.isIE) {
    share.establish();
  }
});
setTimeout(function () {
  if (shortcut.count <= 1) {
    modal.open('openfile'); // modal.open('settings')
  }

  if (!DEBUGMODE.devAction) {
    document.querySelector('#load-cover').parentElement.removeChild(document.querySelector('#load-cover'));
  }

  if (isFirstRun) {
    modal.open('welcome');
  }
}, 1000);

if (settings.usingNW || navigator.userAgent.toLowerCase().indexOf('windows') == -1) {
  document.querySelector('#dl-desktop').classList.add('hidden');
}

'#dl-desktop'.assignClick(function () {
  window.open('https://github.com/smallg0at/VideoNotes/releases/latest/');
});
setTimeout(function () {
  if (!settings.isIE && URIDetector.hasParam) {
    openFile.el.textBox.value = URIDetector.param;
    onSubmitVideoURL();
  }
}, 3000);

if (DEBUGMODE.devAction) {
  document.querySelector('#load-cover').parentElement.removeChild(document.querySelector('#load-cover'));
}

notes.onFinishLoad();
