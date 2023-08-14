import Joi from "joi";

const validatorSchema = {
  createProduct: Joi.object().keys({
    name: Joi.string().required().messages({
      "string.empty": "Product name cannot be an empty",
      "any.required": "Product name is required",
      "string.base": "Product name must be a string",
    }),
    price: Joi.number().required().messages({
      "number.empty": "Product price cannot be an empty",
      "any.required": "Product price is required",
      "number.base": "Price must be a number",
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
      .valid("food", "electronics", "clothing", "furniture", "others")
      .messages({
        "any.only":
          "Category must be one of 'Food','Electronics', 'Clothing', 'Furniture, and 'Others'",
      }),
    availableQuantity: Joi.number().required().messages({
      "number.empty": "Product count cannot be an empty",
      "any.required": "Product count is required",
      "number.base": "Count in stock must be a number",
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

  search: Joi.object()
    .keys({
      name: Joi.string().messages({
        "string.empty": "Product name cannot be an empty",
        "string.base": "Product name must be a string",
      }),
      category: Joi.string()
        .valid("food", "electronics", "clothing", "furniture", "others")
        .messages({
          "any.only":
            "Category must be one of 'Food','Electronics', 'Clothing', 'Furniture, and 'Others'",
        }),
    })
    .or("name", "category") // Ensures that either "name" or "category" must be provided
    .messages({
      "object.missing": "Either product name or category must be provided",
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
    price: Joi.number().messages({
      "number.empty": "Product price cannot be an empty",
      "number.base": "Price must be a string",
    }),
    description: Joi.string().messages({
      "string.empty": "Product description cannot be an empty",
      "string.base": "Description must be a string",
    }),
    imageUrl: Joi.string().messages({
      "string.empty": "Product image url cannot be an empty",
      "string.base": "Image Url must be a string",
    }),
    category: Joi.string()
      .valid("food", "electronics", "clothing", "furniture", "others")
      .messages({
        "string.empty": "Category cannot be an empty",
        "string.base": "Category must be a string",
        "any.only":
          "Category must be one of 'Food','Electronics', 'Clothing', 'Furniture, and 'Others'",
      }),

    availableQuantity: Joi.number().messages({
      "number.empty": "Product count cannot be an empty",
      "number.base": "Count in stock must be a string",
    }),
  }),
};

export default validatorSchema;
