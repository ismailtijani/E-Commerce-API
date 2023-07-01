import { Router } from "express";
import productController from "../controllers/products";
import auth from "../middlewares/auth";
import validatorSchema from "../modules/products/validator";
import validator from "../middlewares/validator";

class ProductRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
    this.registeredRoutes();
  }

  protected registeredRoutes() {
    this.router.get("/", productController.getAllProducts);
    this.router.get(
      "/top_products",
      validator(validatorSchema.searchForTopProducts, "query"),
      productController.getTopProducts
    );
    this.router.get(
      "/search",
      validator(validatorSchema.search, "params"),
      productController.advanceSearch
    );
    //Every routes below will require authentication
    this.router.use(auth.middleware);
    this.router.post(
      "/create",
      validator(validatorSchema.createProduct, "body"),
      productController.createProduct
    );
    this.router.get(
      "/:_id",
      validator(validatorSchema.verifyParamsId, "params"),
      productController.getProductById
    );
    this.router.get(
      "/vendor",
      validator(validatorSchema.getProductByUser, "query"),
      productController.getProductsByUser
    );
    this.router.patch(
      "/:_id",
      validator(validatorSchema.update, "body"),
      productController.updateProduct
    );
    this.router.delete(
      "/:_id",
      validator(validatorSchema.verifyParamsId, "params"),
      productController.deleteProduct
    );
  }
}

const productRouter = new ProductRoutes().router;

export default productRouter;
