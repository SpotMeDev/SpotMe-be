const express = require('express'); 
const router = express.Router(); 
const User = require('../models/user'); 
const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt'); 
const passport = require('passport');
const utils = require('../utils.js'); 

mongoose.connect("mongodb://localhost/spotme_db", {useNewUrlParser: true}); 
mongoose.set('useFindAndModify', false);


router.post("/signup", (req, res) => {
    if (req.body.password !== req.body.confirmPassword || (req.body.password === "" || req.body.confirmPassword === "")) {
        return res.status(400).send({message: "Your passsword and confirm password must match"})
    }

    console.log(req.body)
    
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

module.exports = router; 