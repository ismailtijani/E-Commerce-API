"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const interface_1 = require("./interface");
const orderSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    products: [
        {
            productId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Product",
            },
            quantity: Number,
        },
    ],
    totalPrice: Number,
    status: {
        type: String,
        enum: Object.values(interface_1.OrderStatus),
        default: interface_1.OrderStatus.PENDING,
    },
    payment: {
        paymentMethod: {
            type: String,
            enum: Object.values(interface_1.PaymentMethod),
            default: interface_1.PaymentMethod.CARD,
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
        paidAt: Date,
        paymentId: String,
    },
    deliveryPrice: Number,
    deliveredAt: Date,
    shipping: {
        address: String,
        city: String,
        country: String,
    },
}, { timestamps: true });
const Order = (0, mongoose_1.model)("Order", orderSchema);
exports.default = Order;
