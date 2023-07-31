import Joi from "joi";

const validatorSchema = {
  createOrder: Joi.object().keys({
    paymentMethod: Joi.string()
      .regex(/^(cash|card)$/)
      .messages({ "string.pattern.base": "Payment can either be by 'card' or 'cash'" }),
    deliveryPrice: Joi.number().required().messages({
      "number.empty": "Delivery Price cannot be an empty",
      "any.required": "Delivery price is required",
      "number.base": "Delivery Price must be a number",
    }),
    address: Joi.string().required().messages({
      "string.empty": "Address cannot be an empty",
      "any.required": "Address is required",
      "string.base": "Address must be a string",
    }),
    city: Joi.string().required().messages({
      "string.empty": "City cannot be an empty",
      "any.required": "City is required",
      "string.base": "City must be a string",
    }),
    country: Joi.string().required().messages({
      "string.empty": "Country cannot be an empty",
      "any.required": "Country is required",
      "string.base": "Country must be a string",
    }),
  }),

  verifyParamsId: Joi.object().keys({
    _id: Joi.string().length(24).required().messages({
      "string.length": "Invalid Params Id",
      "any.required": "Params Id cannot be empty",
    }),
  }),

  update: Joi.object().keys({
    paymentMethod: Joi.string()
      .regex(/^(cash|card)$/)
      .messages({ "string.pattern.base": "Payment can either be by 'card' or 'cash'" }),
    address: Joi.string().messages({
      "string.empty": "Address cannot be an empty",
      "string.base": "Address must be a string",
    }),
    city: Joi.string().messages({
      "string.empty": "City cannot be an empty",
      "string.base": "City must be a string",
    }),
    country: Joi.string().messages({
      "string.empty": "Country cannot be an empty",
      "string.base": "Country must be a string",
    }),
  }),
};

export default validatorSchema;
