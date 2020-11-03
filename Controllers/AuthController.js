const express = require('express'); 
const router = express.Router(); 
const User = require('../models/user'); 
const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt'); 
const passport = require('passport');
const utils = require('../utils.js'); 
const Friends = require('../models/friends');
const authService = require("../Services/AuthService"); 

mongoose.connect("mongodb://localhost/spotme_db", {useNewUrlParser: true}); 
mongoose.set('useFindAndModify', false);

const AuthService = new authService()

router.post("/signup", async (req, res) => {
    try {
        if (req.body.password !== req.body.confirmPassword || (req.body.password === "" || req.body.confirmPassword === "")) {
            return res.status(400).send({message: "Your passsword and confirm password must match"})
        }

        // check that email and username is not already used 
        const userWithEmail = await AuthService.userWithEmail(req.body.email)
        if (userWithEmail) {
            return res.status(403).send({message: "Email is already in use. Please use another email address or sign in"})
        }
        const userWithUsername = await AuthService.userWithUsername(req.body.username) 
        if (userWithUsername) {
            return res.status(403).send({message: "Username is already in use. Please select another username or sign in"})
        }
        // hash password and insert into database
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const newUser = await User.create({name: req.body.name, username: req.body.username, email: req.body.email, password: hashedPassword, balance: 0})
        const jwt = utils.issueJWT(newUser);
        const retUser = {id: newUser.id, name: newUser.name, username: newUser.username, email: newUser.email, balance: newUser.balance, friends: newUser.friends};  
        return res.status(200).send({message: "Successfully signed up the user!", token: jwt.token, expiresIn: jwt.expires, user: retUser})
    }
    catch (err) {
        return res.status(400).send({message: "Unable to signup user"})
    } 
})


router.post('/login', (req, res) => {
    User.findOne({email: req.body.email}, (err, user) => {
        if (err) {
            return res.status(401).send({message: "Incorrect username or password. Please try again!"}); 
        }
        if (!user) {   
            return res.status(403).send({message: "Incorrect username or password. Please try again!"})
        }
        bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
                if (err) {
                    return res.status(401).send({message: "Unable to log in"})
                }
                if (isMatch) {
                    const jwt = utils.issueJWT(user); 
                    const retUser = {id: user.id, name: user.name, username: user.username, email: user.email, balance: user.balance, friends: user.friends}
                    return res.status(200).send({message: "Successfully logged in", token: jwt.token, expiresIn: jwt.expires, user: retUser})
                }
                else {
                    return res.status(401).send({message: "Incorrect username or password"})
                }
            })
    })
})

// route specifically for username or name, seperate route for password 
router.post("/change-account", passport.authenticate('jwt', {session: false}), async (req, res) => {
    const user = req.user;
    const type = req.body.updateType;  
    const newField = req.body.updatedField; 
    console.log(type)
    if (type == "name") {
        if (user.name == newField || newField == "") {
            return res.status(400).send({message: "Please select a new name that is at least 1 character long!"}); 
        }
        try {
            const updatedUser = await User.findOneAndUpdate({_id: user._id}, {$set: {name: newField} },{new: true}); 
            return res.status(200).send({message: "Succesfully updated name", user: {id: updatedUser._id, friends: updatedUser.friends, name: updatedUser.name, username: updatedUser.username, email: updatedUser.email, balance: updatedUser.balance}}); 
        }
        catch(err) {
            return res.status(400).send({message: "Unable to update name at this time!"})
        }
    }
    else if (type == "username") {
        // handle username change here
        if (user.username == newField || newField == "") {
            return res.status(400).send({message: "Please select a new username that is at least 1 character long!"}); 
        }
        try {
            const updatedUser = await User.findOneAndUpdate({_id: user._id}, {$set: {username: newField} },{new: true}); 
            return res.status(200).send({message: "Succesfully updated username", user: {id: updatedUser._id, friends: updatedUser.friends, name: updatedUser.name, username: updatedUser.username, email: updatedUser.email, balance: updatedUser.balance}}); 
        }
        catch(err) {
            return res.status(400).send({message: "Unable to update username at this time!"})
        }
    }
    else {
        return res.status(400).send({message: "Unable to update account information!"})
    }

})


// route specifically to change password 
router.post('/change-password', passport.authenticate('jwt', {session: false}), async(req, res) => {
    const user = req.user; 
    if (req.body.currentPasword == "" || req.body.newPassword == "" || req.body.confirmPassword == "") {
        return res.status(400).send({message: "Passwords can't be empty"}); 
    }
    if (req.body.newPassword != req.body.confirmPassword) {
        return res.status(400).send({message: "New Password and Confirm Password must match" }); 
    }
    if (req.body.currentPasword == req.body.newPassword) {
        return res.status(400).send({message: "New password must be different from the current password!" }); 
    }

    bcrypt.compare(req.body.currentPasword, user.password, async (err, isMatch) => {
        if (err) {
            return res.status(401).send({message: "Unable to change password!"}); 
        }
        if (!isMatch) {
            return res.status(403).send({message: "Current Password does not match the user"}); 
        }
        try {
            // create a hash of the new password
            const hashedPassword = await bcrypt.hash(req.body.newPassword, 10)
            const newUser = await User.findOneAndUpdate({_id: user._id}, {$set: {password: hashedPassword}}, {new: true}); 
            return res.status(200).send({message: "Succesfully updated password!"}); 
        } catch(err) {
            return res.status(400).send({message: "Unable to change password at this time!"}); 
        }
     })
})





