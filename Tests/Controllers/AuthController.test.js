const chai = require('chai'); 
const chaiHttp = require('chai-http');
const expect = chai.expect;
const sinon = require('sinon'); 
const passport = require('passport');
const AuthService = require('../../Services/AuthService.js');
const FriendService = require('../../Services/FriendService.js');
chai.use(chaiHttp);

passport.authenticate = sinon.stub( passport, 'authenticate' ).returns(( req, res, next ) => { 
    req.user = {_id: "", name: "",  username: "", email: "", balance: 0, img: ""};
    next();
});
const app = require('../../index.js');
describe("Auth Controllers Tests", () => { 
    describe("Signup Route Tests", () => {
        const name = 'test';
        const username = 'testUsername';
        const email = 'test@gmail.com';
        const password = 'password';
        it("Succesfully signs up", async () => {
            const jwt = {token: "", expires: '1d'};
            const retUser = {id: "", name: name,  username: username, email: email, balance: 0, img: ""};
            sinon.stub(AuthService, 'userWithEmail').returns(false);
            sinon.stub(AuthService, 'userWithUsername').returns(false);
            sinon.stub(AuthService, 'signupUser').returns({jwt: jwt, retUser: retUser});
            const res = await chai.request(app).post("/auth/signup").send({name: name, username: username, email: email, password: password, confirmPassword: password});
            expect(res.status).to.equal(200);
            expect(res.body.user).to.eql(retUser);
            expect(res.body.expiresIn).equals(jwt.expires);
            expect(res.body.token).to.eql(jwt.token);
        });
        it("Password and Confirm Password are not equal", async () => {
            const res = await chai.request(app).post("/auth/signup").send({name: name, username: username, email: email, password: password, confirmPassword: "123"});
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Your passsword and confirm password must match");
        });
        it("Empty Password", async () => {
            const res = await chai.request(app).post("/auth/signup").send({name: name, username: username, email: email, password: "", confirmPassword: password});
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Your passsword and confirm password must match");
        });
        it("Empty Confirm Password", async () => {
            const res = await chai.request(app).post("/auth/signup").send({name: name, username: username, email: email, password: password, confirmPassword: ""});
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Your passsword and confirm password must match");
        });
        it("Both password and confirm password empty", async () => {
            const res = await chai.request(app).post("/auth/signup").send({name: name, username: username, email: email, password: "", confirmPassword: ""});
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Your passsword and confirm password must match");
        });
        it("User with email already exists", async () => {
            sinon.stub(AuthService, 'userWithEmail').returns(true);
            const res = await chai.request(app).post("/auth/signup").send({name: name, username: username, email: email, password: password, confirmPassword: password});
            expect(res.status).to.equal(403);
            expect(res.body.message).to.equal("Email is already in use. Please use another email address or sign in");
        });
        it("User with username already exists", async () => {
            sinon.stub(AuthService, 'userWithUsername').returns(true);
            const res = await chai.request(app).post("/auth/signup").send({name: name, username: username, email: email, password: password, confirmPassword: password});
            expect(res.status).to.equal(403);
            expect(res.body.message).to.equal("Username is already in use. Please select another username or sign in");
        });
        it("Error thrown", async () => {
            sinon.stub(AuthService, 'userWithEmail').throws({message: "Failed to signup"});
            const res = await chai.request(app).post("/auth/signup").send({name: name, username: username, email: email, password: password, confirmPassword: password});
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Failed to signup");
        });
    });
    describe("Login Route Tests", () => {
        const name = 'test';
        const username = 'testUsername';
        const email = 'test@gmail.com';
        const password = 'password';
        it("Successful login", async () => {
            const jwt = {token: "", expires: '1d'};
            const retUser = {id: "", name: name,  username: username, email: email, balance: 0, img: ""};
            sinon.stub(AuthService, 'loginUser').returns({jwt: jwt, retUser: retUser});
            const res = await chai.request(app).post("/auth/login").send({email: email, password: password});
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("Successfully logged in the user!");
            expect(res.body.user).to.eql(retUser);
            expect(res.body.expiresIn).equals(jwt.expires);
            expect(res.body.token).to.eql(jwt.token);
        });
        it("Error thrown", async () => {
            sinon.stub(AuthService, 'loginUser').throws({message: "Failed to login"});
            const res = await chai.request(app).post("/auth/login").send({email: email, password: password});
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Failed to login");
        });
    });

    describe("Change Account Tests", () => {
        it("Successfully changed account information", async () => {
            const retUser = {id: "", name: "",  username: "", email: "", balance: 0, img: ""};
            sinon.stub(AuthService, 'changeAccount').returns(retUser);
            const res = await chai.request(app).post("/auth/change-account");
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("Succesfully updated the user!");
            expect(res.body.user).to.eql(retUser);
        });
        it("Error thrown", async () => {
            sinon.stub(AuthService, 'changeAccount').throws({message: "Failed to change account information"});
            const res = await chai.request(app).post("/auth/change-account");
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Failed to change account information");
        });
    });
    describe("Change Password Tests", () => {
        const password = 'password';
        const newPassword = 'newPassword';
        it("Successfully Changed Password", async () => {
            sinon.stub(AuthService, 'changePassword').returns(true);
            const res = await chai.request(app).post("/auth/change-password").send({currentPassword: password, newPassword: newPassword, confirmPassword: newPassword });
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('Successfully changed password');
        });
        it("Empty Passwords", async () => {
            const res = await chai.request(app).post("/auth/change-password").send({currentPassword: "", newPassword: "", confirmPassword: "" });
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Passwords can't be empty");
        });
        it("New Password and Confirm Password don't match", async () => {
            const res = await chai.request(app).post("/auth/change-password").send({currentPassword: password, newPassword: newPassword, confirmPassword: "not the same" });
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("New Password and Confirm Password must match");
        });
        it("New password not different from current password", async () => {
            const res = await chai.request(app).post("/auth/change-password").send({currentPassword: password, newPassword: password, confirmPassword: password });
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("New password must be different from the current password!");
        });
        it("Couldn't change password", async () => {
            sinon.stub(AuthService, 'changePassword').returns(false);
            const res = await chai.request(app).post("/auth/change-password").send({currentPassword: password, newPassword: newPassword, confirmPassword: newPassword });
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Couldn't change password");
        });
        it("Error thrown", async () => {
            sinon.stub(AuthService, 'changePassword').throws({message: "Failed to change password"});
            const res = await chai.request(app).post("/auth/change-password").send({currentPassword: password, newPassword: newPassword, confirmPassword: newPassword});
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Failed to change password");
        });
    });
    describe("Update Profile Picture Route", () => {
        const profileData64 = "testData";
        it("Successfully update profile picture", async () => {
            const retUser = {id: "", name: "",  username: "", email: "", balance: 0, img: ""};
            sinon.stub(AuthService, 'updateProfilePic').returns(true);
            sinon.stub(AuthService, 'returnUserDetails').returns(retUser);
            const res = await chai.request(app).post("/auth/update-profile-pic").send({profileData64: profileData64 });
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("Successfully updated profile picture");
            expect(res.body.user).to.eql(retUser);
        }); 
        it("No valid base 64 profile data", async () => {
            const res = await chai.request(app).post("/auth/update-profile-pic").send({profileData64: '' });
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Must include valid profile picture");
        });
        it("Unable to upload profile picture", async () => {
            sinon.stub(AuthService, 'updateProfilePic').returns(false);
            const res = await chai.request(app).post("/auth/update-profile-pic").send({profileData64: profileData64 });
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Unable to update profile picture at this time");
        });
        it("Error thrown", async () => {
            sinon.stub(AuthService, 'updateProfilePic').throws({message: "Failed to update profile picture"});
            const res = await chai.request(app).post("/auth/update-profile-pic").send({profileData64: profileData64 });
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Failed to update profile picture");
        });
    });
    describe("Retrieve Profile Pic Route", () => {
        it("Successfully retrieve profile picture", async () => {
            sinon.stub(AuthService, 'retrieveProfilePic').returns("profilePic");
            const res = await chai.request(app).get("/auth/profile-pic");
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("Retrieved profile pic");
            expect(res.body.profilePic).to.equal("profilePic");
        });
        it("Error thrown", async () => {
            sinon.stub(AuthService, 'retrieveProfilePic').throws({message: "Failed to retrieve profile picture"});
            const res = await chai.request(app).get("/auth/profile-pic");
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Failed to retrieve profile picture");
        });
    });
    describe("Search Query", () => {
        it("Successful query", async () => {
            sinon.stub(AuthService, 'searchUsers').returns([]);
            const res = await chai.request(app).get("/auth/search-query");
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("Successfully retrieved all users with the query");
            expect(res.body.users).to.eql([]);
        });
        it("Error thrown", async () => {
            sinon.stub(AuthService, 'searchUsers').throws({message: "Failed to retrieve all users with the query"});
            const res = await chai.request(app).get("/auth/search-query");
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Failed to retrieve all users with the query");
        });
    });
    describe("Is Friend", () => {
        it("Successfully determined friend status", async () => {
            sinon.stub(FriendService, 'friendStatus').returns(1);
            const res = await chai.request(app).get("/auth/is-friend");
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("Sucessfully determined friend status");
            expect(res.body.status).to.equal(1);
        });
        it("Error thrown", async () => {
            sinon.stub(FriendService, 'friendStatus').throws({message: "Failed to determine friend status"});
            const res = await chai.request(app).get("/auth/is-friend");
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Failed to determine friend status");
        });
    });
    describe("All Friends", () => {
        it("Successfully retrieve all friends", async () => {
            sinon.stub(FriendService, 'allFriends').returns([]);
            const res = await chai.request(app).get('/auth/all-friends');
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("Successfully found all the friends of the user"); 
            expect(res.body.friends).to.eql([]);
        });
        it("Error thrown", async () => {
            sinon.stub(FriendService, 'allFriends').throws({message: "Failed to retrieve all friends"});
            const res = await chai.request(app).get("/auth/all-friends");
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Failed to retrieve all friends");
        });
    });
    describe("Add Friend", () => {
        it("Successfully added friend", async () => {
            const retUser = {_id: "", name: "",  username: "", email: "", balance: 0, img: ""};
            sinon.stub(FriendService, 'addFriend').returns(retUser);
            const res = await chai.request(app).post('/auth/add-friend');
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("Successfully sent friend request!");
            expect(res.body.user).to.eql(retUser);
        });
        it("Error thrown", async () => {
            sinon.stub(FriendService, 'addFriend').throws({message: "Failed to add friend"});
            const res = await chai.request(app).post("/auth/add-friend");
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Failed to add friend");
        });
    });
    describe("Handle Friend Request", () => {
        it("Successfully handle friend request", async () => {
            const retUser = {_id: "", name: "",  username: "", email: "", balance: 0, img: ""};
            sinon.stub(FriendService, 'handleFriendRequest').returns(retUser);
            const res = await chai.request(app).post('/auth/handle-friend-request');
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("Successfully handled friend request");
            expect(res.body.user).to.eql(retUser);
        });
        it("Error thrown", async () => {
            sinon.stub(FriendService, 'handleFriendRequest').throws({message: "Failed to handle friend request"});
            const res = await chai.request(app).post("/auth/handle-friend-request");
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Failed to handle friend request");
        });
    });
    afterEach(() => {
        sinon.restore();
    });
});
