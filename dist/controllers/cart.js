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
const schema_1 = __importDefault(require("../modules/carts/schema"));
const responseHelper_1 = require("../utils/responseHelper");
const badRequest_1 = __importDefault(require("../utils/errors/badRequest"));
const notFound_1 = __importDefault(require("../utils/errors/notFound"));
const schema_2 = __importDefault(require("../modules/products/schema"));
class Controller {
}
_a = Controller;
Controller.checkIfProductExist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //Check the Product availability and quantity
        const product = yield schema_2.default.findById(req.body.productId, "availableQuantity");
        if (!product) {
            throw new badRequest_1.default("Product not found");
        }
        // check if the added quantity is greater than the available quantity
        else if (product.availableQuantity < req.body.quantity) {
            throw new badRequest_1.default("Insufficient quantity, only " +
                product.availableQuantity +
                " items are available." +
                " For more items, please contact the seller.");
        }
        else
            next();
    }
    catch (error) {
        next(error);
    }
});
Controller.addCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId, quantity } = req.body;
    try {
        //Create a new cart or update an existing cart in a single operation
        let cart = yield schema_1.default.findOne({ user: req.user._id });
        if (!cart) {
            cart = new schema_1.default({ user: req.user._id, products: [] });
        }
        const existingProductIndex = cart.products.findIndex((product) => product.productId.toString() === productId.toString());
        if (existingProductIndex !== -1) {
            cart.products[existingProductIndex].quantity = quantity;
        }
        else {
            cart.products.push({ productId, quantity });
        }
        yield cart.save(); // Save the updated cart
        return responseHelper_1.responseHelper.successResponse(res, `Cart ${cart.products.length > 1 ? "updated" : "created"} successfully`, cart);
    }
    catch (error) {
        next(error);
    }
});
Controller.viewCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cart = yield schema_1.default.findOne({ user: req.user._id });
        if (!cart)
            throw new notFound_1.default("Empty cart, do add some products");
        return responseHelper_1.responseHelper.successResponse(res, "Cart fetched successfully", cart);
    }
    catch (error) {
        next(error);
    }
});
Controller.deleteCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cart = yield schema_1.default.findOne({ user: req.user._id });
        if (!cart) {
            throw new notFound_1.default("Unable to delete item");
        }
        const removedProductIndex = cart.products.findIndex((product) => product.productId.toString() === req.params._id);
        if (removedProductIndex === -1) {
            throw new badRequest_1.default("Product not found in your cart");
        }
        cart.products.splice(removedProductIndex, 1); // Remove the product from the array
        yield cart.save(); // Save the updated cart after product removal
        return responseHelper_1.responseHelper.successResponse(res, "Item deleted from cart successfully");
    }
    catch (error) {
        next(error);
    }
});
exports.default = Controller;
