
## (10 points) Combine the ledger-based cryptocurrency with your proof of work code.

1. Update the validateTransfer method to find a proof of work, where `hash(JSON.stringify(ledger)+proof)` produces 10 leading zeroes. The ledger itself should include one additional “mined” cryptocoin for the miner’s account (as the miner’s reward for verifying the transaction). Broadcast your proof when found, and verify the proofs of others. <br>
2. Add a jsontransfer command to the readCommand method. This method should work like transfer, except that it takes a JSON formatted string instead of prompting for users to specify coins. The object should specify how many coins each user will receive in the transaction. Validation should not be performed, since this will allow you to simulate an untrustworthy client.<br>
3. (Bonus +5 points) 
Update your code so that it verifies the entire blockchain when a new proof is sent. If the new blockchain is shorter than the current one, ignore it. Likewise, if any block does not have a correct proof, ignore the new ledger.


# NOT COMPLETED! #
