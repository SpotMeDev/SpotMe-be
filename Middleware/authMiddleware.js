const {Validator} = require('node-input-validator');

const signupInput = async (req, res, next) => {
  const validate = new Validator(req.body, {
    name: 'required',
    username: 'required',
    email: 'required|email',
    password: 'required',
    confirmPassword: 'required|same:password',
  });
  const matched = await validate.check();
  if (!matched) {
    return res.status(400).send({message: 'Invalid input! Please provide a proper input and try again'});
  } else {
    next();
  }
};

module.exports = {
  signupInput: signupInput,
};
