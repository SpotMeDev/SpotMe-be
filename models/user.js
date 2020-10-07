const mongoose = require('mongoose'); 


const userSchema = mongoose.Schema({
    name: String, 
    email: String, 
    password: String, 
    balance: Number, 
    friends: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Friends'
    }]
})


module.exports = mongoose.model("User", userSchema); 
