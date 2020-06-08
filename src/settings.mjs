'use strict';
//info: this should be written with compatibility.

const DEBUGMODE = {
    keypress: false,
    inspectGeneratedURL: false,
    setting: false,
    devAction: false,
    quickRefresh: false,
    timefilterDebug: false
}
const version="1.8.2"
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
}
var isFirstRun = false
var settingUtils = {
    read: function() {
        if (settings.localStorage) {
            if (localStorage.VNSettings != 'null' && localStorage.VNSettings) {
                settings = JSON.parse(localStorage.VNSettings)
                if (DEBUGMODE.setting) {
                    console.log('READ:', JSON.parse(localStorage.VNSettings))
                }

            } else {
                localStorage.VNSettings = JSON.stringify(settings)
                if (DEBUGMODE.setting) {
                    console.log('READ:FW', JSON.parse(localStorage.VNSettings))
                }
            }
            this.onRead()
        }
    },
    onRead: function() {
        document.querySelector('#bilibili-ext').selectedIndex = settings.allowExperimentalAPI.bilibili
        document.querySelector('#bilibili-ext').onchange = function() {
            settings.allowExperimentalAPI.bilibili = document.querySelector('#bilibili-ext').selectedIndex
            settingUtils.write()
        }
        if (settings.enableBruteForce) {
            console.log()
            document.querySelector('#enable-force-method').checked = true
        }
        document.querySelector('#enable-force-method').onchange = function() {
            settings.enableBruteForce = document.querySelector('#enable-force-method').checked
            settingUtils.write()
        }
    },
    write: function() {
        if (settings.localStorage) {
            localStorage.VNSettings = JSON.stringify(settings)
            if (DEBUGMODE.setting) {
                console.log('WRITE:', JSON.parse(localStorage.VNSettings))
            }
        }
    },
    reset: function() {
        if (settings.localStorage) {
            if (confirm('确认清除设置与笔记？本操作无法撤销！')) {
                localStorage.clear()
                alert('清除完毕，页面将会刷新。')
                location.reload()
            }
        } else {
            alert('没有资源能被重置。')
        }
    },
    interaction: {
        onDisableLocalStorage: function() {
            document.getElementById('localStorage-error').classList.remove('hidden')
            document.getElementById('settings-icon').style.color = 'rgb(92,92,0)';
            settings.localStorage = false;
        },
        checkIfIE: function() {
            if (navigator.userAgent.indexOf('Trident') != -1 && navigator.userAgent.indexOf('Edge') == -1) {
                console.log(navigator.userAgent)
                settings.isIE = true
            }
        },
        checkLS: function() {
            try {
                localStorage.getItem('videoNotes')
            } catch (e) {
                this.onDisableLocalStorage()
                console.info('LocalStorage is now DISABLED due to exception')
                // console.warn(e)
            }
        },
        grantClipboard: function() {
            if (navigator.clipboard) {
                navigator.clipboard.readText()
            } else {
                console.warn('Clipboard API is not available')
            }
        },
        checkPasteAPI: function() {
            if (!navigator.clipboard) {
                document.querySelector('#URLpaste').classList.add('hidden');
                settings.hasPasteApi = false
            }
        },
        checkNW: function() {
            try {
                if (nw) {
                    settings.usingNW = true
                }
            } catch (e) {
                console.info("NW is not present on this env.")
            }
        }
    }
}
settingUtils.interaction.checkLS()
settingUtils.read()

settingUtils.interaction.checkIfIE()
settingUtils.interaction.checkPasteAPI()
settingUtils.interaction.checkNW()
if(version != settings.lastUsedVersion){
    isFirstRun = true
    console.log('isFirstRun:', settings.lastUsedVersion)
    settings.lastUsedVersion = version
}
settingUtils.write()
var nwWindow = null
var nwClip = null
if (settings.usingNW) {
    nwWindow = nw.Window.get()
    nwClip = nw.Clipboard.get()
    nwWindow.show(true)
    nwWindow.focus()
} else {
    //do nothing
}

export {
    settings,
    DEBUGMODE,
    settingUtils,
    nwWindow,
    nwClip,
    isFirstRun
}