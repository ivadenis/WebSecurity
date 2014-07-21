var keypair = require('keypair');
var fs = require('fs');

var pair = keypair();
fs.writeFile('./pub.txt', pair.public, function(err) {
  if (err) console.log(err);
});
fs.writeFile('./priv.txt', pair.private, function(err) {
  if (err) console.log(err);
});




