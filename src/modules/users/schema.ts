import { Schema, model } from "mongoose";
import { UserLevelEnum, AccountStatusEnum, GenderEnum } from "../../enums";
import { IUser } from "./interface";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: {
        firstName: String,
        lastName: String,
      },
      required: [true, "Name must be provided"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
    },
    profilePhoto: { type: String }, //Need to checkout
    gender: {
      type: String,
      enum: Object.values(GenderEnum),
      default: null,
      trim: true,
    },
    userLevel: {
      type: String,
      enum: Object.values(UserLevelEnum),
      default: UserLevelEnum.isUser,
    },
    status: {
      type: String,
      enum: Object.values(AccountStatusEnum),
      default: AccountStatusEnum.PENDING,
    },
    tokens: [
      {
        type: String,
        required: true,
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

const User = model("User", userSchema);
