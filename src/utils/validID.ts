import { RequestHandler } from "express";
import mongoose from "mongoose";
import BadRequestError from "./errors/badRequest";

class validObjectId {
  public validateId: RequestHandler = (req, res, next) => {
    if (mongoose.Types.ObjectId.isValid(req.params._id)) next();
    throw new BadRequestError("Invalid Params Id");
  };
}

export default new validObjectId().validateId;
