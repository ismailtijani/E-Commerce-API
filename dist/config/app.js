"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientBaseUrl = exports.PORT = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
const node_process_1 = require("node:process");
const environments_1 = __importDefault(require("../environments"));
const errorHandler_1 = __importDefault(require("../middlewares/errorHandler"));
const auth_1 = __importDefault(require("../v1/routes/auth"));
const user_1 = __importDefault(require("../v1/routes/user"));
const product_1 = __importDefault(require("../v1/routes/product"));
const cart_1 = __importDefault(require("../v1/routes/cart"));
const admin_1 = __importDefault(require("../v1/routes/admin"));
const order_1 = __importDefault(require("../v1/routes/order"));
const paystack_1 = __importDefault(require("../v1/routes/paystack"));
class App {
    constructor() {
        this.mongoUrl = node_process_1.env.NODE_ENV === "development"
            ? `mongodb://127.0.0.1/${environments_1.default.getDbName()}`
            : node_process_1.env.MONGODB_URL;
        this.app = (0, express_1.default)();
        this.mongoSetup();
        this.config();
    }
    config() {
        return __awaiter(this, void 0, void 0, function* () {
            this.app.use((0, cors_1.default)({
                origin: exports.ClientBaseUrl,
                methods: "GET,POST,PUT,DELETE,PATCH",
                credentials: true,
            }));
            this.app.use(express_1.default.json());
            this.app.use(express_1.default.urlencoded({ extended: true }));
            // routes
            // set home route
            this.app.get("/", (req, res) => {
                res.status(200).json({ message: "Welcome to the E Commerce API" });
            });
            this.app.use("/api/v1/admin", admin_1.default);
            this.app.use("/api/v1/accounts", auth_1.default);
            this.app.use("/api/v1/users", user_1.default);
            this.app.use("/api/v1/products", product_1.default);
            this.app.use("/api/v1/carts", cart_1.default);
            this.app.use("/api/v1/orders", order_1.default);
            this.app.use("/api/v1/payments", paystack_1.default);
            // set up global error handling here
            this.app.use((error, req, res, next) => {
                errorHandler_1.default.handleError(error, res);
            });
        });
    }
    mongoSetup() {
        try {
            mongoose_1.default
                .set("strictQuery", false)
                .connect(this.mongoUrl, { retryWrites: true, w: "majority" });
            logger_1.default.info("DB Connection Successful");
            logger_1.default.info(`'''''''''''''''''''''''''`);
        }
        catch (error) {
            errorHandler_1.default.handleError(error);
        }
    }
}
exports.PORT = node_process_1.env.PORT || environments_1.default.getPort();
exports.ClientBaseUrl = process.env.NODE_ENV !== "development"
    ? process.env.PROD_URL
    : "http://localhost:3000";
exports.default = new App().app;
