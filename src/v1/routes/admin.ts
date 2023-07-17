import { Router } from "express";
import adminController from "../../controllers/admin";
import Authentication from "../../middlewares/auth";

class adminRoute {
  public router: Router;
  constructor() {
    (this.router = Router()), this.registeredRoutes();
  }
  private registeredRoutes() {
    this.router.use(Authentication.isSuperAdmin);
    this.router.get("/summary", adminController.summary);
    this.router.get("/orders", adminController.getOrders);
    this.router.get("/products", adminController.getAllProducts);
  }
}

const adminRouter = new adminRoute().router;
export default adminRouter;
