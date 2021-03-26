const chai = require('chai'); 
const chaiHttp = require('chai-http');
const expect = chai.expect;
const sinon = require('sinon'); 
const passport = require('passport');
const AuthService = require('../../Services/AuthService.js');
const FriendService = require('../../Services/FriendService.js');
chai.use(chaiHttp);

passport.authenticate = sinon.stub( passport, 'authenticate' ).returns(( req, res, next ) => { 
    req.user = {_id: "", name: "",  username: "", email: "", balance: 0, img: ""}
    next() 
});
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
    describe("Change Password Tests", () => {
        it("Successfully Changed Password", async () => {
            const password = 'password';
            const newPassword = 'newPassword';
            sinon.stub(AuthService, 'changePassword').returns(true);
            let res = await chai.request(app).post("/auth/change-password").send({currentPassword: password, newPassword: newPassword, confirmPassword: newPassword });
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('Successfully changed password')
        });
        it("Empty Passwords", async () => {
            let res = await chai.request(app).post("/auth/change-password").send({currentPassword: "", newPassword: "", confirmPassword: "" });
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Passwords can't be empty")
        });
        it("New Password and Confirm Password don't match", async () => {
            const password = 'password';
            let res = await chai.request(app).post("/auth/change-password").send({currentPassword: password, newPassword: "newPassword", confirmPassword: "not the same" });
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("New Password and Confirm Password must match");
        });
        it("New password not different from current password", async () => {
            const password = 'password';
            let res = await chai.request(app).post("/auth/change-password").send({currentPassword: password, newPassword: password, confirmPassword: password });
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("New password must be different from the current password!");
        })
        it("Couldn't change password", async () => {
            const password = 'password';
            const newPassword = 'newPassword';
            sinon.stub(AuthService, 'changePassword').returns(false);
            let res = await chai.request(app).post("/auth/change-password").send({currentPassword: password, newPassword: newPassword, confirmPassword: newPassword });
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Couldn't change password");
        })
    })
    describe("Update Profile Picture Route", () => {
        it("Successfully update profile picture", async () => {
            const profileData64 = "testData";
            const retUser = {id: "", name: "",  username: "", email: "", balance: 0, img: ""}
            sinon.stub(AuthService, 'updateProfilePic').returns(true);
            sinon.stub(AuthService, 'returnUserDetails').returns(retUser)
            let res = await chai.request(app).post("/auth/update-profile-pic").send({profileData64: profileData64 });
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("Successfully updated profile picture");
            expect(res.body.user).to.eql(retUser)
        }); 
        it("No valid base 64 profile data", async () => {
            const profileData64 = "";
            let res = await chai.request(app).post("/auth/update-profile-pic").send({profileData64: profileData64 });
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Must include valid profile picture");
        });
        it("Unable to upload profile picture", async () => {
            const profileData64 = "testData";
            sinon.stub(AuthService, 'updateProfilePic').returns(false);
            let res = await chai.request(app).post("/auth/update-profile-pic").send({profileData64: profileData64 });
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Unable to update profile picture at this time");
        })
    });
    describe("Retrieve Profile Pic Route", () => {
        it("Successfully retrieve profile picture", async () => {
            sinon.stub(AuthService, 'retrieveProfilePic').returns("profilePic");
            const res = await chai.request(app).get("/auth/profile-pic");
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("Retrieved profile pic");
            expect(res.body.profilePic).to.equal("profilePic")
        })
    })
    describe("Search Query", () => {
        it("Successful query", async () => {
            sinon.stub(AuthService, 'searchUsers').returns([]);
            const res = await chai.request(app).get("/auth/search-query");
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("Successfully retrieved all users with the query");
            expect(res.body.users).to.eql([])
        })
    })
    describe("Is Friend", () => {
        it("Successfully determined friend status", async () => {
            sinon.stub(FriendService, 'friendStatus').returns(1);
            const res = await chai.request(app).get("/auth/is-friend");
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("Sucessfully determined friend status");
            expect(res.body.status).to.equal(1);
        });
    })
    describe("All Friends", () => {
        it("Successfully retrieve all friends", async () => {
            sinon.stub(FriendService, 'allFriends').returns([]);
            const res = await chai.request(app).get('/auth/all-friends');
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("Successfully found all the friends of the user"); 
            expect(res.body.friends).to.eql([]);
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
    });
    afterEach(() => {
        sinon.restore();
    })
})
