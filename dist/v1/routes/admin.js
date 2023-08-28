"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_1 = __importDefault(require("../../controllers/admin"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
class adminRoute {
    constructor() {
        (this.router = (0, express_1.Router)()), this.registeredRoutes();
    }
    registeredRoutes() {
        this.router.use(auth_1.default.middleware);
        this.router.use(auth_1.default.isSuperAdmin);
        this.router.get("/summary", admin_1.default.summary);
        this.router.get("/orders", admin_1.default.getOrders);
        this.router.get("/products", admin_1.default.getAllProducts);
    }
}
const adminRouter = new adminRoute().router;
exports.default = adminRouter;
