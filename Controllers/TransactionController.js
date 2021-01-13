const express = require('express'); 
const router = express.Router(); 
const User = require('../models/user'); 
const Transaction = require('../models/transaction'); 
const passport = require('passport');
const AuthService = require('../Services/AuthService'); 
const TransactionService = require('../Services/TransactionService'); 

router.post('/send', passport.authenticate('jwt', {session: false}), async (req, res) => {
    // check that the user has enough in their current balance to make that transaction
    const sender = req.user; 
    if (sender.balance >= req.body.amount) {
        // also check for a user message 
        if (req.body.message == "") {
            return res.status(400).send({message: "Must include message with your transaction"}); 
        }
        // decrement the user's balance 
        try {
            const updatedSender = await User.findOneAndUpdate({_id: sender._id}, {$inc: {balance: -req.body.amount}}, {new: true});
            const updatedRecipient = await User.findOneAndUpdate({_id: req.body.recipientID}, {$inc: {balance: req.body.amount}}, {new: true}); 
            
            const retUser = await AuthService.returnUserDetails(updatedSender, true); 
            // create the transaction
            const transaction = await Transaction.create({sender: updatedSender._id, recipient: updatedRecipient._id, amount: req.body.amount, message: req.body.message}); 
            return res.status(200).send({messsage: "Succesfully completed transaction", amount: req.body.amount, user: retUser}); 

        }
        catch (err) {
            return res.status(400).send({message: "Unable to complete transaction", error: err}); 
        }
    }
    else {
        return res.status(403).send({message: "Insufficient balance to complete request"}); 
    }
})

router.post('/add-balance', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const sender = req.user; 
    try {
        const updateUserBalance = await User.findOneAndUpdate({_id: sender._id}, {$inc: {balance: req.body.amount}}, {new: true});
        const retUser = await AuthService.returnUserDetails(updateUserBalance, true); 
        return res.status(200).send({message: "Successfully updated your balance", user: retUser});
    }
    catch (err) {
        return res.status(400).send({message: "Unable to update balance at this time! Please try again later"});
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