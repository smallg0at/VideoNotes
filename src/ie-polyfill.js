/*
 Functions Polyfill for IE
*/
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(str) {
        if (this == null) {
            throw TypeError
        }
        var string = String(this)
        if (string.indexOf(str) == 0) {
            return true
        } else {
            return false
        }
    }
}

Array.prototype.forEach = function(callback){
    if (this == null) {
        throw TypeError
    }
    var objList = Array(this)
    for (let index = 0; index < objList.length; index++) {
        callback(objList[index], index)
    }
}

NodeList.prototype.forEach = function(callback){
    if (this == null) {
        throw TypeError
    }
    var objList = this
    for(let index=0;index<objList.length;index++){
        callback(objList.item(index), index)
    }
}