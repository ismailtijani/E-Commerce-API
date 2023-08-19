import { Router } from "express";
import Authentication from "../../middlewares/auth";
import orderController from "../../controllers/order";
import validator from "../../middlewares/validator";
import validatorSchema from "../../modules/order/validation";
import validateId from "../../utils/validID";

class OrderRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.registeredRoutes();
  }

  private registeredRoutes() {
    this.router.use(Authentication.middleware);
    this.router.post(
      "/",
      validator(validatorSchema.createOrder, "body"),
      orderController.createOrder
    );
    this.router.get("/customer", orderController.getOrdersByUser);
    this.router.get("/:_id", validateId, orderController.getOrderById);
    this.router.patch("/:_id/payment", validateId, orderController.updateOrderAfterPayment);
    this.router.patch("/:_id/delivery", validateId, orderController.updateOrderAfterDelivery);
    this.router.patch(
      "/:_id",
      validateId,
      validator(validatorSchema.update, "body"),
      orderController.updateOrder
    );
    this.router.delete("/:_id", validateId, orderController.deleteOrder);
  }
}

const orderRouter = new OrderRoutes().router;
export default orderRouter;
