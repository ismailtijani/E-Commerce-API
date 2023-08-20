import { RequestHandler } from "express";
import Order from "../modules/order/schema";
import User from "../modules/users/schema";
import Product from "../modules/products/schema";
import { responseHelper } from "../utils/responseHelper";
import NotFoundError from "../utils/errors/notFound";
import { ADMIN } from "../constant";
import redisCache from "../config/redisCache";

export default class Controller {
  // get all products uploaded by all users (Super Admin)
  //GET /products?page=2&limit=20       ======>>>>> PAGINATION
  static getAllProducts: RequestHandler = async (req, res, next) => {
    interface SearchQuery {
      $or?: ({ name: RegExp } | { category: RegExp })[];
    }
    const searchKeyword = req.query.searchKeyword as string;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const query: SearchQuery = {};

    if (searchKeyword) {
      const searchRegex = new RegExp(searchKeyword, "i");
      query.$or = [{ name: searchRegex }, { category: searchRegex }];
    }
    try {
      const [products, totalCount] = await Promise.all([
        Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Product.countDocuments(query),
      ]);
      if (!products || products.length === 0) throw new NotFoundError("No product found");
      return responseHelper.successResponse(res, "All products fetched", { products, totalCount });
    } catch (error) {
      next(error);
    }
  };

  //Get all orders (Super Admin)
  //GET /orders?page=2&limit=20       ======>>>>> PAGINATION
  static getOrders: RequestHandler = async (req, res, next) => {
    interface SearchQuery {
      $or?: ({ payment: RegExp } | { status: RegExp })[];
    }
    const searchKeyword = req.query.searchKeyword as string;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const query: SearchQuery = {};

    if (searchKeyword) {
      const searchRegex = new RegExp(searchKeyword, "i");
      query.$or = [{ payment: searchRegex }, { status: searchRegex }];
    }

    try {
      //Check if data still lives
      const response = await redisCache.get(ADMIN);
      if (response)
        return responseHelper.successResponse(res, "Orders retrieved", {
          orders: response.orders,
          totalCount: response.totalCount,
        });

      //Fetch orders from database
      const [orders, totalCount] = await Promise.all([
        Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Order.countDocuments(query),
      ]);

      if (!orders || orders.length === 0) throw new NotFoundError("No order found");

      await redisCache.set(ADMIN, { orders, totalCount }, 60);
      return responseHelper.successResponse(res, "Orders retrieved", { orders, totalCount });
    } catch (error) {
      next(error);
    }
  };

  static summary: RequestHandler = async (req, res, next) => {
    //Fecth total number of orders and total price
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSales: { $sum: "$totalPrice" },
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field from the output
          totalOrders: 1,
          totalSales: 1,
        },
      },
    ]);

    //Fetch total number of registered users
    const users = await User.aggregate([
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
    const dailyOrders = await Order.aggregate([
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

    responseHelper.successResponse(res, "Data summary fecthed successfully", {
      users,
      dailyOrders,
      orders: orders.length === 0 ? [{ totalOrders: 0, totalSales: 0 }] : orders,
    });
  };
}
