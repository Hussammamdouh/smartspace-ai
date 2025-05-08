const Joi = require('joi');

exports.validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'fail',
        message: `Invalid input data: ${error.details[0].message}`
      });
    }
    next();
  };
};

exports.validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        status: 'fail',
        message: `Invalid input data: ${error.details[0].message}`
      });
    }
    next();
  };
};
