import { Router } from "express";
import adminController from "../../controllers/admin";

class adminRoute {
  public router: Router;
  constructor() {
    (this.router = Router()), this.registeredRoutes();
  }
  private registeredRoutes() {
    this.router.get("/", adminController.summary);
  }
}

const adminRouter = new adminRoute().router;
export default adminRouter;
