import { Router } from "express";
import Paystack from "../../controllers/paystack";
import Authentication from "../../middlewares/auth";

class PaymentRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.registeredRoutes();
  }
  private registeredRoutes() {
    this.router.post("/recievedPayment", Paystack.paymentStatus);
    this.router.use(Authentication.middleware);
    this.router.post("/initializedPayment/:orderId", Paystack.payment);
  }
}

const paymentRouter = new PaymentRoutes().router;
export default paymentRouter;
