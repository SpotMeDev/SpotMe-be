const express = require('express'); 
const router = express.Router(); 
const User = require('../models/user'); 
const mongoose = require('mongoose'); 
const passport = require('passport');

mongoose.connect("mongodb://localhost/spotme_db", {useNewUrlParser: true}); 
mongoose.set('useFindAndModify', false);


router.post('/transaction', passport.authenticate('jwt', {session: false}), (req, res) => {
    // check that the user has enough in their current balance to make that transaction
    const sender = req.user; 
    if (sender.balance >= req.body.amount) {
        // decrement the user's balance 
        User.findOneAndUpdate({email: sender.email}, {$inc: {balance: -req.body.amount}}, {new: true}, (err, updatedSender) => {
            
            if (err) {
                return res.status(400).send({message: "Unable to complete the transaction"}); 
            }

            // now check to see that the recipient user exists 
            User.findOneAndUpdate({email: req.body.recipientEmail}, {$inc: {balance: req.body.amount}}, {new: true}, (err, recipient) => {
                if (err) {
                    return res.status(400).send({message: "Unable to complete the transaction"}); 
                }
                else {
                    return res.status(200).send({message: "Successfully completed transaction", updatedSender: updatedSender})
                }
            })
        })
    }
})

router.post('/add-balance', passport.authenticate('jwt', {session: false}), (req, res) => {
    const sender = req.user; 
    User.findOneAndUpdate({email: sender.email}, {$inc: {balance: req.body.amount}}, {new: true}, (err, updatedUser) => {
        if (err) {
            return res.status(400).send({message: "Unable to update balance at this time! Please try again later"})
        }
        else {
            return res.status(200).send({message: "Successfully updated your balance", updatedUser: updatedUser})
        }
    })
})


module.exports = router; 