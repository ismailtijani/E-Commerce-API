"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const validatorSchema = {
    createProduct: joi_1.default.object().keys({
        name: joi_1.default.string().required().messages({
            "string.empty": "Product name cannot be an empty",
            "any.required": "Product name is required",
            "string.base": "Product name must be a string",
        }),
        price: joi_1.default.number().required().messages({
            "number.empty": "Product price cannot be an empty",
            "any.required": "Product price is required",
            "number.base": "Price must be a number",
        }),
        description: joi_1.default.string().required().messages({
            "string.empty": "Product description cannot be an empty",
            "any.required": "Product description is required",
            "string.base": "Description must be a string",
        }),
        imageUrl: joi_1.default.string().required().messages({
            "string.empty": "Product image url cannot be an empty",
            "any.required": "Product image url is required",
            "string.base": "Image Url must be a string",
        }),
        category: joi_1.default.string()
            .trim()
            .lowercase()
            .valid("food", "electronics", "clothing", "furniture", "others")
            .messages({
            "any.only": "Category must be one of 'Food','Electronics', 'Clothing', 'Furniture, and 'Others'",
        }),
        availableQuantity: joi_1.default.number().required().messages({
            "number.empty": "Product count cannot be an empty",
            "any.required": "Product count is required",
            "number.base": "Count in stock must be a number",
        }),
    }),
    getProductByUser: joi_1.default.object().keys({
        sortBy: joi_1.default.string()
            .regex(/^(desc|asc)$/)
            .messages({ "string.pattern.base": "sortBy must be either 'desc' or 'asc'" }),
        limit: joi_1.default.number().messages({ "number.base": "Limit must be a number" }),
        skip: joi_1.default.number().messages({ "number.base": "skip must be a number" }),
    }),
    verifyParamsId: joi_1.default.object().keys({
        _id: joi_1.default.string().length(24).required().messages({
            "string.length": "Invalid Params Id",
            "any.required": "Params Id cannot be empty",
        }),
    }),
    search: joi_1.default.object()
        .keys({
        name: joi_1.default.string().messages({
            "string.empty": "Product name cannot be an empty",
            "string.base": "Product name must be a string",
        }),
        category: joi_1.default.string()
            .valid("food", "electronics", "clothing", "furniture", "others")
            .messages({
            "any.only": "Category must be one of 'Food','Electronics', 'Clothing', 'Furniture, and 'Others'",
        }),
    })
        .or("name", "category") // Ensures that either "name" or "category" must be provided
        .messages({
        "object.missing": "Either product name or category must be provided",
    }),
    searchForTopProducts: joi_1.default.object().keys({
        sortField: joi_1.default.string()
            .regex(/^(rating|review)$/)
            .messages({ "string.pattern.base": "sortField can either be by 'rating' or 'review'" }),
        limit: joi_1.default.number().messages({ "number.base": "Limit must be a number" }),
        sortOrder: joi_1.default.string()
            .regex(/^(1|-1)$/)
            .messages({ "string.pattern.base": "sortOrder can either be by -1 or 1" }),
    }),
    update: joi_1.default.object().keys({
        name: joi_1.default.string().messages({
            "string.empty": "Product name cannot be an empty",
            "string.base": "Product name must be a string",
        }),
        price: joi_1.default.number().messages({
            "number.empty": "Product price cannot be an empty",
            "number.base": "Price must be a string",
        }),
        description: joi_1.default.string().messages({
            "string.empty": "Product description cannot be an empty",
            "string.base": "Description must be a string",
        }),
        imageUrl: joi_1.default.string().messages({
            "string.empty": "Product image url cannot be an empty",
            "string.base": "Image Url must be a string",
        }),
        category: joi_1.default.string()
            .valid("food", "electronics", "clothing", "furniture", "others")
            .messages({
            "string.empty": "Category cannot be an empty",
            "string.base": "Category must be a string",
            "any.only": "Category must be one of 'Food','Electronics', 'Clothing', 'Furniture, and 'Others'",
        }),
        availableQuantity: joi_1.default.number().messages({
            "number.empty": "Product count cannot be an empty",
            "number.base": "Count in stock must be a string",
        }),
    }),
};
exports.default = validatorSchema;
