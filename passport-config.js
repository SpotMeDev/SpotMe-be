const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt'); 

// Load User Model 
const User = require('./models/user'); 

function initialize(passport) {
    const authenticateUser = (email, password, done) => {
        // get user with the email that they have passed in
        User.findOne({email: email}, (err, user) => {
            if (user === null) {
                // call back takes care of user not being in the database 
                return done(null, false, {message: "No user with that email"})
            }
    
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    throw err; 
                }
                if (isMatch) {
                    return done(null, user)
                }
                else {
                    return done(null, false, {message: "Incorrect email or password"})
                }
            })

        }); 
    }


    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser)); 
    passport.serializeUser((user, done) => {
        done(null, user.id); 
    })
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user)        
        })
    })

}


module.exports = initialize; 