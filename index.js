if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const express = require('express'); 
const app = express(); 
const bodyParser = require('body-parser'); 
const port = process.env.PORT || 8080; 
const authRouter = require('./Controllers/AuthController'); 
const transactionRouter = require('./Controllers/TransactionController')
const passport = require('passport');
const session = require('express-session'); 
const initializePassport = require('./passport-config'); 
initializePassport(passport); 

// Body parser 
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })); 

// // Express session middleware
// app.use(session({
//     secret: process.env.SESSION_SECRET, 
//     resave: true, 
//     saveUninitialized: false
// }))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Routes
app.use('/auth', authRouter); 
app.use('/transaction', transactionRouter)
app.get("/", (req, res) => {
    res.send({message: "Welcome to the SpotMe BackEnd"})
});


// Port listening
app.listen(port, () => console.log(`Listening on port ${port}`)); 



