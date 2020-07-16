const express = require('express'); 
const app = express(); 
const bodyParser = require('body-parser'); 
const port = process.env.PORT || 8080; 
const mongoose = require('mongoose'); 
const user = require('./models/user'); 

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })); 

mongoose.connect("mongodb://localhost/spotme_db", {useNewUrlParser: true})




app.get("/", (req, res) => {
    res.send({message: "Welcome to the SpotMe BackEnd"})
});


app.listen(port, () => console.log(`Listening on port ${port}`)); 



