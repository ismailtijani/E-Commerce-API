"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validator_1 = __importDefault(require("../../modules/users/validator"));
const validator_2 = __importDefault(require("../../middlewares/validator"));
const auth_1 = __importDefault(require("../../controllers/auth"));
const auth_2 = __importDefault(require("../../middlewares/auth"));
class AuthRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.registeredRoutes();
    }
    registeredRoutes() {
        this.router.post("/signup", (0, validator_2.default)(validator_1.default.signup, "body"), auth_1.default.signup);
        this.router.get("/:confirmationCode", (0, validator_2.default)(validator_1.default.confirmAccount, "params"), auth_1.default.confirmAccount);
        this.router.post("/login", (0, validator_2.default)(validator_1.default.login, "body"), auth_1.default.loginAccess);
        this.router.post("/login_success/:_id", auth_2.default.tokenVerification, auth_1.default.loginSuccess);
        this.router.post("/forget_password", (0, validator_2.default)(validator_1.default.forgetPassword, "body"), auth_1.default.forgetPassword);
        this.router.post("/reset_password/:token", (0, validator_2.default)(validator_1.default.verifyForgotPasswordToken, "params"), (0, validator_2.default)(validator_1.default.resetPassword, "body"), auth_1.default.resetPassword);
        //Every routes below will require authentication
        this.router.use(auth_2.default.middleware);
        this.router.post("/logout", auth_1.default.logout);
        this.router.delete("/", auth_1.default.deleteProfile);
    }
}
const AuthRouter = new AuthRoutes().router;
exports.default = AuthRouter;
