import AppError from "./appError";
import { statusCodes } from "../interfaces";

export default class ServerError extends AppError {
  public readonly statusCode: statusCodes;
  constructor(message: string) {
    super(message);
    this.statusCode = statusCodes.INTERNAL_SERVER_ERROR;
  }
}
