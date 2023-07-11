import { Router } from "express";
import auth from "../../middlewares/auth";
import orderController from "../../controllers/order";
class OrderRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.registeredRoutes();
  }

  private registeredRoutes() {
    this.router.use(auth.middleware);
    this.router.post("/", orderController.createOrder);
    this.router.get("/", orderController.getOrders);
    this.router.get("/", orderController.getOrdersById);
    this.router.get("/", orderController.getOrdersByUser);
    this.router.patch("/", orderController.updateOrder);
    this.router.patch("/", orderController.updateOrderAfterPayment);
    this.router.patch("/", orderController.updateOrderAfterDelivery);
    this.router.delete("/", orderController.deleteOrder);
  }
}

const orderRouter = new OrderRoutes().router;
export default orderRouter;
