'use strict';
// console.log('ran script')

/*
* This is the main script, containing every module working
* for the player and gui.
*
* Classes are here as objects, which is used because I don't
* need extensibility.
*/
document.querySelector('video').src = "";
var textareaItem = document.querySelector('textarea');
var frameCount = 0;


// Importing everything from the settings panel
import {
    settings,
    DEBUGMODE,
    settingUtils,
    nwWindow,
    nwClip,
    isFirstRun
} from './settings.mjs'

/*
* Click assigner
* Usage:
* (query: string).assignClick((event)=>{
*  // do something
* })
*/
String.prototype.assignClick = function(func) {
    let a = document.querySelector(this);
    a.onclick = function(event) {
        func(event)
    }
}

// URL doesn't work for IE, so bypass.
if (!settings.isIE) {
    var URIDetector = {
        url: new URL(location.href),
        hasParam: false,
        param: ''
    }
    URIDetector.hasParam = URIDetector.url.searchParams.has('query')
    if (URIDetector.hasParam) {
        URIDetector.param = URIDetector.url.searchParams.get('query')
        document.querySelector('#parameter').classList.remove('hidden')
        document.querySelector('#parameter>info').innerHTML = '您正在用链接打开 ' + URIDetector.param + ' 。'
    }
    '#param-btn'.assignClick(() => {
        window.open(URIDetector.url.pathname, '_self')
    })
} else {
    document.querySelector('#sharelink').classList.add('hidden')
}

'#reset-everything'.assignClick((event) => {
    settingUtils.reset()
})

if (settings.usingNW) {
    document.querySelector('#is-app').textContent = "本地应用。"
}


