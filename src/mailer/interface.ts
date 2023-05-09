export interface IConfirmationMail {
  name: string;
  email: string;
  confirmationCode: string;
}

export interface IForgotPassword {
  name: string;
  email: string;
  token: string;
}

export interface I2FACode {
  name: string;
  email: string;
  code: string;
}
