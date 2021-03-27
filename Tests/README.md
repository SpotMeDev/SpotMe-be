# Overview
This directory will contain all the tests for our SpotMe server. Our testing framework consists of Mocha which is a JS framework running on Node.js, Chai which serves as an assertion library that pairs well with Mocha, and Sinon which gives us the flexibility to test spies, stubs, and mocks for our tests. 

## Setup
Currently, there are two sub-directories: one for Controller tests and one for Services tests. In order to add a test, create a file in onm of these two directories and name the file as follows, <test_file>.test.js. For example, if I wanted to test the AuthService.js. I would create a file in the Services directory named "AuthService.test.js". 


## Instructions for running tests 
1. Navigate to the root directory of the SpotMe-be repository. 
2. Run `npm install` which will look to our package.json to install the necessary dependencies. 
3. Run `npm test` which will run the tests based on the script. 

After running these commands, you should see the following in your terminal instance. 

![Screen Shot 2021-03-27 at 1 18 18 PM](https://user-images.githubusercontent.com/46234727/112728730-0bc1ff80-8eff-11eb-85ea-1a033b982d77.png)

At the bottom of the terminal you will see the number of passed tests and failed tests. Successful tests will have their name and a green checkmark beside it while failing tests will appear in red. 

