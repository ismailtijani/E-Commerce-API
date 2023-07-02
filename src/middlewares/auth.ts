import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { statusCodes } from "../utils/interfaces";
import User from "../modules/users/schema";
import RedisCache from "../config/redisCache";
import { ACCESS_TOKEN, AUTH_PREFIX } from "../constant";
import UnAuthenticatedError from "../utils/errors/unauthenticated";
import BadRequestError from "../utils/errors/badRequest";

export default class Authentication {
  static async middleware(req: Request, res: Response, next: NextFunction) {
    // Get token from headers
    const accessToken = req.header("Authorization")?.replace("Bearer ", "");

    try {
      if (!accessToken) throw new UnAuthenticatedError("Please Authenticate.");

      // Verify Token
      const { _id } = <IPayload>jwt.verify(accessToken, JWT_SECRET);

      //Check if token still lives
      const { token } = await RedisCache.get(ACCESS_TOKEN + _id);
      if (!token) throw new BadRequestError({ message: "Please Authenticate" });

      // Get user from database
      const user = await User.findById({ _id });
      // Add user to request
      if (user) req.user = user;
      req.token = accessToken;
      next();
    } catch (error: any) {
      if (error.name === "JsonWebTokenError")
        return res.status(statusCodes.BAD_REQUEST).json({
          STATUS: "FAILURE",
          ERROR: "Invalid or expired token",
        });
      next(error);
    }
  }

  static async generateAuthToken(_id: string, next: NextFunction) {
    try {
      const token = jwt.sign({ _id }, JWT_SECRET, {
        expiresIn: process.env.TOKEN_VALIDATION_DURATION,
      });
      //Time to live
      const ttl = 7 * 24 * 60 * 60;
      await RedisCache.set(ACCESS_TOKEN + _id, { token }, ttl);
      return token;
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
        throw new BadRequestError({ message: "Auth Code expired or does not exist" });

      if (authToken !== confirmationCode) throw new BadRequestError({ message: "Invalid code" });
      //Delete Confirmation code
      await RedisCache.del(AUTH_PREFIX + _id);
      // Fetch user data
      const user = await User.findById(_id);
      // Generate AuthToken
      const token = await this.generateAuthToken(_id, next);
      //Add user and token to request
      if (user) req.user = user;
      req.token = token;
      next();
    } catch (error) {
      next(error);
    }
  };
}

// Fectching JsonwebToken secret
const JWT_SECRET = process.env.JWT_SECRET as string;

interface IPayload {
  _id: string;
}
