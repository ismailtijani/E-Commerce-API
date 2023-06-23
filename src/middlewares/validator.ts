import { NextFunction, Request, Response } from "express";
import Logger from "../utils/logger";
import { ObjectSchema, ValidationErrorItem } from "joi";
import BadRequestError from "../utils/errors/badRequest";

function validator(schema: ObjectSchema, property: keyof Request) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
    });
    const valid = error == null;
    if (valid) {
      next();
    } else {
      const { details } = error;
      const message: string = details.map((i: ValidationErrorItem) => i.message).join(",");
      Logger.error(`${error.name}: ${error.message}`);
      throw new BadRequestError({ message });
    }
  };
}
export default validator;
