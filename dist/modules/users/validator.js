"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const strongPasswordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
const stringPassswordError = "Password must be strong. At least one upper case alphabet. At least one lower case alphabet. At least one digit. At least one special character. Minimum eight in length";
const userValidatorSchema = {
    signup: joi_1.default.object().keys({
        firstName: joi_1.default.string().required().messages({
            "string.empty": "First name cannot be an empty",
            "any.required": "First name is required",
            "string.base": "First name must be a string",
        }),
        lastName: joi_1.default.string().required().messages({
            "string.empty": "Last name cannot be empty",
            "any.required": "Last name is required",
            "string.base": "Last name must be a string",
        }),
        email: joi_1.default.string().email().required().messages({
            "string.email": "Invalid email format",
            "string.empty": "Email cannot be empty",
            "string.base": "Email must be a string",
            "any.required": "Email is required",
        }),
        phoneNumber: joi_1.default.string()
            .pattern(/^[0-9]{11}$/) // Assuming a 11-digit phone number format
            .required()
            .messages({
            "string.base": "Phone number must be a string",
            "string.pattern.base": "Invalid phone number format",
            "string.empty": "Phone number is required",
            "any.required": "Phone number is required",
        }),
        password: joi_1.default.string().regex(strongPasswordRegex).required().messages({
            "string.empty": "Password is required",
            "string.pattern.base": stringPassswordError,
        }),
    }),
    login: joi_1.default.object().keys({
        email: joi_1.default.string().email().required().messages({
            "string.email": "Invalid email format",
            "string.empty": "Email cannot be empty",
            "string.base": "Email must be a string",
            "any.required": "Email is required",
        }),
        password: joi_1.default.string().required(),
    }),
    confirmAccount: joi_1.default.object().keys({
        confirmationCode: joi_1.default.string().required().messages({
            "string.required": "Invalid Confirmation Code",
        }),
    }),
    fileAccess: joi_1.default.object().keys({
        filename: joi_1.default.string().required(),
    }),
    verifyParamsId: joi_1.default.object().keys({
        id: joi_1.default.string().length(24).required().messages({
            "string.length": "Invalid Params Id",
            "string.required": "Params Id cannot be empty",
        }),
    }),
    verifyAuthToken: joi_1.default.object().keys({
        code: joi_1.default.string().length(6).required().messages({
            "string.length": "Invalid Params Id",
            "string.required": "Params Id cannot be empty",
        }),
    }),
    verifyForgotPasswordToken: joi_1.default.object().keys({
        token: joi_1.default.string().required().messages({
            "string.required": "Token is required",
        }),
    }),
    profilePhoto: joi_1.default.object().keys({
        image: joi_1.default.object().required(),
    }),
    update: joi_1.default.object().keys({
        firstName: joi_1.default.string().messages({
            "string.empty": "First name cannot be an empty",
            "string.base": "First name must be a string",
        }),
        lastName: joi_1.default.string().messages({
            "string.empty": "Last name cannot be empty",
            "string.base": "Last name must be a string",
        }),
        phoneNumber: joi_1.default.string()
            .pattern(/^[0-9]{11}$/)
            .messages({
            "string.base": "Phone number must be a string",
            "string.pattern.base": "Invalid phone number format",
            "string.empty": "Phone number is required",
        }),
        password: joi_1.default.string().regex(strongPasswordRegex).messages({
            "string.empty": "Password is required",
            "string.pattern.base": stringPassswordError,
        }),
    }),
    resetPassword: joi_1.default.object().keys({
        password: joi_1.default.string().regex(strongPasswordRegex).required().messages({
            "string.empty": "Password is required",
            "string.pattern.base": stringPassswordError,
        }),
    }),
    forgetPassword: joi_1.default.object().keys({
        email: joi_1.default.string().email().required().messages({
            "string.email": "Invalid email format",
            "string.empty": "Email cannot be empty",
            "string.base": "Email must be a string",
            "any.required": "Email is required",
        }),
    }),
};
exports.default = userValidatorSchema;
