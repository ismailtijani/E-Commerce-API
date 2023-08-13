import crypto from "crypto";
import MailService from "../mailer/service";
import { AccountStatusEnum } from "../enums";
import { ACCESS_TOKEN, AUTH_PREFIX } from "../constant";
import Authentication from "../middlewares/auth";
import User from "../modules/users/schema";
import { IUser } from "../modules/users/interface";
import { RequestHandler } from "express";
import { responseHelper } from "../utils/responseHelper";
import BadRequestError from "../utils/errors/badRequest";
import redisCache from "../config/redisCache";

export default class Controller {
  static signup: RequestHandler = async (req, res, next) => {
    const { email } = req.body as { email: IUser["email"] };
    try {
      //Check if there is a registered account with the email
      const existingUser = await User.findOne({ email });

      if (existingUser && existingUser.status === AccountStatusEnum.PENDING) {
        throw new BadRequestError(
          "An Account Already Exist with this details, kindly verify your account"
        );
      } else if (existingUser && existingUser.status === AccountStatusEnum.ACTIVATED) {
        throw new BadRequestError("User alredy exist, Kindly login");
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
    } catch (error) {
      next(error);
    }
  };

  static confirmAccount: RequestHandler = async (req, res, next) => {
    const { confirmationCode } = req.params;

    try {
      const user = await User.findOne({ confirmationCode });
      if (!user) throw new BadRequestError("Invalid or Expired confirmation code");

      const updateData = { status: AccountStatusEnum.ACTIVATED, confirmationCode: null };
      await User.findOneAndUpdate({ _id: user._id }, updateData, {
        new: true,
        runValidators: true,
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
      const { token } = await redisCache.get(ACCESS_TOKEN + _id);
      if (token)
        return responseHelper.successResponse(res, "You have successfully login", { user, token });

      //Generate 2FA code
      const confirmationCode = Authentication.generateConfirmationCode();
      const codeExpiration = 10 * 60;
      //   Store code in redis
      await redisCache.set(AUTH_PREFIX + _id, { confirmationCode }, codeExpiration);
      //Send 2FAuth code to user
      MailService.send2FAAuthCode({
        name: firstName,
        token: confirmationCode,
        email,
      });

      responseHelper.successResponse(res, `Authentication Code sent to ${email} `, _id);
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
      await redisCache.del(ACCESS_TOKEN + req.user._id);
      responseHelper.successResponse(res, "You have successfully logged out of this system");
    } catch (error) {
      next(error);
    }
  };

  static forgetPassword: RequestHandler = async (req, res, next) => {
    const { email } = req.body as { email: IUser["email"] };
    // Search for user Account
    const user = await User.findOne({ email });
    if (!user) throw new BadRequestError("Sorry, we don't recognize this account");
    //Generate reset Password Token
    const resetToken = await user.generateResetPasswordToken();

    try {
      // Send reset URL to user via Mail
      MailService.sendPasswordReset({
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

      if (!user) throw new BadRequestError("Invalid or Expired Token");
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
