const AuthService = require('../../../Services/AuthService');
const User = require('../../../models/user');
const Utils = require('../../../Services/utils')
const bcrypt = require('bcrypt'); 
const TokenService = require('../../../Services/TokenService'); 

const assert = require('assert'); 


let sign_up_user = async ()  => {
    const {jwt, retUser} = await AuthService.signupUser("Test", "Test", "Test", "Test");
    return retUser;
}

ret = sign_up_user().then((data) => {
    console.log(data)
}).catch((data) => {
    console.log(data)
})
