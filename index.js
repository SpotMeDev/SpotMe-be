if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const express = require('express'); 
const app = express(); 
const bodyParser = require('body-parser'); 
const port = process.env.PORT || 8080; 
const authRouter = require('./Controllers/AuthController'); 
// const passport = require('passport');
// const initializePassport = require('../passport-config'); 
// initializePassport(passport); 

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })); 

// app.use(session({
//     secret: process.env.SESSION_SECRET, 
//     resave: false, 
//     saveUninitialized: false
// }))

// app.use(passport.initialize())
// app.use(passport.session())


app.use('/auth', authRouter); 


app.get("/", (req, res) => {
    res.send({message: "Welcome to the SpotMe BackEnd"})
});



app.listen(port, () => console.log(`Listening on port ${port}`)); 



