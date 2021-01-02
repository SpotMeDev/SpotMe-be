const mongoose = require('mongoose'); 


const userSchema = mongoose.Schema({
    name: String, 
    username: String, 
    email: String, 
    password: String, 
    balance: Number, 
    friends: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Friends'
    }], 
    profileImg: {type: mongoose.Schema.Types.ObjectId, ref: "Image"}
})


module.exports = mongoose.model("User", userSchema); 
