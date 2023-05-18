import { Request, Response, NextFunction, RequestHandler } from "express";
import AppError from "../utils/errorClass";
import jwt from "jsonwebtoken";
import { IDecode, responseStatusCodes } from "../utils/interfaces";
import User from "../modules/users/schema";
import dotenv from "dotenv";
import RedisCache from "../config/redisCache";
import { ACCESS_TOKEN, AUTH_PREFIX, LOGIN_TOKEN } from "../constant";
import { responseHelper } from "../utils/responseHelper";
import { IUser, IUserMethods, UserDocument, UserModel } from "../modules/users/interface";
import { UserLevelEnum } from "../enums";
import { Types } from "mongoose";
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
      const decoded = <IDecode>jwt.verify(token, JWT_SECRET);

      // Check if the User data exist in redis
      //   Get user from database
      const user = await User.findOne({
        _id: decoded._id,
        "tokens.token": token,
      });

      if (!user)
        throw new AppError({
          message: "Please Authenticate",
          statusCode: responseStatusCodes.UNAUTHORIZED,
        });
      // Add user to request
      req.user = user;
      req.token = token;
      next();
    } catch (error: any) {
      if (error.name === "JsonWebTokenError")
        return res.status(responseStatusCodes.BAD_REQUEST).json({
          STATUS: "FAILURE",
          ERROR: "Invalid Token",
        });
      next(error);
    }
  }

  static async generateAuthToken(_id: string) {
    let code = "";
    jwt.sign(
      { _id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: process.env.TOKEN_VALIDATION_DURATION,
      },
      async (error, token) => {
        if (error) {
          Logger.error("JWT Error, couldn't generate token");
          throw new AppError({
            message: "An error occured, please try again",
            statusCode: responseStatusCodes.INTERNAL_SERVER_ERROR,
          });
        }

        const ttl = 7 * 24 * 60 * 60;
        const response = await RedisCache.set(ACCESS_TOKEN + _id, token, ttl);
        if (!response)
          throw new AppError({
            message: "An Error occured, Please try again",
            statusCode: responseStatusCodes.INTERNAL_SERVER_ERROR,
          });

        code = token as string;
      }
    );
    return code;
  }

  static generateConfirmationCode() {
    const confirmationCode = Math.floor(Math.random() * (999999 - 100000) + 100000).toString();
    return confirmationCode;
  }

  static tokenVerification: RequestHandler = async (req, res, next) => {
    const { _id } = req.params;
    const { code: confirmationCode } = req.body;

    try {
      //Fetch and Validate 2FAuth token
      const authToken = await RedisCache.get(AUTH_PREFIX + _id);
      if (!authToken)
        throw new AppError({
          message: "Auth Code expired or does not exist",
          statusCode: responseStatusCodes.NOT_FOUND,
        });
      if (authToken !== confirmationCode)
        throw new AppError({ message: "Forbidden!", statusCode: responseStatusCodes.FORBIDDEN });
      const response = await RedisCache.del(AUTH_PREFIX + _id);
      if (!response)
        throw new AppError({
          message: "Error logging in, Please try again",
          statusCode: responseStatusCodes.INTERNAL_SERVER_ERROR,
        });

      const user = await User.findById(_id);
      // Generate AuthToken
      const token = await this.generateAuthToken(_id);

      //Add user and token to request
      // req.user = user;
      req.token = token;
      next();
    } catch (error) {
      next(error);
    }
  };
}

// Fectching JsonwebToken secret
const JWT_SECRET = process.env.JWT_SECRET as string;
