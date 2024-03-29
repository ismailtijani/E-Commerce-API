import { Router } from "express";
import productController from "../../controllers/product";
import Authentication from "../../middlewares/auth";
import validatorSchema from "../../modules/products/validator";
import validator from "../../middlewares/validator";
import validateId from "../../utils/validID";

class ProductRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
    this.registeredRoutes();
  }

  protected registeredRoutes() {
    this.router.get(
      "/top_products",
      validator(validatorSchema.searchForTopProducts, "query"),
      productController.getTopProducts
    );
    this.router.get(
      "/search",
      validator(validatorSchema.search, "query"),
      productController.advanceSearch
    );
    //Every routes below will require authentication
    this.router.use(Authentication.middleware);
    this.router.use(Authentication.isAdmin);

    this.router.post(
      "/",
      validator(validatorSchema.createProduct, "body"),
      productController.createProduct
    );
    this.router.get(
      "/vendor",
      validator(validatorSchema.getProductByUser, "query"),
      productController.getProductsByUser
    );
    this.router.get("/:_id", validateId, productController.getProductById);
    this.router.patch(
      "/:_id",
      validateId,
      validator(validatorSchema.update, "body"),
      productController.updateProduct
    );
    this.router.delete("/:_id", validateId, productController.deleteProduct);
  }
}

const productRouter = new ProductRoutes().router;

export default productRouter;
