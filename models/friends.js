const mongoose = require('mongoose');


const friendSchema = mongoose.Schema({
  requester: {type: mongoose.Schema.Types.String, ref: 'User'},
  recipient: {type: mongoose.Schema.Types.String, ref: 'User'},
  status: {
    type: Number,
    enums: [
      0, // add friend
      1, // requested
      2, // pending
      3, // friends
    ],
  },
}, {timestamps: true});

module.exports = mongoose.model('Friends', friendSchema);
