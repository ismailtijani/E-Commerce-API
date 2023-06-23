import AppError from "./appError";
import { statusCodes, AppErrorArgs } from "../interfaces";

export default class BadRequestError extends AppError {
  public name: string;
  public readonly statusCode: statusCodes;
  constructor(args: AppErrorArgs) {
    super(args.message);
    this.statusCode = statusCodes.BAD_REQUEST;
    this.name = args.name || "Error";
  }
}
