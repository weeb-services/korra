const Joi = require('joi');
const waifuInsultSchema = Joi.object().keys({
    avatar: Joi.string().required()
});
module.exports = waifuInsultSchema;
