var crypto = require('crypto');
var fs = require('fs');

function signMessage(message, privKey, sigFile) {
    var signer = crypto.createSign('RSA-SHA256');
    
    signer.update(message);

    fs.writeFile(sigFile, signer.sign(privKey, 'hex'), function(err) {
        if (err) throw err;
        console.log("sig.txt created....")
    })
    console.log('Signature created');
}

function verifySignature(message, pubKey, sig) {
    var verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(message);
    return verifier.verify(pubKey, sig, 'hex');
}

if (process.argv.length < 6) {
    console.error("Usage: " + process.argv[0] + " testSig.js" + " sign <original message> <private key> <signature file>");
    console.error("   OR");
    console.error("       " + process.argv[0] + " testSig.js" + " verify <original message> <public key> <signature file>");
    process.exit();
}

var cmd = process.argv[2];
var messageFile = process.argv[3];
var keyFile = process.argv[4];
var sigFile = process.argv[5];

var message = fs.readFileSync(messageFile).toString('ascii');
var key = fs.readFileSync(keyFile).toString('ascii');

if (cmd === 'sign') {
    signMessage(message, key, sigFile);
} else if (cmd === 'verify') {
    var sig = fs.readFileSync(sigFile).toString('ascii').trim();
    var success = verifySignature(message, key, sig);
    if (success) {
        console.log("Signature is valid");
    } else {
        console.log("Invalid signature");
    }
}
