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
const crypto_1 = __importDefault(require("crypto"));
const notFound_1 = __importDefault(require("../utils/errors/notFound"));
const schema_1 = __importDefault(require("../modules/order/schema"));
const responseHelper_1 = require("../utils/responseHelper");
const badRequest_1 = __importDefault(require("../utils/errors/badRequest"));
const interface_1 = require("../modules/order/interface");
const schema_2 = __importDefault(require("../modules/products/schema"));
const schema_3 = __importDefault(require("../modules/carts/schema"));
class Controller {
}
_a = Controller;
// create a new order showing products, total price of products and user details
Controller.createOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { deliveryPrice, address, city, country } = req.body;
    try {
        // Get the cart of the user
        const cart = yield schema_3.default.findOne({ user: req.user._id });
        if (!cart)
            throw new notFound_1.default("Cart is empty. Kindly add some products 😊");
        const productIds = cart.products.map((product) => product.productId);
        const products = yield schema_2.default.find({
            _id: { $in: productIds },
            availableQuantity: { $gte: 1 },
        });
        // Check product availability and quantity, and calculate total price
        let costTotal = 0;
        for (const product of cart.products) {
            // Get the price of a product by its ID
            const foundProduct = products.find((prd) => prd._id.toString() === product.productId.toString());
            if (!foundProduct)
                throw new notFound_1.default(`Product with ID ${product.productId} is out of stock.`);
            if (foundProduct.availableQuantity < product.quantity)
                throw new badRequest_1.default(`Insufficient quantity for product with ID ${product.productId}.`);
            costTotal += (foundProduct === null || foundProduct === void 0 ? void 0 : foundProduct.price) * product.quantity;
        }
        // create commission
        const commission = (costTotal * 0.05).toFixed(2);
        // total price
        const totalPrice = (costTotal + Number(commission) + Number(deliveryPrice)).toFixed(2);
        //Generate a reference ID i.e PaymentId
        const paymentId = crypto_1.default.randomBytes(9).toString("hex");
        const order = yield schema_1.default.create({
            userId: req.user._id,
            products: cart.products.map((product) => product.productId),
            totalPrice,
            payment: { paymentId },
            shipping: {
                address,
                city,
                country,
            },
        });
        yield schema_3.default.findOneAndDelete({ user: req.user._id });
        return responseHelper_1.responseHelper.createdResponse(res, "Your order has been successfully placed", order);
    }
    catch (error) {
        next(error);
    }
});
//Get all orders placed by a specific user
Controller.getOrdersByUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield schema_1.default.find({ userId: req.user._id });
        if (!order)
            throw new notFound_1.default("No Order found");
        return responseHelper_1.responseHelper.successResponse(res, "Orders retrieved", order);
    }
    catch (error) {
        next(error);
    }
});
//Get a specific order by id
Controller.getOrderById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield schema_1.default.findById(req.params._id);
        if (!order)
            throw new notFound_1.default("No order found");
        return responseHelper_1.responseHelper.successResponse(res, "Orders retrieved", order);
    }
    catch (error) {
        next(error);
    }
});
// Update a specific order by id
Controller.updateOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const updates = Object.keys(req.body);
    try {
        //Check if updates are provided
        if (updates.length === 0)
            throw new badRequest_1.default("Invalid update!");
        const updatedOrder = yield schema_1.default.findByIdAndUpdate(req.params._id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedOrder)
            throw new badRequest_1.default("Update failed");
        return responseHelper_1.responseHelper.successResponse(res, "Order updated successfully ✅", updatedOrder);
    }
    catch (error) {
        next(error);
    }
});
//Update an order after payment confirmation
Controller.updateOrderAfterPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield schema_1.default.findOne({ "payment.paymentId": req.params.reference });
        if (!order)
            throw new notFound_1.default("Order not found");
        order.status = interface_1.OrderStatus.COMPLETED;
        order.payment.isPaid = true;
        order.payment.paidAt = new Date();
        yield order.save();
        // Track the number of times a product has been sold
        const cart = yield schema_3.default.findOne({ user: req.user._id });
        // if (!carts) throw new NotFoundError("Cart is empty, Kindly add some products😊")
        const bulkOptions = cart === null || cart === void 0 ? void 0 : cart.products.map((product) => ({
            updateOne: {
                filter: { _id: product.productId },
                update: {
                    $inc: { sales: +product.quantity, availableQuantity: -product.quantity }, //This will correctly decrement the availableQuantity as the sales field is increased
                },
            },
        }));
        //Update the product quantity
        const updated = yield schema_2.default.bulkWrite(bulkOptions || []);
        console.log(updated);
        //Delete cart
        yield schema_3.default.findOneAndDelete({ user: req.user._id });
        //Send an Email to the user to confrim payment
        return responseHelper_1.responseHelper.successResponse(res, "Payment recieved, delivery in process...", order);
    }
    catch (error) {
        next(error);
    }
});
//Update an Order after delivery
Controller.updateOrderAfterDelivery = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield schema_1.default.findById(req.params._id);
        if (!order)
            throw new notFound_1.default("Order not found");
        order.status = interface_1.OrderStatus.DELIVERED;
        order.deliveredAt = new Date();
        yield order.save();
        //TODO: Send appreciative mail to the user
        return responseHelper_1.responseHelper.successResponse(res, "Your order has been Delivered 😊");
    }
    catch (error) {
        next(error);
    }
});
// delete a specific order by id (Admin and user)
Controller.deleteOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield schema_1.default.findByIdAndDelete(req.params._id);
        if (!order)
            throw new notFound_1.default("Operation failed");
        return responseHelper_1.responseHelper.successResponse(res, "Order deleted successfully");
    }
    catch (error) {
        next(error);
    }
});
exports.default = Controller;
