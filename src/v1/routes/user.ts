import { Router } from "express";
import auth from "../../middlewares/auth";
import upload from "../../middlewares/multer";
import validator from "../../middlewares/validator";
import userValidatorSchema from "../../modules/users/validator";
import userController from "../../controllers/user";

class UserRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.registeredRoutes();
  }

  protected registeredRoutes() {
    //Every routes below will require authentication
    this.router.use(auth.middleware);
    this.router.get("/", userController.readProfile);
    this.router.post(
      "/profile_photo",
      // validator(userValidatorSchema.profilePhoto, "body"),
      upload().single("upload"),
      userController.updateProfilePhoto
    );
    this.router.get("/profile_photo/:filename", userController.viewProfilePhoto);
    this.router.patch("/profile_photo/:filename", userController.updateProfilePhoto);
    this.router.delete("/profile_photo/:filename", userController.deleteProfilePhoto);
    this.router.patch(
      "/",
      validator(userValidatorSchema.update, "body"),
      userController.updateProfile
    );
  }
}

const userRouter = new UserRoutes().router;

export default userRouter;
