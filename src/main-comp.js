'use strict'; //info: this should be written with compatibility.

var _this3 = void 0;

var DEBUGMODE = {
  keypress: false,
  inspectGeneratedURL: false,
  setting: false,
  devAction: false
};
var settings = {
  isIE: false,
  localStorage: true,
  allowExperimentalAPI: {
    bilibili: 1
  },
  hasPasteApi: true,
  hasPermission: true,
  enableBruteForce: false,
  usingNW: false
};
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
        localStorage.videoNotes = '';
        localStorage.VNSettings = '';
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
var gui = {
  el: {
    left: document.querySelector('.left'),
    right: document.querySelector('.right')
  },
  updateRightHeight: function updateRightHeight() {
    if (window.innerWidth <= 1024) {
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
    document.querySelector('#more-options').classList.toggle('hidden');
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
        if (document.fullscreenElement) {
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
  }
};
window.onresize = gui.updateRightHeight();

document.querySelector('#fullscreen').onclick = function () {
  return gui.fullscreen.toggle();
};

document.querySelector('#context-toggle').onclick = function () {
  return gui.toggleContextMenu();
};

document.querySelector('#winontop').onclick = function () {
  gui.toggleOnTop();
};

document.querySelector('#refresh').onclick = function () {
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
};

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
    this.save();
    this.container.classList.add('isactive');

    try {
      clearTimeout(this.activeTimeout);
    } catch (error) {
      console.error(error);
    }

    if (textareaItem.value != "" && !force && window.innerWidth > 1024) {
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
      e.preventDefault();

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

document.querySelector('#URLpaste').onclick = function (event) {
  return openFile.gui.pasteContent(event);
};

var shortcut = {
  list: new Map(),
  count: 0,
  defaultKeyOptions: {
    ctrl: false,
    shift: false,
    alt: false
  },
  add: function add(key, func) {
    return this.list.set(key, func);
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

      if (_this2.list.has(event.key)) {
        var _a = _this2.list.get(event.key);

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
      onSubmitVideoURL();
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
  load: function load() {
    var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var isOnlineStream = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
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
    document.querySelector('#iframe-loading').classList.remove('hidden');
  },
  unload: function unload() {
    gui.el.left.classList.remove('hasframe');
    gui.el.left.classList.remove('bilibili');
    this.el.classList.add('hidden');
    this.el.src = "";
  }
};

webFrame.el.contentWindow.onbeforeunload = function () {
  document.querySelector('#iframe-loading').classList.remove('hidden');
  document.querySelector('#iframe-loading').classList.remove('transparent');
};

webFrame.el.onload = function () {
  document.title = 'VideoNotes - ' + webFrame.el.contentWindow.document.title;
  document.querySelector('#iframe-loading').classList.add('transparent');
  setTimeout(function () {
    document.querySelector('#iframe-loading').classList.replace('transparent', 'hidden');
  }, 1050);
};

webFrame.el.contentWindow.onerror = function () {
  alert('加载页面内容时出现了点问题，请稍后再试。');
  self.onload();
};

function onSubmitVideoURL() {
  var inputURL = openFile.el.textBox.value;

  if (inputURL) {
    var res = videoUrlParser(inputURL);
    document.querySelector('#file-info').innerHTML = '⏳ 正在处理链接并加载中...';
    openFile.el.textBox.disabled = true;
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
  if (window.location.href.indexOf(videoPlayer.el.src) != -1 || videoPlayer.inError) {
    modal.open('openfile');
  } else {
    if (videoPlayer.isPaused()) {
      videoPlayer.play();
    } else {
      videoPlayer.pause();
    } // videoPlayer.isPaused() ? videoPlayer.play() : videoPlayer.pause()

  }
}

document.querySelector('#playpause').addEventListener('click', function () {
  togglePlayPause();
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
    this.el.src = url;
    this.inError = false;
    document.querySelector('#time-edt').classList.remove('nodisplay');

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
  },
  jump: function jump() {
    var pausedbef = this.isPaused();
    this.pause();
    var destTimeString = prompt('请输入目标秒数');

    if (destTimeString === null || destTimeString == "") {
      if (!pausedbef) {
        this.play();
      }
    } else {
      var destTime = parseInt(destTimeString);
      console.log(destTime);

      if (!isNaN(destTime)) {
        videoPlayer.el.currentTime = destTime;
      }
    }
  },
  seek: function seek(time) {
    this.el.currentTime += time;
  }
};
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
    var _this5 = this;

    document.querySelectorAll('.close-button').forEach(function (item) {
      item.onclick = function (event) {
        _this5.close(item.parentElement.parentElement.id);
      };
    });
    document.querySelectorAll('modal').forEach(function (item) {
      item.onclick = function (event) {
        if (event.target.tagName == 'MODAL') {
          _this5.close(item.id);
        }
      };
    });
    document.querySelectorAll('[data-modal]').forEach(function (item) {
      item.onclick = function (event) {
        _this5.open(item.getAttribute('data-modal'));
      };
    });
  }
};
modal.init();

if (navigator.userAgent.indexOf('Firefox') == -1) {
  modal.open('settings'); //Temporary fix for rendering issue

  modal.close('settings');
  console.info('Doing settings workaround'); // document.querySelector('modal#settings').classList.add('fadeout')
}

setTimeout(function () {
  if (shortcut.count <= 1) {
    modal.open('openfile'); // modal.open('settings')

    openFile.el.textBox.select();
  }

  if (!DEBUGMODE.devAction) {
    document.querySelector('#load-cover').parentElement.removeChild(document.querySelector('#load-cover'));
  }
}, 1000);

if (DEBUGMODE.devAction) {
  document.querySelector('#load-cover').parentElement.removeChild(document.querySelector('#load-cover'));
}

notes.onFinishLoad();
