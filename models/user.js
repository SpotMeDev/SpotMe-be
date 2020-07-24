const mongoose = require('mongoose'); 


const userSchema = mongoose.Schema({
    name: String, 
    email: String, 
    password: String, 
    balance: Number
})


module.exports = mongoose.model("User", userSchema); 
