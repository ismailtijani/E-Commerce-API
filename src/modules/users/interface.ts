import { HydratedDocument, Model, Document } from "mongoose";
import { UserLevelEnum, AccountStatusEnum, GenderEnum } from "../../enums";

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  profilePhoto: string | undefined;
  gender: GenderEnum;
  confirmationCode: string | null;
  accountType: UserLevelEnum;
  status: AccountStatusEnum;
  resetPasswordToken: string | undefined;
  resetPasswordExpire: Date | undefined;
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
