const User = require('../models/user');
const Image = require('../models/image');
const Utils = require('../services/utils');
const bcrypt = require('bcrypt');
const TokenService = require('./TokenService');

/**
 * Takes in necessary profile information and creates a user object in our database.
 * @param   {string} name
 * @param   {string} username
 * @param   {string} email
 * @param   {string} password
 * @return {object} the encrypted JWT (JSON Web Token) along with the database's user object
 */
const signupUser = async (name, username, email, password) => {
  try {
    // hash password and insert into database
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({name: name, username: username, email: email, password: hashedPassword, balance: 0});
    const jwt = TokenService.issueJWT(newUser);
    const retUser = await returnUserDetails(newUser, true);
    return {jwt, retUser};
  } catch (err) {
    throw err;
  }
};

/**
 * Takes in an email (soon username) and password and logs in user by checking password hash and generating a token
 * @param   {string} email
 * @param   {string} password the second number
 * @returns {object} the encrypted JWT (JSON Web Token) along with the database's user object
 */

const loginUser = async (email, password) => {
  try {
    const user = await User.findOne({email: email});
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const jwt = TokenService.issueJWT(user);
        const retUser = await returnUserDetails(user, true);
        return {jwt, retUser};
      } else {
        throw new Error('Incorrect username or password! Please try again.');
      }
    } else {
      throw new Error('Incorrect username or password! Please try again.');
    }
  } catch (err) {
    throw err;
  }
};

/**
 * Changes the user's password by updating the database document
 * @param   {object} user Current user object that needs password change
 * @param   {string} currentPassword the password that is currently associated with the user
 * @param   {string} newPassword the password string that the user wants to change to
 * @returns {boolean} boolean indicating whether we have succesffuly changed password
 */

const changePassword = async (user, currentPassword, newPassword) => {
  try {
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (isMatch) {
      // create a hash of the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await User.findOneAndUpdate({_id: user._id}, {$set: {password: hashedPassword}}, {new: true});
      return true;
    } else {
      throw new Error('Current Password does not match the user');
    }
  } catch (err) {
    throw err;
  }
};

/**
 * Change user account information, either the user's name or username
 * @param   {object} user Current user object that needs password change
 * @param   {string} updateType string that indicates whether we are changing user's name or username
 * @param   {string} updatedField the string that is associated with the new value that we want to change our field to
 * @return {object} returns updated user object
 */
const changeAccount = async (user, updateType, updatedField) => {
  try {
    const type = updateType;
    const newField = updatedField;
    if (type === 'name') {
      if (user.name === newField || newField === '') {
        throw new Error('Please select a new name that is at least 1 character long!');
      }
      const updatedUser = await User.findOneAndUpdate({_id: user._id}, {$set: {name: newField}}, {new: true});
      const retUser = await returnUserDetails(updatedUser, true);
      return retUser;
    } else if (type === 'username') {
      // handle username change here
      if (user.username === newField || newField === '') {
        throw new Error('Please select a new username that is at least 1 character long!');
      }
      const updatedUser = await User.findOneAndUpdate({_id: user._id}, {$set: {username: newField}}, {new: true});
      const retUser = await returnUserDetails(updatedUser, true);
      return retUser;
    } else {
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
      return {id: user._id, name: user.name, username: user.username, email: user.email, balance: user.balance, img: profilePic64};
    } else {
      return {id: user._id, name: user.name, username: user.username, email: user.email, balance: user.balance};
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

