"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_1 = __importDefault(require("../../controllers/product"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validator_1 = __importDefault(require("../../modules/products/validator"));
const validator_2 = __importDefault(require("../../middlewares/validator"));
const validID_1 = __importDefault(require("../../utils/validID"));
class ProductRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.registeredRoutes();
    }
    registeredRoutes() {
        this.router.get("/top_products", (0, validator_2.default)(validator_1.default.searchForTopProducts, "query"), product_1.default.getTopProducts);
        this.router.get("/search", (0, validator_2.default)(validator_1.default.search, "query"), product_1.default.advanceSearch);
        //Every routes below will require authentication
        this.router.use(auth_1.default.middleware);
        this.router.use(auth_1.default.isAdmin);
        this.router.post("/", (0, validator_2.default)(validator_1.default.createProduct, "body"), product_1.default.createProduct);
        this.router.get("/vendor", (0, validator_2.default)(validator_1.default.getProductByUser, "query"), product_1.default.getProductsByUser);
        this.router.get("/:_id", validID_1.default, product_1.default.getProductById);
        this.router.patch("/:_id", validID_1.default, (0, validator_2.default)(validator_1.default.update, "body"), product_1.default.updateProduct);
        this.router.delete("/:_id", validID_1.default, product_1.default.deleteProduct);
    }
}
const productRouter = new ProductRoutes().router;
exports.default = productRouter;
