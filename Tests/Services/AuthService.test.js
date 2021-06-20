const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const AuthService = require('../../Services/AuthService');
const mongoose = require('mongoose');
const {update} = require('../../models/user');
const {response} = require('express');
const firebase = require('@firebase/testing');

// project ID for Nod Firebase project
const FireBase_Project_ID = 'nodpay-5f5f1';

describe('Authentication Service Tests', () => {
  // before function runs before each test and should be used to set up database connections and async requests.
  // set up the firebase emulator
  before((done) => {
    mongoose.connect('mongodb://localhost:27017/spotme-test', {useNewUrlParser: true});
    const fb = firebase.initializeAdminApp({projectId: FireBase_Project_ID}).auth();
    done();
  });
  describe('Successful Signup Tests', () => {
    const name = 'test';
    const username = 'testUsername';
    const email = 'test@gmail.com';
    const password = 'password';
    const phoneNumber = '+15553004404';
    let user;
    before((done) => {
      AuthService.signupUser(name, username, email, phoneNumber, password).then((resp) => {
        user = resp.retUser;
        done();
      }).catch((err) => {
        console.log(err);
        done(err);
      });
    });
    it('Successful User Signup', async () => {
      expect(user.name).equals(name);
      expect(user.username).equals(username);
      expect(user.email).equals(email);
      expect(user.balance).equals(0);
      expect(user.phoneNumber).equals(phoneNumber);
    });
  });
  describe('Login User', () => {
    const email = 'test@gmail.com';
    const password = 'password';
    let user;
    before((done) => {
      AuthService.loginUser(email, password).then((resp) => {
        user = resp.retUser;
        done();
      }).catch((err) => {
        console.log(err);
        done(err);
      });
    });
    it('Successful User Login', async () => {
      expect(user.email).equals(email);
    });
  });

  describe('Change Account Name', () => {
    const email = 'test@gmail.com';
    const password = 'password';
    const newName = 'Tester';
    let user;
    let updatedUser;
    before((done) => {
      AuthService.loginUser(email, password).then((resp) =>{
        user = resp.retUser;
        done();
      }).catch((err) => {
        console.log(err);
        done(err);
      });
    });

    before((done) => {
      AuthService.changeAccount(user, 'name', newName).then((resp) => {
        updatedUser = resp;
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('Successful Account Name Change', async () => {
      expect(user.email).equals(email);
      expect(updatedUser.retUser.name).equals(newName);
    });
  });

  // Change Account Username
  describe('Change Account Username', () => {
    const email = 'test@gmail.com';
    const password = 'password';
    const newUsername = 'Tester';
    let user;
    let updatedUser;
    before((done) => {
      AuthService.loginUser(email, password).then((resp) =>{
        user = resp.retUser;
        done();
      }).catch((err) => {
        done(err.message);
      });
    });

    before((done) => {
      AuthService.changeAccount(user, 'username', newUsername).then((resp) => {
        updatedUser = resp;
        done();
      }).catch((err) => {
        console.log(err);
        done(err);
      });
    });

    it('Successful Account Name Change', async () => {
      expect(updatedUser.retUser.username).equals(newUsername);
    });
  });

  describe('User With Email', () => {
    const email = 'test@gmail.com';
    let ret;
    before((done) => {
      AuthService.userWithEmail(email).then((response) => {
        ret = response;
        done();
      }).catch((error) => {
        console.log(error);
        done(error);
      });
    });

    it('User With Email', async () => {
      expect(ret).equals(true);
    });
  });

  describe('User With Username', () => {
    const username = 'testUsername';
    let ret;
    before((done) => {
      AuthService.userWithUsername(username).then((response) => {
        ret = response;
        done();
      }).catch((error) => {
        console.log(error);
        done(error);
      });
    });

    it('User With Username Success', async () => {
      expect(ret).equals(true);
    });
  });

  // search user test
  describe('Search Users', () => {
    const username = 'testUsername';
    let ret;
    before((done) => {
      AuthService.searchUsers(username).then((response) => {
        ret = response;
        done();
      }).catch((error) => {
        console.log(error);
        done(error);
      });
    });

    it('Search Users Successful', async () => {
      ret.forEach((item) => {
        expect(item.name).equals('test');
        expect(item.username).equals('testUsername');
        expect(item.email).equals('test@gmail.com');
      });
    });
  });

  // change password TODO
  describe('Change Password', () => {
    const email = 'test@gmail.com';
    const password = 'password';
    const newPassword = 'password1';
    let user;
    let changedPassword;
    before((done) => {
      AuthService.loginUser(email, password).then((response) => {
        user = response.retUser;
        done();
      }).catch((error) => {
        console.log(error);
        done(error);
      });
    });

    before((done) => {
      AuthService.changePassword(user, password, newPassword).then((response) => {
        changedPassword = response;
        done();
      }).catch((error) => {
        console.log(error);
        done(error);
      });
    });
    it('Successful Change Password', async () => {
      expect(changedPassword).equals(true);
    });
  });
  after((done) => {
    mongoose.connection.db.dropDatabase(() => {
      mongoose.connection.close(done);
    });
  });
});
