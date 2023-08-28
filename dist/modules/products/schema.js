"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const interface_1 = require("./interface");
const productSchema = new mongoose_1.Schema({
    name: {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, "Product name is required"],
        unique: true,
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
    },
    category: {
        type: String,
        trim: true,
        lowercase: true,
        enum: Object.values(interface_1.CategoryEnum),
        required: [true, "Product category is required"],
        default: interface_1.CategoryEnum.OTHERS,
    },
    description: {
        type: String,
        required: [true, "Product description is required"],
    },
    imageUrl: {
        type: String,
        required: [true, "Product image is required"],
    },
    availableQuantity: {
        type: Number,
        required: [true, "Product quatity is required"],
    },
    ratings: {
        userId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
        rating: {
            type: String,
            enum: Object.values(interface_1.RatingEnum),
        },
    },
    reviews: [
        {
            type: String,
        },
    ],
    seller: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    sales: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });
//indexing to improve the performance of queries on name and category fields
productSchema.index({ name: 1, category: 1 });
const Product = (0, mongoose_1.model)("Product", productSchema);
exports.default = Product;
