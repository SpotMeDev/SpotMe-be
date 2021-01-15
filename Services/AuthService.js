const User = require('../models/user'); 
const Friends = require('../models/friends'); 
const Image = require('../models/image'); 
const Utils = require('../services/utils')
const bcrypt = require('bcrypt'); 
const TokenService = require('./TokenService'); 

let signupUser = async (name, username, email, password) => {
    try {
        // hash password and insert into database
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await User.create({name: name, username: username, email: email, password: hashedPassword, balance: 0})
        const jwt = TokenService.issueJWT(newUser); 
        const retUser = await returnUserDetails(newUser, true); 
        return {jwt, retUser}
    }
    catch(err) {
        throw err; 
    }
}

let loginUser = async (email, password) => {
    try {
        let user = await User.findOne({email: email})
        if (user) {
            let isMatch = await bcrypt.compare(password, user.password); 
            if (isMatch){
                const jwt = TokenService.issueJWT(user); 
                const retUser = await returnUserDetails(user, true); 
                return {jwt, retUser}; 
            }
            else {
                throw new Error("Incorrect username or password! Please try again.")
            }
        }
        else {
            throw new Error("Incorrect username or password! Please try again.")
        }
    }
    catch(err) {
        throw err; 
    }
}

let changePassword = async (user, currentPassword, newPassword) => {
    try {
        let isMatch = await bcrypt.compare(currentPassword, user.password); 
        if (isMatch) {
            // create a hash of the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10)
            const newUser = await User.findOneAndUpdate({_id: user._id}, {$set: {password: hashedPassword}}, {new: true}); 
            return true;  
        }
        else {
            throw new Error("Current Password does not match the user"); 
        }
    }
    catch(err) {
        throw err; 
    }
}


let changeAccount = async (user, updateType, updatedField) => {
    try {
        const type = updateType;  
        const newField = updatedField; 
        if (type === "name") {
            if (user.name === newField || newField === "") {
                throw new Error("Please select a new name that is at least 1 character long!"); 
            }
            const updatedUser = await User.findOneAndUpdate({_id: user._id}, {$set: {name: newField} },{new: true}); 
            const retUser = await returnUserDetails(updatedUser, true); 
            return retUser; 
            
        }
        else if (type === "username") {
            // handle username change here
            if (user.username === newField || newField === "") {
                throw new Error("Please select a new username that is at least 1 character long!"); 
            }
            const updatedUser = await User.findOneAndUpdate({_id: user._id}, {$set: {username: newField} },{new: true});
            const retUser = await returnUserDetails(updatedUser, true); 
            return retUser; 
            
        }
        else {
            throw new Error("Unable to update account information!"); 
        }
    }
    catch (err) {
        throw err; 
    }
}

let searchUsers = async (query) => {
    try {
        // find all users with a username that matches the query
        const allUsers = await User.find({username: { $regex: query, $options: "i" }}); 
        // now iterate through the array of users, removing any sensitive information, and also removing the user 
        let ret = []
        if (allUsers.length > 0) {
            await Promise.all(allUsers.map(async (user) => { 
                const retUser = await returnUserDetails(user); 
                ret.push(retUser); 
            }))
        }
        return ret; 
    }
    catch(err) {
        throw err; 
    }
}

// check if user exists with given email
let userWithEmail = async (email) => {
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
        throw err; 
    }
} 
    // check if user already exists with given username
let userWithUsername = async (username) => {
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
        throw err; 
    }
}

// function will take in the sender and recipID and then return the status of their friendship: 
// 0 --> not friends 
// 1 ---> user has requested 
// 2 ---> pending friend request from recipient
// 3 -> friends already 
let friendStatus = async (senderId, recipientId) => {
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
        throw err; 
    }
}

// function takes the user ID and returns all of the user's friends, in an array of objects 
let allFriends = async (id) => {
    try {
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
    catch (err) {
        throw err; 
    } 

}

let updateProfilePic = async (user, data) => {
    try {
        const buffer = Buffer.from(data, 'base64');
        const newImage = await Image.create({img: {data: buffer, contentType: "img/jpeg"}}); 
        const newUser = await User.findOneAndUpdate({_id: user._id}, {$set: {profileImg: newImage._id}}, {new: true}); 
        return true; 
    }
    catch (err) {
        throw err;  
    }
} 

let retrieveProfilePic = async (user) => {
    try {
        const imgID = user.profileImg; 
        // use the object ID to find the correct image document 
        const profileImg = await Image.findById(imgID); 
        if (profileImg) {
            const base64 = Utils.arrayBufferToBase64(profileImg.img.data.buffer)
            return base64
        }
        else {
            return ""
        }
    }
    catch (err) {
        throw err; 
    }
}
// given a user, function returns user object details excluding password 
let returnUserDetails = async (user, includeProfilePic = false) => {
    try {
        if (includeProfilePic) {
            const profilePic64 = await retrieveProfilePic(user)
            return {id: user._id, name: user.name, username: user.username, email: user.email, balance: user.balance, img: profilePic64}
        }
        else {
            return {id: user._id, name: user.name, username: user.username, email: user.email, balance: user.balance}
    
        }
    }
    catch (err) {
        throw err; 
    }
}

module.exports = {
    signupUser: signupUser, 
    loginUser: loginUser, 
    changePassword: changePassword,
    changeAccount: changeAccount, 
    searchUsers: searchUsers,  
    userWithEmail: userWithEmail, 
    userWithUsername: userWithUsername, 
    friendStatus: friendStatus, 
    allFriends: allFriends, 
    updateProfilePic: updateProfilePic, 
    retrieveProfilePic: retrieveProfilePic, 
    returnUserDetails: returnUserDetails
}

