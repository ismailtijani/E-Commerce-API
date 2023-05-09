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
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: process.env.USER_GMAIL,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.USER_GMAIL_REFRESH_TOKEN,
  },
});

class MailService {
  private transporter: Transporter = transporter;
  private user = `${process.env.USER_NAME} <${process.env.USER_GMAIL}>`;
  private client_base_url = ClientBaseUrl;

  public async sendAccountActivationCode(params: IMailParams) {
    const html = confrimAccountTemplate(params.code, this.client_base_url);
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
            Logger.error(`Account activation Email to ${params.email} failed!!`);
            throw new Error(error.toString());
          } else return true;
        }
      );
    } catch (error: any) {
      Logger.error(`Google Authentication Failed!: ${error.name}`);
      throw new Error(error.toString());
    }
  }
  public async send2FAAuthCode(params: IMailParams) {
    const html = authCodeTemplate({ name: params.name, code: params.code });
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
            Logger.error(`2FAAuthCode Email to ${params.email} failed!!`);
            throw new Error(error.toString());
          } else return true;
        }
      );
    } catch (error: any) {
      Logger.error(`Google Authentication Failed!: ${error.name}`);
      throw new Error(error.toString());
    }
  }
  public async sendAccountSuccessEmail(params: Partial<IMailParams>) {
    const html = accountSuccessMailTemplate(this.client_base_url);
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
            Logger.error(`Account Success Email to ${params.email} failed!!`);
            throw new Error(error.toString());
          } else return true;
        }
      );
    } catch (error: any) {
      Logger.error(`Google Authentication Failed!: ${error.name}`);
      throw new Error(error.toString());
    }
  }

  public async sendPasswordReset(params: IMailParams) {
    const html = forgetPasswordTemplate(params.code, this.client_base_url, params.name);
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
            Logger.error(`Password reset Email to ${params.email} failed!!`);
            throw new Error(error.toString());
          } else return true;
        }
      );
    } catch (error: any) {
      Logger.error(`Google Authentication Failed ${error}`);
      throw new Error(error.toString());
    }
  }
}

export default MailService;
