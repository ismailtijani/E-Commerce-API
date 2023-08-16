import Joi from "joi";

const validatorSchema = {
  addCart: Joi.object().keys({
    productId: Joi.string().length(24).required().messages({
      "string.empty": "Product ID cannot be an empty",
      "string.length": "Invalid Id",
      "any.required": "Product ID is required",
      "string.base": "Product ID must be a string",
    }),
    quantity: Joi.number().min(0).required().messages({
      "number.empty": "Product quantity cannot be an empty",
      "any.required": "Product quantity is required",
      "number.base": "Quantity must be a number",
      "number.min": "Quantity must be grater than 0",
    }),
  }),

  verifyParamsId: Joi.object().keys({
    _id: Joi.string().length(24).required().messages({
      "string.length": "Invalid Params Id",
      "any.required": "Params Id cannot be empty",
    }),
  }),

  // update: Joi.object().keys({
  //   productId: Joi.string().length(24).required().messages({
  //     "string.empty": "Product ID cannot be an empty",
  //     "string.length": "Invalid Id",
  //     "any.required": "Product ID is required",
  //     "string.base": "Product ID must be a string",
  //   }),
  //   quantity: Joi.number().min(0).required().messages({
  //     "number.empty": "Product quantity cannot be an empty",
  //     "any.required": "Product quantity is required",
  //     "number.base": "Quantity must be a number",
  //     "number.min": "Quantity must be grater than 0",
  //   }),
  // }),
};

export default validatorSchema;
