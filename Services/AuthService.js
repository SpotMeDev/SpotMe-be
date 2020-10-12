const User = require('../models/user'); 


class AuthService {

    // check if user exists with given email
    userWithEmail = async (email) => {
        console.log(email)
        try {
            // check that email is not already used 
            const userExists = await User.findOne({email: email}); 
            console.log(userExists)
            if (userExists) {
                return true; 
            }
            else {
                return false;
            }
        }
        catch(err) {
            return false;
        }
    }
    // check if user already exists with given username
    userWithUsername = async (username) => {
        try {
            const user = await User.findOne({username: username}); 
            if (user) {
                return true; 
            }
            else {
                return false;
            }
        }
        catch(err) {
            return false; 
        }
    }
}


module.exports = AuthService; 