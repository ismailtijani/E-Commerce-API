import Joi from "joi";

const strongPasswordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
const stringPassswordError =
  "Password must be strong. At least one upper case alphabet. At least one lower case alphabet. At least one digit. At least one special character. Minimum eight in length";

const userValidatorSchema = {
  signup: Joi.object().keys({
    firstName: Joi.string().min(3).required(),
    lastName: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required(),
    password: Joi.string().min(8).regex(strongPasswordRegex).required().messages({
      "string.min": "Must have at least 8 characters",
      "object.regex": "Must have at least 8 characters",
      "string.pattern.base": stringPassswordError,
    }),
  }),

  login: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).regex(strongPasswordRegex).required().label("Password").messages({
      "string.min": "Must have at least 8 characters",
      "object.regex": "Must have at least 8 characters",
      "string.pattern.base": stringPassswordError,
    }),
  }),

  confirmAccount: Joi.object().keys({
    confirmationCode: Joi.string().length(20).required().messages({
      "string.min": "Invalid Confirmation Code",
      "string.required": "Confirmation Code cannot be empty",
    }),
  }),

  fileAccess: Joi.object().keys({
    filename: Joi.string().required().message("Filename must be provided"),
  }),

  verifyParamsId: Joi.object().keys({
    id: Joi.string().length(24).required().messages({
      "string.length": "Invalid Params Id",
      "string.required": "Params Id cannot be empty",
    }),
  }),
  // verifyAuthToken: Joi.object().keys({
  //   code: Joi.string().length(6).required().messages({
  //     "string.length": "Invalid Params Id",
  //     "string.required": "Params Id cannot be empty",
  //   }),
  // }),
  // verifyForgotPasswordToken: Joi.object().keys({
  //   token: Joi.string().required().messages({
  //     "string.required": "Token is required",
  //   }),
  // }),

  update: Joi.object().keys({
    firstName: Joi.string().min(3),
    lastName: Joi.string().min(3),
    phoneNumber: Joi.string(),
    password: Joi.string().min(8).regex(strongPasswordRegex).messages({
      "string.min": "Must have at least 8 characters",
      "object.regex": "Must have at least 8 characters",
      "string.pattern.base": stringPassswordError,
    }),
  }),

  resetPassword: Joi.object().keys({
    password: Joi.string().min(8).regex(strongPasswordRegex).required().messages({
      "string.min": "Must have at least 8 characters",
      "object.regex": "Must have at least 8 characters",
      "string.pattern.base": stringPassswordError,
    }),

    // token: Joi.string().length(20).required().messages({
    //   "string.length": "Invalid token",
    //   "string.required": "Token is required",
    // }),
  }),

  forgetPassword: Joi.object().keys({
    email: Joi.string().email().required().message("Email must be provided"),
  }),
};

export default userValidatorSchema;
