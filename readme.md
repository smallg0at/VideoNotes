
<img src="./res/VideoNotes.png" width="150" align="right" style="z-index: 100">

# VideoNotes

A web-based application created for those who take notes while watching video.

![GitHub All Releases](https://img.shields.io/github/downloads/smallg0at/VideoNotes/total?style=flat-square)
![GitHub](https://img.shields.io/github/license/smallg0at/VideoNotes?style=flat-square)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/smallg0at/videonotes?style=flat-square)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/smallg0at/videonotes?style=flat-square)

📥 [Download with GitHub Release](https://github.com/smallg0at/VideoNotes/releases)

🌐 [Use Current Online (Standalone) Edition](https://smallg0at.github.io/VideoNotes/VideoNotes.html)

## Features

- Videos
  - supports opening from local
  - support online streaming:
    - bilibili
    - acfun
    - Microsoft Stream
- Support .pdf, .html opening as well as websites that allow iframe.
- Simplistic Design
- Non-distractive notes display
- nw.js support

## Deployment

### Browser

simply open `VideoNotes.html` in any browser or serve on a server.

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
