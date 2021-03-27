const express = require('express'); 
const router = express.Router(); 
const passport = require('passport');
const TransactionService = require('../Services/TransactionService'); 

const OktaJwtVerifier = require('@okta/jwt-verifier');
const oktaJwtVerifier = new OktaJwtVerifier({
    issuer: 'https://dev-96772784.okta.com/oauth2/default',
    clientId: '0oad43btvFJyjVPpt5d6'
});

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];

  if (bearerHeader) {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    // Forbidden
    res.status(403).send({message: "Invalid token"});
  }
}
//basic okta token verification test
router.get('/test-okta', verifyToken, (req, res) => {
    oktaJwtVerifier.verifyAccessToken(req.token, 'api://default')
    .then(jwt => {
        res.status(200).send({message: "Okta token worked"})
      })
      .catch(err => {
        res.status(403).send({message: "Unauthorized"});
        console.log(err);
      });
})

router.post('/send', passport.authenticate('jwt', {session: false}), async (req, res) => {
    try {
        let userAfterTransaction = await TransactionService.createTransaction(req.user, req.body.recipientID, req.body.message, req.body.amount); 
        return res.status(200).send({message: "Succesfully created transaction", user: userAfterTransaction}); 
    }
    catch (err) {
        return res.status(400).send({message: err.message}); 
    }
})

router.post('/add-balance', passport.authenticate('jwt', {session: false}), async (req, res) => {
    try {
        const updatedUser = await TransactionService.addBalance(req.user, req.body.amount); 
        return res.status(200).send({message: "Successfully updated your balance", user: updatedUser});
    }
    catch (err) {
        return res.status(400).send({message: err.message});
    }
})


router.get('/user-transactions', passport.authenticate('jwt', {session: false}), async (req, res) => {
    try {
        const user = req.user;  
        const transactions = await TransactionService.allUserTransactions(user); 
        return res.status(200).send({message: "Succesfully retrieved user transactions", transactions: transactions})
    }
    catch(err) {
        return res.status(400).send({message: "Unable to get user transactions at this time"})
    }
})

router.get('/all-transactions', passport.authenticate('jwt', {session: false}), async (req, res) => {
    try {
        const user = req.user; 
        const transactions = await TransactionService.allFriendsTransactions(user); 
        return res.status(200).send({message: "Successfully retrieved all transactions", transactions: transactions})
    }
    catch (err) {
        return res.status(400).send({message: "Unable to get user transactions at this time!"})
    }
})


module.exports = router; 