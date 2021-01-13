const jsonwebtoken = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const pathToPrivKey = path.join(__dirname, '..', 'id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToPrivKey, 'utf8');
const pathToPublicKey = path.join(__dirname, '..', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToPublicKey, 'utf8');

const User = require('../models/user'); 
const JwtStrategy = require('passport-jwt').Strategy; 
const ExtractJwt = require('passport-jwt').ExtractJwt; 
    /**
         * @param {*} user - The user object.  We need this to set the JWT `sub` payload property to the MongoDB user ID
    */
let issueJWT = (user) => {
    const _id = user._id;

    const expiresIn = '1d';
  
    const payload = {
      sub: _id,
      iat: Date.now()
    };
  
    const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn: expiresIn, algorithm: 'RS256' });
  
    return {
      token: "Bearer " + signedToken,
      expires: expiresIn
    }
}


let initialize = (passport) => {
    const options = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
        secretOrKey: PUB_KEY, 
        algorithms: ['RS256']
    }; 
    
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
    }); 
    passport.use(strategy); 
}

module.exports = {
    issueJWT: issueJWT, 
    initialize: initialize

}
