"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const order_1 = __importDefault(require("../../controllers/order"));
const validator_1 = __importDefault(require("../../middlewares/validator"));
const validation_1 = __importDefault(require("../../modules/order/validation"));
const validID_1 = __importDefault(require("../../utils/validID"));
class OrderRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.registeredRoutes();
    }
    registeredRoutes() {
        this.router.use(auth_1.default.middleware);
        this.router.post("/", (0, validator_1.default)(validation_1.default.createOrder, "body"), order_1.default.createOrder);
        this.router.get("/customer", order_1.default.getOrdersByUser);
        this.router.get("/:_id", validID_1.default, order_1.default.getOrderById);
        this.router.patch("/:_id/payment", validID_1.default, order_1.default.updateOrderAfterPayment);
        this.router.patch("/:_id/delivery", validID_1.default, order_1.default.updateOrderAfterDelivery);
        this.router.patch("/:_id", validID_1.default, (0, validator_1.default)(validation_1.default.update, "body"), order_1.default.updateOrder);
        this.router.delete("/:_id", validID_1.default, order_1.default.deleteOrder);
    }
}
const orderRouter = new OrderRoutes().router;
exports.default = orderRouter;
