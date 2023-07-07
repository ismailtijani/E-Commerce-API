import { RequestHandler } from "express";
import NotFoundError from "../utils/errors/notFound";
import Order from "../modules/order/schema";
import { responseHelper } from "../utils/responseHelper";

export default class Controller {
  // create a new order showing products, total price of products and user details
  static createOrder: RequestHandler = async (req, res, next) => {
    try {
      // get the cart of the user
      await req.user.populate("cart");
      const carts = req.user.carts;
      if (!carts || carts.length === 0)
        throw new NotFoundError("Cart is empty, Kindly add some products😊");
      //Fetch products to be place on order from cart
      const products = carts?.map((cartItem) => cartItem.products);
      await Order.create({
        userId: req.user._id,
        products,
        ...req.body,
      });
      return responseHelper.createdResponse(res, "Your order has successfully been placed");
    } catch (error) {
      next(error);
    }
  };
  //Get all orders (Super Admin)
  static getOrders: RequestHandler = async (req, res, next) => {
    try {
      const orders = await Order.find();
      if (!orders || orders.length === 0) throw new NotFoundError("No order found");
      return responseHelper.successResponse(res, "Orders retrieved", orders);
    } catch (error) {
      next(error);
    }
  };
  //Get all orders placed by a specific user
  static getOrdersByUser: RequestHandler = async (req, res, next) => {
    try {
      const orders = await Order.find({ userId: req.user._id });
      if (!orders || orders.length === 0) throw new NotFoundError("No Order found");
      return responseHelper.successResponse(res, "Orders retrieved", orders);
    } catch (error) {
      next(error);
    }
  };
  //Get a specific order by id
  static getOrdersById: RequestHandler = async (req, res, next) => {
    try {
      const order = await Order.findById(req.user._id);
      if (!order) throw new NotFoundError("No order found");
      return responseHelper.successResponse(res, "Orders retrieved", order);
    } catch (error) {
      next(error);
    }
  };
  // static updateOrder: RequestHandler = async (req, res, next) => {};
  //Total sales made(Sum total)
}
