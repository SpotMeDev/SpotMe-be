const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const sinon = require('sinon');
const passport = require('passport');
const TransactionService = require('../../Services/TransactionService.js');
chai.use(chaiHttp);

passport.authenticate = sinon.stub( passport, 'authenticate' ).returns(( req, res, next ) => {
  req.user = {_id: '', name: '', username: '', email: '', balance: 0, img: ''};
  next();
});
const app = require('../../index.js');

describe('Transaction Controller Tests', () => {
  const retUser = {_id: '', name: '', username: '', email: '', balance: 0, img: ''};
  const message = 'Testing transaction message';
  const amount = 10;
  describe('Send Transaction', () => {
    const recipientID = '123456';
    it('Successfully send transaction', async () => {
      const retUser = {_id: '', name: '', username: '', email: '', balance: 0, img: ''};
      sinon.stub(TransactionService, 'createTransaction').returns(retUser);
      const res = await chai.request(app).post('/transaction/send').send({recipientID: recipientID, message: message, amount: amount});
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Succesfully created transaction');
      expect(res.body.user).to.eql(retUser);
    });
    it('Error thrown in route', async () => {
      const errorMessage = 'Unable to complete transaction at this time!';
      sinon.stub(TransactionService, 'createTransaction').throws({message: errorMessage});
      const res = await chai.request(app).post('/transaction/send').send({recipientID: recipientID, message: message, amount: amount});
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal(errorMessage);
    });
  });
  describe('Add Balance', () => {
    it('Successfully add to balance', async () => {
      sinon.stub(TransactionService, 'addBalance').returns(retUser);
      const res = await chai.request(app).post('/transaction/add-balance').send({amount: amount});
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Successfully updated your balance');
    });
    it('Error thrown in route', async () => {
      const errorMessage = 'Unable to modify balance at this time';
      sinon.stub(TransactionService, 'addBalance').throws({message: errorMessage});
      const res = await chai.request(app).post('/transaction/add-balance').send({amount: amount});
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal(errorMessage);
    });
  });
  describe('User Transactions', () => {
    it('Successfully retrieve user transactions', async () => {
      sinon.stub(TransactionService, 'allUserTransactions').returns([]);
      const res = await chai.request(app).get('/transaction/user-transactions');
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Succesfully retrieved user transactions');
      expect(res.body.transactions).to.eql([]);
    });
    it('Error thrown in route', async () => {
      const errorMessage = 'Unable to retrieve transactions at this time';
      sinon.stub(TransactionService, 'allUserTransactions').throws({message: errorMessage});
      const res = await chai.request(app).get('/transaction/user-transactions');
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal(errorMessage);
    });
  });
  describe('All Transactions', () => {
    it('Successfully retrieve all relevant transactions', async () => {
      sinon.stub(TransactionService, 'allFriendsTransactions').returns([]);
      const res = await chai.request(app).get('/transaction/all-transactions');
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Successfully retrieved all transactions');
      expect(res.body.transactions).to.eql([]);
    });
    it('Error thrown in route', async () => {
      const errorMessage = 'Unable to retrieve transactions at this time';
      sinon.stub(TransactionService, 'allFriendsTransactions').throws({message: errorMessage});
      const res = await chai.request(app).get('/transaction/all-transactions');
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal(errorMessage);
    });
  });
  afterEach(() => {
    sinon.restore();
  });
});
sinon.restore();
