const express = require('express'); 
const router = express.Router(); 
const User = require('../models/user'); 
const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt'); 
const passport = require('passport');


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


router.post('/login', (req, res, next) => {
    passport.authenticate('local', function(err, user, info) {
        if (err) { 
            return res.status(403).send({message: "Error logging in at this time"}) 
        }
        if (!user) { 
            return res.status(401).send({message: "Incorrect email or password"}); 
        }
        req.logIn(user, function(err) {
          if (err) { 
              return res.status(403).send({message: "Error logging in at this time"}) 
          }
          return res.status(200).send({message: "Successfully logged in!"})
        });
      })(req, res, next);
})


module.exports = router; 