import { RequestHandler } from "express";
import mongoose from "mongoose";
import BadRequestError from "./errors/badRequest";

export default class validObjectId {
  static validateId: RequestHandler = (req, res, next) => {
    if (mongoose.Types.ObjectId.isValid(req.params._id)) next();
    throw new BadRequestError("Invalid Params Id");
  };
}
