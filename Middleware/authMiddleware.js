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

extend('different', async ({value, args}, validator) => {
  const field = args[0];
  if (field === '' || !field) {
    throw new Error('Invalid use of different rule!');
  }
  const otherValue = validator.inputs[args[0]];
  if (value === otherValue) {
    return false;
  }
  return true;
});

const validateSignup = async (req, res, next) => {
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

const validateLogin = async (req, res, next) => {
  const validate = new Validator(req.body, {
    email: 'required|email',
    password: 'required',
  });
  const matched = await validate.check();
  if (!matched) {
    return res.status(400).send({message: 'Invalid input! Please provide a proper input and try again'});
  } else {
    next();
  }
};

const validateChangeAccount = async (req, res, next) => {
  const validate = new Validator(req.body, {
    updateType: 'required',
    updatedField: 'required',
  });
  const matched = await validate.check();
  if (!matched) {
    return res.status(400).send({message: 'Invalid input! Please provide a proper input and try again'});
  } else {
    next();
  }
};

const validateChangePassword = async (req, res, next) => {
  const validate = new Validator(req.body, {
    currentPassword: 'required',
    newPassword: 'required|different:currentPassword',
    confirmPassword: 'required|same:newPassword',
  });
  const matched = await validate.check();
  if (!matched) {
    return res.status(400).send({message: 'Invalid input! Please provide a proper input and try again'});
  } else {
    next();
  }
};

const validateUpdateProfilePicture = async (req, res, next) => {
  const validate = new Validator(req.body, {
    profileData64: 'required',
  });
  const matched = await validate.check();
  if (!matched) {
    return res.status(400).send({message: 'Invalid input! Please provide a proper input and try again'});
  } else {
    next();
  }
};

const validateSearchQuery = async (req, res, next) => {
  const validate = new Validator(req.query, {
    query: 'required',
  });
  const matched = await validate.check();
  if (!matched) {
    return res.status(400).send({message: 'Invalid input! Please provide a proper input and try again'});
  } else {
    next();
  }
};

const validateIsFriend = async (req, res, next) => {
  const validate = new Validator(req.query, {
    rID: 'required',
  });
  const matched = await validate.check();
  if (!matched) {
    return res.status(400).send({message: 'Invalid input! Please provide a proper input and try again'});
  } else {
    next();
  }
};

const validateAllFriends = async (req, res, next) => {
  const validate = new Validator(req.query, {
    id: 'required',
  });
  const matched = await validate.check();
  if (!matched) {
    return res.status(400).send({message: 'Invalid input! Please provide a proper input and try again'});
  } else {
    next();
  }
};

const validateAddFriend = async (req, res, next) => {
  const validate = new Validator(req.body, {
    recipientID: 'required',
  });
  const matched = await validate.check();
  if (!matched) {
    return res.status(400).send({message: 'Invalid input! Please provide a proper input and try again'});
  } else {
    next();
  }
};

const validateHandleFriendRequest = async (req, res, next) => {
  const validate = new Validator(req.body, {
    recipientID: 'required',
    acceptedRequest: 'required',
  });
  const matched = await validate.check();
  if (!matched) {
    return res.status(400).send({message: 'Invalid input! Please provide a proper input and try again'});
  } else {
    next();
  }
};

module.exports = {
  validateSignup: validateSignup,
  validateLogin: validateLogin,
  validateChangeAccount: validateChangeAccount,
  validateChangePassword: validateChangePassword,
  validateUpdateProfilePicture: validateUpdateProfilePicture,
  validateSearchQuery: validateSearchQuery,
  validateIsFriend: validateIsFriend,
  validateAllFriends: validateAllFriends,
  validateAddFriend: validateAddFriend,
  validateHandleFriendRequest: validateHandleFriendRequest,
};
