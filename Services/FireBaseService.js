const FireBase_Admin = require('firebase-admin');

//function to verify id tokens and extract user id. this will be used as middleware
const Verify = async (token) => {
    try {
        const user = await FireBase_Admin.auth().verifyIdToken(token);
        userId = user.uid;
        return userId;
    } catch(err) {
        throw err;
    }
}

const Authenticate = (req, res, next) => {
    //first getting the authorization header
    const token = req.headers.authorization;
    if(token != null) {
        //using firebase SDK to verify user token and return the user uid
        FireBase_Admin.auth().verifyIdToken(token)
        .then(user =>{
            if(user) {
                req.user = user.uid;
                next();
            } else {
                req.user = false;
                next();
            }
            
        }).catch(err => {
            return res.status(400).send({Error: err});
        })
    } else{
        return res.status(400).send({message: "No Authorization header provided"});
    }
};


module.exports = {
    Verify: Verify,
    Authenticate: Authenticate
}
  