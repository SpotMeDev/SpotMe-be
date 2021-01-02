const Transaction = require('../models/transaction')
const User = require('../models/user'); 
const authService = require('../Services/AuthService'); 
const AuthService = new authService(); 

class TransactionService {
    // finds all transactions where user is either the sender or the recipient 
    allUserTransactions = async (user) => {

        // createdAt: -1 will provide transactions in descending order
        const allTransactions = await Transaction.find({ $or: [{sender: user._id}, {recipient: user._id }]}).sort({"createdAt": -1})
        const ret = []
        await Promise.all(allTransactions.map(async (transaction) => {
            let userIsSender = false; 
            if (transaction.sender == user._id) {
                const recipient = await User.findById(transaction.recipient); 
                const retUser = await AuthService.returnUserDetails(user); 
                const retRecipient = await AuthService.returnUserDetails(recipient); 
                userIsSender = true; 
                ret.push({id: transaction._id, sender: retUser, recipient: retRecipient, amount: transaction.amount, message: transaction.message, createdAt: transaction.createdAt, userIsSender: userIsSender})
            }
            else {
                const sender = await User.findById(transaction.recipient); 
                const retUser = await AuthService.returnUserDetails(user); 
                const retSender = await AuthService.returnUserDetails(sender); 
                ret.push({id: transaction._id, sender: retSender, recipient: retUser, amount: transaction.amount, message: transaction.message, createdAt: transaction.createdAt, userIsSender: userIsSender})
            }
        }))
        return ret; 
    }
}

module.exports = TransactionService