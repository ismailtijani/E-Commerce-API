"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const validatorSchema = {
    addCart: joi_1.default.object().keys({
        productId: joi_1.default.string().length(24).required().messages({
            "string.empty": "Product ID cannot be an empty",
            "string.length": "Invalid Id",
            "any.required": "Product ID is required",
            "string.base": "Product ID must be a string",
        }),
        quantity: joi_1.default.number().min(0).required().messages({
            "number.empty": "Product quantity cannot be an empty",
            "any.required": "Product quantity is required",
            "number.base": "Quantity must be a number",
            "number.min": "Quantity must be grater than 0",
        }),
    }),
    verifyParamsId: joi_1.default.object().keys({
        _id: joi_1.default.string().length(24).required().messages({
            "string.length": "Invalid Params Id",
            "any.required": "Params Id cannot be empty",
        }),
    }),
};
exports.default = validatorSchema;
