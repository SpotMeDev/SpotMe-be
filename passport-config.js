const { authenticate } = require('passport');

const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user'); 

function initialize(passport) {
    const authenticateUser = (email, password, done) => {
        // get user 
        User.findOne({email: email}, (err, user) => {
            if (user === null) {
                return done(null, false, {message: "No user with that email"})
            }
    
            try {
                if (await bcrypt.compare(password, user.password)) {
                    return done(null, user)
                }
                else {
                    return done(null, false, {message: "Incorrect email or password"})
                }
            }
            catch (err) {
                return done(e)
            }
        }); 
    }


    passport.use(new LocalStrategy({usernameField: 'email'}), authenticateUser); 
    passport.serializeUser((user, done) => {})
    passport.deserializeUser((id, done) => {})

}


module.exports = initialize; 