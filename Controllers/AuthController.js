const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const passport = require('passport');
const AuthService = require('../Services/AuthService');
const FriendService = require('../Services/FriendService');
const FireBaseService = require('../Services/FireBaseService');
const {reset} = require('sinon');
const multer = require('multer');
const upload = multer();
const AuthMiddleware = require('../Middleware/authMiddleware');
// I made a comment to see if i can push to bit bucket
router.post('/signup', AuthMiddleware.validateSignup, async (req, res) => {
  try {
    const {UserToken, retUser} = await AuthService.signupUser(req.body.name, req.body.username, req.body.email, req.body.phoneNumber, req.body.password);
    return res.status(200).send({message: 'Successfully signed up the user!', token: UserToken.idToken, expiresIn: UserToken.expiresIn, refreshToken: UserToken.refreshToken, user: retUser});
  } catch (err) {
    return res.status(400).send({message: err.message});
  }
});


router.post('/login', AuthMiddleware.validateLogin, async (req, res) => {
  try {
    const {UserToken, retUser} = await AuthService.loginUser(req.body.email, req.body.password);
    return res.status(200).send({message: 'Successfully logged in the user!', token: UserToken.idToken, expiresIn: UserToken.expiresIn, refreshToken: UserToken.refreshToken, user: retUser});
  } catch (err) {
    return res.status(400).send({message: err.message});
  }
});

// route for Facebook authenentication
router.post('/facebook-signin', async (req, res) => {
  try {
    // user object from front end is passed in the HTTP request
    const FacebookUser = req.body;
    const {UserToken, retUser} = await AuthService.facebookAuthentication(FacebookUser);
    return res.status(200).send({message: 'Successfully logged in the user!', token: UserToken.idToken, expiresIn: UserToken.expiresIn, refreshToken: UserToken.refreshToken, user: retUser});
  } catch (err) {
    return res.status(400).send({message: err});
  }
});

// route specifically for username or name, seperate route for password
router.post('/change-account', AuthMiddleware.validateChangeAccount, FireBaseService.Authenticate, async (req, res) => {
  try {
    const updatedUser = await AuthService.changeAccount(req.user, req.body.updateType, req.body.updatedField);
    return res.status(200).send({message: 'Succesfully updated the user!', user: updatedUser});
  } catch (err) {
    return res.status(400).send({message: err.message});
  }
});


// route specifically to change password
router.post('/change-password', AuthMiddleware.validateChangePassword, FireBaseService.Authenticate, async (req, res) => {
  try {
    const user = req.user;
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

// multer only been used with post man image upload test. pass in upload.single('profileData64') in the middleware
router.post('/update-profile-pic', AuthMiddleware.validateUpdateProfilePicture, FireBaseService.Authenticate, async (req, res) => {
  try {
    const user = req.user;
    // only for when working with post man
    // const profileData64 = req.file;
    if (req.body.profileData64) {
      // do we need this extra ret64 computation if we already have the profileData64
      const upload = await AuthService.updateProfilePic(user, req.body.profileData64);
      if (upload) {
        const retUser = await AuthService.returnUserDetails(user, true);
        return res.status(200).send({message: 'Successfully updated profile picture', user: retUser});
      } else {
        // error uploading the profile picture
        return res.status(400).send({message: 'Unable to update profile picture at this time'});
      }
    } else {
      // error uploading the profile picture
      return res.status(400).send({message: 'Unable to update profile picture at this time'});
    }
  } catch (err) {
    return res.status(400).send({message: err.message});
  }
});

router.get('/profile-pic', FireBaseService.Authenticate, async (req, res) => {
  const user = req.user;
  console.log(user);
  try {
    const profilePic = await AuthService.retrieveProfilePic(user);
    return res.status(200).send({message: 'Retrieved profile pic', profilePic: profilePic});
  } catch (err) {
    return res.status(400).send({message: err.message});
  }
});


router.get('/search-query', AuthMiddleware.validateSearchQuery, FireBaseService.Authenticate, async (req, res) => {
  try {
    const ret = await AuthService.searchUsers(req.query.query);
    return res.status(200).send({message: 'Successfully retrieved all users with the query', users: ret});
  } catch (err) {
    return res.status(400).send({message: err.message});
  }
});

router.get('/is-friend', AuthMiddleware.validateIsFriend, FireBaseService.Authenticate, async (req, res) => {
  try {
    const sender = req.user;
    const friendStatus = await FriendService.friendStatus(sender._id, req.query.rID);
    return res.status(200).send({message: 'Sucessfully determined friend status', status: friendStatus});
  } catch (err) {
    return res.status(400).send({message: err.message});
  }
});

router.get('/all-friends', AuthMiddleware.validateAllFriends, async (req, res) => {
  try {
    const id = req.query.id;
    const friends = await FriendService.allFriends(id);
    return res.status(200).send({message: 'Successfully found all the friends of the user', friends: friends});
  } catch (err) {
    return res.status(400).send({message: err.message});
  }
});

router.post('/add-friend', AuthMiddleware.validateAddFriend, passport.authenticate('jwt', {session: false}), async (req, res) => {
  // create the two friend schemas for the user sending request and also the recipient
  try {
    const retUser = await FriendService.addFriend(req.user, req.body.recipientID);
    return res.status(200).send({message: 'Successfully sent friend request!', user: retUser});
  } catch (err) {
    return res.status(400).send({message: err.message});
  }
});


router.post('/handle-friend-request', AuthMiddleware.validateHandleFriendRequest, passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    const retUser = await FriendService.handleFriendRequest(req.user, req.body.recipientID, req.body.acceptedRequest);
    return res.status(200).send({message: 'Successfully handled friend request', user: retUser});
  } catch (err) {
    return res.status(400).send({message: err.message});
  }
});

module.exports = router;
