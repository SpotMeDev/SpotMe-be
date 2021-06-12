const mongoose = require('mongoose');


const transactionSchema = mongoose.Schema({
  sender: {type: mongoose.Schema.Types.String, ref: 'User'},
  recipient: {type: mongoose.Schema.Types.String, ref: 'User'},
  amount: Number,
  message: String,
}, {timestamps: true});


module.exports = mongoose.model('Transaction', transactionSchema);
