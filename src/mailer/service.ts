import { createTransport, Transporter } from "nodemailer";
import { I2FACode, IConfirmationMail, IForgotPassword } from "./interface";
import dotenv from "dotenv";
import { ClientBaseUrl } from "../config/app";
import accountSuccessMailTemplate from "./templates/accountSuccess";
import authCodeTemplate from "./templates/authCode";
import confrimAccountTemplate from "./templates/confirmAccount";
import forgetPasswordTemplate from "./templates/forgetPassword";
import AppError from "../utils/errorClass";
import {
  ACCOUNT_SUCCESS_SUBJECT,
  AUTH_CODE_SUBJECT,
  AUTH_PREFIX,
  CONFIRM_ACCOUNT_SUBJECT,
  RESET_PASSWORD,
  PASSWORD_RESET_HELP,
} from "./constant";
import { responseStatusCodes } from "../utils/interfaces";

dotenv.config();

const transporter: Transporter = createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: process.env.GMAIL_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_USER_REFRESH_TOKEN,
  },
});

class MailService {
  private transporter: Transporter = transporter;
  private user = `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`;
  private client_base_url = ClientBaseUrl;

  public async sendAccountActivationRequest(params: IConfirmationMail) {
    const html = confrimAccountTemplate(params.confirmationCode, this.client_base_url);
    try {
      await this.transporter.verify();
      this.transporter.sendMail(
        {
          from: this.user,
          to: params.email,
          subject: CONFIRM_ACCOUNT_SUBJECT,
          html: html,
        },
        (error) => {
          if (error)
            throw new AppError({
              message: error.toString(),
              statusCode: responseStatusCodes.INTERNAL_SERVER_ERROR,
            });
          else return true;
        }
      );
    } catch (error: any) {
      throw new AppError({
        message: error.toString(),
        statusCode: responseStatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }
  public async send2FAAuthCode(params: I2FACode) {
    const html = authCodeTemplate({ name: params.name, code: params.code });
    try {
      await this.transporter.verify();
      this.transporter.sendMail(
        {
          from: this.user,
          to: params.email,
          subject: AUTH_CODE_SUBJECT,
          html: html,
        },
        (error) => {
          if (error) throw new Error(error.toString());
          else return true;
        }
      );
    } catch (error) {
      throw new Error(error);
    }
  }
  public async sendAccountSuccessEmail(params: Partial<IConfirmationMail>) {
    const html = accountSuccessMailTemplate(this.client_base_url);
    try {
      await this.transporter.verify();
      this.transporter.sendMail(
        {
          from: this.user,
          to: params.email,
          subject: ACCOUNT_SUCCESS_SUBJECT,
          html: html,
        },
        (error) => {
          if (error) throw new Error(error.toString());
          else return true;
        }
      );
    } catch (err: any) {
      throw new Error(err.toString());
    }
  }

  public async sendPasswordReset(params: IForgotPassword) {
    const html = forgetPasswordTemplate(params.token, this.client_base_url, params.name);
    try {
      await this.transporter.verify();
      this.transporter.sendMail(
        {
          from: this.user,
          to: params.email,
          subject: PASSWORD_RESET_HELP,
          html: html,
        },
        (error) => {
          if (error) throw new Error(error.toString());
          else return true;
        }
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}

export default MailService;
