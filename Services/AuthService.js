/* eslint-disable brace-style */
const User = require('../models/user');
const Image = require('../models/image');
const Utils = require('../Services/utils');
const FireBase_Admin = require('firebase-admin');
const FireBaseService = require('./FireBaseService');
/**
 * Takes in necessary profile information and creates a user object in our database.
 * Creates a new user in our FireBase console
 * @param   {string} name
 * @param   {string} username
 * @param   {string} email
 * @param   {string} password users passwords will be encrypted and stored in FireBase
 * @param   {string} phoneNumber users phoneNumber will be stored in firebase only
 * @return {object} the encrypted FireBase authentication token to authenticate a user upon signup along with user information
 */
const signupUser = async (name, username, email, phoneNumber, password) => {
  try {
    const user = await FireBase_Admin.auth()
        .createUser({
          email: email,
          emailVerified: false,
          phoneNumber: phoneNumber,
          password: password,
          displayName: name,
        });
    // store user in the database
    const newUser = await User.create({
      _id: user.uid,
      name: name,
      username: username,
      email: email,
      phoneNumber: phoneNumber,
      balance: 0,
    });

    // const CustomToken = await FireBase_Admin.auth().createCustomToken(user.uid);
    const UserToken = await FireBaseService.FireBaseIDtoken(email, password);
    const retUser = await returnUserDetails(newUser, true);
    // returning json of JWT token
    return {UserToken, retUser};
  } catch (err) {
    throw err;
  }
};
/**
 * Takes in the users email and password and retrives the user's uid and JWT ID token from FireBase
 * @param   {string} email
 * @param   {string} password
 * @return {object} the encrypted JWT ID Token along with the database's user object
 */
const loginUser = async (email, password) => {
  try {
    // retrive token and uid from firebase service
    const {uid, idToken, refreshToken, expiresIn} = await FireBaseService.FireBaseIDtoken(email, password);
    // find user in database by their uid
    const user = await User.findOne({_id: uid});
    if (user) {
      const retUser = await returnUserDetails(user, true);
      return {UserToken: {idToken, refreshToken, expiresIn}, retUser};
    } else {
      throw new Error('User not registered, please create an account');
    }
  } catch (err) {
    throw err;
  }
};
/**
 * Changes the user's password by updating it in FireBase
 * @param   {object} user Current user object that needs password change
 * @param   {string} newPassword the password string that the user wants to change to
 * @returns {boolean} boolean indicating whether we have succesffuly changed password
 */

const changePassword = async (user, newPassword) => {
  const userOld = user;
  // creating object to pass into FireBase Update API
  const updateObject = {
    password: newPassword,
  };
  try {
    const user = await FireBaseService.UpdateUser(userOld, updateObject);
    if (user) {
      return true;
    // eslint-disable-next-line brace-style
    }
    // throwing error since no user returned from Firbase API
    else {
      throw new Error('User not updated');
    }
  } catch (err) {
    throw err;
  }
};

/**
 * Change user account information, either the user's name or username
 * @param   {object} user Current user object to update information
 * @param   {string} updateType string that indicates whether we are changing user's name or username
 * @param   {string} updatedField the string that is associated with the new value that we want to change our field to
 * @return {object} returns updated user object
 */

const changeAccount = async (user, updateType, updatedField) => {
  try {
    const type = updateType;
    const newField = updatedField;
    // switch statement to handle conditions for if its name, username or neither
    switch (type) {
      // displayname in firebase we have set to name field
      case 'name':
        if (user.name === newField || newField === '') {
          throw new Error('Please select a new username that is at least 1 character long!');
        }
        // updating displayName in firebase by passing in object with displayName field
        const updateObject = {
          displayName: newField,
        };
        const userUpdate = await FireBaseService.UpdateUser(user, updateObject);
        console.log(userUpdate);

        // updating in the database and returning user details
        if (userUpdate) {
          // have to use uid since FireBase object returns the id as uid
          const updatedUser = await User.findOneAndUpdate({_id: userUpdate.uid}, {$set: {name: newField}}, {new: true});
          const retUser = await returnUserDetails(updatedUser, true);
          return retUser;
        }
        // throwing error since no user returned from Firbase API
        else {
          throw new Error('User did not update');
        }
        // username one only need to update in the database
      case 'username':
        if (user.username === newField || newField === '') {
          throw new Error('Please select a new username that is at least 1 character long!');
        }
        const updatedUser = await User.findOneAndUpdate({_id: user._id}, {$set: {username: newField}}, {new: true});
        const retUser = await returnUserDetails(updatedUser, true);
        return retUser;
        // if neither criteria met throw error
      default:
        throw new Error('Unable to update account information!');
    }
  } catch (err) {
    throw err;
  }
};

