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
const schema_1 = __importDefault(require("../modules/products/schema"));
const responseHelper_1 = require("../utils/responseHelper");
const badRequest_1 = __importDefault(require("../utils/errors/badRequest"));
const notFound_1 = __importDefault(require("../utils/errors/notFound"));
const schema_2 = __importDefault(require("../modules/order/schema"));
const constant_1 = require("../constant");
const redisCache_1 = __importDefault(require("../config/redisCache"));
class Controller {
}
_a = Controller;
// create a new product by registered user
Controller.createProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user._id;
    try {
        const product = yield schema_1.default.create(Object.assign(Object.assign({}, req.body), { seller: _id }));
        return responseHelper_1.responseHelper.createdResponse(res, "Product created succesfully", product);
    }
    catch (error) {
        // catch  E11000 duplicate key error
        if (error.code === 11000)
            return res.status(400).json({ STATUS: "FAILURE", MESSAGE: "Product name already exists" });
        next(error);
    }
});
// GET ALL PRODUCTS UPLOADED BY A SPECIFIC USER (Vendor)
//GET /products?limit=2&skip=2             ======>>>>> PAGINATION
//GET /products?sortBy=createdAt:desc      ======>>>>> SORT
Controller.getProductsByUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const sort = {};
    if (req.query.sortBy) {
        const splitted = req.query.sortBy.split(":");
        sort[splitted[0]] = splitted[1] === "desc" ? -1 : 1;
    }
    try {
        yield ((_b = req.user) === null || _b === void 0 ? void 0 : _b.populate({
            path: "products",
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort,
            },
        }));
        //Get all user products
        const products = (_c = req.user) === null || _c === void 0 ? void 0 : _c.products;
        if (!products || (products === null || products === void 0 ? void 0 : products.length) === 0)
            throw new notFound_1.default("No product found, do upload some products 😊");
        return responseHelper_1.responseHelper.successResponse(res, "All products fetched", products);
    }
    catch (error) {
        next(error);
    }
});
// get a specific product by id
Controller.getProductById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield schema_1.default.findById(req.params._id);
        if (!product)
            throw new notFound_1.default("No product found");
        return responseHelper_1.responseHelper.successResponse(res, "Product retrieved successfully", product);
    }
    catch (error) {
        next(error);
    }
});
// update a specific product by id (Admin and Vendor)
Controller.updateProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const updates = Object.keys(req.body);
    try {
        //Check if updates are provided
        if (updates.length === 0)
            throw new badRequest_1.default("Invalid update!");
        const updatedData = yield schema_1.default.findOneAndUpdate({ _id: req.params._id }, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedData)
            throw new badRequest_1.default("Update failed");
        return responseHelper_1.responseHelper.successResponse(res, "Product updated successfully✅", updatedData);
    }
    catch (error) {
        next(error);
    }
});
// delete a specific product by id (Admin and user)
Controller.deleteProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield schema_1.default.findByIdAndDelete(req.params._id);
        if (!product)
            throw new notFound_1.default("Unable to delete product");
        return responseHelper_1.responseHelper.successResponse(res, "Producted deleted successfully");
    }
    catch (error) {
        next(error);
    }
});
// Get top products by highest number of ratings and review (Admin & Vendor)
Controller.getTopProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e, _f;
    const sortField = ((_d = req.query.sortField) === null || _d === void 0 ? void 0 : _d.toString()) || "rating";
    const sortOrder = parseInt((_e = req.query.sortOrder) === null || _e === void 0 ? void 0 : _e.toString()) || -1;
    const limit = parseInt((_f = req.query.limit) === null || _f === void 0 ? void 0 : _f.toString()) || 5;
    const pipeline = [
        { $sort: { [sortField]: sortOrder } },
        { $limit: limit },
    ];
    try {
        const results = yield redisCache_1.default.get(constant_1.TOP_PRODUCT);
        if (results)
            return responseHelper_1.responseHelper.successResponse(res, "Top products fecthed successfully", results);
        const products = yield schema_1.default.aggregate(pipeline);
        if (products.length === 0)
            throw new notFound_1.default("No product found");
        yield redisCache_1.default.set(constant_1.TOP_PRODUCT, products, 24 * 60 * 60);
        return responseHelper_1.responseHelper.successResponse(res, "Top products fecthed successfully", products);
    }
    catch (error) {
        next(error);
    }
});
// advance search for products
Controller.advanceSearch = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, category } = req.query;
    try {
        const products = yield schema_1.default.aggregate([
            {
                $match: {
                    $or: [
                        { name: { $regex: `${name}`, $options: "i" } },
                        { category: { $regex: `${category}`, $options: "i" } },
                    ],
                },
            },
        ]);
        if (!products || products.length === 0)
            throw new badRequest_1.default("No Product found");
        responseHelper_1.responseHelper.successResponse(res, "Products fetched successfully", products);
    }
    catch (error) {
        next(error);
    }
});
Controller.productRating = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.params;
    const userId = req.user._id;
    const { review, rating } = req.body;
    try {
        // Rate a product only if user has purchased the product
        const hasPurchased = yield schema_2.default.exists({
            userId,
            "products.productId": _id,
            // status: "completed",
        });
        if (!hasPurchased)
            throw new badRequest_1.default("You can only review and rate products you have purchased");
        const product = yield schema_1.default.findByIdAndUpdate({ _id, "ratings.userId": { $ne: userId } }, {
            $push: { reviews: review, ratings: { userId, rating } },
            $inc: { totalRatings: 1 },
            $avg: { rating: "$rating" }, // Update the average rating
        }, { new: true });
        if (!product)
            throw new notFound_1.default("Product not found");
        return responseHelper_1.responseHelper.createdResponse(res, "Review added successfully");
    }
    catch (error) {
        next(error);
    }
});
exports.default = Controller;
