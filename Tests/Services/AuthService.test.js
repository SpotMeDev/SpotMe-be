const chai = require('chai');
const expect = chai.expect;
const AuthService = require('../../Services/AuthService');
const mongoose = require('mongoose');


describe('Authentication Service Tests', () => {
  // before function runs before each test and should be used to set up database connections and async requests
  before((done) => {
    mongoose.connect('mongodb://localhost:27017/spotme-test', {useNewUrlParser: true});
    done();
  });
  describe('Successful Signup Tests', () => {
    const name = 'test';
    const username = 'testUsername';
    const email = 'test@gmail.com';
    const password = 'password';
    let user;
    before((done) => {
      AuthService.signupUser(name, username, email, password).then((resp) => {
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
    });
  });
  after((done) => {
    mongoose.connection.db.dropDatabase(() => {
      mongoose.connection.close(done);
    });
  });
});
