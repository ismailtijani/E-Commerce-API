import { Request, Response, NextFunction, RequestHandler } from "express";
import AppError from "../utils/errorClass";
import jwt from "jsonwebtoken";
import { responseStatusCodes } from "../utils/interfaces";
import User from "../modules/users/schema";
import RedisCache from "../config/redisCache";
import { ACCESS_TOKEN, AUTH_PREFIX } from "../constant";
import Logger from "../utils/logger";

export default class Authentication {
  static async middleware(req: Request, res: Response, next: NextFunction) {
    // Get token from headers
    const token = req.header("Authorization")?.replace("Bearer ", "");

    try {
      if (!token)
        throw new AppError({
          message: "Please Authenticate",
          statusCode: responseStatusCodes.UNAUTHORIZED,
        });
      //   Verify Token
      jwt.verify(token, JWT_SECRET, async (error, decoded) => {
        if (error)
          throw new AppError({
            message: "Invalid or expired token",
            statusCode: responseStatusCodes.UNAUTHORIZED,
          });

        const { _id } = decoded as { _id: string };
        //   Get user from database
        const user = await User.findById({ _id });

        if (!user)
          throw new AppError({
            message: "Please Authenticate",
            statusCode: responseStatusCodes.UNAUTHORIZED,
          });
        // Add user to request
        req.user = user;
        req.token = token;
        next();
      });
    } catch (error: any) {
      next(error);
    }
  }

  static async generateAuthToken(_id: string, next: NextFunction) {
    Logger.info(_id);
    Logger.info(JWT_SECRET);
    let code = "";
    try {
      jwt.sign(
        { _id },
        JWT_SECRET,
        {
          expiresIn: process.env.TOKEN_VALIDATION_DURATION,
        },
        async (error, token) => {
          Logger.info(token!);
          if (error) {
            Logger.error("JWT Error, couldn't generate token");
            throw new AppError({
              message: "An error occured, please try again",
              statusCode: responseStatusCodes.INTERNAL_SERVER_ERROR,
            });
          }

          const ttl = 7 * 24 * 60 * 60;
          const response = await RedisCache.set(ACCESS_TOKEN + _id, { token }, ttl);
          if (!response)
            throw new AppError({
              message: "An Error occured, Please try again",
              statusCode: responseStatusCodes.INTERNAL_SERVER_ERROR,
            });

          code = token as string;
        }
      );
      Logger.info(code);
      return code;
    } catch (error) {
      next(error);
    }
  }

  static generateConfirmationCode() {
    const confirmationCode = Math.floor(Math.random() * (999999 - 100000) + 100000).toString();
    return confirmationCode;
  }

  static tokenVerification: RequestHandler = async (req, res, next) => {
    const { _id } = req.params;
    const { code: authToken } = req.body;

    try {
      //Fetch and Validate 2FAuth token
      const { confirmationCode } = await RedisCache.get(AUTH_PREFIX + _id);
      if (!confirmationCode)
        throw new AppError({
          message: "Auth Code expired or does not exist",
          statusCode: responseStatusCodes.NOT_FOUND,
        });
      if (authToken !== confirmationCode)
        throw new AppError({
          message: "Invalid code",
          statusCode: responseStatusCodes.FORBIDDEN,
        });
      const response = await RedisCache.del(AUTH_PREFIX + _id);
      if (!response)
        throw new AppError({
          message: "Error logging in, Please try again",
          statusCode: responseStatusCodes.INTERNAL_SERVER_ERROR,
        });

      const user = await User.findById(_id);
      // if (!user) {
      //   throw new AppError({
      //     message: "User not found!",
      //     statusCode: responseStatusCodes.BAD_REQUEST,
      //   });
      // }
      // Generate AuthToken
      const token = await this.generateAuthToken(_id, next);

      //Add user and token to request
      req.user = user!;
      req.token = token;
      next();
    } catch (error) {
      next(error);
    }
  };
}

// Fectching JsonwebToken secret
const JWT_SECRET = process.env.JWT_SECRET as string;
