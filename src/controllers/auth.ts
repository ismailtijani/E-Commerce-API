import crypto from "crypto";
import RedisCache from "../config/redisCache";
import MailService from "../mailer/service";
import { AccountStatusEnum } from "../enums";
import { ACCESS_TOKEN, AUTH_PREFIX } from "../constant";
import Authentication from "../middlewares/auth";
import User from "../modules/users/schema";
import { IUser } from "../modules/users/interface";
import { RequestHandler } from "express";
import AppError from "../utils/errorClass";
import { responseStatusCodes } from "../utils/interfaces";
import { responseHelper } from "../utils/responseHelper";

export default class Controller {
  static signup: RequestHandler = async (req, res, next) => {
    const { email } = req.body as { email: IUser["email"] };
    try {
      //Check if there is a registered account with the email
      const existingUser = await User.findOne({ email });

      if (existingUser && existingUser.status === AccountStatusEnum.PENDING) {
        throw new AppError({
          message: "An Account Already Exist with this details, kindly verify your account",
          statusCode: responseStatusCodes.CONFLICT,
        });
      } else if (existingUser && existingUser.status === AccountStatusEnum.ACTIVATED) {
        throw new AppError({
          message: "User alredy exist, Kindly login or Rest your password",
          statusCode: responseStatusCodes.CONFLICT,
        });
      }
      //Create User account
      const user = await User.create(req.body);
      //Generate auth token
      const token = crypto.randomBytes(20).toString("hex");
      user.confirmationCode = token;
      await user.save();
      // Send Confirmation Message to new user
      MailService.sendAccountActivationCode({ email, token });

      responseHelper.createdResponse(res, "Account created successfuly!");
    } catch (error: any) {
      // if (error.name === "ValidationError") {
      //   Logger.error(error);
      //   return res
      //     .status(responseStatusCodes.BAD_REQUEST)
      //     .json({ name: error.name, message: error.message });
      // }

      next(error);
    }
  };

  static confirmAccount: RequestHandler = async (req, res, next) => {
    const { confirmationCode } = req.params;

    try {
      const user = await User.findOne({ confirmationCode });
      if (!user)
        throw new AppError({
          message: "Invalid or Expired confirmation code",
          statusCode: responseStatusCodes.BAD_REQUEST,
        });

      const updateData = { status: AccountStatusEnum.ACTIVATED, confirmationCode: null };
      const updatedData = await User.findOneAndUpdate({ _id: user._id }, updateData, {
        new: true,
        runValidators: true,
      });
      if (!updatedData)
        throw new AppError({
          message: "Account Activation failed!, Please try again",
          statusCode: responseStatusCodes.INTERNAL_SERVER_ERROR,
        });
      //Send Account confirmation Success mail
      MailService.sendAccountSuccessEmail({ email: user.email });

      responseHelper.successResponse(res, "Account Activation was successful");
    } catch (error) {
      next(error);
    }
  };

  static loginAccess: RequestHandler = async (req, res, next) => {
    const { email, password } = req.body as {
      email: IUser["email"];
      password: IUser["password"];
    };
    try {
      const user = await User.findByCredentials(email, password);
      const { _id, firstName } = user;
      // check if the last login session still lives
      const { token } = await RedisCache.get(ACCESS_TOKEN + _id);
      if (token) return responseHelper.successResponse(res, "You have successfully login", user);

      //Generate 2FA code
      const confirmationCode = Authentication.generateConfirmationCode();
      const codeExpiration = 15 * 60;
      //   Store code in redis
      await RedisCache.set(AUTH_PREFIX + _id, { confirmationCode }, codeExpiration);
      //Send 2FAuth code to user
      MailService.send2FAAuthCode({
        name: firstName,
        token: confirmationCode,
        email,
      });

      responseHelper.successResponse(res, `2Factor Code sent to ${email} `, { _id });
    } catch (error) {
      next(error);
    }
  };

  static loginSuccess: RequestHandler = async (req, res, next) => {
    try {
      const user = req.user;
      const token = req.token;
      return responseHelper.successResponse(res, "You have successfully login", { user, token });
    } catch (error) {
      next(error);
    }
  };

  static logout: RequestHandler = async (req, res, next) => {
    try {
      //Delete the user token from redis
      await RedisCache.del(ACCESS_TOKEN + req.user._id);

      responseHelper.successResponse(res, "You have successfully logged out of this system");
    } catch (error) {
      next(error);
    }
  };

  static forgetPassword: RequestHandler = async (req, res, next) => {
    const { email } = req.body as { email: IUser["email"] };
    // Search for user Account
    const user = await User.findOne({ email });
    if (!user)
      throw new AppError({
        message: "Sorry, we don't recognize this account",
        statusCode: responseStatusCodes.BAD_REQUEST,
      });
    //Generate reset Password Token
    const resetToken = await user.generateResetPasswordToken();

    try {
      // Send reset URL to user via Mail
      const status = MailService.sendPasswordReset({
        name: user.firstName,
        token: resetToken,
        email,
      });

      return responseHelper.successResponse(
        res,
        "Reset password link have been sent to your Email✅"
      );
    } catch (error) {
      next(error);
    }
  };

  static resetPassword: RequestHandler = async (req, res, next) => {
    const { token } = req.params;

    // Hash token
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    try {
      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (!user)
        throw new AppError({
          message: "Invalid or Expired Token",
          statusCode: responseStatusCodes.BAD_REQUEST,
        });
      // Set new password
      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      return responseHelper.successResponse(res, "Password reset successfuly ✅");
    } catch (error) {
      next(error);
    }
  };

  static deleteProfile: RequestHandler = async (req, res, next) => {
    try {
      await req.user.deleteOne();
      return responseHelper.successResponse(res, "Account deactivated successfully");
    } catch (error) {
      next(error);
    }
  };
}
