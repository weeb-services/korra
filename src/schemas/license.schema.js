const Joi = require('joi');
const licenseSchema = Joi.object().keys({
    title: Joi.string().required(),
    avatar: Joi.string().required(),
    widgets: Joi.array().items(Joi.string().required().allow('')).max(3),
    badges: Joi.array().items(Joi.string().required()).max(3)
});
module.exports = {licenseSchema};
