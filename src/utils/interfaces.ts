import { UserDocument } from "../modules/users/interface";

declare global {
  namespace Express {
    interface Request {
      user: UserDocument;
      token?: string;
    }
  }
}

export type Info = string | object;

export interface AppErrorArgs {
  name?: string;
  message: string;
}

export enum statusCodes {
  SUCCESS = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  MODIFIED = 304,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE = 422,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
}
