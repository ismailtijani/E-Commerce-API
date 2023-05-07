import { Response } from "express";
import { responseStatusCodes, Info } from "./interfaces";

export class responseHelper {
  public static successResponse(res: Response, message?: string, DATA?: Info) {
    res.status(responseStatusCodes.SUCCESS).json({
      STATUS: "SUCCESS",
      MESSAGE: message,
      DATA,
    });
  }

  public static createdResponse(res: Response, message?: string, DATA?: Info) {
    res.status(responseStatusCodes.CREATED).json({
      STATUS: "SUCCESS",
      MESSAGE: message,
      DATA,
    });
  }
}
