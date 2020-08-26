const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt'); 
const fs = require('fs');
const path = require('path');

// Load User Model 
const User = require('./models/user'); 

const pathToKey = path.join(__dirname, '.', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

const JwtStrategy = require('passport-jwt').Strategy; 
const ExtractJwt = require('passport-jwt').ExtractJwt; 

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
    secretOrKey: PUB_KEY, 
    algorithms: ['RS256']
}

const strategy = new JwtStrategy(options, (payload, done) => {
        User.findOne({_id: payload.sub}).then(user => {
            if (user) {
                return done(null, user); 
            }
            else {
                return done(null, false)
            }
        }).catch(err => {
            return done(err, false)
        })  
}) 

function initialize(passport) {
    passport.use(strategy); 
    // const authenticateUser = (email, password, done) => {
    //     // get user with the email that they have passed in
    //     User.findOne({email: email}, (err, user) => {
    //         if (user === null) {
    //             // call back takes care of user not being in the database 
    //             return done(null, false, {message: "No user with that email"})
    //         }
    
    //         bcrypt.compare(password, user.password, (err, isMatch) => {
    //             if (err) {
    //                 throw err; 
    //             }
    //             if (isMatch) {
    //                 return done(null, user)
    //             }
    //             else {
    //                 return done(null, false, {message: "Incorrect email or password"})
    //             }
    //         })

    //     }); 
    // }


    // passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser)); 
    // passport.serializeUser((user, done) => {
    //     done(null, user.id); 
    // })
    // passport.deserializeUser((id, done) => {
    //     User.findById(id, (err, user) => {
    //         done(err, user)        
    //     })
    // })


}


module.exports = initialize; 