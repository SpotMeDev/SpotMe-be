const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
  //setting the id to Firebase uid
  _id: String,
  name: String,
  username: String,
  //removed password field since passwords can be stored in firebase
  email: String,
  balance: Number,
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Friends',
  }],
  profileImg: {type: mongoose.Schema.Types.ObjectId, ref: 'Image'},
});


module.exports = mongoose.model('User', userSchema);
