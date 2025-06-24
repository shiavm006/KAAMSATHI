const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const toValidate = {};
  if (schema.body) toValidate.body = req.body;
  if (schema.params) toValidate.params = req.params;
  if (schema.query) toValidate.query = req.query;

  const { error } = Joi.compile(schema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(toValidate);

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details.map((d) => d.message).join(', ')
    });
  }
  next();
};

module.exports = validate; 