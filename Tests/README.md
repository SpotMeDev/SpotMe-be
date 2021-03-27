# Overview
This directory will contain all the tests for our SpotMe server. Our testing framework consists of Mocha which is a JS framework running on Node.js, Chai which serves as an assertion library that pairs well with Mocha, and Sinon which gives us the flexibility to test spies, stubs, and mocks for our tests. 

## Setup
Currently, there are two sub-directories: one for Controller tests and one for Services tests. In order to add a test, create a file in onm of these two directories and name the file as follows, <test_file>.test.js. For example, if I wanted to test the AuthService.js. I would create a file in the Services directory named "AuthService.test.js". 


## Instructions for running tests 
1. Navigate to the root directory of the SpotMe-be repository. 
2. Run `npm install` which will look to our package.json to install the necessary dependencies. 
3. Run `npm test` which will run the tests based on the script. 

After running these commands, you should see the following in your terminal instance. 

![Screen Shot 2021-03-27 at 1 28 10 PM](https://user-images.githubusercontent.com/46234727/112728993-4bd5b200-8f00-11eb-8bed-855596959dd0.png)

At the bottom of the terminal you will see the number of passed tests and failed tests. Successful tests will have their name and a green checkmark beside it while failing tests will appear in red. 

## Creating a test 
Once you've created a testing file in the respective location, you are ready to begin creating a test. First, add the necessary imports to the top of the file, refer to one of the test files alrady created to see which imports are necessary. 

There are two important testing functions that you will use, "describe blocks" and "it blocks". A describe block will allow you to group together similar tests and the it block refers to the specific test itself. For example, if I am testing a group of functions, I can use a describe block to group the functions together and to test an individual function, I use the it block. Refer to the image below to see what this looks like in the context of our application. 

![Screen Shot 2021-03-27 at 1 34 34 PM](https://user-images.githubusercontent.com/46234727/112729167-301edb80-8f01-11eb-8cd9-1b313cf3e4dd.png)

At the highest level, we have a describe block that holds all of our tests together. Then embedded within that we have specific describe blocks that test our various routes (e.g "Signup route tests"). Then within that describe block, we have our it blocks that test for specific use cases. Such as testing when the password and confirm password don't match in our signup route. 

## Mocking
When creating unit tests, we want to test specific isolated functions and not any outside code. For example, when testing our controllers, we don't also want to test our AuthService functions. Therefore, this is where Sinon mocking is useful. Instead of relying on the actual output of the AuthService function, we can use a sinon mock that allows us to control it's specific output. 

```
sinon.stub(AuthService, 'changePassword').returns({ success: true })

```
Here is an example of a sinon mock, we are mocking the AuthService.changePassword function and specifying the output.

