var crypto = require('crypto');

function findProof(s, numZeroes) {
    var i = 0;
    var found = false;
    var hash_test;

    while (!found) {
        hash_test = hash(s + i);
        //console.log("hash(): ", hash(s))
        //console.log("hash() + i: ", hash(s + i))

        if (hash_test.indexOf("1", 0) >= numZeroes) {
            found = true;
        } else {
            i++;
        }
    }
    console.log("hash() + i: ", hash(s + i))
    return i;
}

function verifyProof(s, numZeroes, proofVal) {
    var hash_test = hash(s + proofVal);

    if (hash_test.indexOf("1", 0) >= numZeroes) {
        return true;
    }

    return false;
}

function hash(s) {
    var h = crypto.createHash('sha256').update(s).digest('hex');
    var binStr = parseInt(h, 16).toString(2);
    while (binStr.length < 256) {
        binStr = "0" + binStr;
    }
    return binStr;
}

var str = 'hello';
var z = 20;

console.log("findProof():", findProof(str, z))
console.log(verifyProof(str, z, findProof(str, z)))
console.log(verifyProof(str, z, 10))