/**
 * Given a search query, return all corresponding users
 * @param   {string} query string representing search query of potential usernames
 * @returns {array} returns an array of user objects that match the query
 */

const searchUsers = async (query) => {
  try {
    // find all users with a username that matches the query
    const allUsers = await User.find({username: {$regex: query, $options: 'i'}});
    // now iterate through the array of users, removing any sensitive information, and also removing the user
    const ret = [];
    if (allUsers.length > 0) {
      await Promise.all(allUsers.map(async (user) => {
        const retUser = await returnUserDetails(user);
        ret.push(retUser);
      }));
    }
    return ret;
  } catch (err) {
    throw err;
  }
};

/**
 * Checks if a user exists with the given email
 * @param   {string} email
 * @return {boolean} boolean indicating whether there is a user that already exists with that email
 */
const userWithEmail = async (email) => {
  try {
    // check that email is not already used
    const userExists = await User.findOne({email: email});
    if (userExists) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    throw err;
  }
};

/**
 * Checks if a user exists with the given username
 * @param   {string} username
 * @return {boolean} boolean indicating whether there is a user that already exists with that username
 */
const userWithUsername = async (username) => {
  try {
    const user = await User.findOne({username: username});
    if (user) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    throw err;
  }
};

/**
 * Update the profile picture of the corresponding user
 * @param   {object} user
 * @param   {string} data Base64 encoding of the user's profile picture
 * @returns {boolean} boolean indicating whether we succesfully update the profile picture
 */

const updateProfilePic = async (user, data) => {
  try {
    // only for wjen using multer const buffer = Buffer.from(data.buffer, 'base64');
    const buffer = Buffer.from(data, 'base64');
    const newImage = await Image.create({img: {data: buffer, contentType: 'img/jpeg'}});
    await User.findOneAndUpdate({_id: user._id}, {$set: {profileImg: newImage._id}}, {new: true});
    return true;
  } catch (err) {
    throw err;
  }
};

/**
 * Given a user, return the base64 encoding of their profile picture
 * @param   {object} user
 * @return {string} returns Base64 encoding of the user's profile picture
 */
const retrieveProfilePic = async (user) => {
  try {
    console.log(user);
    const imgID = user.profileImg;
    // use the object ID to find the correct image document
    const profileImg = await Image.findById(imgID);
    if (profileImg) {
      const base64 = Utils.arrayBufferToBase64(profileImg.img.data.buffer);
      return base64;
    } else {
      return '';
    }
  } catch (err) {
    throw err;
  }
};
/**
 * Given a user, function returns user object details excluding password
 * @param   {object} user
 * @param   {boolean} includeProfilePic
 * @return {string} returns Base64 encoding of the user's profile picture
 */
const returnUserDetails = async (user, includeProfilePic = false) => {
  try {
    if (includeProfilePic) {
      const profilePic64 = await retrieveProfilePic(user);
      return {_id: user._id, name: user.name, username: user.username, email: user.email, balance: user.balance, phoneNumber: user.phoneNumber, img: profilePic64};
    } else {
      return {_id: user._id, name: user.name, username: user.username, email: user.email, balance: user.balance, phoneNumber: user.phoneNumber};
    }
  } catch (err) {
    throw err;
  }
};

module.exports = {
  signupUser: signupUser,
  loginUser: loginUser,
  changePassword: changePassword,
  changeAccount: changeAccount,
  searchUsers: searchUsers,
  userWithEmail: userWithEmail,
  userWithUsername: userWithUsername,
  updateProfilePic: updateProfilePic,
  retrieveProfilePic: retrieveProfilePic,
  returnUserDetails: returnUserDetails,
};

