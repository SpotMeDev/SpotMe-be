const User = require('../models/user'); 
const Friends = require('../models/friends'); 

class AuthService {

    // check if user exists with given email
    userWithEmail = async (email) => {
        console.log(email)
        try {
            // check that email is not already used 
            const userExists = await User.findOne({email: email}); 
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

    // function will take in the sender and recipID and then return the status of their friendship: 
    // 0 --> not friends 
    // 1 ---> user has requested 
    // 2 ---> pending friend request from recipient
    // 3 -> friends already 
    friendStatus = async (senderId, recipientId) => {
        // check the friends array to see if the sender is already friends with 
        try {
            const sender = await User.findById(senderId)
            const recipient = await User.findById(recipientId)

            if (sender && recipient) {
                
                // now check the status of their friendship in the friends collection
                const senderFriend = await Friends.findOne({requester: sender._id, recipient: recipient._id}); 
                // then return the status of the sender's friendship with the recipient 
                // will be either 1, 2, or 3
                return senderFriend.status
    
            }
            else {
                return 0; 
            }   
        }
        catch(err) {
            return 0; 
        }
    }
}


module.exports = AuthService; 