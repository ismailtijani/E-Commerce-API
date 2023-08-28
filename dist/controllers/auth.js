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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const service_1 = __importDefault(require("../mailer/service"));
const enums_1 = require("../enums");
const constant_1 = require("../constant");
const auth_1 = __importDefault(require("../middlewares/auth"));
const schema_1 = __importDefault(require("../modules/users/schema"));
const responseHelper_1 = require("../utils/responseHelper");
const badRequest_1 = __importDefault(require("../utils/errors/badRequest"));
const redisCache_1 = __importDefault(require("../config/redisCache"));
class Controller {
}
_a = Controller;
Controller.signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        //Check if there is a registered account with the email
        const existingUser = yield schema_1.default.findOne({ email });
        if (existingUser && existingUser.status === enums_1.AccountStatusEnum.PENDING) {
            throw new badRequest_1.default("An Account Already Exist with this details, kindly verify your account");
        }
        else if (existingUser && existingUser.status === enums_1.AccountStatusEnum.ACTIVATED) {
            throw new badRequest_1.default("User alredy exist, Kindly login");
        }
        //Create User account
        const user = yield schema_1.default.create(req.body);
        //Generate auth token
        const token = crypto_1.default.randomBytes(20).toString("hex");
        user.confirmationCode = token;
        yield user.save();
        // Send Confirmation Message to new user
        service_1.default.sendAccountActivationCode({ email, token });
        responseHelper_1.responseHelper.createdResponse(res, "Account created successfuly!");
    }
    catch (error) {
        next(error);
    }
});
Controller.confirmAccount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { confirmationCode } = req.params;
    try {
        const user = yield schema_1.default.findOne({ confirmationCode });
        if (!user)
            throw new badRequest_1.default("Invalid or Expired confirmation code");
        const updateData = { status: enums_1.AccountStatusEnum.ACTIVATED, confirmationCode: null };
        yield schema_1.default.findOneAndUpdate({ _id: user._id }, updateData, {
            new: true,
            runValidators: true,
        });
        //Send Account confirmation Success mail
        service_1.default.sendAccountSuccessEmail({ email: user.email });
        responseHelper_1.responseHelper.successResponse(res, "Account Activation was successful");
    }
    catch (error) {
        next(error);
    }
});
Controller.loginAccess = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield schema_1.default.findByCredentials(email, password);
        const { _id, firstName } = user;
        // check if the last login session still lives
        const { token } = yield redisCache_1.default.get(constant_1.ACCESS_TOKEN + _id);
        if (token)
            return responseHelper_1.responseHelper.successResponse(res, "You have successfully login", { user, token });
        //Generate 2FA code
        const confirmationCode = auth_1.default.generateConfirmationCode();
        const codeExpiration = 10 * 60;
        //   Store code in redis
        yield redisCache_1.default.set(constant_1.AUTH_PREFIX + _id, { confirmationCode }, codeExpiration);
        //Send 2FAuth code to user
        service_1.default.send2FAAuthCode({
            name: firstName,
            token: confirmationCode,
            email,
        });
        responseHelper_1.responseHelper.successResponse(res, `Authentication Code sent to ${email} `, _id);
    }
    catch (error) {
        next(error);
    }
});
Controller.loginSuccess = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const token = req.token;
        return responseHelper_1.responseHelper.successResponse(res, "You have successfully login", { user, token });
    }
    catch (error) {
        next(error);
    }
});
Controller.logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //Delete the user token from redis
        yield redisCache_1.default.del(constant_1.ACCESS_TOKEN + req.user._id);
        responseHelper_1.responseHelper.successResponse(res, "You have successfully logged out of this system");
    }
    catch (error) {
        next(error);
    }
});
Controller.forgetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    // Search for user Account
    const user = yield schema_1.default.findOne({ email });
    if (!user)
        throw new badRequest_1.default("Sorry, we don't recognize this account");
    //Generate reset Password Token
    const resetToken = yield user.generateResetPasswordToken();
    try {
        // Send reset URL to user via Mail
        service_1.default.sendPasswordReset({
            name: user.firstName,
            token: resetToken,
            email,
        });
        return responseHelper_1.responseHelper.successResponse(res, "Reset password link have been sent to your Email✅");
    }
    catch (error) {
        next(error);
    }
});
Controller.resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    // Hash token
    const resetPasswordToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
    try {
        const user = yield schema_1.default.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });
        if (!user)
            throw new badRequest_1.default("Invalid or Expired Token");
        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        yield user.save();
        return responseHelper_1.responseHelper.successResponse(res, "Password reset successfuly ✅");
    }
    catch (error) {
        next(error);
    }
});
Controller.deleteProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield req.user.deleteOne();
        return responseHelper_1.responseHelper.successResponse(res, "Account deactivated successfully");
    }
    catch (error) {
        next(error);
    }
});
exports.default = Controller;
