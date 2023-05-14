import { Request, Response, NextFunction } from "express";
import AppError from "../utils/errorClass";
import jwt from "jsonwebtoken";
import { IDecode, responseStatusCodes } from "../utils/interfaces";
import User from "../modules/users/schema";
import dotenv from "dotenv";

dotenv.config();

class Authentication {
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
}

// Fectching JsonwebToken secret
const JWT_SECRET = process.env.JWT_SECRET as string;

export default Authentication.middleware;
