import AppError from "./appError";
import { statusCodes } from "../interfaces";

export default class NotFoundError extends AppError {
  public readonly statusCode: statusCodes;
  constructor(message: string) {
    super(message);
    this.statusCode = statusCodes.NOT_FOUND;
  }
}
