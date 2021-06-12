const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const AuthService = require('../../Services/AuthService');
const FriendService = require('../../Services/FriendService');
const mongoose = require('mongoose');
const { update } = require('../../models/user');
const { response } = require('express');


describe('Friend Service Tests', () => {
  // before function runs before each test and should be used to set up database connections and async requests
  before((done) => {
    mongoose.connect('mongodb://localhost:27017/spotme-test', {useNewUrlParser: true});
    done();
  });
  describe('Add Friend', () => {
    const friend1 = {
        name: 'friend1',
        username:'friend1Username',
        email:'friend1@gmail.com',
        password:'password'
    }

    const friend2 = {
        name: 'friend2',
        username:'friend2Username',
        email:'friend2@gmail.com',
        password:'password'
    }

    let friend1User;
    let friend2User;
    let friend1WithFriend;

    before((done) => {
      AuthService.signupUser(friend1.name, friend1.username, friend1.email, friend1.password).then((resp) => {
        friend1User = resp.retUser;
        done();
      }).catch((err) => {
        console.log(err);
        done(err);
      });
    });

    before((done) => {
        AuthService.signupUser(friend2.name, friend2.username, friend2.email, friend2.password).then((resp) => {
          friend2User = resp.retUser;
          console.log("FRIEND2");
          console.log(friend2User);
          done();
        }).catch((err) => {
          console.log(err);
          done(err);
        });
    });

    before((done) => {
        FriendService.addFriend(friend1User, friend2User._id).then((response) => {
            friend1WithFriend = response;
            console.log("BACK IN TEST")
            console.log(friend1WithFriend);
            console.log("END BACK IN TEST")
            done();
        }).catch((error) => {
            done(error);
        })
    })

    before((done) => {
        FriendService.allFriends(friend1User._id).then((response) => {
            console.log(response);
            done();
        })
    })

    it('Successful Add Friend', async () => {
      let friendId = friend1User.friends[0];
      expect(friendId).equals(friend2User._id);
    });
  });

  describe("All Friends", () => {

    let currentUser;
    let friendsList;

    before((done) => {
        AuthService.loginUser("friend1@gmail.com", "password").then((response) => {
            currentUser = response.retUser;
            done();
        }).catch((error) => {
            done(error);
        })
    })

    before((done) => {
        FriendService.allFriends(currentUser.id).then((response) => {
            friendsList = response;
            console.log(friendsList);
            done();
        }).catch((error) => {
            done(error);
        })
    })

    it('Successful All Friends', async () => {

    })

  })
  
  after((done) => {
    mongoose.connection.db.dropDatabase(() => {
      mongoose.connection.close(done);
    });
  });
});
