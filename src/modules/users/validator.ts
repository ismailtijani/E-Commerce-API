import Joi from "joi";

const strongPasswordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
const stringPassswordError =
  "Password must be strong. At least one upper case alphabet. At least one lower case alphabet. At least one digit. At least one special character. Minimum eight in length";

const userValidatorSchema = {
  signup: Joi.object().keys({
    firstName: Joi.string().required().messages({
      "string.empty": "First name cannot be an empty",
      "any.required": "First name is required",
      "string.base": "First name must be a string",
    }),
    lastName: Joi.string().required().messages({
      "string.empty": "Last name cannot be empty",
      "any.required": "Last name is required",
      "string.base": "Last name must be a string",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "string.empty": "Email cannot be empty",
      "string.base": "Email must be a string",
      "any.required": "Email is required",
    }),
    phoneNumber: Joi.string()
      .pattern(/^[0-9]{11}$/) // Assuming a 11-digit phone number format
      .required()
      .messages({
        "string.base": "Phone number must be a string",
        "string.pattern.base": "Invalid phone number format",
        "string.empty": "Phone number is required",
        "any.required": "Phone number is required",
      }),
    password: Joi.string().regex(strongPasswordRegex).required().messages({
      "string.empty": "Password is required",
      "string.pattern.base": stringPassswordError,
    }),
  }),

  login: Joi.object().keys({
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "string.empty": "Email cannot be empty",
      "string.base": "Email must be a string",
      "any.required": "Email is required",
    }),
    password: Joi.string().min(8).regex(strongPasswordRegex).required().label("Password").messages({
      "string.min": "Must have at least 8 characters",
      "object.regex": "Must have at least 8 characters",
      "string.pattern.base": stringPassswordError,
    }),
  }),

  confirmAccount: Joi.object().keys({
    confirmationCode: Joi.string().required().messages({
      "string.required": "Invalid Confirmation Code",
    }),
  }),

  fileAccess: Joi.object().keys({
    filename: Joi.string().required(),
  }),

  verifyParamsId: Joi.object().keys({
    id: Joi.string().length(24).required().messages({
      "string.length": "Invalid Params Id",
      "string.required": "Params Id cannot be empty",
    }),
  }),
  verifyAuthToken: Joi.object().keys({
    code: Joi.string().length(6).required().messages({
      "string.length": "Invalid Params Id",
      "string.required": "Params Id cannot be empty",
    }),
  }),
  verifyForgotPasswordToken: Joi.object().keys({
    token: Joi.string().required().messages({
      "string.required": "Token is required",
    }),
  }),

  profilePhoto: Joi.object().keys({
    image: Joi.object().required(),
  }),

  update: Joi.object().keys({
    firstName: Joi.string().messages({
      "string.empty": "First name cannot be an empty",
      "string.base": "First name must be a string",
    }),
    lastName: Joi.string().messages({
      "string.empty": "Last name cannot be empty",
      "string.base": "Last name must be a string",
    }),
    phoneNumber: Joi.string()
      .pattern(/^[0-9]{11}$/)
      .messages({
        "string.base": "Phone number must be a string",
        "string.pattern.base": "Invalid phone number format",
        "string.empty": "Phone number is required",
      }),
    password: Joi.string().regex(strongPasswordRegex).messages({
      "string.empty": "Password is required",
      "string.pattern.base": stringPassswordError,
    }),
  }),

  resetPassword: Joi.object().keys({
    password: Joi.string().regex(strongPasswordRegex).required().messages({
      "string.empty": "Password is required",
      "string.pattern.base": stringPassswordError,
    }),
  }),

  forgetPassword: Joi.object().keys({
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "string.empty": "Email cannot be empty",
      "string.base": "Email must be a string",
      "any.required": "Email is required",
    }),
  }),
};

export default userValidatorSchema;
