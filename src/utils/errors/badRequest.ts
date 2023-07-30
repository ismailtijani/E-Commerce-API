import AppError from "./appError";
import { statusCodes } from "../interfaces";

export default class BadRequestError extends AppError {
  // public name: string;
  public readonly statusCode: statusCodes;
  constructor(message: string) {
    super(message);
    this.statusCode = statusCodes.BAD_REQUEST;
    // this.name = args.name || "Error";
  }
}
