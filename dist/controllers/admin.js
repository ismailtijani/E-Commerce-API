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
const schema_1 = __importDefault(require("../modules/order/schema"));
const schema_2 = __importDefault(require("../modules/users/schema"));
const schema_3 = __importDefault(require("../modules/products/schema"));
const responseHelper_1 = require("../utils/responseHelper");
const notFound_1 = __importDefault(require("../utils/errors/notFound"));
const constant_1 = require("../constant");
const redisCache_1 = __importDefault(require("../config/redisCache"));
class Controller {
}
_a = Controller;
// get all products uploaded by all users (Super Admin)
//GET /products?page=2&limit=20       ======>>>>> PAGINATION
Controller.getAllProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const searchKeyword = req.query.searchKeyword;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const query = {};
    if (searchKeyword) {
        const searchRegex = new RegExp(searchKeyword, "i");
        query.$or = [{ name: searchRegex }, { category: searchRegex }];
    }
    try {
        const [products, totalCount] = yield Promise.all([
            schema_3.default.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            schema_3.default.countDocuments(query),
        ]);
        if (!products || products.length === 0)
            throw new notFound_1.default("No product found");
        return responseHelper_1.responseHelper.successResponse(res, "All products fetched", { products, totalCount });
    }
    catch (error) {
        next(error);
    }
});
//Get all orders (Super Admin)
//GET /orders?page=2&limit=20       ======>>>>> PAGINATION
Controller.getOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const searchKeyword = req.query.searchKeyword;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const query = {};
    if (searchKeyword) {
        const searchRegex = new RegExp(searchKeyword, "i");
        query.$or = [{ payment: searchRegex }, { status: searchRegex }];
    }
    try {
        //Check if data still lives
        const response = yield redisCache_1.default.get(constant_1.ADMIN);
        if (response)
            return responseHelper_1.responseHelper.successResponse(res, "Orders retrieved", {
                orders: response.orders,
                totalCount: response.totalCount,
            });
        //Fetch orders from database
        const [orders, totalCount] = yield Promise.all([
            schema_1.default.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            schema_1.default.countDocuments(query),
        ]);
        if (!orders || orders.length === 0)
            throw new notFound_1.default("No order found");
        yield redisCache_1.default.set(constant_1.ADMIN, { orders, totalCount }, 60);
        return responseHelper_1.responseHelper.successResponse(res, "Orders retrieved", { orders, totalCount });
    }
    catch (error) {
        next(error);
    }
});
Controller.summary = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //Fecth total number of orders and total price
    const orders = yield schema_1.default.aggregate([
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalSales: { $sum: "$totalPrice" },
            },
        },
        {
            $project: {
                _id: 0,
                totalOrders: 1,
                totalSales: 1,
            },
        },
    ]);
    //Fetch total number of registered users
    const users = yield schema_2.default.aggregate([
        {
            $group: {
                _id: null,
                totalUser: { $sum: 1 },
                activeUsers: {
                    $sum: { $cond: [{ $eq: ["$status", "activated"] }, 1, 0] },
                },
                pendingAccounts: {
                    $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
                },
            },
        },
        {
            $project: {
                _id: 0,
                totalUser: 1,
                activeUsers: 1,
                pendingAccounts: 1,
            },
        },
    ]);
    //Fetch daily order
    const dailyOrders = yield schema_1.default.aggregate([
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                orders: { $sum: 1 },
                totalSales: { $sum: "$totalPrice" },
            },
        },
        {
            $project: {
                date: "$_id",
                orders: 1,
                totalSales: 1,
                _id: 0,
            },
        },
    ]);
    responseHelper_1.responseHelper.successResponse(res, "Data summary fecthed successfully", {
        users,
        dailyOrders,
        orders: orders.length === 0 ? [{ totalOrders: 0, totalSales: 0 }] : orders,
    });
});
exports.default = Controller;
