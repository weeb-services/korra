const Joi = require('joi');
const loveShipSchema = Joi.object()
    .keys({
        targetOne: Joi.string()
            .required(),
        targetTwo: Joi.string()
            .required()
    });
module.exports = loveShipSchema;
