var express = require('express'); 
var app = express(); 
var bodyParser = require('body-parser'); 
var port = process.env.PORT || 8080; 

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })); 



app.get("/", (req, res) => {
    res.send({message: "Welcome to the SpotMe BackEnd"})
});


app.listen(port, () => console.log(`Listening on port ${port}`)); 



