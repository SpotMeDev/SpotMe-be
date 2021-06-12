const User = require('../models/user');
const Friends = require('../models/friends');
const AuthService = require('../Services/AuthService');

/**
 * Take in the senderId and recipientId and then return the status of their friendship:
 * 0 --> not friends
 * 1 --> user has requested
 * 2 --> pending friend request from recipient
 * 3 --> friends already
 * @param   {string} senderId
 * @param   {string} recipientId
 * @returns {number} returns number (0-3, refer to comments above about what each corresponds to) which indicates the status of friendship
 */

const friendStatus = async (senderId, recipientId) => {
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
    } else {
      return 0;
    }
  } catch (err) {
    throw err;
  }
};

/**
 * takes the user ID and returns all of the user's friends, in an array of objects
 * @param   {string} id
 * @return {array} returns an array of User objects corresponding to all the friends of the original user, if none, returns []
 */
const allFriends = async (id) => {
  try {
    const user = await User.findById(id);
    console.log("ALL FRIENDS")
    console.log(user);
    if (user) {
      // create a mongo aggregation: NEED TO IMPROVE: TOO MANY QUERIES
      const friends = user.friends;
      if (friends.length > 0) {
        const ret = [];
        // iterate through the friends of the user
        await Promise.all(friends.map(async (friend) => {
          // for each friend id, query for that document and the user will be the requestor so we want to map the recipient and return them
          const friendDoc = await Friends.findById(friend);
          if (friendDoc.status === 3) {
            // using the id of the recipient, we will find the
            const recipient = await User.findById(friendDoc.recipient);
            ret.push({_id: recipient._id, friends: recipient.friends, name: recipient.name, username: recipient.username, email: recipient.email});
          }
        }));
        return ret;
      } else {
        return [];
      }
    }
    return [];
  } catch (err) {
    throw err;
  }
};

/**
 * Takes in a user and a recipientID, and sends a friend request to the recipient
 * @param   {object} user
 * @param   {object} recipientID
 * @return {object} returns updated user object if succesfully added, else throw an error
 */
const addFriend = async (user, recipientID) => {
  try {
    // get the sender and recipient user obj
    const sender = user;
    console.log("SENDER");
    console.log(sender);
    const recipient = await User.findById(recipientID);
    console.log("RECIP");
    console.log(recipientID);

    // update friend schema to reflect sending
    const senderFriendReq = await Friends.findOneAndUpdate({requester: sender._id, recipient: recipient._id}, {$set: {status: 1}}, {new: true, upsert: true});
    const recipientFriendReq = await Friends.findOneAndUpdate({requester: recipient._id, recipient: sender._id}, {$set: {status: 2}}, {new: true, upsert: true});

    // update the user objects
    const newSender = await User.findOneAndUpdate({_id: sender._id}, {$push: {friends: senderFriendReq._id}}, {new: true});
    await User.findOneAndUpdate({_id: recipient._id}, {$push: {friends: recipientFriendReq._id}}, {new: true});
    const retUser = await AuthService.returnUserDetails(newSender, false);
    console.log("ADD FRIEND RETURN")
    console.log(retUser);
    return retUser;
  } catch (err) {
    throw err;
  }
};

/**
 * Function either accepts or declines a pending friend request
 * @param   {object} user
 * @param   {object} recipientID
 * @param   {string} acceptedRequest string which is either "true" or "false" indicating whether the user accepts or declines this request
 * @return {object} returns updated user object if succesfully handled, else throw an error
 */
const handleFriendRequest = async (user, recipientID, acceptedRequest) => {
  try {
    const sender = user;
    const recipient = await User.findById(recipientID);
    if (acceptedRequest === 'true') {
      // update the friends schema
      await Friends.findOneAndUpdate({requester: sender._id, recipient: recipient._id}, {$set: {status: 3}});
      await Friends.findOneAndUpdate({requester: recipient._id, recipient: sender._id}, {$set: {status: 3}});
      const retUser = await AuthService.returnUserDetails(sender, true);
      return retUser;
    } else {
      // delete the friend relationship between if the request has been declined
      const remSender = await Friends.findOneAndRemove({requester: sender._id, recipient: recipient._id});
      const remRecipient = await Friends.findOneAndRemove({requester: recipient._id, recipient: sender._id});

      // remove the friends from each of the user's objects
      const updatedSender = await User.findOneAndUpdate({_id: sender._id}, {$pull: {friends: remSender._id}}, {new: true});
      await User.findOneAndUpdate({_id: recipient._id}, {$pull: {friends: remRecipient._id}}, {new: true});
      const retUser = await AuthService.returnUserDetails(updatedSender, true);
      return retUser;
    }
  } catch (err) {
    throw err;
  }
};

module.exports = {
  friendStatus: friendStatus,
  allFriends: allFriends,
  addFriend: addFriend,
  handleFriendRequest: handleFriendRequest,
};
