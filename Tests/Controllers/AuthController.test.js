const chai = require('chai'); 
const chaiHttp = require('chai-http');
const expect = chai.expect;
const sinon = require('sinon'); 
const passport = require('passport');
const AuthService = require('../../Services/AuthService.js');
chai.use(chaiHttp);

passport.authenticate = sinon.stub( passport, 'authenticate' ).returns(( req, res, next ) => { next() });
const app = require('../../index.js');
describe("Auth Controllers Tests", () => { 
    before((done) => {
        done();
    })
    describe("Signup Route Tests", () => {
        let name = 'test'
        let username = 'testUsername';
        let email = 'test@gmail.com';
        let password = 'password';
        it("Succesfully signs up", async () => {
            let jwt = {token: "", expires: '1d'};
            let retUser = {id: "", name: name,  username: username, email: email, balance: 0, img: ""}
            sinon.stub(AuthService, 'userWithEmail').returns(false);
            sinon.stub(AuthService, 'userWithUsername').returns(false);
            sinon.stub(AuthService, 'signupUser').returns({jwt: jwt, retUser: retUser})
            let res = await chai.request(app).post("/auth/signup").send({name: name, username: username, email: email, password: password, confirmPassword: password})
            expect(res.status).to.equal(200);
            expect(res.body.user).to.eql(retUser);
            expect(res.body.expiresIn).equals(jwt.expires);
            expect(res.body.token).to.eql(jwt.token);
        })
        it("Password and Confirm Password are not equal", async () => {
            let res = await chai.request(app).post("/auth/signup").send({name: name, username: username, email: email, password: password, confirmPassword: "123"})
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Your passsword and confirm password must match")
        })
        it("Empty Password", async () => {
            let res = await chai.request(app).post("/auth/signup").send({name: name, username: username, email: email, password: "", confirmPassword: password})
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Your passsword and confirm password must match")
        })
        it("Empty Confirm Password", async () => {
            let res = await chai.request(app).post("/auth/signup").send({name: name, username: username, email: email, password: password, confirmPassword: ""})
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Your passsword and confirm password must match")
        })
        it("Both password and confirm password empty", async () => {
            let res = await chai.request(app).post("/auth/signup").send({name: name, username: username, email: email, password: "", confirmPassword: ""})
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Your passsword and confirm password must match")
        })
        it("User with email already exists", async () => {
            sinon.stub(AuthService, 'userWithEmail').returns(true);
            let res = await chai.request(app).post("/auth/signup").send({name: name, username: username, email: email, password: password, confirmPassword: password});
            expect(res.status).to.equal(403);
            expect(res.body.message).to.equal("Email is already in use. Please use another email address or sign in");
        })
        it("User with username already exists", async () => {
            sinon.stub(AuthService, 'userWithUsername').returns(true);
            let res = await chai.request(app).post("/auth/signup").send({name: name, username: username, email: email, password: password, confirmPassword: password});
            expect(res.status).to.equal(403);
            expect(res.body.message).to.equal("Username is already in use. Please select another username or sign in");
        })
        afterEach(() => {
            sinon.restore();
        })
    })
    describe("Login Route Tests", () => {
        let name = 'test';
        let username = 'testUsername';
        let email = 'test@gmail.com';
        let password = 'password';
        it("Successful login", async () => {
            let jwt = {token: "", expires: '1d'};
            let retUser = {id: "", name: name,  username: username, email: email, balance: 0, img: ""};
            sinon.stub(AuthService, 'loginUser').returns({jwt: jwt, retUser: retUser});
            let res = await chai.request(app).post("/auth/login").send({email: email, password: password});
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("Successfully logged in the user!");
            expect(res.body.user).to.eql(retUser);
            expect(res.body.expiresIn).equals(jwt.expires);
            expect(res.body.token).to.eql(jwt.token);
        })
        afterEach(() => {
            sinon.restore();
        })
    })

    describe("Change Account Tests", () => {
        it("Successfully changed account information", async () => {
            let retUser = {id: "", name: "",  username: "", email: "", balance: 0, img: ""};
            sinon.stub(AuthService, 'changeAccount').returns(retUser);
            let res = await chai.request(app).post("/auth/change-account");
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("Succesfully updated the user!");
            expect(res.body.user).to.eql(retUser);
        })
    })
    afterEach(() => {
        sinon.restore();
    })
})
