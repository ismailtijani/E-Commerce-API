import { Response } from "express";
import Logger from "../utils/logger";
import AppError from "../utils/errors/appError";
import { statusCodes } from "../utils/interfaces";
import BadRequestError from "../utils/errors/badRequest";
import UnAuthenticatedError from "../utils/errors/unauthenticated";
import ServerError from "../utils/errors/serverError";
import NotFoundError from "../utils/errors/notFound";

export class ErrorHandler {
  private isTrustedError(error: Error | AppError) {
    if (error instanceof AppError) {
      return true;
    }
    return false;
  }

  public handleError(error: Error | AppError, res?: Response) {
    if (this.isTrustedError(error) && res) {
      this.handleTrustedError(error as AppError, res as Response);
    } else {
      this.handleCriticalError(error as Error, res as Response);
    }
  }
  private handleTrustedError = (error: AppError, res: Response) => {
    if (error instanceof BadRequestError) {
      return res.status(error.statusCode).json({
        STATUS: "FAILURE",
        MESSAGE: error.message,
      });
    } else if (error instanceof UnAuthenticatedError) {
      return res.status(error.statusCode).json({
        STATUS: "FAILURE",
        MESSAGE: error.message,
      });
    } else if (error instanceof ServerError) {
      return res.status(error.statusCode).json({
        STATUS: "FAILURE",
        MESSAGE: error.message,
      });
    } else if (error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        STATUS: "FAILURE",
        MESSAGE: error.message,
      });
    }
  };
  private handleCriticalError(error: Error, res?: Response) {
    if (res) {
      res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
        STATUS: "FAILURE",
        MESSAGE: "Internal Server Error",
      });
    }
    Logger.error(error);
    Logger.warn("Application encountered a critical error. Exiting.....");
    process.exit(1);
  }
}

export default new ErrorHandler();
