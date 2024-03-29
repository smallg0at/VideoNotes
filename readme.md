### **This project is no longer being actively maintained.**

This Project is still usable to this day (all features are there), but will no longer be maintained due to lack of interest.

There will only be security fixes by Github Dependabot that will (probably) never be actually compiled.

---

<img src="./res/VideoNotes.png" width="150" align="right" style="z-index: 100">

# VideoNotes

为边看视频边记录笔记的人群设计的基于网页的应用。

A web-based application created for those who take notes while watching video.



\*Language Support: only Chinese (Simplified) is supported.

![GitHub All Releases](https://img.shields.io/github/downloads/smallg0at/VideoNotes/total?style=flat-square)
![GitHub](https://img.shields.io/github/license/smallg0at/VideoNotes?style=flat-square)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/smallg0at/videonotes?style=flat-square)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/smallg0at/videonotes?style=flat-square)

📥 [从 GitHub Release 下载最新版（推荐，Windows x64） \| Download with GitHub Release](https://github.com/smallg0at/VideoNotes/releases)

🌐 [使用最新的在线版本 \| Use Current Online (Standalone) Edition](https://smallg0at.github.io/VideoNotes/VideoNotes.html)

## Features

- Videos
  - supports opening from local
  - support online streaming:
    - bilibili
    - acfun
    - Microsoft Stream
    - Youtube
- Support .pdf, .html opening as well as websites that allow iframe.
- Very Simplistic Design
- Non-distractive notes display
- nw.js support

## Deployment

### Browser

simply serve on a server, and modify `share.service` on main.mjs.

Internet Explorer is supported, but its scripts should be compiled from main.mjs with `npm run babel` first.

### node.js (nw.js)

```
npm install
npm start
```

## Build

```
npm run dist
```