var gui = {
    el: {
        left: document.querySelector('.left'),
        right: document.querySelector('.right')
    },
    mode: '',
    updateRightHeight: function() {//Update the notes's height on phones
        if (window.matchMedia("(orientation: portrait)").matches == true) {
            let leftComp = window.getComputedStyle(document.querySelector('.left'))
            let leftHeight = parseInt(leftComp.getPropertyValue('height'))
            document.querySelector('.right').style.height = (window.innerHeight - leftHeight - 5) + 'px'
        } else {
            document.querySelector('.right').setAttribute('style', '')
        }
    },
    setInnerIcon: function(query, iconName, extraLabel = null, important = false) {
        // Inject an icon to an interaction.
        // query: query string, icnoName: Fluent UI Core icon name,
        // extralabel: descriptive text on right, and important to display it on phone.
        document.querySelector(query).innerHTML = `<i class="ms-Icon ms-Icon--${iconName}" aria-hidden="true"></i>${(extraLabel ? `<iconlabel${(important ? ' class="important"' : '')}>${extraLabel}</iconlabel>` : '')}`
    },
    toggleContextMenu: function() {
        // Toggle the context menu.
        // document.querySelector('#more-options').classList.toggle('hidden')
        document.querySelector('#more-options').parentElement.classList.toggle('isopen')
    },
    windowIsOnTop: false,
    toggleOnTop: function() {
        // Toggle if always on top. nw.js ONLY.
        nwWindow.setAlwaysOnTop(!this.windowIsOnTop)
        this.windowIsOnTop = !this.windowIsOnTop
        gui.setInnerIcon('#winontop', (this.windowIsOnTop ? 'CheckboxComposite' : 'Checkbox'), '窗口置顶', true)
    },
    fullscreen: {
        toggle: function() {
            if (settings.usingNW) {
                nwWindow.toggleFullscreen()
                if (!nwWindow.isFullscreen) {
                    gui.setInnerIcon('#fullscreen', 'BackToWindow', '退出全屏 (f)', true)
                    // document.querySelector('#fullscreen').innerHTML = "退出全屏"
                } else {
                    gui.setInnerIcon('#fullscreen', 'FullScreen', '全屏 (f)', true)
                    // document.querySelector('#fullscreen').innerHTML = "全屏"
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
        onChange: function(forceValue = null) {
            console.log(forceValue)
            if (document.fullscreenElement || document.fullscreen) {
                gui.setInnerIcon('#fullscreen', 'BackToWindow', '退出全屏 (f)', true)
                // document.querySelector('#fullscreen').innerHTML = "退出全屏"
            } else {
                gui.setInnerIcon('#fullscreen', 'FullScreen', '全屏 (f)', true)
                // document.querySelector('#fullscreen').innerHTML = "全屏"
            }
        },
    },
    loadIndicator: {//controls the load indicator, with animations
        show: function() {
            if (!settings.isIE) {
                document.querySelector('#iframe-loading').classList.remove('hidden')
                setTimeout(() => {
                    document.querySelector('#iframe-loading').classList.remove('transparent')
                }, 50)
            }
        },
        hide: function() {
            document.querySelector('#iframe-loading').classList.add('transparent')
            setTimeout(() => {
                document.querySelector('#iframe-loading').classList.replace('transparent', 'hidden')
            }, 1050)
        }
    }
}
// assign triggers
window.onresize = gui.updateRightHeight()
'#fullscreen'.assignClick(() => gui.fullscreen.toggle())
'#context-toggle'.assignClick(() => gui.toggleContextMenu())
'#winontop'.assignClick(() => {
    gui.toggleOnTop()
})
'#refresh'.assignClick(() => {
    let tempElement = document.createElement('div')
    tempElement.id = 'load-cover'
    tempElement.style.opacity = 0
    document.documentElement.appendChild(tempElement)
    setTimeout(() => {
        tempElement.style.opacity = 1
        setTimeout(() => {
            tempElement.style.opacity = 1
            location.reload()
        }, 250)
    }, 100)
})
document.querySelectorAll('context>operation>interaction').forEach(item => {
    item.addEventListener('click', () => {
        gui.toggleContextMenu()
    })
})
gui.updateRightHeight()
if (!settings.usingNW) {
    document.querySelector('#winontop').classList.add('hidden')
}
document.addEventListener('fullscreenchange', () => {
    gui.fullscreen.onChange()
})


var notes = {
    container: document.querySelector('group'),
    isAlwaysOn: false,
    activeTimeout: -1,
    item: (id = 0) => {
        // Return the nth textarea. Cut feature.
        return document.querySelectorAll('textarea').item(id)
    },
    load: () => {
        if (settings.localStorage) {
            textareaItem.value = localStorage.videoNotes || ""; //拿到存储的文本
        }
    },
    save: () => {
        if (settings.localStorage) {
            localStorage.videoNotes = textareaItem.value
        }
    },
    setActive: function(force = false) {
        // light it up. force: will force it to light up infinitely till next trigger
        this.save()
        this.container.classList.add('isactive');
        try {
            clearTimeout(this.activeTimeout)
        } catch (error) {
            console.error(error)
        }
        if (textareaItem.value != "" && !force && window.innerWidth > 1024 && !this.isAlwaysOn) {
            this.activeTimeout = setTimeout(() => {
                this.container.classList.remove('isactive')
            }, 2500);
        }
    },
    init: function() {
        this.load()
        this.item().onscroll = () => notes.setActive()
        this.item().onselectionchange = () => notes.setActive()
        this.item().onselect = () => notes.setActive()
        // this.item().ontouchstart = ()=>textAreaSetActive(true)
        this.item().ontouchmove = () => notes.setActive()
        this.item().ontouchend = () => notes.setActive()
        this.container.onscroll = () => notes.setActive()
    },
    onFinishLoad: function() {
        this.item().placeholder = '在这里记点笔记吧。' + (settings.localStorage ? '' : '\n\n您的浏览器暂不支持本地存储，因此您的文本在刷新时不会被保留！')
    },
    insertText: function(target, text) {
        target.focus()
        if (typeof document.selection != "undefined") {
            document.selection.createRange().text = text;
        } else {
            target.value = target.value.substr(0, target.selectionStart) + text + target.value.substring(target.selectionStart, target.length);
        }
    }
}
notes.init()

var openFile = {
    el: {
        filePicker: document.querySelector('input[type=file]'),
        textBox: document.querySelector('#URLtextbox'),
        openButton: document.querySelector('#URLopen')
    },
    gui: {
        pasteContent: function(e) {
            if (settings.usingNW) {
                document.querySelector('#URLtextbox').value = nwClip.get()
            } else {
                if (navigator.clipboard.readText) {
                    this.pasteNew()
                } else {
                    document.querySelector('#URLtextbox').select()
                    document.execCommand('paste')
                    setTimeout(() => {
                        if (document.querySelector('#URLtextbox').value == "") {
                            modal.custom.info.render(
                                `您的浏览器不支持自动粘贴，请手动粘贴。`,
                                `提示`
                            )
                            document.querySelector('#URLpaste').classList.add('hidden')
                        }
                    }, 50);
                }
            }
            document.querySelector('#URLtextbox').select()
        },
        pasteNew: async function() {
            navigator.clipboard.readText()
                .then((text) => {
                    document.querySelector('#URLtextbox').value = text
                })
                .catch(err => {
                    // This can happen if the user denies clipboard permissions:
                    document.querySelector('#URLpaste').classList.add('hidden')
                    console.info('CLIPBOARD Denied', err)
                });
            // The symbol below is used by the babel command, don't delete
            //◫
        }

    },
    open: {
        local: function() {
            // Tries to open a local file.
            var selectedFile = openFile.el.filePicker.files.item(0)
            console.log(selectedFile)
            var {
                name,
                size,
                type
            } = selectedFile
            console.log("文件名:" + name + " 大小:" + size);
            document.querySelector('#file-info').innerHTML = `⏳ ${name}（${(size/1000000).toFixed(1)}MB）${(settings.enableBruteForce?' 正在加载中...':'')} ${size >= 100000000 && settings.enableBruteForce?'<br>文件过大，可能加载失败或页面崩溃。':''}`
            document.querySelector('#file-info').classList.toggle('hidden')
            if (settings.enableBruteForce) {
                // Bruteforce mode: for fun, and is buggy. Opening up 100MB+ files will cause explotion.
                var reader = new FileReader(); //这是核心,读取操作就是由它完成.
                console.log('BruteForce: init')
                reader.readAsDataURL(selectedFile)
                reader.onload = function() {
                    console.log('BruteForce: done, ' + this.result.length)
                    if (this.result.length == 0) {
                        alert('此文件没有内容或过大，加载失败。')
                    } else {
                        openFile.open.loadLocal(this.result, '', name)
                    }
                }
            } else {
                openFile.open.loadLocal(URL.createObjectURL(selectedFile), type, name)
            }
        },
        loadLocal: function(url = '', type = new String(), name = '') {
            setTimeout(() => {
                if (url.startsWith('data:video/') || type.startsWith('video/')) {
                    videoPlayer.activate(url, name)
                } else {
                    webFrame.load(url)
                }

                modal.close('openfile')
            }, 350)
        }
    }
}
openFile.el.filePicker.onchange = () => {
    openFile.open.local()
}

'#URLpaste'.assignClick((event) => openFile.gui.pasteContent(event))
'#URLopen'.assignClick((event) => {
    onSubmitVideoURL(event.shiftKey)
})


var shortcut = {
    list: new Map(),
    count: 0,
    defaultKeyOptions: {
        ctrl: false,
        shift: false,
        alt: false,
    },
    add: function(key, func) {
        // add a combination. Use in following order: ctrl, shift, alt or it won't work.
        return this.list.set(key.toLocaleLowerCase(), func)
    },
    check: function(key) {
        return this.list.has(key)
    },
    listen: function() {
        // set up the listener.
        document.onkeyup = (event) => {
            if (DEBUGMODE.keypress) {
                console.log('KEYUP:', event)
            }
            this.count++
            if (this.list.has('any')) {
                let a = this.list.get('any')
                a(event)
            }
            if (!event.key) {
                console.warn(ReferenceError('Key does not exist'))
                return null
            }
            let composedKey = event.key
            if (event.altKey) {
                composedKey = 'alt+' + composedKey
            }
            if (event.shiftKey) {
                composedKey = 'shift+' + composedKey
            }
            if (event.ctrlKey) {
                composedKey = 'ctrl+' + composedKey
            }
            composedKey = composedKey.toLocaleLowerCase()
            if (this.list.has(composedKey)) {
                let a = this.list.get(composedKey)
                a(event)
            }
        }
    }
}

{ // func: Set up shortcut
    shortcut.add('Control', (event) => {
        notes.setActive()
    })
    shortcut.add(' ', (event) => {
        if (event.target.tagName != 'TEXTAREA' && event.target.tagName != 'INPUT') {
            togglePlayPause()
        }
    })
    shortcut.add('F11', (event) => {
        event.preventDefault()
    })
    shortcut.add('Enter', (event) => {
        if (event.target.id == 'URLtextbox') {
            onSubmitVideoURL(false)
        }
    })
    shortcut.add('shift+Enter', (event) => {
        if (event.target.id == 'URLtextbox') {
            onSubmitVideoURL(true)
        }
    })
    shortcut.add('o', (event) => {
        if (event.target.tagName != 'TEXTAREA' && event.target.tagName != 'INPUT') {
            event.preventDefault()
            modal.isOpen('openfile') ? modal.close('openfile') : modal.open('openfile')
        }
    })
    shortcut.add('s', (event) => {
        if (event.target.tagName != 'TEXTAREA' && event.target.tagName != 'INPUT') {
            event.preventDefault()
            modal.isOpen('settings') ? modal.close('settings') : modal.open('settings')
        }
    })
    shortcut.add('f', (event) => {
        if (event.target.tagName != 'TEXTAREA' && event.target.tagName != 'INPUT') {
            event.preventDefault()
            gui.fullscreen.toggle()
        }
    })
    shortcut.add('any', (event) => {
        if (event.target.tagName == 'TEXTAREA') {
            notes.setActive()
        }
    })
    shortcut.add('Tab', (event) => {
        if (event.target.tagName != 'TEXTAREA' && event.target.tagName != 'INPUT') {
            document.querySelector('textarea').select()
        }
    })
    if (DEBUGMODE.quickRefresh) {
        shortcut.add('ctrl+r', (event) => {
            location.reload()
        })
    }
    if (settings.usingNW) {
        shortcut.add('F11', () => {
            gui.fullscreen.toggle()
        })
    }

    shortcut.add('ctrl+i', (event) => {
        if (event.target.tagName == 'TEXTAREA') {
            let playbackTime = 0
            if (videoPlayer.isAvailable) {
                playbackTime = videoPlayer.el.currentTime
            } else if (settings.usingNW) { //disabled
                if (webFrame.isAvailable == true) {
                    let timeData = null
                    let frame1 = document.querySelector('iframe').contentWindow
                    if (frame1.document.querySelector('video')) {
                        timeData = frame1.document.querySelector('video').currentTime
                    } else if (frame1.document.querySelector('iframe').contentWindow.document.querySelector('video')) {
                        timeData = frame1.document.querySelector('iframe').contentWindow.document.querySelector('video').currentTime
                    }
                    if (DEBUGMODE.timefilterDebug) {
                        console.log('InsTime: Web:', timeData)
                    }
                    if (timeData) {
                        playbackTime = timeData
                    } else {
                        modal.custom.info.render('当前网站暂时不支持插入时间。', '错误')
                    }
                }
            } else {
                return 0
            }
            if (DEBUGMODE.timefilterDebug) {
                console.log(playbackTime)
            }
            let playbackCounter = [0, 0, 0]
            playbackCounter[2] = Math.floor(playbackTime % 60)

            playbackCounter[1] = Math.floor(playbackTime / 60)
            while (playbackCounter[1] >= 60) {
                playbackCounter[1] -= 60
                playbackCounter[0]++
            }
            let fnstr = ''
            fnstr = (playbackCounter[0] > 0) ? (playbackCounter[0]) + ':' : ''
            fnstr = fnstr.concat((playbackCounter[0] > 0 && playbackCounter[1] < 10) ? '0' : '' + playbackCounter[1] + ':')
            fnstr = fnstr.concat(((playbackCounter[2] >= 10) ? '' : '0') + playbackCounter[2])
            notes.insertText(event.target, fnstr)
        }
    })
    if (settings.usingNW) {
        shortcut.add('ctrl+p', (event) => {
            let targetVideoElement = null
            if (webFrame.isAvailable == true) {
                let frame1 = document.querySelector('iframe').contentWindow
                if (frame1.document.querySelector('video')) {
                    targetVideoElement = frame1.document.querySelector('video')
                } else if (frame1.document.querySelector('iframe').contentWindow.document.querySelector('video')) {
                    targetVideoElement = frame1.document.querySelector('iframe').contentWindow.document.querySelector('video')
                }
            } else if (videoPlayer.isAvailable) {
                targetVideoElement = videoPlayer.el
            }
            if (targetVideoElement) {
                if (targetVideoElement.paused) {
                    targetVideoElement.play()
                } else {
                    targetVideoElement.pause()
                }
            }
        })
        shortcut.add('ctrl+r', () => {
            location.reload()
        })
    }
    shortcut.add('ctrl+]', () => {
        notes.isAlwaysOn = !notes.isAlwaysOn
    })



    shortcut.listen()
}


document.onkeydown = (event) => {
    if (DEBUGMODE.keypress) {
        console.log('KEYDN:', event)
    }
    if (event.key == 'Control') {
        notes.setActive(true)
    }
}

notes.setActive()

function calculateTimeString(time) {
    // a typical time generator, sample: 121 => 2:01. Support up to hours level.
    let playbackCounter = [0, 0, 0]
    playbackCounter[2] = Math.floor(time % 60)

    playbackCounter[1] = Math.floor(time / 60)
    while (playbackCounter[1] >= 60) {
        playbackCounter[1] -= 60
        playbackCounter[0]++
    }
    let fnstr = ''
    fnstr = (playbackCounter[0] > 0) ? (playbackCounter[0]) + ':' : ''
    fnstr = fnstr.concat((playbackCounter[0] > 0 && playbackCounter[1] < 10) ? '0' : '' + playbackCounter[1] + ':')
    fnstr = fnstr.concat(((playbackCounter[2] >= 10) ? '' : '0') + playbackCounter[2])
    return fnstr
}

setInterval(() => { //refreshes every 100ms, setting time bar
    if (frameCount >= 0) {
        if (videoPlayer.isAvailable) {
            let mediaPlayback = videoPlayer.el
            document.querySelector('#play-length').setAttribute('style', 'width: ' + (mediaPlayback.currentTime / mediaPlayback.duration * 100).toFixed(2) + '%;');
            // let existstr = Math.floor(mediaPlayback.currentTime / 60) + ':' + Math.floor(mediaPlayback.currentTime % 60)
            // let totalstr = Math.floor(mediaPlayback.duration / 60) + ':' + Math.floor(mediaPlayback.duration % 60)
            document.querySelector('.media-playback-timing').innerHTML = calculateTimeString(mediaPlayback.currentTime) + ' / ' + calculateTimeString(mediaPlayback.duration)
        }
    }
    frameCount++
    gui.updateRightHeight()
}, 100)
window.onbeforeunload = () => {
    if (!settings.localStorage && textareaItem.value != "") {
        return '文本框内仍有内容，确认离开？'
    }
}




function videoUrlParser(url = new String()) {
    //Parse the URL for good. RUBBISH CODE AHEAD!!!
    let targetURL;
    let lowURL = url.toLocaleLowerCase()
    if ((lowURL.startsWith('av') || lowURL.startsWith('bv') || url.indexOf('www.bilibili.com/video/') != -1 || url.indexOf('b23.tv/') != -1) && (!url.startsWith('||'))) {
        //bilibili mode
        // targetURL = 'https://www.bilibili.com/blackboard/newplayer.html?aid=' + targetURL
        if (settings.allowExperimentalAPI.bilibili == 1) {
            targetURL = 'http://xbeibeix.com/api/bilibilivideo.php?url=' + url
            // let req = new XMLHttpRequest()
        } else {
            targetURL = url.replace('www.bilibili.com/video/', '')
            targetURL = targetURL.replace('b23.tv/', '')
            targetURL = targetURL.replace('https://', '')
            targetURL = targetURL.replace('?p=', '&page=')
            targetURL = targetURL.replace('?', '&')
            if (lowURL.indexOf('bv') != -1) {
                targetURL = targetURL.replace('BV', '')
                targetURL = targetURL.replace('bv', '')
                targetURL = 'https://player.bilibili.com/player.html?bvid=' + targetURL + '&high_quality=1'
            } else {
                targetURL = targetURL.replace('av', '')
                targetURL = 'https://player.bilibili.com/player.html?aid=' + targetURL + '&high_quality=1'
            }
        }
        if (DEBUGMODE.inspectGeneratedURL) {
            console.log('ParseURL', 'bilibili', targetURL)
        }
        return {
            mode: 'bilibili',
            parsed: targetURL,
            interaction: function() {
                webFrame.load(targetURL, true)
            }
        }

    } else if ((url.startsWith('ac') || url.indexOf('www.acfun.cn/v/') != -1 || url.indexOf('m.acfun.cn/v/') != -1) && (!url.startsWith('||'))) {
        if (url.indexOf('m.acfun.cn') != -1) {
            targetURL = url.replace('https://m.acfun.cn/v/?ac=', '')
            targetURL = targetURL.substr(0, targetURL.indexOf('&'))
        } else {
            targetURL = url.replace('www.acfun.cn/v/', '')
            targetURL = targetURL.replace('https://', '')
            targetURL = targetURL.replace('ac', '')
            targetURL = targetURL.substr(0, targetURL.indexOf('_'))
        }
        // targetURL = targetURL.replace('?p=', '&page=')
        targetURL = 'https://www.acfun.cn/player/ac' + targetURL
        if (DEBUGMODE.inspectGeneratedURL) {
            console.log('ParseURL', 'acfun', targetURL)
        }
        return {
            mode: 'acfun',
            parsed: targetURL,
            interaction: function() {

                if (window.innerWidth <= 600) {
                    alert('acfun 网页播放器在手机上效果不一定正常。')
                }
                webFrame.load(targetURL, true)
            }
        }
    } else if (url.indexOf('web.microsoftstream.com/video/') != -1 && !url.startsWith('||')) {

        targetURL = url.replace('web.microsoftstream.com/video/', 'web.microsoftstream.com/embed/video/')
        // targetURL = targetURL.replace('?p=', '&page=')
        if (targetURL.indexOf('?st=') != -1) {
            targetURL = targetURL + '&autoplay=true&amp;showinfo=false'
        } else {
            targetURL = targetURL + '?autoplay=true&amp;showinfo=false'
        }
        if (DEBUGMODE.inspectGeneratedURL) {
            console.log('ParseURL', 'msstream', targetURL)
        }
        return {
            mode: 'ms-stream',
            parsed: targetURL,
            interaction: function() {
                webFrame.load(targetURL, true)
                document.querySelector('.left').classList.add('bilibili')
            }
        }
    } else if (url.indexOf('youtube.com') != -1 && !url.startsWith('||')) {
        let urlOBJ = new URL(url)
        if (settings.isIE) {
            return {
                mode: 'frame',
                parsed: url,
                interaction: function() {
                    webFrame.load(targetURL, false)
                    document.querySelector('.left').classList.remove('bilibili')
                }
            }
        }
        let videoID = urlOBJ.searchParams.get('v')
        let timeiter = urlOBJ.searchParams.get('t')
        targetURL = 'https://www.youtube.com/embed/' + videoID
        if (timeiter) {
            timeiter = timeiter.replace('s', '')
            targetURL = targetURL + '?start=' + timeiter
        }
        return {
            mode: 'youtube',
            parsed: targetURL,
            interaction: function() {
                webFrame.load(targetURL, true)
                document.querySelector('.left').classList.add('bilibili')
            }
        }
    } else if (url.startsWith('||')) {
        targetURL = url.replace('||', '');
        if (DEBUGMODE.inspectGeneratedURL) {
            console.log('ParseURL', 'frame', targetURL)
        }
        return {
            mode: 'frame',
            parsed: targetURL,
            interaction: function() {
                webFrame.load(targetURL, false)
                document.querySelector('.left').classList.remove('bilibili')
            }
        }
        // } else if (url.startsWith('blob:')) {
        //     return {
        //         mode: 'blob',
        //         error: 'Blob is not supported by now.'
        //     }

    } else {
        return {
            mode: 'video',
            parsed: url,
            interaction: function() {
                if (DEBUGMODE.inspectGeneratedURL) {
                    console.log('ParseURL', 'video', url)
                }
                videoPlayer.activate(url)
            }
        }
    }
}
var webFrame = {
    url: () => {
        this.el.src
    },
    el: document.querySelector('iframe'),
    isAvailable: false,
    load: function(url = '', isOnlineStream = false) {
        videoPlayer.unload()
        document.title = 'VideoNotes - Loading...'
        document.querySelector('video').classList.add('hidden')
        if (isOnlineStream) {
            document.querySelector('.left').classList.add('bilibili')
        } else {
            document.querySelector('.left').classList.remove('bilibili')
        }
        this.el.classList.remove('hidden')
        this.el.src = url
        gui.el.left.classList.add('hasframe')
        gui.loadIndicator.show()
        webFrame.isAvailable = true
    },
    unload: function() {
        gui.el.left.classList.remove('hasframe')
        gui.el.left.classList.remove('bilibili')
        gui.loadIndicator.hide()
        this.el.classList.add('hidden')
        this.el.src = ""
        this.isAvailable = false
    }
}
webFrame.el.contentWindow.onbeforeunload = () => {
    gui.loadIndicator.show()
}
webFrame.el.onload = function() {
    try {
        document.title = 'VideoNotes - ' + webFrame.el.contentWindow.document.title
    } catch (e) {
        document.title = 'VideoNotes - ' + webFrame.el.src
        console.warn(e)
    }
    gui.loadIndicator.hide()
    if (gui.mode == 'bilibili' && settings.usingNW) {
        let insertedStyle = webFrame.el.contentDocument.createElement('style')
        insertedStyle.innerHTML = `.bilibili-player .bilibili-player-area div.bilibili-player-video-control{background: black;border-color: black;opacity: 0.8}.bilibili-player-video-recommend-container, .bilibili-player-video-recommend,.bilibili-player-video-jump-to-bilibili-detail-bar,.bilibili-player-video-sendjumbar,.bilibili-player-video-pause-panel-container-qrcode,.bilibili-player-video-suspension-bar-btn-group-jumpbtn{	display: none !important;}.bilibili-player .bilibili-player-area .bilibili-player-video-control .bilibili-player-video-progress-bar{opacity: 0.6}.bilibili-player-video-sendjumpbar{display:none}div.bilibili-player-video-control{opacity: 0.5!important;transition:.25s all}div.bilibili-player-video-control:hover{opacity:0.9!important}`;
        webFrame.el.contentDocument.documentElement.appendChild(insertedStyle)
    }

}
webFrame.el.contentWindow.onerror = function() {
    alert('加载页面内容时出现了点问题，请稍后再试。')
    self.onload()
}

function onSubmitVideoURL(frame = false) {
    // runs as user submit their link.
    // frame: boolean: force it as webpage.
    let inputURL = openFile.el.textBox.value
    if (inputURL) {
        if (frame) {
            if (inputURL.indexOf('://') == -1) {
                inputURL = 'http://' + inputURL
            }
            inputURL = '||' + inputURL
        }
        if (inputURL.indexOf(share.service) != -1 && !settings.isIE) {
            let parser = new URL(inputURL)
            inputURL = parser.searchParams.get('query')
        }
        console.log(inputURL)
        let res = videoUrlParser(inputURL)
        document.querySelector('#file-info').innerHTML = '⏳ 正在处理链接并加载中...'
        openFile.el.textBox.disabled = true
        gui.mode = res.mode
        history.change(inputURL)
        document.querySelector('#file-info').classList.toggle('hidden')
        if (!res.error) {
            setTimeout(() => {
                modal.close('openfile')
                res.interaction()
                document.querySelector('#file-info').classList.toggle('hidden')
                openFile.el.textBox.disabled = false
                openFile.el.textBox.value = ""

            }, 500)
        } else {
            console.error(res.error)
            gui.setInnerIcon('#playpause', 'Error', '重新打开', true)
            alert(res.error)
        }
    }
}


function togglePlayPause() { //onclick playpause button
    let a = new URL(window.location.href)
    // console.log(a, videoPlayer.el.src)
    // console.log(videoPlayer.el.src.indexOf(a.pathname)!=1)
    if (videoPlayer.el.src.indexOf(a.pathname) != -1 || videoPlayer.inError) {
        modal.open('openfile')
    } else {
        if (videoPlayer.isPaused()) {
            videoPlayer.play()
        } else {
            videoPlayer.pause()
        }
        // videoPlayer.isPaused() ? videoPlayer.play() : videoPlayer.pause()
    }
}
'#playpause'.assignClick(function() {
    togglePlayPause();
})

'#openfile-sub'.assignClick(() => {
    modal.open('openfile')
})

var videoPlayer = {
    el: document.querySelector('video'),
    isAvailable: false,
    inError: false,
    isPaused: function() {
        return this.el.paused
    },
    play: function() {
        this.el.play()
    },
    pause: function() {
        this.el.pause()
    },
    onError: function(e) {
        gui.setInnerIcon('#playpause', 'Error', '打开', true)
        this.el.onplay = null
        this.el.onpause = null
        this.el.pause()
        this.inError = true
        this.isAvailable = false
        let f = JSON.stringify(e)
        console.log(f)
        document.title = 'VideoNotes - 错误'
        modal.custom.info.render(`很抱歉，视频播放时出现了错误。<br>当前正在播放：<a href="${e.srcElement.src}" class="help">${e.srcElement.src}</a><br>Timestamp: ${e.timeStamp}<br>本错误可能是由于不慎忘在网页URL前加 <code>||</code> 、网络连接不畅、视频编码不被支持导致的。<br>您可尝试使用网页模式打开、刷新页面、重启浏览器、重启计算机解决。`, '出现错误')
        document.querySelector('#time-edt').classList.add('nodisplay')
        gui.updateRightHeight()
        throw e
    },
    activate: function(url, overrideTitle = '') {
        webFrame.el.classList.add('hidden')
        this.el.classList.remove('hidden')
        gui.el.left.classList.remove('hasframe')
        gui.el.left.classList.remove('bilibili')
        webFrame.unload()
        this.el.src = url
        this.inError = false
        document.querySelector('#time-edt').classList.remove('nodisplay')
        setTimeout(() => {
            gui.loadIndicator.hide()
        }, 2500)
        if (overrideTitle) {
            document.title = 'VideoNotes - ' + overrideTitle
        } else {
            document.title = 'VideoNotes - ' + this.el.src
        }
        this.isAvailable = true
        this.el.onerror = (e) => {
            this.onError(e)
        }
        this.el.onplay = () => {
            gui.setInnerIcon('#playpause', 'Pause', '暂停')
            // label.innerHTML = '暂停'
        }
        this.el.onpause = () => {
            gui.setInnerIcon('#playpause', 'Play', '播放')
            // label.innerHTML = '播放'
        }
        this.el.onended = () => {
            gui.setInnerIcon('#playpause', 'Play', '重放')
            // label.innerHTML = '重放'
        }
        this.el.play()
        document.querySelector('#openfile-sub').classList.remove('hidden')

    },
    unload: function() {
        this.el.onplay = null
        this.el.onpause = null
        this.el.onerror = null
        this.el.pause()
        this.inError = false
        this.isAvailable = false
        this.el.src = ""
        document.querySelector('#time-edt').classList.add('nodisplay')
        document.querySelector('#openfile-sub').classList.add('hidden')
    },
    jump: function() {
        let pausedbef = this.isPaused()
        this.pause()
        let destTimeString = prompt('请输入目标时间（如 5:26）')
        if (destTimeString === null || destTimeString == "") {
            if (!pausedbef) {
                this.play()
            }
        } else {
            destTimeString = destTimeString.trim()
            destTimeString = destTimeString.replace('：', ':')
            let destTimeArr = destTimeString.split(':')
            if (DEBUGMODE.jumpDebug) {
                console.log(destTimeArr)
            }
            let destTime = 0
            let destLevel = -1
            if (DEBUGMODE.jumpDebug) {
                console.groupCollapsed('destTimeParse')
            }
            for (let i = destTimeArr.length - 1; i >= 0; i--) {
                destLevel++
                destTime += (parseInt(destTimeArr[i]) * (60 ** destLevel))
                if (DEBUGMODE.jumpDebug) {
                    console.log((parseInt(destTimeArr[i]) * (60 ** destLevel)))
                }
            }
            if (DEBUGMODE.jumpDebug) {
                console.groupEnd()
                console.log(destTime)
            }
            if (!isNaN(destTime)) {
                videoPlayer.el.currentTime = destTime
            }
        }
    },
    seek: function(time) {
        this.el.currentTime += time
    }
}

'#player-rev'.assignClick(() => {
    videoPlayer.seek(-5)
})
'#player-forw'.assignClick(() => {
    videoPlayer.seek(5)
})
'#player-jump'.assignClick(() => {
    videoPlayer.jump()
})

var modal = {
    basezindex: 10000,
    elementList: function() {
        return document.querySelectorAll('modal')
    },
    custom: {
        info: {
            id: 'modal',
            render: function(html, title = "信息") {
                document.querySelector('#info h1').innerHTML = title
                document.querySelector('#info p').innerHTML = html
                modal.open('info')
            }
        },
        openfile: {
            id: 'openfile',
            onOpen: function() {
                openFile.el.textBox.select()
            }
        }
    },
    el: function(name = null) {
        if (name != null) {
            let b = document.querySelector('modal#' + name)
            if (b == null) {
                throw 'ERROR: modal not found'
            } else {
                return b
            }
        } else {
            throw 'ERROR: invalid argument'
        }
    },
    open: function(target = null) {
        if (target != null) {
            let theElement = document.querySelector('modal#' + target)
            theElement.style.zIndex = this.basezindex++;
            theElement.classList.remove('hidden')
            if (settings.isIE) {
                theElement.style.position = "relative"
            }
            setTimeout(() => {
                theElement.classList.remove('fadeout')
                let modelInf = this.custom[target]
                if (modelInf != undefined && modelInf.onOpen != undefined) {
                    modelInf.onOpen()
                }
            }, 10)
        }
    },
    isOpen: (target = null) => {
        if (target) {
            return !document.querySelector('modal#' + target).classList.contains('fadeout')
        } else {
            return undefined
        }
    },
    close: function(target = null) {
        if (target != null) {
            document.querySelector('modal#' + target).classList.add('fadeout')
            setTimeout(() => {
                document.querySelector('modal#' + target).classList.add('hidden')
            }, 270);
        }
    },
    init: function() {
        document.querySelectorAll('.close-button').forEach((item) => {
            item.onclick = (event) => {
                this.close(item.parentElement.parentElement.id)
            }
        })
        document.querySelectorAll('modal').forEach((item) => {
            item.onclick = (event) => {
                if (event.target.tagName == 'MODAL') {
                    this.close(item.id)
                }
            }
        })
        document.querySelectorAll('[data-modal]').forEach((item) => {
            item.onclick = (event) => {
                this.open(item.getAttribute('data-modal'))
            }
        })
    }
}
modal.init();
if (navigator.userAgent.indexOf('Firefox') == -1) {
    //Temporary fix for rendering issue.
    // Chromium will lag a lot whan rendering welcome,
    // so preload it while users are waiting is a good idea.
    // I'll say firefox does it very smoothly.
    modal.open('welcome')
    modal.close('welcome')
    console.info('Doing settings workaround')
    // document.querySelector('modal#settings').classList.add('fadeout')
}

var history = {
    cur: '',
    setup: function(obj) {
        if (settings.localStorage) {
            let a = localStorage.getItem('VNHistory')
            if (a) {
                this.cur = a
                document.querySelector('#history-btn').innerHTML = a
                document.querySelector('#history').classList.remove('hidden')
            }
        }
    },
    change: function(str) {
        if (settings.localStorage) {
            localStorage.setItem('VNHistory', str)
            this.setup()
        }
    }
}
'#history-btn'.assignClick((event) => {
    openFile.el.textBox.value = history.cur
    onSubmitVideoURL()
})
history.setup()

var share = {
    service: 'https://smallg0at.github.io/VideoNotes/VideoNotes.html',
    // The service the user is currently using.
    establish: function() {
        if (history.cur != '') {
            var shareURI = this.service + '?query=' + history.cur
            var url = new URL(shareURI)
            this.copy(url.href)
        } else {
            this.copy(this.service)
        }
    },
    copy: function(uri) {
        if (settings.usingNW) {
            nwClip.set(uri, 'text')
        } else {
            navigator.clipboard.writeText(uri)
        }
        alert('似乎已复制分享链接（视频为最近一次观看的在线视频），可粘贴查看。')
    }
}
'#sharelink'.assignClick(() => {
    if (!settings.isIE) {
        share.establish()
    }
})

setTimeout(() => {
    if (shortcut.count <= 1) {
        modal.open('openfile')
        // modal.open('settings')

    }
    if (!DEBUGMODE.devAction) {
        document.querySelector('#load-cover').parentElement.removeChild(document.querySelector('#load-cover'))
    }
    if (isFirstRun) {
        modal.open('welcome')
    }

}, 1000);

if (settings.usingNW || navigator.userAgent.toLowerCase().indexOf('windows') == -1) {
    document.querySelector('#dl-desktop').classList.add('hidden')
}
'#dl-desktop'.assignClick(() => {
    window.open('https://github.com/smallg0at/VideoNotes/releases/latest/')
})

setTimeout(() => {
    if (!settings.isIE && URIDetector.hasParam) {
        // open up the video. Users will have to take notice of
        // what they are watching.
        openFile.el.textBox.value = URIDetector.param
        onSubmitVideoURL()
    }
}, 3500)
if (DEBUGMODE.devAction) {
    // remove the cover as soon as the script done working. dbg use only!
    document.querySelector('#load-cover').parentElement.removeChild(document.querySelector('#load-cover'))
}
notes.onFinishLoad()