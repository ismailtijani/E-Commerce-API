import { UserLevelEnum, AccountStatusEnum, GenderEnum } from "../../enums";

export interface IUser {
  name: {
    firstName: string;
    lastName: string;
  };
  email: string;
  password: string;
  phoneNumber: number;
  profilePhoto: string;
  gender: GenderEnum;
  tokens: object[];
  isAdmin: boolean;
  authLevel?: UserLevelEnum;
  status?: AccountStatusEnum;
  resetPasswordToken: string | undefined;
  resetPasswordExpire: Date | undefined;
}
