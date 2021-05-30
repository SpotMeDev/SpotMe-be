const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const passport = require('passport');
const AuthService = require('../Services/AuthService');
const FriendService = require('../Services/FriendService');
const FireBaseService = require("../Services/FireBaseService");
const { reset } = require('sinon');
//test router for signing in a user
/*
router.post('/createuser', async (req,res) => {
  try{
      const {CustomToken, retUser} = await AuthService.createUser(req.body.username, req.body.email, req.body.phoneNumber, req.body.password);
      res.status(200).send({message: "Successfully signed up User!", token: CustomToken, user: retUser});
  } catch(err){
    console.log(err);
    res.status(400).send({message: err});
  }
});*/

router.post('/signup', async (req, res) => {
  try {
    if (req.body.password !== req.body.confirmPassword || (req.body.password === '' || req.body.confirmPassword === '')) {
      return res.status(400).send({message: 'Your passsword and confirm password must match'});
    }
    // check that email and username is not already used
    const userWithEmail = await AuthService.userWithEmail(req.body.email);
    if (userWithEmail) {
      return res.status(403).send({message: 'Email is already in use. Please use another email address or sign in'});
    }
    const userWithUsername = await AuthService.userWithUsername(req.body.username);
    if (userWithUsername) {
      return res.status(403).send({message: 'Username is already in use. Please select another username or sign in'});
    }
    //change this area to accomodate phone number
    const {token, retUser} = await AuthService.signupUser(req.body.name, req.body.username, req.body.email, req.body.phoneNumber, req.body.password);
    return res.status(200).send({message: 'Successfully signed up the user!', token: token.idToken, expiresIn: token.expiresIn, refreshToken: token.refreshToken, user: retUser});
  } catch (err) {
    return res.status(400).send({message: err.message});
  }
});


router.post('/login', async (req, res) => {
  try {
    const {jwt, retUser} = await AuthService.loginUser(req.body.email, req.body.password);
    return res.status(200).send({message: 'Successfully logged in the user!', token: jwt.token, expiresIn: jwt.expires, user: retUser});
  } catch (err) {
    return res.status(400).send({message: err.message});
  }
});

// route specifically for username or name, seperate route for password
router.post('/change-account', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    const updatedUser = await AuthService.changeAccount(req.user, req.body.updateType, req.body.updatedField);
    return res.status(200).send({message: 'Succesfully updated the user!', user: updatedUser});
  } catch (err) {
    return res.status(400).send({message: err.message});
  }
});


// route specifically to change password
router.post('/change-password', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    const user = req.user;
    if (req.body.currentPassword === '' || req.body.newPassword === '' || req.body.confirmPassword === '') {
      return res.status(400).send({message: 'Passwords can\'t be empty'});
    }
    if (req.body.newPassword !== req.body.confirmPassword) {
      return res.status(400).send({message: 'New Password and Confirm Password must match'});
    }
    if (req.body.currentPassword === req.body.newPassword) {
      return res.status(400).send({message: 'New password must be different from the current password!'});
    }

    const changedPassword = await AuthService.changePassword(user, req.body.currentPassword, req.body.newPassword);
    if (changedPassword) {
      return res.status(200).send({message: 'Successfully changed password'});
    } else {
      return res.status(400).send({message: 'Couldn\'t change password'});
    }
  } catch (err) {
    return res.status(400).send({message: err.message});
  }
});


router.post('/update-profile-pic', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    const user = req.user;
    if (req.body.profileData64) {
      // do we need this extra ret64 computation if we already have the profileData64?
      const upload = await AuthService.updateProfilePic(user, req.body.profileData64);
      if (upload) {
        const retUser = await AuthService.returnUserDetails(user, true);
        return res.status(200).send({message: 'Successfully updated profile picture', user: retUser});
      } else {
        // error uploading the profile picture
        return res.status(400).send({message: 'Unable to update profile picture at this time'});
      }
    } else {
      return res.status(400).send({message: 'Must include valid profile picture'});
    }
  } catch (err) {
    return res.status(400).send({message: err.message});
  }
});

router.get('/profile-pic', passport.authenticate('jwt', {session: false}), async (req, res) => {
  const user = req.user;
  try {
    const profilePic = await AuthService.retrieveProfilePic(user);
    return res.status(200).send({message: 'Retrieved profile pic', profilePic: profilePic});
  } catch (err) {
    return res.status(400).send({message: err.message});
  }
});


router.get('/search-query', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    const ret = await AuthService.searchUsers(req.query.query);
    return res.status(200).send({message: 'Successfully retrieved all users with the query', users: ret});
  } catch (err) {
    return res.status(400).send({message: err.message});
  }
});

router.get('/is-friend', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    const sender = req.user;
    const friendStatus = await FriendService.friendStatus(sender._id, req.query.rID);
    return res.status(200).send({message: 'Sucessfully determined friend status', status: friendStatus});
  } catch (err) {
    return res.status(400).send({message: err.message});
  }
});

router.get('/all-friends', async (req, res) => {
  try {
    const id = req.query.id;
    const friends = await FriendService.allFriends(id);
    return res.status(200).send({message: 'Successfully found all the friends of the user', friends: friends});
  } catch (err) {
    return res.status(400).send({message: err.message});
  }
});

router.post('/add-friend', passport.authenticate('jwt', {session: false}), async (req, res) => {
  // create the two friend schemas for the user sending request and also the recipient
  try {
    const retUser = await FriendService.addFriend(req.user, req.body.recipientID);
    return res.status(200).send({message: 'Successfully sent friend request!', user: retUser});
  } catch (err) {
    return res.status(400).send({message: err.message});
  }
});


router.post('/handle-friend-request', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    const retUser = await FriendService.handleFriendRequest(req.user, req.body.recipientID, req.body.acceptedRequest);
    return res.status(200).send({message: 'Successfully handled friend request', user: retUser});
  } catch (err) {
    return res.status(400).send({message: err.message});
  }
});

module.exports = router;
