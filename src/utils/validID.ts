import { RequestHandler } from "express";
import mongoose from "mongoose";
import BadRequestError from "./errors/badRequest";

class validObjectId {
  public validateId: RequestHandler = (req, res, next) => {
    try {
      if (mongoose.Types.ObjectId.isValid(req.params._id)) {
        next();
      } else {
        throw new BadRequestError("Invalid Params Id");
      }
    } catch (error) {
      next(error);
    }
  };
}

export default new validObjectId().validateId;
