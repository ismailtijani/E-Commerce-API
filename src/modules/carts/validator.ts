import Joi from "joi";

const validatorSchema = {
  addCart: Joi.object().keys({
    productId: Joi.string().length(24).required().messages({
      "string.empty": "Product ID cannot be an empty",
      "string.length": "Invalid Id",
      "any.required": "Product ID is required",
      "string.base": "Product ID must be a string",
    }),
    quantity: Joi.string().required().messages({
      "string.empty": "Product quantity cannot be an empty",
      "any.required": "Product quantity is required",
      "string.base": "Quantity must be a string",
    }),
  }),

  verifyParamsId: Joi.object().keys({
    _id: Joi.string().length(24).required().messages({
      "string.length": "Invalid Params Id",
      "any.required": "Params Id cannot be empty",
    }),
  }),

  update: Joi.object().keys({
    quantity: Joi.string().required().messages({
      "string.empty": "Product quantity cannot be an empty",
      "any.required": "Product quantity is required",
      "string.base": "Quantity must be a string",
    }),
  }),
};

export default validatorSchema;