router.get('/search-query', passport.authenticate('jwt', {session: false}), async (req, res) => {
    try {
        const sender = req.user; 
        // find all users with a username that matches the query
        const allUsers = await User.find({username: { $regex: req.query.query, $options: "i" }}); 
        // now iterate through the array of users, removing any sensitive information, and also removing the user 
        let ret = []
        if (allUsers.length > 0) {
            allUsers.forEach(user => {
                const retUser = {_id: user.id, name: user.name, username: user.username, email: user.email, friends: user.friends}; 
                ret.push(retUser); 
            })
        }
        return res.status(200).send({message: "Successfully retrieved all users with the query", users: ret})
    }
    catch(err) {
        return res.status(400).send({message: "Unable to search for users at this time!"})
    }
})

router.get('/is-friend', passport.authenticate('jwt', {session: false}), async (req, res) => {
    try {
        const sender = req.user; 
        const friendStatus = await AuthService.friendStatus(sender._id, req.query.rID);
        return res.status(200).send({message: "Sucessfully determined friend status", status: friendStatus})
    }   
    catch(err) {
        return res.status(400).send({message: "Unable to determine status of friendship at this time!"});
    }
    
})

router.get('/all-friends', async (req, res) => {
    try {
        const id = req.query.id; 
        const friends = await AuthService.allFriends(id); 
        return res.status(200).send({message: "Successfully found all the friends of the user", friends: friends})
    }
    catch(err) {
        return res.status(400).send({messsage: "Unable to find user's friends at this time!"})
    }
})

router.post('/add-friend', passport.authenticate('jwt', {session: false}), async (req, res) => {
    // create the two friend schemas for the user sending request and also the recipient 
    try {
        // get the sender and recipient user obj
        const sender = req.user;
        const recipient = await User.findById(req.body.recipientID); 

        // update friend schema to reflect sending 
        const senderFriendReq = await Friends.findOneAndUpdate({requester: sender._id, recipient: recipient._id}, {$set: {status: 1} } ,{new: true, upsert: true})
        const recipientFriendReq = await Friends.findOneAndUpdate({requester: recipient._id, recipient: sender._id}, {$set: {status: 2}}, {new: true, upsert: true})

        // update the user objects
        const newSender = await User.findOneAndUpdate({_id: sender._id}, {$push: {friends: senderFriendReq._id} }, {new: true})
        const newRecipient = await User.findOneAndUpdate({_id: recipient._id}, {$push: {friends: recipientFriendReq._id} }, {new: true})

        const retUser = {id: newSender._id ,name: newSender.name, username: newSender.username, email: newSender.email, balance: newSender.balance, friends: newSender.friends}

        return res.status(200).send({message: "Successfully sent friend request!", user: retUser})
    }
    catch (err) {
        return res.status(400).send({message: "Unable to complete friend request at this time"})
    }
})


router.post('/handle-friend-request', passport.authenticate('jwt', {session: false}), async (req, res) => {
    try {
        const sender = req.user; 
        const recipient = await User.findById(req.body.recipientID); 
        if (req.body.acceptedRequest === "true") {
            // update the friends schema 
            const updateSenderFriend = await Friends.findOneAndUpdate({requester: sender._id, recipient: recipient._id}, {$set: {status: 3}}); 
            const updateRecipientFriend = await Friends.findOneAndUpdate({requester: recipient._id, recipient: sender._id}, {$set: {status: 3}})
            return res.status(200).send({message: "Successfully accepted friend request!"})
        }
        else {
            // delete the friend relationship between if the request has been declined  
            const remSender = await Friends.findOneAndRemove({requester: sender._id, recipient: recipient._id}); 
            const remRecipient = await Friends.findOneAndRemove({requester: recipient._id, recipient: sender._id})

            // remove the friends from each of the user's objects 
            const updatedSender = await User.findOneAndUpdate({_id: sender._id}, {$pull: {friends: remSender._id}}, {new: true});
            const updatedRecipient = await User.findOneAndUpdate({_id: recipient._id}, {$pull: {friends: remRecipient._id}}, {new: true})

            return res.status(200).send({message: "Succesfully declined friend request", user: {id: updatedSender._id, friends: updatedSender.friends, name: updatedSender.name, username: updatedSender.username, email: updatedSender.email, balance: updatedSender.balance }}); 

        }
    }
    catch (err) {
        return res.status(400).send({message: "Unable to handle friend request at this time!"})
    }
})



module.exports = router; 