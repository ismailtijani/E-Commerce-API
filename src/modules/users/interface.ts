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
