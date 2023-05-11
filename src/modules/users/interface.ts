import { HydratedDocument, Model, Document } from "mongoose";
import { UserLevelEnum, AccountStatusEnum, GenderEnum } from "../../enums";

export interface IUser {
  name: {
    firstName: string;
    lastName: string;
  };
  email: string;
  password: string;
  phoneNumber: string;
  profilePhoto: string;
  gender: GenderEnum;
  tokens: object[];
  userLevel: UserLevelEnum;
  status: AccountStatusEnum;
  resetPasswordToken: string | undefined;
  resetPasswordExpire: Date | undefined;
}

export type UserDocument = IUser & Document;

export interface IUserMethods {
  generateAuthToken(): Promise<string>;
  generateResetPasswordToken(): Promise<string>;
}

export interface UserModel extends Model<IUser, object, IUserMethods> {
  findByCredentials(
    email: string,
    password: string
  ): Promise<HydratedDocument<IUser, IUserMethods>>;
}
