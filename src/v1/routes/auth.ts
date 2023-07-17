import { Router } from "express";
import userValidatorSchema from "../../modules/users/validator";
import validator from "../../middlewares/validator";
import authController from "../../controllers/auth";
import Authentication from "../../middlewares/auth";

class AuthRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.registeredRoutes();
  }

  protected registeredRoutes() {
    this.router.post(
      "/signup",
      validator(userValidatorSchema.signup, "body"),
      authController.signup
    );
    this.router.get(
      "/:confirmationCode",
      validator(userValidatorSchema.confirmAccount, "params"),
      authController.confirmAccount
    );
    this.router.post(
      "/login",
      validator(userValidatorSchema.login, "body"),
      authController.loginAccess
    );
    this.router.post(
      "/login_success/:_id",
      Authentication.tokenVerification,
      authController.loginSuccess
    );
    this.router.post(
      "/forget_password",
      validator(userValidatorSchema.forgetPassword, "body"),
      authController.forgetPassword
    );
    this.router.post(
      "/reset_password/:token",
      validator(userValidatorSchema.verifyForgotPasswordToken, "params"),
      validator(userValidatorSchema.resetPassword, "body"),
      authController.resetPassword
    );
    //Every routes below will require authentication
    this.router.use(Authentication.middleware);
    this.router.post("/logout", authController.logout);
    this.router.delete("/", authController.deleteProfile);
  }
}

const AuthRouter = new AuthRoutes().router;
export default AuthRouter;
