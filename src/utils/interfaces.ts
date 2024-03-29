import { UserDocument } from "../modules/users/interface";

export type Info = string | object;

declare global {
  namespace Express {
    interface Request {
      user: UserDocument;
      token: string;
    }
  }
}

export interface AppErrorArgs {
  name?: string;
  message: string;
}

export enum statusCodes {
  SUCCESS = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE = 422,
  INTERNAL_SERVER_ERROR = 500,
}
