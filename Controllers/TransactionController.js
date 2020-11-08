const express = require('express'); 
const router = express.Router(); 
const User = require('../models/user'); 
const Transaction = require('../models/transaction'); 
const passport = require('passport');

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
            // create the transaction
            const transaction = await Transaction.create({sender: updatedSender._id, recipient: updatedRecipient._id, amount: req.body.amount, message: req.body.message}); 
            return res.status(200).send({messsage: "Succesfully completed transaction", amount: req.body.amount, balance: updatedSender.balance}); 

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
        return res.status(200).send({message: "Successfully updated your balance", balance: updateUserBalance.balance});
    }
    catch (err) {
        return res.status(400).send({message: "Unable to update balance at this time! Please try again later"});
    }
})


module.exports = router; 