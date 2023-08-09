import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import forge from "node-forge";
import User from "../modules/users/schema";
import RedisCache from "../config/redisCache";
import { ACCESS_TOKEN, AUTH_PREFIX, AUTH_KEYS } from "../constant";
import UnAuthenticatedError from "../utils/errors/unauthenticated";
import BadRequestError from "../utils/errors/badRequest";
import { UserLevelEnum } from "../enums";
import { statusCodes } from "../utils/interfaces";
import Logger from "../utils/logger";

export default class Authentication {
  static async middleware(req: Request, res: Response, next: NextFunction) {
    // Get token from headers
    const accessToken = req.header("Authorization")?.replace("Bearer ", "");

    try {
      if (!accessToken) throw new UnAuthenticatedError("Access denied.Please Authenticate.");

      //Retrieve keys from database
      const { privateKey } = await RedisCache.get(AUTH_KEYS);
      // Verify Token (Decrypt with RSA using the private key)
      const decryptor = forge.pki.privateKeyFromPem(privateKey);
      const _id = decryptor.decrypt(accessToken, "RSAES-PKCS1-V1_5");

      // Get user from database
      const user = await User.findById({ _id });
      if (!user) throw new BadRequestError("Please Authenticate");
      // Add user to request
      req.user = user;
      req.token = accessToken;
      next();
    } catch (error: any) {
      if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError")
        return res.status(statusCodes.BAD_REQUEST).json({
          STATUS: "FAILURE",
          ERROR: "Invalid or expired token",
        });
      next(error);
    }
  }

  static async generateKeyPair(_id: string, next: NextFunction) {
    try {
      // Generate a 2048-bit RSA key pair
      const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });

      // Convert the keys to PEM format (string)
      const privateKey: string = forge.pki.privateKeyToPem(keyPair.privateKey);
      const publicKey: string = forge.pki.publicKeyToPem(keyPair.publicKey);
      //Store the keys in Redis
      await RedisCache.set(AUTH_KEYS, { privateKey, publicKey });
      // Encrypt with RSA using the public key
      // const encryptor = forge.pki.publicKeyFromPem(publicKey);
      // const algorithm = process.env.ALGORITHM;
      // const encryptedData = encryptor.encrypt(_id, "RSAES-PKCS1-V1_5", publicKey);

      return { privateKey, publicKey };
      // const token = jwt.sign({ _id }, JWT_SECRET, {
      //   algorithm: "HS256",
      //   expiresIn: process.env.TOKEN_VALIDATION_DURATION,
      // });
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
      // Generate AuthToken
      // const token = await this.generateAuthToken(_id, next);
      //Add user and token to request
      if (user) req.user = user;
      // req.token = token;
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

// Fectching JsonwebToken secret
// const JWT_SECRET = process.env.JWT_SECRET as string;

// interface IPayload {
//   _id: string;
// }
