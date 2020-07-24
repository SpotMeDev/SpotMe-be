const express = require('express'); 
const router = express.Router(); 
const User = require('../models/user'); 
const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt'); 
// const passport = require('passport');

// const initializePassport = require('../passport-config'); 
// initializePassport(passport); 

mongoose.connect("mongodb://localhost/spotme_db", {useNewUrlParser: true}); 


router.post("/signup", async (req, res) => {
    if (req.body.password !== req.body.confirmPassword || (req.body.password === "" || req.body.confirmPassword ==="")) {
        return res.status(400).send({message: "Your passsword and confirm password must match"})
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
                     res.status(200).send({message: "Successfully signed up the user!"})
                 }
             })
        }
        catch {
            return res.status(400).send({message: "Unable to signup user"})
        }
    }
})


module.exports = router; 