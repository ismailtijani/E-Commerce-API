import { Request, Response, NextFunction, RequestHandler } from "express";
import User from "../modules/users/schema";
import { keyPair } from "../config/app";
import RedisCache from "../config/redisCache";
import { ACCESS_TOKEN, AUTH_PREFIX } from "../constant";
import UnAuthenticatedError from "../utils/errors/unauthenticated";
import BadRequestError from "../utils/errors/badRequest";
import { UserLevelEnum } from "../enums";
import NotFoundError from "../utils/errors/notFound";

export default class Authentication {
  static async middleware(req: Request, res: Response, next: NextFunction) {
    // Get token from headers
    const token = req.header("Authorization")?.replace("Bearer ", "");

    try {
      if (!token) throw new UnAuthenticatedError("Access denied.Please Authenticate.");
      // Split token into encryptedData and signature
      const [encryptedData, signature] = token.split(",");

      // Verify Token (Decrypt with RSA using the private key)
      const isVerified = keyPair.verifySignature(encryptedData, signature);
      if (!isVerified) throw new BadRequestError("Please Authenticate");

      const _id = keyPair.decrypt(encryptedData);
      // Get user from database
      const user = await User.findById({ _id });
      if (!user) throw new BadRequestError("Please Authenticate");
      // Add user to request
      req.user = user;
      req.token = { token, signature };
      next();
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
      if (!confirmationCode) throw new BadRequestError("Auth Code expired or does not exist");

      if (authToken !== confirmationCode) throw new BadRequestError("Invalid code");
      //Delete Confirmation code
      await RedisCache.del(AUTH_PREFIX + _id);

      // Fetch user data
      const user = await User.findById(_id);
      if (!user) throw new NotFoundError("User not found");
      // Generate AuthToken
      const token = keyPair.encrypt(_id);
      const signature = keyPair.sign(token);
      //Save token to Redis
      await RedisCache.set(ACCESS_TOKEN + _id, token, 7 * 24 * 60 * 60);
      //Add user and token to request
      req.user = user;
      req.token = { token, signature };
      next();
    } catch (error) {
      next(error);
    }
  };

  static isAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      if (
        req.user?.id === req.params.id ||
        req.user?.userLevel === UserLevelEnum.isAdmin ||
        req.user?.userLevel === UserLevelEnum.isSuperAdmin
      ) {
        next();
      } else throw new BadRequestError("You are not allowed to perform this operation!");
    } catch (error) {
      next(error);
    }
  }
  /* access_level_verifier('admin') */
  static isSuperAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user.userLevel === UserLevelEnum.isSuperAdmin) next();
      throw new BadRequestError("You are not allowed to perform this operation!");
    } catch (error) {
      next(error);
    }
  }
}
