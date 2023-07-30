import { RequestHandler } from "express";
import { responseHelper } from "../utils/responseHelper";
import S3 from "../config/aws";
import BadRequestError from "../utils/errors/badRequest";
import ServerError from "../utils/errors/serverError";

export default class Controller {
  static Bucket = process.env.AMAZON_S3_PROPERTY_IMAGES_BUCKET as string;

  static readProfile: RequestHandler = (req, res) => {
    return responseHelper.successResponse(res, undefined, req.user);
  };

  static uploadProfilePhoto: RequestHandler = async (req, res, next) => {
    const user = req.user;
    try {
      if (!req.file) throw new BadRequestError("Invalid input");

      if ("location" in req.file && "key" in req.file) {
        user.imageUrl = req.file.location as string;
        await user.save();
        return responseHelper.successResponse(res, "Image uploaded successfully", {
          location: req.file.location as string,
          key: req.file.key as string,
        });
      }
      // Internal Server Error(Change statuscode)
      throw new BadRequestError("Failed to save user profile photo");
    } catch (error) {
      next(error);
    }
  };

  static viewProfilePhoto: RequestHandler = async (req, res, next) => {
    try {
      const response = await S3.getObject({ Bucket: this.Bucket, Key: req.params.filename });
      return responseHelper.successResponse(res, undefined, response.Body);
    } catch (error) {
      next(error);
    }
  };

  static updateProfilePhoto: RequestHandler = async (req, res, next) => {
    try {
      await S3.deleteObject({ Bucket: this.Bucket, Key: req.params.filename });
      const response = await S3.putObject({
        Bucket: this.Bucket,
        Key: req.file?.filename,
        Body: req.file?.buffer,
      });

      if ("Location" in response && "Key" in response) {
        return responseHelper.successResponse(res, "Image uploaded successfully", {
          location: response.Location,
          key: response.Key,
        });
      }
      throw new ServerError("Failed to save user profile photo");
    } catch (error) {
      next(error);
    }
  };

  static deleteProfilePhoto: RequestHandler = async (req, res, next) => {
    try {
      const response = await S3.deleteObject({ Bucket: this.Bucket, Key: req.params.filename });
      if (response.$metadata.httpStatusCode === 204) {
        req.user.imageUrl = undefined;
        await req.user.save();
        return responseHelper.successResponse(res, "Image deleted successfully");
      }
      throw new ServerError("Error deleting image, please try again");
    } catch (error) {
      next(error);
    }
  };

  static updateProfile: RequestHandler = async (req, res, next) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["firstName", "lastName", "phoneNumber", "password"];
    try {
      if (updates.length === 0) throw new BadRequestError("Invalid update!");
      const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
      if (!isValidOperation) throw new BadRequestError("Invalid update");
      const user: any = req.user;
      updates.forEach((update) => (user[update] = req.body[update]));
      await user.save();
      return responseHelper.successResponse(res, "Profile updated successfully✅");
    } catch (error) {
      next(error);
    }
  };

  static deleteAccount: RequestHandler = async (req, res, next) => {
    try {
      await req.user?.deleteOne();
      responseHelper.successResponse(res, "Account deleted successfully");
    } catch (error) {
      next(error);
    }
  };
}
