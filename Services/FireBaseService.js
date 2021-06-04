const FireBase_Admin = require('firebase-admin');
const axios = require('axios');
const User = require('../models/user');


/**
 * Using FireBase HTTP API to sign in user and retrive the ID token along with the refresh token
 * @param {string} email 
 * @param {string} password 
 * @returns {object} returns the JWT ID token, refresh token and time to expire which is one hour -> 3600 seconds
 */
const FireBaseIDtoken = async(email, password) => {
    //will store this later in environment variables
    const API_Key = 'AIzaSyDaZLrCamN89yUaM9g1tjn7BDdxsUDKWB8';
    const data = {
        email: email,
        password: password,
        returnSecureToken: true
    }
    //making sure it returns as json format
    const Configuration =  {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        //using FireBase REST API to make a post request to get the user information and ID token
        const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_Key}`, 
        data, config = Configuration)
        console.log(response.data);
        const idToken = 'Bearer ' + response.data.idToken;
        const refreshToken = response.data.refreshToken;
        const expiresIn = response.data.expiresIn;
        const uid = response.data.localId;
        //returning the ID token(JWT token), refreskToken, exipres time & uid (may change if find no need)
        return {idToken, refreshToken, expiresIn, uid}
    } catch(err) {
        console.log(err);
        throw err;
    }
}
/**
 * This is the Firebase middleware to authenticate user to use our services by verifying
 * its ID token 
 * @param {*} req get the authorization header from the request
 * @param {*} res if any error return result 400
 * @param {*} next once verified the user return a uid or false if not verified
 * @returns {string} uid
 * 
 */
const Authenticate = (req, res, next) => {
    //first getting the authorization header. Seperating bearer and token
    const [Bearer, token] = req.headers.authorization.split(' ');
    if(Bearer == 'Bearer') {
        if(token != null) {
            //using firebase SDK to verify user token and return the user uid
            FireBase_Admin.auth().verifyIdToken(token)
            .then(response =>{
                if(response) {
                    User.findOne({_id: response.uid}).then((user) => {
                        console.log(user);
                        req.user = user;
                        next();
                    })
                    .catch((err) => {
                        console.log(err);
                        req.user = false;
                        next();
                    })
                } else {
                    req.user = false;
                    next();
                }
                
            }).catch(err => {
                return res.status(400).send({Error: err});
            })
        } else{
            return res.status(403).send({message: "No Authorization token provided"});
        }

    } else {
        return res.status(403).send({message: "No Bearer in ID token"});
    }
};

const UpdatePassword = async(user, newPassword) => {
    //_id is the uid that needs to be passed in
    const uid = user._id;
    try {
        const userUpdated = await FireBase_Admin.auth().updateUser(uid, {
            password: newPassword
        });
        return userUpdated;
    } catch(err) {
        console.log(err)
        throw err;
    }
}

module.exports = {
    FireBaseIDtoken: FireBaseIDtoken,
    Authenticate: Authenticate,
    UpdatePassword: UpdatePassword
}
  