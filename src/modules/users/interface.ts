import { HydratedDocument, Model, Document } from "mongoose";
import { UserLevelEnum, AccountStatusEnum } from "../../enums";
import { IProduct } from "../products/interface";

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  imageUrl: string | undefined;
  confirmationCode: string | null;
  userLevel: UserLevelEnum;
  status: AccountStatusEnum;
  resetPasswordToken: string | undefined;
  resetPasswordExpire: Date | undefined;
  products?: IProduct[];
}

export type UserDocument = IUser & IUserMethods & Document;

export interface IUserMethods {
  generateResetPasswordToken(): Promise<string>;
}

export interface UserModel extends Model<IUser, object, IUserMethods> {
  findByCredentials(
    email: string,
    password: string
  ): Promise<HydratedDocument<IUser, IUserMethods>>;
}
