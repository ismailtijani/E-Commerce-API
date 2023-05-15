import { RequestHandler } from "express";
import RedisCache from "../config/redisCache";
import MailService from "../mailer/service";
import AppError from "../utils/errorClass";
import { IUser } from "../modules/users/interface";
import Logger from "../utils/logger";
import { responseHelper } from "../utils/responseHelper";
import User from "../modules/users/schema";
import crypto from "crypto";
import { responseStatusCodes } from "../utils/interfaces";
import { AccountStatusEnum } from "../enums";
import { AUTH_PREFIX, LOGIN_TOKEN } from "../constant";
import redisCache from "../config/redisCache";
import Authentication from "../middlewares/auth";

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
      const token = await Authentication.generateAuthToken(user);

      //Store Token in redis

      // Send Confirmation Message to new user
      const status = MailService.sendAccountActivationCode({ email, token });

      if (!status) {
        await User.deleteOne({ email });
        throw new AppError({
          message: "Mailer Service Error, kindly try again!",
          statusCode: responseStatusCodes.INTERNAL_SERVER_ERROR,
        });
      }

      responseHelper.createdResponse(res, "Account created succesfully", token);
    } catch (error: any) {
      if (error.name === "ValidationError") {
        Logger.error(error);
        return res
          .status(responseStatusCodes.BAD_REQUEST)
          .json({ name: error.name, message: error.message });
      }

      next(error);
    }
  };

  static confirmAccount: RequestHandler = async (req, res, next) => {
    const { confirmationCode } = req.params;
    try {
      if (!confirmationCode)
        throw new AppError({
          message: "Insufficient parameters",
          statusCode: responseStatusCodes.BAD_REQUEST,
        });
      //Get Token from Redis
      const user = await User.findOne({ confirmationCode });
      if (!user)
        throw new AppError({
          message: "Invalid or Expired confirmation code",
          statusCode: responseStatusCodes.BAD_REQUEST,
        });

      const updateData = { status: AccountStatusEnum.ACTIVATED, confirmationCode: null };
      const updatedData = User.findOneAndUpdate({ _id: user._id }, updateData, {
        new: true,
        runValidators: true,
      });
      if (!updatedData)
        throw new AppError({
          message: "Account Activation failed!",
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
      //Generate 2FA code
      const confirmationCode = Math.floor(Math.random() * (999999 - 100000) + 100000).toString();
      const codeExpiration = 15 * 60;
      //   Store code in redis
      const response = await RedisCache.set(
        AUTH_PREFIX + _id,
        { confirmationCode },
        codeExpiration
      );
      if (!response)
        throw new AppError({
          message: "An Error occured, Please try again",
          statusCode: responseStatusCodes.INTERNAL_SERVER_ERROR,
        });
      //Send 2FAuth code to user
      const status = MailService.send2FAAuthCode({
        name: firstName,
        token: confirmationCode,
        email,
      });
      if (!status) {
        throw new AppError({
          message: " An Error occured, kindly try again!",
          statusCode: responseStatusCodes.INTERNAL_SERVER_ERROR,
        });
      }

      responseHelper.successResponse(res, `2Factor Code sent to ${email} `, {
        confirmationCode,
        _id,
      });
    } catch (error) {
      next(error);
    }
  };

  static loginSuccess: RequestHandler = async (req, res, next) => {
    try {
      const user = req.user;
      const token = req.token;
      //Set login to redis
      await RedisCache.set(LOGIN_TOKEN + user._id, { token });
      return responseHelper.successResponse(res, "You have successfully login", { user, token });
    } catch (error) {
      next(error);
    }
  };

  static readProfile: RequestHandler = (req, res) => {
    return responseHelper.successResponse(res, undefined, req.user);
  };

  static uploadAvatar: RequestHandler = async (req, res, next) => {
    try {
    } catch (error: any) {
      next(error);
    }
  };

  static viewAvatar: RequestHandler = async (req, res, next) => {
    try {
      const user = req.user;
      if (!user.profilePhoto)
        throw new AppError({
          message: "No image uploaded, Upload now",
          statusCode: responseStatusCodes.NOT_FOUND,
        });
      res.set("Content-Type", "Image/png");
      res.status(200).send(user.profilePhoto);
    } catch (error) {
      next(error);
    }
  };

  static deleteAvatar: RequestHandler = async (req, res, next) => {
    const user = req.user;
    try {
      user.profilePhoto = undefined;
      await user.save();
      responseHelper.successResponse(res, "Image deleted successfully");
    } catch (error) {
      next(error);
    }
  };

  static updateProfile: RequestHandler = async (req, res, next) => {
    try {
      const updates = Object.keys(req.body);
      if (updates.length === 0)
        throw new AppError({
          message: "Invalid update!",
          statusCode: responseStatusCodes.BAD_REQUEST,
        });
      const allowedUpdates = ["firstName", "lastName", "email", "phoneNumber", "password"];
      const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
      if (!isValidOperation)
        throw new AppError({
          message: "Invalid update",
          statusCode: responseStatusCodes.BAD_REQUEST,
        });
      const user: any = req.user;
      updates.forEach((update) => (user[update] = req.body[update]));
      await user.save();
      responseHelper.successResponse(res, "Profile updated successfully✅");
    } catch (error) {
      next(error);
    }
  };

  static logout: RequestHandler = async (req, res, next) => {
    const user = req.user;
    // try {
    //   //Check through the user tokens to filter out the one that was used for auth on the device
    //   user.tokens = user.tokens.filter((token: any) => token.token !== req.token);
    //   await redisCache.del(LOGIN_TOKEN + user._id);
    //   await user.save();
    //   responseHelper.successResponse(res, "You've successfully logged out of this system");
    // } catch (error) {
    //   next(error);
    // }
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
    // Create reset url
    const resetURl = `${req.protocol}://${req.get("host")}/forget_password/${resetToken}`;

    try {
      // Send reset URL to user via Mail
      const status = MailService.sendPasswordReset({
        name: user.firstName,
        token: resetURl,
        email,
      });

      if (!status) {
        user.resetPasswordExpire = undefined;
        user.resetPasswordToken = undefined;
        throw new AppError({
          message: `Password reset Email to ${email} failed, Please try again later`,
          statusCode: responseStatusCodes.INTERNAL_SERVER_ERROR,
        });
      }

      return responseHelper.successResponse(res, "Email Sent ✅");
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

      return responseHelper.successResponse(res, "Password reset successfuly");
    } catch (error) {
      next(error);
    }
  };

  static deleteProfile: RequestHandler = async (req, res, next) => {
    const user = req.user;
    try {
      await user.deleteOne();
      return responseHelper.successResponse(res, "Account deactivated successfully");
    } catch (error) {
      next(error);
    }
  };
}
