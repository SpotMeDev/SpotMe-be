const {Validator} = require('node-input-validator');

const validateSend = async (req, res, next) => {
  const validate = new Validator(req.body, {
    recipientID: 'required',
    message: 'required',
    amount: 'required',
  });
  const matched = await validate.check();
  if (!matched) {
    return res.status(400).send({message: 'Invalid input! Please provide a proper input and try again'});
  } else {
    next();
  }
};

const validateAddBalance = async (req, res, next) => {
  const validate = new Validator(req.body, {
    amount: 'required',
  });
  const matched = await validate.check();
  if (!matched) {
    return res.status(400).send({message: 'Invalid input! Please provide a proper input and try again'});
  } else {
    next();
  }
};

module.exports = {
  validateSend: validateSend,
  validateAddBalance: validateAddBalance,
};
