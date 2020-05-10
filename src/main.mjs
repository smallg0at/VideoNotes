'use strict';
// console.log('ran script')
document.querySelector('video').src = "";
var textareaItem = document.querySelector('textarea');
var frameCount = 0;

import {
    settings,
    DEBUGMODE,
    settingUtils,
    nwWindow,
    nwClip
} from './settings.mjs'

String.prototype.assignClick = function(func) {
    let a = document.querySelector(this);
    a.onclick = function(event) {
        func()
    }
}


var gui = {
    el: {
        left: document.querySelector('.left'),
        right: document.querySelector('.right')
    },
    mode: '',
    updateRightHeight: function() {
        if (window.matchMedia("(orientation: portrait)").matches == true) {
            let leftComp = window.getComputedStyle(document.querySelector('.left'))
            let leftHeight = parseInt(leftComp.getPropertyValue('height'))
            document.querySelector('.right').style.height = (window.innerHeight - leftHeight - 5) + 'px'
        } else {
            document.querySelector('.right').setAttribute('style', '')
        }
    },
    setInnerIcon: function(query, iconName, extraLabel = null, important = false) {
        document.querySelector(query).innerHTML = `<i class="ms-Icon ms-Icon--${iconName}" aria-hidden="true"></i>${(extraLabel ? `<iconlabel${(important ? ' class="important"' : '')}>${extraLabel}</iconlabel>` : '')}`
    },
    toggleContextMenu: function() {
        // document.querySelector('#more-options').classList.toggle('hidden')
        document.querySelector('#more-options').parentElement.classList.toggle('isopen')
    },
    windowIsOnTop: false,
    toggleOnTop: function() {
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
                if (document.fullscreenElement||document.msFullscreenElement) {
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
    loadIndicator: {
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
    activeTimeout: -1,
    item: (id = 0) => {
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
        this.save()
        this.container.classList.add('isactive');
        try {
            clearTimeout(this.activeTimeout)
        } catch (error) {
            console.error(error)
        }
        if (textareaItem.value != "" && !force && window.innerWidth > 1024) {
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
            e.preventDefault()
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
            //》
        }

    },
    open: {
        local: function() {
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
'#URLopen'.assignClick(() => onSubmitVideoURL())

var shortcut = {
    list: new Map(),
    count: 0,
    defaultKeyOptions: {
        ctrl: false,
        shift: false,
        alt: false,
    },
    add: function(key, func) {
        return this.list.set(key, func)
    },
    check: function(key) {
        return this.list.has(key)
    },
    apply: function() {
        document.onkeyup = (event) => {
            if (DEBUGMODE.keypress) {
                console.log('KEYUP:', event)
            }
            this.count++
            if (this.list.has('any')) {
                let a = this.list.get('any')
                a(event)
            }
            if (this.list.has(event.key)) {
                let a = this.list.get(event.key)
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
            onSubmitVideoURL()
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
    if (settings.usingNW) {
        shortcut.add('F11', () => {
            gui.fullscreen.toggle()
        })
    }

    shortcut.apply()
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

setInterval(() => { //refreshes every 100ms, setting time bar
    if (frameCount >= 0) {
        if (videoPlayer.isAvailable) {
            let mediaPlayback = videoPlayer.el
            document.querySelector('#play-length').setAttribute('style', 'width: ' + (mediaPlayback.currentTime / mediaPlayback.duration * 100).toFixed(2) + '%;');
            let existstr = Math.floor(mediaPlayback.currentTime / 60) + ':' + Math.floor(mediaPlayback.currentTime % 60)
            let totalstr = Math.floor(mediaPlayback.duration / 60) + ':' + Math.floor(mediaPlayback.duration % 60)
            document.querySelector('.media-playback-timing').innerHTML = existstr + ' / ' + totalstr
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
    },
    unload: function() {
        gui.el.left.classList.remove('hasframe')
        gui.el.left.classList.remove('bilibili')
        gui.loadIndicator.hide()
        this.el.classList.add('hidden')
        this.el.src = ""
    }
}
webFrame.el.contentWindow.onbeforeunload = () => {
    gui.loadIndicator.show()
}
webFrame.el.onload = function() {
    document.title = 'VideoNotes - ' + webFrame.el.contentWindow.document.title
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

function onSubmitVideoURL() {
    let inputURL = openFile.el.textBox.value
    if (inputURL) {
        let res = videoUrlParser(inputURL)
        document.querySelector('#file-info').innerHTML = '⏳ 正在处理链接并加载中...'
        openFile.el.textBox.disabled = true
        gui.mode = res.mode
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
    if (window.location.href.indexOf(videoPlayer.el.src) != -1 || videoPlayer.inError) {
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
document.querySelector('#playpause').addEventListener('click', function() {
    togglePlayPause();
})
'#openfile-sub'.assignClick(()=>{
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
        modal.custom.info.render(`很抱歉，视频播放时出现了错误。<br>当前正在播放：<a href="${e.srcElement.src}" class="help">${e.srcElement.src}</a><br>Timestamp: ${e.timeStamp}<br>本错误可能是由于不慎忘在网页URL前加 <code>||</code> 、网络连接不畅、视频编码不被支持导致的。<br>您可尝试刷新页面、重启浏览器、重启计算机解决。`, '出现错误')
        document.querySelector('#time-edt').classList.add('nodisplay')
        gui.updateRightHeight()
        throw e
    },
    activate: function(url, overrideTitle = '') {
        webFrame.el.classList.add('hidden')
        this.el.classList.remove('hidden')
        gui.el.left.classList.remove('hasframe')
        gui.el.left.classList.remove('bilibili')
        this.el.src = url
        this.inError = false
        document.querySelector('#time-edt').classList.remove('nodisplay')
        gui.loadIndicator.hide()
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
    unload: function(){
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
        let destTimeString = prompt('请输入目标秒数')
        if (destTimeString === null || destTimeString == "") {
            if (!pausedbef) {
                this.play()
            }
        } else {
            let destTime = parseInt(destTimeString)
            console.log(destTime)
            if (!isNaN(destTime)) {
                videoPlayer.el.currentTime = destTime
            }
        }
    },
    seek: function(time) {
        this.el.currentTime += time
    }
}

'#player-rev'.assignClick(()=>{
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
            onOpen: function(){
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
                if(modelInf != undefined && modelInf.onOpen != undefined){
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
    modal.open('settings') //Temporary fix for rendering issue
    modal.close('settings')
    console.info('Doing settings workaround')
    // document.querySelector('modal#settings').classList.add('fadeout')
}

setTimeout(() => {
    if (shortcut.count <= 1) {
        modal.open('openfile')
        // modal.open('settings')

    }
    if (!DEBUGMODE.devAction) {
        document.querySelector('#load-cover').parentElement.removeChild(document.querySelector('#load-cover'))
    }
}, 1000);
if (DEBUGMODE.devAction) {
    document.querySelector('#load-cover').parentElement.removeChild(document.querySelector('#load-cover'))
}
notes.onFinishLoad()