const chai = require('chai'); 
const expect = chai.expect;
const request = require("request");
const AuthService = require('../../../Services/AuthService');
const mongoose = require('mongoose'); 



describe("Authentication Service Tests", () => {
    before((done) => {
        mongoose.connect('mongodb://localhost:27017/spotme-test', {useNewUrlParser: true}); 
        done()
    })
    describe("Successful Signup Tests", () => {
        let name = 'test'
        let username = 'testUsername';
        let email = 'test@gmail.com';
        let password = 'password';
        let token; 
        let user; 
        before((done) => {
            AuthService.signupUser(name, username, email, password).then((resp) => {
                token = resp.jwt;
                user = resp.retUser
                done();
            }).catch(err => {
                console.log(err);
                done(err);
            })
        })
        it("Successful User Signup", async () => {
            expect(user.name).equals(name);
            expect(user.username).equals(username);
            expect(user.email).equals(email)
            expect(user.balance).equals(0)
        })
    })
})
