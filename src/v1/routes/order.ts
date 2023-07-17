import { Router } from "express";
import auth from "../../middlewares/auth";
import orderController from "../../controllers/order";
import validator from "../../middlewares/validator";
import validatorSchema from "../../modules/order/validation";
class OrderRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.registeredRoutes();
  }

  private registeredRoutes() {
    this.router.use(auth.middleware);
    this.router.post(
      "/",
      validator(validatorSchema.createOrder, "body"),
      orderController.createOrder
    );
    this.router.get(
      "/:_id",
      validator(validatorSchema.verifyParamsId, "params"),
      orderController.getOrderById
    );
    this.router.get("/customer", orderController.getOrdersByUser);
    this.router.patch(
      "/:_id",
      validator(validatorSchema.verifyParamsId, "params"),
      validator(validatorSchema.update, "body"),
      orderController.updateOrder
    );
    this.router.patch(
      "/:_id/payment",
      validator(validatorSchema.verifyParamsId, "params"),
      orderController.updateOrderAfterPayment
    );
    this.router.patch(
      "/:_id/delivery",
      validator(validatorSchema.verifyParamsId, "params"),
      orderController.updateOrderAfterDelivery
    );
    this.router.delete(
      "/:_id",
      validator(validatorSchema.verifyParamsId, "params"),
      orderController.deleteOrder
    );
  }
}

const orderRouter = new OrderRoutes().router;
export default orderRouter;
