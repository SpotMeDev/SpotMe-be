const Transaction = require('../models/transaction');
const User = require('../models/user');
const AuthService = require('../Services/AuthService');
const FriendService = require('../Services/FriendService');
const utils = require('../Services/utils');
const dateConversion = utils.dateConversion;

/**
 * Creates a transaction between user and recipient along with updating their SpotMe balance
 * @param   {object} user
 * @param   {string} recipientID
 * @param   {string} message string that corresponds to the message that describes the transaction
 * @param   {number} amount the amount of the transaction between the two users
 * @return {object} the updated user object
 */
const createTransaction = async (user, recipientID, message, amount) => {
  try {
    // check that the user has enough in their current balance to make that transaction
    const sender = user;
    if (sender.balance >= amount) {
      // also check for a user message
      if (message === '') {
        throw new Error('Must include message with your transaction');
      }
      // decrement the user's balance
      const updatedSender = await User.findOneAndUpdate({_id: sender._id}, {$inc: {balance: -amount}}, {new: true});
      const updatedRecipient = await User.findOneAndUpdate({_id: recipientID}, {$inc: {balance: amount}}, {new: true});

      const retUser = await AuthService.returnUserDetails(updatedSender, true);
      // create the transaction
      await Transaction.create({sender: updatedSender._id, recipient: updatedRecipient._id, amount: amount, message: message});
      return retUser;
    } else {
      throw new Error('Insufficient balance to complete request');
    }
  } catch (err) {
    throw err;
  }
};

/**
 * Increases the user's SpotMe balance by the specified amount
 * @param   {object} user
 * @param   {number} amount the amount of the transaction between the two users
 * @return {object} the updated user object
 */
const addBalance = async (user, amount) => {
  try {
    const updateUserBalance = await User.findOneAndUpdate({_id: user._id}, {$inc: {balance: amount}}, {new: true});
    const retUser = await AuthService.returnUserDetails(updateUserBalance, true);
    return retUser;
  } catch (err) {
    throw err;
  }
};


/**
 * Finds all transactions where user is either the sender or the recipient
 * @param   {object} user
 * @return {array} returns an array of transactions, if none, returns []
 */
const allUserTransactions = async (user) => {
  // createdAt: -1 will provide transactions in descending order
  try {
    const allTransactions = await Transaction.find({$or: [{sender: user._id}, {recipient: user._id}]}).sort({'createdAt': -1});
    const ret = [];
    await Promise.all(allTransactions.map(async (transaction) => {
      let userIsSender = false;
      if (transaction.sender.equals(user._id)) {
        const recipient = await User.findById(transaction.recipient);
        const retUser = await AuthService.returnUserDetails(user);
        const retRecipient = await AuthService.returnUserDetails(recipient);
        userIsSender = true;
        const formattedDate = dateConversion(transaction.createdAt);
        ret.push({id: transaction._id, sender: retUser, recipient: retRecipient, amount: transaction.amount, message: transaction.message, createdAt: formattedDate, created: transaction.createdAt, userIsSender: userIsSender});
      } else {
        const sender = await User.findById(transaction.sender);
        const retUser = await AuthService.returnUserDetails(user);
        const retSender = await AuthService.returnUserDetails(sender);
        const formattedDate = dateConversion(transaction.createdAt);
        ret.push({id: transaction._id, sender: retSender, recipient: retUser, amount: transaction.amount, message: transaction.message, createdAt: formattedDate, created: transaction.createdAt, userIsSender: userIsSender});
      }
    }));
    if (ret.length > 0) {
      ret.sort((a, b) => b.created - a.created);
    }
    return ret;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
/**
 * Finds all transactions associated with the user or any of the user's friends
 * @param   {object} user
 * @return {array} returns an array of transactions, if none, returns []
 */
const allFriendsTransactions = async (user) => {
  // create a set of transactions so that we don't add any duplicates
  try {
    const set = new Set();
    const friends = await FriendService.allFriends(user._id);
    const userTransactions = await allUserTransactions(user);
    const ret = userTransactions;
    // add all of our transactions to set
    ret.forEach((transaction) => {
      set.add(transaction.id.toString());
    });
    // now for each friend, iterate through their transactions and add to array
    await Promise.all(friends.map(async (friend) => {
      const newFriend = await User.findById(friend.id);
      const currentTransaction = await allUserTransactions(newFriend);
      currentTransaction.forEach((transaction) => {
        if (!set.has(transaction.id.toString())) {
          set.add(transaction.id.toString());
          ret.push(transaction);
        }
      });
    }));
    return ret;
  } catch (err) {
    console.log(err);
    throw err;
  }
};


module.exports = {
  createTransaction: createTransaction,
  addBalance: addBalance,
  allFriendsTransactions: allFriendsTransactions,
  allUserTransactions: allUserTransactions,
};
