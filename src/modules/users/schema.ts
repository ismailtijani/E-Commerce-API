import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserLevelEnum, AccountStatusEnum, GenderEnum } from "../../enums";
import { IUser, IUserMethods, UserDocument, UserModel } from "./interface";
import AppError from "../../utils/errorClass";
import { responseStatusCodes } from "../../utils/interfaces";
import Logger from "../../utils/logger";
import { string } from "joi";

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    firstName: {
      type: String,
      required: [true, "First name must be provided"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name must be provided"],
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
    accountType: {
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
        token: {
          type: String,
          required: true,
        },
      },
    ],
    confirmationCode: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// User document relationship with another document (to enable populate)
userSchema.virtual("*documentName*", {
  ref: "*modelName*",
  localField: "_id",
  foreignField: "*propertyName*",
});

//Hashing User plain text password before saving
userSchema.pre<UserDocument>("save", async function (next) {
  if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 8);
  next();
});

// User Token Generation
userSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET as string);
  this.tokens = this.tokens.concat({ token });
  await this.save();
  return token;
};

// Generate and hash password token
userSchema.methods.generateResetPasswordToken = async function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and send to resetPassword token field
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Set expire
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

  await this.save();

  return resetToken;
};

//Removing sensitive datas from the user
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.profilePhoto;
  return userObject;
};

//Login User Authentication
userSchema.statics.findByCredentials = async (
  email: IUser["email"],
  password: IUser["password"]
) => {
  const user = await User.findOne({ email });
  if (!user)
    throw new AppError({
      message: "No Account with this credentials, kindly signup",
      statusCode: responseStatusCodes.NOT_FOUND,
    });
  if (user && user.status !== AccountStatusEnum.ACTIVATED)
    throw new AppError({
      message: "Account not activated, kindly check your mail for activation link",
      statusCode: responseStatusCodes.UNPROCESSABLE,
    });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    throw new AppError({
      message: "Email or Password is incorrect",
      statusCode: responseStatusCodes.BAD_REQUEST,
    });
  return user;
};

// // Deleting User's records upon Deleting User Profile
// userSchema.pre<UserDocument>("remove", async function (next) {
//   await ModelName.deleteMany({ foreignField: this._id }); //Input model name and foreign field
//   Logger.warn(
//     `All transaction records created by ${this.name} has been deleted as the user deleted thier account`
//   );
//   next();
// });
const User = model<IUser, UserModel>("User", userSchema);

export default User;
