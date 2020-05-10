const fs = require('fs')


var stra = fs.readFileSync('./src/settings.mjs', {
    encoding: 'utf-8'
})
var strb = fs.readFileSync('./src/main.mjs', {
    encoding: 'utf-8'
})
console.groupCollapsed('Concat and replace strings...')
let a = stra.indexOf('export')
for (let i = a; i < stra.length; i++) {
    const element = stra[i];
    if(element == '}'){
        let k = stra.substring(a,i+1)
        console.log('EXPORT',a,i)
        stra = stra.replace(k,"")
        break;
    }
}
let b = strb.indexOf('import')
for (let i = b; i < strb.length; i++) {
    const element = strb[i];
    if (element == '}') {
        let k = strb.substring(b, i + 1)
        console.log('EXPORT',b, i)
        strb = strb.replace(k, "")
        break;
    }
}
b = strb.lastIndexOf('pasteNew')
let flag = false
for (let i = b; i < strb.length; i++) {
    const element = strb[i];
    if(element == '》'){
        flag = true
    }
    if (element == '}' && flag) {
        let k = strb.substring(b-1, i + 1)
        console.log('PASTENEW',b, i)
        strb = strb.replace(k, "")
        break;
    }
}
strb = strb.replace(`'use strict';`,"")
strb = strb.replace(`from './settings.mjs'`,"")
strb = strb.replace('this.pasteNew()','')
var c = stra + strb
fs.writeFileSync('./main-c1.js',c)
console.groupEnd()

const childProcess = require("child_process")

console.log("Compiling with Babel...")
childProcess.exec('npx babel ./main-c1.js --out-file ./src/main-comp.js',(error, stdout, stderr) => {
    if (error) {
        console.error(`We have encountered an error while compiling:\n${error}`);
        return;
    }
    console.log('Done, removing main-c1.js.')
    fs.unlinkSync('./main-c1.js')
})
// npx babel script.js --out-file script-compiled.js
