import { RequestHandler } from "express";
import Order from "../modules/order/schema";
import User from "../modules/users/schema";
import Product from "../modules/products/schema";
import { responseHelper } from "../utils/responseHelper";

export default class Controller {
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
    ]);

    //Fetch total number of registered users
    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUser: { $sum: 1 },
        },
      },
    ]);

    //Fetch daily order
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { $format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          totalSales: { $sum: "$totalPrice" },
        },
      },
    ]);
    //Fetch total number of products in each category
    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: "category",
          count: { $sum: 1 },
        },
      },
    ]);

    responseHelper.successResponse(res, "Data summary fecthed successfully", {
      users,
      dailyOrders,
      orders: orders.length === 0 ? [{ totalOrders: 0, totalSales: 0 }] : orders,
      productCategories,
    });
  };
}
