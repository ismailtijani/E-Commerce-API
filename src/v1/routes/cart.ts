import { Router } from "express";
import auth from "../../middlewares/auth";
import cartController from "../../controllers/cart";
import validator from "../../middlewares/validator";
import validatorSchema from "../../modules/carts/validator";
import validateId from "../../utils/validID";

class CartRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.registeredRoutes();
  }

  protected registeredRoutes() {
    this.router.use(auth.middleware);
    this.router.post(
      "/",
      validator(validatorSchema.addCart, "body"),
      cartController.checkIfProductExist,
      cartController.addCart
    );
    this.router.get("/", cartController.viewCart);
    // this.router.patch(
    //   "/:_id",
    //   validateId,
    //   // validator(validatorSchema.verifyParamsId, "params"),
    //   validator(validatorSchema.update, "body"),
    //   cartController.checkIfProductExist,
    //   cartController.updateCart
    // );
    this.router.delete("/:_id", validateId, cartController.deleteCart);
  }
}

const cartRouter = new CartRoutes().router;
export default cartRouter;
