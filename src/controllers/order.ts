import { RequestHandler } from "express";
import NotFoundError from "../utils/errors/notFound";
import Order from "../modules/order/schema";
import { responseHelper } from "../utils/responseHelper";
import BadRequestError from "../utils/errors/badRequest";
import { OrderStatus } from "../modules/order/interface";
import Product from "../modules/products/schema";
import Cart from "../modules/carts/schema";

export default class Controller {
  // create a new order showing products, total price of products and user details
  static createOrder: RequestHandler = async (req, res, next) => {
    try {
      // Get the cart of the user
      await req.user.populate("cart");
      const carts = req.user.carts;
      if (!carts || carts.length === 0)
        throw new NotFoundError("Cart is empty. Kindly add some products 😊");

      // Fetch products from the database with availability and quantity checks
      const productIds = carts.flatMap((cartItem) =>
        cartItem.products.map((product) => product.productId)
      );
      const products = await Product.find({
        _id: { $in: productIds },
        availableQuantity: { $gte: 1 },
      });
      // Check product availability and quantity, and calculate total price
      let costTotal = 0;
      for (const cartItem of carts) {
        for (const product of cartItem.products) {
          // Get the price of a product by its ID
          const foundProduct = products.find((prd) => prd._id === product.productId);
          if (!foundProduct)
            throw new NotFoundError(`Product with ID ${product.productId} is out of stock.`);
          if (foundProduct.availableQuantity < product.quantity)
            throw new BadRequestError({
              message: `Insufficient quantity for product with ID ${product.productId}.`,
            });
          costTotal += foundProduct?.price * product.quantity;
        }
      }
      // create commission
      const commission = (costTotal * 0.05).toFixed(2);
      // total price
      const totalPrice = (costTotal + Number(commission)).toFixed(2);

      const order = await Order.create({
        userId: req.user._id,
        products: carts.flatMap((cartItem) => cartItem.products),
        totalPrice,
        ...req.body,
      });
      await Cart.findOneAndDelete({ user: req.user._id });
      return responseHelper.createdResponse(res, "Your order has been successfully placed", order);
    } catch (error) {
      next(error);
    }
  };

  //Get all orders (Super Admin)
  //GET /orders?page=2&limit=20       ======>>>>> PAGINATION
  static getOrders: RequestHandler = async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
      const orders = await Order.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
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
  static getOrderById: RequestHandler = async (req, res, next) => {
    try {
      const order = await Order.findById(req.params._id);
      if (!order) throw new NotFoundError("No order found");
      return responseHelper.successResponse(res, "Orders retrieved", order);
    } catch (error) {
      next(error);
    }
  };

  // Update a specific order by id
  static updateOrder: RequestHandler = async (req, res, next) => {
    const updates = Object.keys(req.body);
    try {
      //Check if updates are provided
      if (updates.length === 0) throw new BadRequestError({ message: "Invalid update!" });
      const updatedOrder = await Order.findByIdAndUpdate(req.params._id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!updatedOrder) throw new BadRequestError({ message: "Update failed" });
      return responseHelper.successResponse(res, "Order updated successfully ✅", updatedOrder);
    } catch (error) {
      next(error);
    }
  };

  //Update an order after payment confirmation
  static updateOrderAfterPayment: RequestHandler = async (req, res, next) => {
    try {
      const order = await Order.findById(req.params._id);
      if (!order) throw new NotFoundError("Order not found");
      order.status = OrderStatus.COMPLETED;
      order.payment.isPaid = true;
      order.payment.paidAt = new Date();
      order.payment.paymentResult = {
        orderId: order._id.toString(),
        payerId: req.user._id,
        paymentId: "******",
      };
      await order.save();
      //Track the number of times a product has been sold
      // await req.user.populate("carts")
      const carts = req.user.carts;
      // if (!carts) throw new NotFoundError("Cart is empty, Kindly add some products😊")
      const bulkOptions = carts?.flatMap((cartItem) =>
        cartItem.products.map((product) => ({
          updateOne: {
            filter: { _id: product.productId },
            update: {
              $inc: { sales: +product.quantity, availableQuantity: -product.quantity }, //This will correctly decrement the availableQuantity as the sales field is increased
            },
          },
        }))
      );
      console.log(bulkOptions);
      //Update the product quantity
      const updated = await Product.bulkWrite(bulkOptions || []);
      console.log(updated);
      //Delete cart
      await Cart.findOneAndDelete({ user: req.user._id });
      return responseHelper.successResponse(res, "Payment recieved, Order in process...", order);
    } catch (error) {
      next(error);
    }
  };

  //Update an Order after delivery
  static updateOrderAfterDelivery: RequestHandler = async (req, res, next) => {
    try {
      const order = await Order.findById(req.params._id);
      if (!order) throw new NotFoundError("Order not found");
      order.status = OrderStatus.DELIVERED;
      order.deliveredAt = new Date();
      await order.save();
      //TODO: Send appreciative mail to the user
      return responseHelper.successResponse(res, "Your order has been Delivered 😊");
    } catch (error) {
      next(error);
    }
  };

  // delete a specific order by id (Admin and user)
  static deleteOrder: RequestHandler = async (req, res, next) => {
    try {
      const order = await Order.findByIdAndDelete(req.params._id);
      if (!order) throw new NotFoundError("Operation failed");
      return responseHelper.successResponse(res, "Order deleted successfully");
    } catch (error) {
      next(error);
    }
  };
}
