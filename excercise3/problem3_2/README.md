(10 points) Install the keypair module for node:
  `npm install keypair`

(a) Download genKeys.js and testSig.js from the course website. Generate a public and private key.
Update the signMessage and verifySignature methods from testSig.js. (You might find http:
//nodejs.org/api/crypto.html helpful). Turn in your modified testSig.js code. A sample run of
this program’s expected behavior is given below.
```
  $ node testSig.js sign message.txt privKey.txt sig.txt
  Signature created
  $ cat sig.txt
  235ccd1ab9b797991976c657b210d3c931d7c3fb5c356c44049d56e0fefef...
  $ node testSig.js verify message.txt wrongPubKey.txt sig.txt
  Invalid signature
  $ node testSig.js verify message.txt rightPubKey.txt sig.txt
  Signature is valid
  ```
(b) Download message.txt, sig.txt, alicePub.txt, bobPub.txt, and charliePub.txt.
Who signed the message?
