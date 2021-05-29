const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const passport = require('passport');
const TransactionService = require('../Services/TransactionService');
const FireBaseService = require("../Services/FireBaseService");

router.post('/send', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    const userAfterTransaction = await TransactionService.createTransaction(req.user, req.body.recipientID, req.body.message, req.body.amount);
    return res.status(200).send({message: 'Succesfully created transaction', user: userAfterTransaction});
  } catch (err) {
    return res.status(400).send({message: err.message});
  }
});

router.post('/add-balance', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    const updatedUser = await TransactionService.addBalance(req.user, req.body.amount);
    return res.status(200).send({message: 'Successfully updated your balance', user: updatedUser});
  } catch (err) {
    return res.status(400).send({message: err.message});
  }
});


router.get('/user-transactions', FireBaseService.Authenticate, async (req, res) => {
  try {
    const user = req.user;
    const transactions = await TransactionService.allUserTransactions(user);
    return res.status(200).send({message: 'Succesfully retrieved user transactions', transactions: transactions});
  } catch (err) {
    return res.status(400).send({message: err.message});
  }
});

router.get('/all-transactions', FireBaseService.Authenticate, async (req, res) => {
  try {
    const user = req.user;
    const transactions = await TransactionService.allFriendsTransactions(user);
    return res.status(200).send({message: 'Successfully retrieved all transactions', transactions: transactions});
  } catch (err) {
    return res.status(400).send({message: err.message});
  }
});

module.exports = router;
