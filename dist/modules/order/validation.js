"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const validatorSchema = {
    createOrder: joi_1.default.object().keys({
        paymentMethod: joi_1.default.string()
            .regex(/^(cash|card)$/)
            .messages({ "string.pattern.base": "Payment can either be by 'card' or 'cash'" }),
        deliveryPrice: joi_1.default.number().required().messages({
            "number.empty": "Delivery Price cannot be an empty",
            "any.required": "Delivery price is required",
            "number.base": "Delivery Price must be a number",
        }),
        address: joi_1.default.string().required().messages({
            "string.empty": "Address cannot be an empty",
            "any.required": "Address is required",
            "string.base": "Address must be a string",
        }),
        city: joi_1.default.string().required().messages({
            "string.empty": "City cannot be an empty",
            "any.required": "City is required",
            "string.base": "City must be a string",
        }),
        country: joi_1.default.string().required().messages({
            "string.empty": "Country cannot be an empty",
            "any.required": "Country is required",
            "string.base": "Country must be a string",
        }),
    }),
    verifyParamsId: joi_1.default.object().keys({
        _id: joi_1.default.string().length(24).required().messages({
            "string.length": "Invalid Params Id",
            "any.required": "Params Id cannot be empty",
        }),
    }),
    update: joi_1.default.object().keys({
        paymentMethod: joi_1.default.string()
            .regex(/^(cash|card)$/)
            .messages({ "string.pattern.base": "Payment can either be by 'card' or 'cash'" }),
        address: joi_1.default.string().messages({
            "string.empty": "Address cannot be an empty",
            "string.base": "Address must be a string",
        }),
        city: joi_1.default.string().messages({
            "string.empty": "City cannot be an empty",
            "string.base": "City must be a string",
        }),
        country: joi_1.default.string().messages({
            "string.empty": "Country cannot be an empty",
            "string.base": "Country must be a string",
        }),
    }),
};
exports.default = validatorSchema;
