var fs = require('fs');
var net = require('net');
var crypto = require('crypto');
var readline = require('readline');

function CoinClient(privKeyFile, pubKeyFile, conn) {
  this.privKey = fs.readFileSync(privKeyFile).toString('ascii');
  this.pubKey = fs.readFileSync(pubKeyFile).toString('ascii');
  this.srvr = net.createServer();
  this.srvr.on('connection', this.receiveIOU.bind(this)); // bind context of the callback to this
  this.srvr.listen(conn.port);
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

CoinClient.prototype.sendIOU = function(to, msg) {
  var trans = {};
  trans.msg = msg;
  trans.pubKey = this.pubKey;
  trans.id = this.getID();
  trans.sig = this.signMessage(msg, this.privKey);
  var client = net.connect({port:to}, function() {
    client.write(JSON.stringify(trans));
  });
}

CoinClient.prototype.receiveIOU = function(client) {
  var self = this;
  client.on('data', function(data) {
    var trans = JSON.parse(data);
    if ( self.verifySignature(trans.msg, trans.pubKey, trans.sig) ) { 
      console.log("Verified!");
      console.log("Msg: " + trans.msg);
    } else { console.log("not verified!") }
    
    if (rl) rl.prompt(); // Repeat prompt for UI
  });
}



// Creating a more readable ID
CoinClient.prototype.getID = function() {
  this.id = this.id || crypto.createHash('sha256').update(this.pubKey).digest('hex').slice(0,10);
  return this.id;
}


// Functions for UI

function displayCommands() {
  console.log("Type 'help' to see this message.");
  console.log("Type 'transfer' to send a note to another user");
  console.log("Type 'exit' to exit the program");
}

function handleTransferReq() {
  rl.question("Port of recipient: ", function(port) {
    rl.question("Your message: ", function(msg) {
      cc.sendIOU(port,msg);
      console.log('Message sent.');
      rl.prompt();
    });
  });
}

function readCommand() {
  rl.setPrompt("Command> ");
  rl.prompt();
  rl.on('line', function(answer) {
    switch (answer.trim()) {
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


// The "main method", so to speak

if (process.argv.length < 5) {
  console.error("Usage: " + process.argv[0]
      + " <private key> <public key> <port>");
  process.exit();
}
var privKey = process.argv[2];
var pubKey = process.argv[3];
var conn = {port: process.argv[4]};

var cc = new CoinClient(privKey, pubKey, conn);
console.log("Starting process for " + cc.getID());

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

displayCommands();
readCommand();

