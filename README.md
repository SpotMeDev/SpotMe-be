# SpotMe-be
Node JS / Express Server for the SpotMe application which looks to provide an easier, interactive approach to peer-to-peer transactions


## Project Structure 
```
├── Controllers                         # Controllers will be the intermediary between Services and Client requests, handles all routing
│   └── AuthController.js               # All Authentication Routes contained within this Controller
    └── TransactionController.js        # All Transaction Routes contained within this Controller
└── models                              # Contains all Mongoose Database Schemas for our different collections
    ├── friends.js                      # Friend Schema that establishes relationship between requester and recipient
    └── image.js                        # Image Schema that establishes stores profile / transaction image
    ├── transaction.js                  # Transaction Schema that records transaction details 
    └── user.js                         # User Schema that saves user and necessary information
├── scripts                             # Contains any JS scripts that we might need to run from time to time
└── Services                            # Services will serve similar to a DAO, such that they will provide all of our database operations
    ├── AuthService.js                  # Class containing helper functions / database queries dealing with our application's users 
    └── Base64.js                       # Class containing code that deals with Base64 formatting, this is specifically for our image storage 
    ├── TransactionService.js           # Class containing helper functions / database queries dealing with our application's transactions 
    └── utils.js                        # File will contain miscellaneous functions needed throughout our application, such as conversion functions 
├── index.js                            # Main source file that app will use to render our routes and instantiate all necessary middleware

```

## Installation / Running Server 
1. Make sure that you have installed Node.js, if not install it here (https://nodejs.org/en/download/)
2. After node installation, confirm by opening up a terminal instance and running the command `node --version` or `npm --version` (npm = Node Package Manager)
3. Install MongoDB (https://docs.mongodb.com/manual/installation/)
4. Confirm MongoDB installation by opening a terminal instance and running `mongo` command which should open a mongo shell if properly installed
5. Navigate to root directory of SpotMe-be repo
6. Ask one of the developers for project configuration (.env and id_rsa specific) files 
7. Run `npm install` which will look to our package.json to install all the necessary project dependencies 
8. Run `npm run devStart` which should run our local server using nodemon 
9. Navigate to http://localhost:8080/. If you see a JSON response welcoming you to the SpotMe Back-end, you have successfully setup the project correctly.


## Contributing 
Look through the assigned GitHub issues / Trello cards for specific tasks or reach out to Gagandeep Kang. 

Format your local branches with "YOURNAME-FEATURENAME-ISSUENUMBER". For example, if I fixed the 217th GitHub issue which was a bug in the auth controller my local branch should be named, "gagankang-authControllerBug-217"


