var fs = require('fs');
var net = require('net');
var crypto = require('crypto');
var readline = require('readline');
var _ = require('underscore');

var PORT_MIN_RANGE = 9000
var PORT_MAX_RANGE = 9010

var INITIAL_LEDGER = {
    '404f8fd144': 132,
    '07f946d659': 46,
    'c214b8bfb6': 8,
    '2be9fbe5da': 200
};

function CoinClient(privKeyFile, pubKeyFile, conn) {
    this.privKey = fs.readFileSync(privKeyFile).toString('ascii');
    this.pubKey = fs.readFileSync(pubKeyFile).toString('ascii');
    this.ledger = INITIAL_LEDGER;
    this.srvr = net.createServer();
    this.srvr.on('connection', this.makeMessageReceiver(this));
    this.srvr.listen(conn.port);
    // Get the latest version of the ledger
    this.broadcast({
        type: 'getledger'
    });
}

CoinClient.prototype.transferFunds = function(details) {
    var sign = crypto.createSign('RSA-SHA256');
    var trans = {
        type: 'transfer'
    };
    var msg = JSON.stringify(details);
    trans.details = details;
    trans.sig = sign.update(msg).sign(this.privKey, 'hex');
    trans.pubKey = this.pubKey;
    trans.id = this.getID();
    this.broadcast(trans);
    this.validateTransfer(trans);
}

CoinClient.prototype.makeMessageReceiver = function(self) {
    return function(client) {
        client.on('data', function(data) {
            var trans = JSON.parse(data);
            if (trans.id === self.getID()) return; // Ignore your own messages
            switch (trans.type) {
                case 'getledger':
                    self.broadcast({
                        type: 'shareledger',
                        'ledger': self.ledger
                    });
                    break;
                case 'shareledger':
                    self.ledger = trans.ledger;
                    console.log("Transaction ledger updated");
                    self.showLedger();
                    if (rl) rl.prompt(); // Repeating prompt for UI
                    break;
                case 'transfer':
                    self.validateTransfer(trans);
                    break;
                case 'reject':
                    console.log("Reject from " + trans.id + ": " + trans.msg);
                    break;
                case 'accept':
                    // Ignore for now
                    break;
                default:
                    console.log("Unhandled message type: " + trans.type);
            }
        });
    };
}

CoinClient.prototype.signMessage = function(message, privKey) {
    var signer = crypto.createSign('RSA-SHA256');
    signer.update(message);
    console.log('Signature created');
    return signer.sign(privKey, 'hex');
}

CoinClient.prototype.verifySignature = function(message, pubKey, sig) {
    var verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(message);
    return verifier.verify(pubKey, sig, 'hex');
}

CoinClient.prototype.validateTransfer = function(trans) {
    debugger
    var msg = JSON.stringify(trans.details);
    var coins = this.ledger[trans.id];

    var id = trans.id;

    // Create new ledger
    var newLedger = {};
    newLedger.prev = this.ledger; // Retaining a copy of the old ledger

    if (this.verifySignature(msg, trans.pubKey, trans.sig)) {
        console.log('verified')

        if (newLedger.prev[id]) { newLedger.prev[id] -= coins; }
    
        _.forEach(JSON.parse(msg), function(val, key, list) {
            if (newLedger.prev[key] !== undefined) {
                newLedger.prev[key] += val
            } else {
                console.log('Account "%s" not found. Returning %d$ to "%s"!', key, val, id);
                newLedger.prev[id] += val
            }
        }, this);
    } else { console.log("can't verify the transaction!") }

    this.ledger = newLedger.prev;
    this.broadcast({ type: 'accept'});
}

// Creating a more readable ID
CoinClient.prototype.getID = function() {
    this.id = this.id || crypto.createHash('sha256').update(this.pubKey).digest('hex').slice(0, 10);
    return this.id;
}

CoinClient.prototype.getCoins = function() {
    return this.ledger[this.getID()];
}

CoinClient.prototype.showLedger = function() {
    var keys = Object.keys(this.ledger);
    for (var i in keys) {
        var id = keys[i];
        console.log(id + " has " + this.ledger[id]);
    }
}

CoinClient.prototype.broadcast = function(msgObj, client) {
    msgObj.id = this.getID();
    var data = JSON.stringify(msgObj);
    for (p = PORT_MIN_RANGE; p < PORT_MAX_RANGE; p++) {
        (function() { // Creating a closure, because JavaScript.
            var client = net.connect({
                'port': p
            }, function() {
                client.write(data);
            });
            client.on('error', function(e) {
                //console.error(e);
            });
        })(); // ending closure
    }
}



// Functions for UI

function displayCommands() {
    console.log("Type 'getledger' to request the latest ledger from others.");
    console.log("Type 'showledger' to see your own copy of the ledger.");
    console.log("Type 'transfer' to send a note to another user");
    console.log("Type 'exit' to exit the program");
    console.log("Type 'help' to see this message.");
}

function allocateCoins(coins, trans) {
    trans = trans || {};

    // Base case
    if (coins === 0) {
        cc.transferFunds(trans);
        console.log('Transaction broadcast.');
        rl.prompt();
        return;
    }

    console.log('You have ' + coins + ' coins remaining.');
    rl.question('Specify a user to give coins to: ', function(user) {
        rl.question('How many coins will you give to ' + user + ': ', function(c) {
            c = parseInt(c);
            if (c > coins) {
                console.log('**ERROR** You do not have that many coins');
                allocateCoins(coins, trans);
            } else {
                var prevAmt = trans[user] || 0;
                trans[user] = prevAmt + c;
                allocateCoins(coins - c, trans);
            }
        });
    });
}

function handleTransferReq() {
    var coins = cc.getCoins();

    console.log('***BE SURE TO ALLOCATE ALL COINS***');
    console.log('Any remaining coins you should allocate to yourself');
    console.log('If you forget to include yourself, your coins will disappear');

    allocateCoins(coins);
}

function readCommand() {
    rl.setPrompt("Command> ");
    rl.prompt();
    rl.on('line', function(answer) {
        switch (answer.trim()) {
            case 'getledger':
                cc.broadcast({
                    type: 'getledger'
                });
                break;
            case 'showledger':
                cc.showLedger();
                break;
            case 'transfer':
                handleTransferReq();
                break;
            case 'help':
                displayCommands();
                break;
            case 'exit':
                process.exit(0);
                break;
            default:
                console.log("I'm sorry, but I don't understand your command");
                displayCommands();
        }
        rl.prompt();
    }).on('close', function() {
        process.exit(0);
    });
}


if (process.argv.length < 5) {
    console.error("Usage: " + process.argv[0] + " <private key> <public key> <port>");
    process.exit();
}
var privKey = process.argv[2];
var pubKey = process.argv[3];
var conn = {
    port: process.argv[4]
};

var cc = new CoinClient(privKey, pubKey, conn);
console.log("Starting process for " + cc.getID());

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

displayCommands();
readCommand();
