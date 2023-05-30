import { RequestHandler } from "express";
import AppError from "../utils/errorClass";
import { responseHelper } from "../utils/responseHelper";
import { responseStatusCodes } from "../utils/interfaces";
import S3 from "../config/aws";

export default class Controller {
  static Bucket = process.env.AMAZON_S3_PROPERTY_IMAGES_BUCKET as string;

  static readProfile: RequestHandler = (req, res) => {
    return responseHelper.successResponse(res, undefined, req.user);
  };

  static uploadProfilePhoto: RequestHandler = async (req, res, next) => {
    const user = req.user;
    try {
      if (!req.file)
        throw new AppError({
          message: " Invalid input",
          statusCode: responseStatusCodes.BAD_REQUEST,
        });
      if ("location" in req.file && "key" in req.file) {
        user.imageUrl = req.file.location as string;
        await user.save();

        return responseHelper.successResponse(res, "Image uploaded successfully", {
          location: req.file.location as string,
          key: req.file.key as string,
        });
      }
      throw new AppError({
        message: "Failed to save user profile photo",
        statusCode: responseStatusCodes.NOT_IMPLEMENTED,
      });
    } catch (error: any) {
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
      throw new AppError({
        message: "Failed to save user profile photo",
        statusCode: responseStatusCodes.NOT_IMPLEMENTED,
      });
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
      throw new AppError({
        message: "Error deleting image, please try again",
        statusCode: responseStatusCodes.NOT_IMPLEMENTED,
      });
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
      const allowedUpdates = ["firstName", "lastName", "phoneNumber", "password"];
      const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
      if (!isValidOperation)
        throw new AppError({
          message: "Invalid update",
          statusCode: responseStatusCodes.BAD_REQUEST,
        });
      const user: any = req.user;
      updates.forEach((update) => (user[update] = req.body[update]));
      await user.save();
      return responseHelper.successResponse(res, "Profile updated successfully✅");
    } catch (error) {
      next(error);
    }
  };
}
