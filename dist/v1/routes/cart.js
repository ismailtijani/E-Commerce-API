"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const cart_1 = __importDefault(require("../../controllers/cart"));
const validator_1 = __importDefault(require("../../middlewares/validator"));
const validator_2 = __importDefault(require("../../modules/carts/validator"));
const validID_1 = __importDefault(require("../../utils/validID"));
class CartRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.registeredRoutes();
    }
    registeredRoutes() {
        this.router.use(auth_1.default.middleware);
        this.router.post("/", (0, validator_1.default)(validator_2.default.addCart, "body"), cart_1.default.checkIfProductExist, cart_1.default.addCart);
        this.router.get("/", cart_1.default.viewCart);
        this.router.delete("/:_id", validID_1.default, cart_1.default.deleteCart);
    }
}
const cartRouter = new CartRoutes().router;
exports.default = cartRouter;
