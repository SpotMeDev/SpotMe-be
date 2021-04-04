const mongoose = require('mongoose');


const transactionSchema = mongoose.Schema({
  sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  recipient: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  amount: Number,
  message: String,
}, {timestamps: true});


module.exports = mongoose.model('Transaction', transactionSchema);
