const express = require('express'); 
const router = express.Router(); 
const User = require('../models/user'); 
const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt'); 
const passport = require('passport');
const utils = require('../utils.js'); 
const Friends = require('../models/friends');

mongoose.connect("mongodb://localhost/spotme_db", {useNewUrlParser: true}); 
mongoose.set('useFindAndModify', false);


router.post("/signup", (req, res) => {
    if (req.body.password !== req.body.confirmPassword || (req.body.password === "" || req.body.confirmPassword === "")) {
        return res.status(400).send({message: "Your passsword and confirm password must match"})
    }
    
    // check that email is not already used 
    User.findOne({email: req.body.email}, async (err, user) => {
        if (err) {
            return res.status(400).send({message: "Unable to signup user"})
        }
        if (user) {
            return res.status(400).send({message: "Email is already in use. Please use another email address or sign in"})
        }
        else {
            try {
                const hashedPassword = await bcrypt.hash(req.body.password, 10)
                User.create({
                    name: req.body.name, 
                    email: req.body.email, 
                    password: hashedPassword, 
                    balance: 0
                 }, (err, user) => {
                     if (err) {
                         res.status(400).send({
                             message: "Unable to sign up the user at this time"
                         })
                     }
                     else {
                         console.log(user); 
                         const jwt = utils.issueJWT(user);
                         const retUser = {id: user.id, name: user.name, email: user.email, balance: user.balance};  
                         res.status(200).send({message: "Successfully signed up the user!", token: jwt.token, expiresIn: jwt.expires, user: retUser})
                     }
                 })
            }
            catch {
                return res.status(400).send({message: "Unable to signup user"})
            }
        }
    })    
})


router.post('/login', (req, res, next) => {
    User.findOne({email: req.body.email}, (err, user) => {
        if (err) {
            return res.status(401).send({message: "Incorrect username or password. Please try again!"}); 
        }
        bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
                if (err) {
                    return res.status(401).send({message: "Unable to log in"})
                }
                if (isMatch) {
                    const jwt = utils.issueJWT(user); 
                    const retUser = {id: user.id, name: user.name, email: user.email, balance: user.balance }
                    return res.status(200).send({message: "Successfully logged in", token: jwt.token, expiresIn: jwt.expires, user: retUser})
                }
                else {
                    return res.status(401).send({message: "Incorrect usernmae or password"})
                }
            })
    })
})


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


router.post('/add-friend', passport.authenticate('jwt', {session: false}), async (req, res) => {
    // create the two friend schemas for the user sending request and also the recipient 
    try {
        // get the sender and recipient user obj
        const sender = req.user;
        const recipient = await User.findOne({email: req.body.recipientEmail}); 

        // update friend schema to reflect sending 
        const senderFriendReq = await Friends.findOneAndUpdate({requester: sender._id, recipient: recipient._id}, {$set: {status: 1} } ,{new: true, upsert: true})
        const recipientFriendReq = await Friends.findOneAndUpdate({requester: recipient._id, recipient: sender._id}, {$set: {status: 2}}, {new: true, upsert: true})

        // update the user objects

        const newSender = await User.findOneAndUpdate({email: sender.email}, {$push: {friends: senderFriendReq._id} }, {new: true})
        const newRecipient = await User.findOneAndUpdate({email: recipient.email}, {$push: {friends: recipientFriendReq._id} }, {new: true})

        const retUser = {name: newSender.name, email: newSender.email, balance: newSender.balance}

        return res.status(200).send({message: "Successfully sent friend request!", user: retUser})
    }
    catch (err) {
        return res.status(400).send({message: "Unable to complete friend request at this time"})
    }
})


router.post('/handle-friend-request', passport.authenticate('jwt', {session: false}), async (req, res) => {
    try {
        const sender = req.user; 
        const recipient = await User.findOne({email: req.body.recipientEmail}); 
        if (req.body.acceptedRequest) {
            // update the friends schema 
            const updateSenderFriend = await Friends.findOneAndUpdate({requester: sender._id, recipient: recipient._id}, {$set: {status: 3}}); 
            const updateRecipientFriend = await Friends.findOneAndUpdate({requester: recipient._id, recipient: sender._id}, {$set: {status: 3}})
            return res.status(200).send({message: "Successfully accepted friend request!"})
        }
        else {
            // delete the friend relationship between if the request has been declined  
            const remSender = await Friends.findOneAndRemove({requester: sender._id, recipient: recipient._id}); 
            const remRecipient = await Friends.findOneAndRemove({requester: recipient._id, recipient: sender._id})

            // remove the friends from each of the user's objects 
            const updatedSender = await User.findOneAndUpdate({email: sender.email}, {$pull: {friends: remSender._id}}, {new: true});
            const updatedRecipient = await User.findOneAndUpdate({email: recipient.email}, {$pull: {friends: remRecipient._id}}, {new: true})

            return res.status(200).send({message: "Succesfully declined friend request", user: updatedSender}); 

        }
    }
    catch (err) {
        return res.status(400).send({message: "Unable to handle friend request at this time!"})
    }
})



module.exports = router; 