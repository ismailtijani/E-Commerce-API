"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const enums_1 = require("../../enums");
const badRequest_1 = __importDefault(require("../../utils/errors/badRequest"));
const userSchema = new mongoose_1.Schema({
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
    imageUrl: String,
    userLevel: {
        type: String,
        enum: Object.values(enums_1.UserLevelEnum),
        default: enums_1.UserLevelEnum.isUser,
    },
    status: {
        type: String,
        enum: Object.values(enums_1.AccountStatusEnum),
        default: enums_1.AccountStatusEnum.PENDING,
    },
    confirmationCode: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, { timestamps: true });
// User document relationship with other document (to enable populate)
// Virtual fields
userSchema.virtual("products", {
    ref: "Product",
    localField: "_id",
    foreignField: "seller",
});
// Cart
userSchema.virtual("carts", {
    ref: "Cart",
    localField: "_id",
    foreignField: "user",
});
// Order
userSchema.virtual("orders", {
    ref: "Order",
    localField: "_id",
    foreignField: "user",
});
//Hashing User plain text password before saving
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified("password"))
            this.password = yield bcrypt_1.default.hash(this.password, 8);
        next();
    });
});
// Generate and hash password token
userSchema.methods.generateResetPasswordToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        // Generate token
        const resetToken = crypto_1.default.randomBytes(20).toString("hex");
        // Hash token and send to resetPassword token field
        this.resetPasswordToken = crypto_1.default.createHash("sha256").update(resetToken).digest("hex");
        // Set expire
        this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
        yield this.save();
        return resetToken;
    });
};
//Removing sensitive datas from the user
userSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.confirmationCode;
    delete userObject.imageUrl;
    return userObject;
};
//Login User Authentication
userSchema.statics.findByCredentials = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User.findOne({ email });
    if (!user)
        throw new badRequest_1.default("No Account with this credentials, kindly signup");
    if (user && user.status !== enums_1.AccountStatusEnum.ACTIVATED)
        throw new badRequest_1.default("Account not activated, kindly check your mail for activation link");
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch)
        throw new badRequest_1.default("Email or Password is incorrect");
    return user;
});
// Deleting User's records upon Deleting User Profile
// userSchema.pre<UserDocument>("remove", async function (next) {
//   await Order.deleteMany({ foreignField: this._id }); //Input model name and foreign field
//   Logger.warn(
//     `All records created by ${this.name} has been deleted as the user deleted thier account`
//   );
//   next();
// });
const User = (0, mongoose_1.model)("User", userSchema);
exports.default = User;
