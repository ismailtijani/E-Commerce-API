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
const nodemailer_1 = require("nodemailer");
require("dotenv/config");
const app_1 = require("../config/app");
const accountSuccess_1 = __importDefault(require("./templates/accountSuccess"));
const authCode_1 = __importDefault(require("./templates/authCode"));
const confirmAccount_1 = __importDefault(require("./templates/confirmAccount"));
const forgetPassword_1 = __importDefault(require("./templates/forgetPassword"));
const constant_1 = require("../constant");
const logger_1 = __importDefault(require("../utils/logger"));
const transporter = (0, nodemailer_1.createTransport)({
    service: "gmail",
    // host: "smtp.gmail.com",
    // port: 465,
    // port: 587,
    // secure: false,
    auth: {
        // type: "OAuth2",
        user: process.env.USER_GMAIL,
        pass: process.env.USER_PASSWORD,
        // clientId: process.env.GOOGLE_CLIENT_ID,
        // clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // refreshToken: process.env.USER_GMAIL_REFRESH_TOKEN,
    },
});
class MailService {
    constructor() {
        this.transporter = transporter;
        this.user = `${process.env.USER_NAME} <${process.env.USER_GMAIL}>`;
        this.client_base_url = app_1.ClientBaseUrl;
    }
    sendAccountActivationCode(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = (0, confirmAccount_1.default)(params.token, this.client_base_url);
            let success = true;
            try {
                yield this.transporter.verify();
                this.transporter.sendMail({
                    from: this.user,
                    to: params.email,
                    subject: constant_1.CONFIRM_ACCOUNT_SUBJECT,
                    html,
                }, (error) => {
                    if (error) {
                        success = false;
                        logger_1.default.error(error);
                        logger_1.default.error(`Account confirmation code Email to ${params.email} failed!!`);
                    }
                });
            }
            catch (error) {
                success = false;
                logger_1.default.error(`Mail Service Error!: ${error}`);
            }
            return success;
        });
    }
    send2FAAuthCode(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = (0, authCode_1.default)({ name: params.name, code: params.token });
            let success = true;
            try {
                yield this.transporter.verify();
                this.transporter.sendMail({
                    from: this.user,
                    to: params.email,
                    subject: constant_1.AUTH_CODE_SUBJECT,
                    html,
                }, (error) => {
                    if (error) {
                        success = false;
                        logger_1.default.error(`2FAAuthCode Email to ${params.email} failed!!`);
                    }
                });
            }
            catch (error) {
                success = false;
                logger_1.default.error(`Google Authentication Failed!: ${error}`);
            }
            return success;
        });
    }
    sendAccountSuccessEmail(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = (0, accountSuccess_1.default)(this.client_base_url);
            let success = true;
            try {
                yield this.transporter.verify();
                this.transporter.sendMail({
                    from: this.user,
                    to: params.email,
                    subject: constant_1.ACCOUNT_SUCCESS_SUBJECT,
                    html,
                }, (error) => {
                    if (error) {
                        success = false;
                        logger_1.default.error(`Account Success Email to ${params.email} failed!!`);
                    }
                });
            }
            catch (error) {
                success = false;
                logger_1.default.error(`Google Authentication Failed!: ${error}`);
            }
            return success;
        });
    }
    sendPasswordReset(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = (0, forgetPassword_1.default)(params.token, this.client_base_url, params.name);
            let success = true;
            try {
                yield this.transporter.verify();
                this.transporter.sendMail({
                    from: this.user,
                    to: params.email,
                    subject: constant_1.PASSWORD_RESET_HELP,
                    html,
                }, (error) => {
                    if (error) {
                        success = false;
                        logger_1.default.error(`Password reset Email to ${params.email} failed!!`);
                    }
                });
            }
            catch (error) {
                success = false;
                logger_1.default.error(`Google Authentication Failed ${error}`);
            }
            return success;
        });
    }
}
exports.default = new MailService();
