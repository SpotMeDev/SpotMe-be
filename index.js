if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
// development branch
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const authRouter = require('./Controllers/AuthController');
const transactionRouter = require('./Controllers/TransactionController');
const mongoose = require('mongoose');

// Connect Database
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@spotme.lidfh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`, {useNewUrlParser: true});
mongoose.set('useFindAndModify', false);

// firebase connection
const FireBase_Admin = require('firebase-admin');
const FireBase_Credentials = require('./nodpay-FireBase-ServiceAccount.json');

FireBase_Admin.initializeApp({
  credential: FireBase_Admin.credential.cert(FireBase_Credentials),
});
// Body parser
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

// Routes
app.use('/auth', authRouter);
app.use('/transaction', transactionRouter);
app.get('/', (req, res) => {
  res.send({message: 'Welcome to the SpotMe BackEnd'});
});


// Port listening
app.listen(port, () => console.log(`Listening on port ${port}`));


module.exports = app;
