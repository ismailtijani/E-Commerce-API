import { createTransport, Transporter } from "nodemailer";
import { IMailParams } from "./interface";
import dotenv from "dotenv";
import { ClientBaseUrl } from "../config/app";
import accountSuccessMailTemplate from "./templates/accountSuccess";
import authCodeTemplate from "./templates/authCode";
import confrimAccountTemplate from "./templates/confirmAccount";
import forgetPasswordTemplate from "./templates/forgetPassword";
import {
  ACCOUNT_SUCCESS_SUBJECT,
  AUTH_CODE_SUBJECT,
  CONFIRM_ACCOUNT_SUBJECT,
  PASSWORD_RESET_HELP,
} from "../constant";
import Logger from "../utils/logger";

dotenv.config();

const transporter: Transporter = createTransport({
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
  private transporter: Transporter = transporter;
  private user = `${process.env.USER_NAME} <${process.env.USER_GMAIL}>`;
  private client_base_url = ClientBaseUrl;

  public async sendAccountActivationCode(params: IMailParams) {
    const html = confrimAccountTemplate(params.token, this.client_base_url);
    let success = true;
    try {
      await this.transporter.verify();
      this.transporter.sendMail(
        {
          from: this.user,
          to: params.email,
          subject: CONFIRM_ACCOUNT_SUBJECT,
          html,
        },
        (error) => {
          if (error) {
            success = false;
            Logger.error(error);
            Logger.error(`Account confirmation code Email to ${params.email} failed!!`);
          }
        }
      );
    } catch (error: any) {
      success = false;
      Logger.error(`Mail Service Error!`);
      Logger.error(error);
    }
    return success;
  }

  public async send2FAAuthCode(params: IMailParams) {
    const html = authCodeTemplate({ name: params.name as string, code: params.token as string });
    let success = true;
    try {
      await this.transporter.verify();
      this.transporter.sendMail(
        {
          from: this.user,
          to: params.email,
          subject: AUTH_CODE_SUBJECT,
          html,
        },
        (error) => {
          if (error) {
            success = false;
            Logger.error(`2FAAuthCode Email to ${params.email} failed!!`);
          }
        }
      );
    } catch (error: any) {
      success = false;
      Logger.error(`Google Authentication Failed!: ${error.name}`);
    }
    return success;
  }

  public async sendAccountSuccessEmail(params: Partial<IMailParams>) {
    const html = accountSuccessMailTemplate(this.client_base_url);
    let success = true;
    try {
      await this.transporter.verify();
      this.transporter.sendMail(
        {
          from: this.user,
          to: params.email,
          subject: ACCOUNT_SUCCESS_SUBJECT,
          html,
        },
        (error) => {
          if (error) {
            success = false;
            Logger.error(`Account Success Email to ${params.email} failed!!`);
          }
        }
      );
    } catch (error: any) {
      success = false;
      Logger.error(`Google Authentication Failed!: ${error.name}`);
    }
    return success;
  }

  public async sendPasswordReset(params: IMailParams) {
    const html = forgetPasswordTemplate(params.token, this.client_base_url, params.name as string);
    let success = true;
    try {
      await this.transporter.verify();
      this.transporter.sendMail(
        {
          from: this.user,
          to: params.email,
          subject: PASSWORD_RESET_HELP,
          html,
        },
        (error) => {
          if (error) {
            success = false;
            Logger.error(`Password reset Email to ${params.email} failed!!`);
          }
        }
      );
    } catch (error: any) {
      success = false;
      Logger.error(`Google Authentication Failed ${error}`);
    }
    return success;
  }
}

export default new MailService();
