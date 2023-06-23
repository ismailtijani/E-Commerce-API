import { Response } from "express";
import { statusCodes, Info } from "./interfaces";

export class responseHelper {
  public static successResponse(res: Response, message?: string, DATA?: Info) {
    res.status(statusCodes.SUCCESS).json({
      STATUS: "SUCCESS",
      MESSAGE: message,
      DATA,
    });
  }

  public static createdResponse(res: Response, message?: string, DATA?: Info) {
    res.status(statusCodes.CREATED).json({
      STATUS: "SUCCESS",
      MESSAGE: message,
      DATA,
    });
  }
}
