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
const mongoose = require('mongoose'); 
const initializePassport = require('./passport-config'); 
initializePassport(passport); 

// Connect Database 
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@spotme.lidfh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`, {useNewUrlParser: true}); 
mongoose.set('useFindAndModify', false);

// Body parser 
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); 

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



