const {Validator, extend} = require('node-input-validator');
const AuthService = require('../Services/AuthService');

// checks that field is unique in database
extend('unique', async ({value, args}) => {
  const field = args[0];
  if (field === '' || !field) {
    throw new Error('Invalid use of unique rule!');
  }
  let exists;
  if (field === 'email') {
    exists = await AuthService.userWithEmail(value);
  }
  if (field === 'username') {
    exists = await AuthService.userWithUsername(value);
  }
  if (exists) {
    return false;
  }
  return true;
});

const signupInput = async (req, res, next) => {
  const validate = new Validator(req.body, {
    name: 'required',
    username: 'required|unique:username',
    email: 'required|email|unique:email',
    password: 'required',
    confirmPassword: 'required|same:password',
  });
  const matched = await validate.check();
  if (!matched) {
    const errors = validate.getErrors();
    if (errors.hasOwnProperty('email')) {
      return res.status(403).send({message: 'Email is already in use. Please use another email address or sign in'});
    }
    if (errors.hasOwnProperty('username')) {
      return res.status(403).send({message: 'Username is already in use. Please select another username or sign in'});
    }
    // check to see if unique field threw an error
    // console.log(validate.getErrors());
    return res.status(400).send({message: 'Invalid input! Please provide a proper input and try again'});
  } else {
    next();
  }
};

module.exports = {
  signupInput: signupInput,
};
