import Joi from "joi";

const validatorSchema = {
  createProduct: Joi.object().keys({
    name: Joi.string().required().messages({
      "string.empty": "Product name cannot be an empty",
      "any.required": "Product name is required",
      "string.base": "Product name must be a string",
    }),
    price: Joi.string().required().messages({
      "string.empty": "Product price cannot be an empty",
      "any.required": "Product price is required",
      "string.base": "Price must be a string",
    }),
    description: Joi.string().required().messages({
      "string.empty": "Product description cannot be an empty",
      "any.required": "Product description is required",
      "string.base": "Description must be a string",
    }),
    imageUrl: Joi.string().required().messages({
      "string.empty": "Product image url cannot be an empty",
      "any.required": "Product image url is required",
      "string.base": "Image Url must be a string",
    }),
    category: Joi.string()
      .trim()
      .lowercase()
      .valid("food", "electronic", "clothing", "furniture", "others")
      .messages({
        "any.only":
          "Category must be one of 'Food','Electronic', 'Clothing', 'Furniture, and 'Others'",
      }),
    countInStock: Joi.string().required().messages({
      "string.empty": "Product count cannot be an empty",
      "any.required": "Product count is required",
      "string.base": "Count in stock must be a string",
    }),
  }),

  getProductByUser: Joi.object().keys({
    sortBy: Joi.string()
      .regex(/^(desc|asc)$/)
      .messages({ "string.pattern.base": "sortBy must be either 'desc' or 'asc'" }),
    limit: Joi.number().messages({ "number.base": "Limit must be a number" }),
    skip: Joi.number().messages({ "number.base": "skip must be a number" }),
  }),

  verifyParamsId: Joi.object().keys({
    _id: Joi.string().length(24).required().messages({
      "string.length": "Invalid Params Id",
      "any.required": "Params Id cannot be empty",
    }),
  }),

  search: Joi.object().keys({
    name: Joi.string().messages({
      "string.empty": "Product name cannot be an empty",
      "string.base": "Product name must be a string",
    }),
    category: Joi.string().valid("food", "electronic", "clothing", "furniture", "others").messages({
      "any.only":
        "Category must be one of 'Food','Electronic', 'Clothing', 'Furniture, and 'Others'",
    }),
  }),

  searchForTopProducts: Joi.object().keys({
    sortField: Joi.string()
      .regex(/^(rating|review)$/)
      .messages({ "string.pattern.base": "sortField can either be by 'rating' or 'review'" }),
    limit: Joi.number().messages({ "number.base": "Limit must be a number" }),
    sortOrder: Joi.string()
      .regex(/^(1|-1)$/)
      .messages({ "string.pattern.base": "sortOrder can either be by -1 or 1" }),
  }),

  update: Joi.object().keys({
    name: Joi.string().messages({
      "string.empty": "Product name cannot be an empty",
      "string.base": "Product name must be a string",
    }),
    price: Joi.string().messages({
      "string.empty": "Product price cannot be an empty",
      "string.base": "Price must be a string",
    }),
    description: Joi.string().messages({
      "string.empty": "Product description cannot be an empty",
      "string.base": "Description must be a string",
    }),
    imageUrl: Joi.string().messages({
      "string.empty": "Product image url cannot be an empty",
      "string.base": "Image Url must be a string",
    }),
    category: Joi.string().messages({
      "string.empty": "Category cannot be an empty",
      "string.base": "Category must be a string",
    }),
    countInStock: Joi.string().messages({
      "string.empty": "Product count cannot be an empty",
      "string.base": "Count in stock must be a string",
    }),
  }),
};

export default validatorSchema;
