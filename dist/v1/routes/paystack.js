"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paystack_1 = __importDefault(require("../../controllers/paystack"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
class PaymentRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.registeredRoutes();
    }
    registeredRoutes() {
        this.router.post("/recievedPayment", paystack_1.default.paymentStatus);
        this.router.use(auth_1.default.middleware);
        this.router.post("/initializedPayment/:orderId", paystack_1.default.payment);
    }
}
const paymentRouter = new PaymentRoutes().router;
exports.default = paymentRouter;
