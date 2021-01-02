const User = require('../models/user'); 
const Friends = require('../models/friends'); 
const Image = require('../models/image'); 
const base64 = require('../services/Base64')
const Base64 = new base64() 
class AuthService {

    // check if user exists with given email
    userWithEmail = async (email) => {
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
            const sender = await User.findById(senderId); 
            const recipient = await User.findById(recipientId); 

            if (sender && recipient) {
                // now check the status of their friendship in the friends collection
                const senderFriend = await Friends.findOne({requester: sender._id, recipient: recipient._id}); 
                if (senderFriend) {
                    // then return the status of the sender's friendship with the recipient 
                    // will be either 1, 2, or 3
                    return senderFriend.status; 
                }
                return 0; 
    
            }
            else {
                return 0; 
            }   
        }
        catch(err) {
            return 0; 
        }
    }

    // function takes the user ID and returns all of the user's friends, in an array of objects 
    allFriends = async (id) => {
        const user = await User.findById(id); 
        if (user) {
            // create a mongo aggregation: NEED TO IMPROVE: TOO MANY QUERIES 
            const friends = user.friends
            if (friends.length > 0) {
                let ret = []
                // iterate through the friends of the user  
                await Promise.all(friends.map(async (friend) => {
                    // for each friend id, query for that document and the user will be the requestor so we want to map the recipient and return them
                    let friendDoc = await Friends.findById(friend); 
                    if (friendDoc.status == 3) {
                        // using the id of the recipient, we will find the 
                        let recipient = await User.findById(friendDoc.recipient);
                        ret.push({id: recipient._id, friends: recipient.friends, name: recipient.name, username: recipient.username, email: recipient.email})
                    }
                }))
                return ret; 
            }
            else {
                return []
            }

        }   
        return []; 

    }

    updateProfilePic = async (user, data) => {
        try {
            const buffer = Buffer.from(data, 'base64');
            const newImage = await Image.create({img: {data: buffer, contentType: "img/jpeg"}}); 
            const newUser = await User.findOneAndUpdate({_id: user._id}, {$set: {profileImg: newImage._id}}, {new: true}); 
            return true; 
        }
        catch (err) {
            return false; 
        }
    }
    
    retrieveProfilePic = async (user) => {
        const imgID = user.profileImg; 
        // use the object ID to find the correct image document 
        const profileImg = await Image.findById(imgID); 
        const base64 = Base64.arrayBufferToBase64(profileImg.img.data.buffer)
        return base64
    }
    // given a user, function returns user object details excluding password 
    returnUserDetails = async (user, includeProfilePic = false) => {
        if (includeProfilePic) {
            const profilePic64 = await this.retrieveProfilePic(user)
            return {id: user._id, name: user.name, username: user.username, email: user.email, balance: user.balance, img: profilePic64}
        }
        else {
            return {id: user._id, name: user.name, username: user.username, email: user.email, balance: user.balance}

        }
    }

}


module.exports = AuthService; 
