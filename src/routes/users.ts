import { Router } from "express";
import auth from "../middlewares/auth";
import upload from "../middlewares/multer";
import validator from "../middlewares/validator";
import userValidatorSchema from "../modules/users/validator";
import userController from "../controllers/users";

class UserRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.registeredRoutes();
  }

  protected registeredRoutes() {
    //Every routes below will require authentication
    this.router.use(auth);
    this.router.get("/profile", userController.readProfile);
    this.router.post(
      "/profile/upload_photo",
      upload.single("image"),
      userController.updateProfilePhoto
    );
    this.router.get("/profile/view_photo/:filename", userController.viewProfilePhoto);
    this.router.get("/profile/update_photo/:filename", userController.updateProfilePhoto);
    this.router.delete("/profile/delete_photo/:filename", userController.deleteProfilePhoto);
    this.router.patch(
      "/update_profile",
      validator(userValidatorSchema.update, "body"),
      userController.updateProfile
    );
  }
}

const userRouter = new UserRoutes().router;

export default userRouter;
