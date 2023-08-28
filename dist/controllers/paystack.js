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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const paystack_1 = __importDefault(require("paystack"));
const schema_1 = __importDefault(require("../modules/order/schema"));
const badRequest_1 = __importDefault(require("../utils/errors/badRequest"));
const responseHelper_1 = require("../utils/responseHelper");
const serverError_1 = __importDefault(require("../utils/errors/serverError"));
const crypto_1 = __importDefault(require("crypto"));
const order_1 = __importDefault(require("../controllers/order"));
const logger_1 = __importDefault(require("../utils/logger"));
// Initialize Paystack with your API key
const secret = process.env.PAYSTACK_MAIN_KEY;
const paystack = (0, paystack_1.default)(secret);
class Payment {
}
_a = Payment;
Payment.payment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield schema_1.default.findById(req.params.orderId);
        if (!order)
            throw new badRequest_1.default("Order not found");
        // Call Paystack to initialize payment
        const paymentResponse = yield paystack.transaction.initialize({
            name: req.user.firstName,
            email: req.user.email,
            amount: order.totalPrice * 100,
            currency: "NGN",
            reference: order.payment.paymentId,
        });
        // Check if payment initialization was successful
        if (!paymentResponse.status || !paymentResponse.data.authorization_url) {
            throw new serverError_1.default("Payment initialization failed.");
        }
        // Return payment authorization URL to the client
        return responseHelper_1.responseHelper.successResponse(res, `Payment complete! Reference: `, {
            authorization_url: paymentResponse.data.authorization_url,
        });
    }
    catch (error) {
        next(error);
    }
});
// To receive event and Paystack data from convoy webhook
Payment.paymentStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //validate event
    const hash = crypto_1.default.createHmac("sha512", secret).update(JSON.stringify(req.body)).digest("hex");
    logger_1.default.info(hash);
    try {
        if (hash == req.headers["x-paystack-signature"]) {
            // Retrieve the request's body
            const { event, data } = req.body;
            logger_1.default.warn(event);
            logger_1.default.info(data);
            if (event === "charge.success") {
                const { reference } = data;
                // Set the reference as a route parameter
                const mockReq = {
                    params: { reference },
                };
                order_1.default.updateOrderAfterPayment(mockReq, res, next);
            }
            return res.send(200);
        }
    }
    catch (error) {
        return res.status(500).json({
            error: "An error occurred while initializing payment.",
            message: error.message,
        });
    }
});
exports.default = Payment;
