import crypto from "crypto";
import { RequestHandler } from "express";
import NotFoundError from "../utils/errors/notFound";
import Order from "../modules/order/schema";
import { responseHelper } from "../utils/responseHelper";
import BadRequestError from "../utils/errors/badRequest";
import { OrderStatus } from "../modules/order/interface";
import Product from "../modules/products/schema";
import Cart from "../modules/carts/schema";
import Logger from "../utils/logger";

export default class Controller {
  // create a new order showing products, total price of products and user details
  static createOrder: RequestHandler = async (req, res, next) => {
    const { deliveryPrice, address, city, country } = req.body;
    try {
      // Get the cart of the user
      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart) throw new NotFoundError("Cart is empty. Kindly add some products 😊");

      const productIds = cart.products.map((product) => product.productId);

      const products = await Product.find({
        _id: { $in: productIds },
        availableQuantity: { $gte: 1 },
      });

      // Check product availability and quantity, and calculate total price
      let costTotal = 0;
      for (const product of cart.products) {
        // Get the price of a product by its ID
        const foundProduct = products.find(
          (prd) => prd._id.toString() === product.productId.toString()
        );
        if (!foundProduct)
          throw new NotFoundError(`Product with ID ${product.productId} is out of stock.`);
        if (foundProduct.availableQuantity < product.quantity)
          throw new BadRequestError(
            `Insufficient quantity for product with ID ${product.productId}.`
          );
        costTotal += foundProduct?.price * product.quantity;
      }
      // create commission
      const commission = (costTotal * 0.05).toFixed(2);
      // total price
      const totalPrice = (costTotal + Number(commission) + Number(deliveryPrice)).toFixed(2);
      //Generate a reference ID i.e PaymentId
      const paymentId = crypto.randomBytes(9).toString("hex");
      const order = await Order.create({
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
      await Cart.findOneAndDelete({ user: req.user._id });
      return responseHelper.createdResponse(res, "Your order has been successfully placed", order);
    } catch (error) {
      next(error);
    }
  };

  //Get all orders placed by a specific user
  static getOrdersByUser: RequestHandler = async (req, res, next) => {
    try {
      const order = await Order.find({ userId: req.user._id });
      if (!order) throw new NotFoundError("No Order found");
      return responseHelper.successResponse(res, "Orders retrieved", order);
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
      if (updates.length === 0) throw new BadRequestError("Invalid update!");
      const updatedOrder = await Order.findByIdAndUpdate(req.params._id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!updatedOrder) throw new BadRequestError("Update failed");
      return responseHelper.successResponse(res, "Order updated successfully ✅", updatedOrder);
    } catch (error) {
      next(error);
    }
  };

  //Update an order after payment confirmation
  static updateOrderAfterPayment: RequestHandler = async (req, res, next) => {
    try {
      const order = await Order.findOne({ "payment.paymentId": req.params.reference });
      if (!order) throw new NotFoundError("Order not found");
      order.status = OrderStatus.COMPLETED;
      order.payment.isPaid = true;
      order.payment.paidAt = new Date();
      await order.save();
      // Track the number of times a product has been sold
      const cart = await Cart.findOne({ user: req.user._id });
      // if (!carts) throw new NotFoundError("Cart is empty, Kindly add some products😊")
      const bulkOptions = cart?.products.map((product) => ({
        updateOne: {
          filter: { _id: product.productId },
          update: {
            $inc: { sales: +product.quantity, availableQuantity: -product.quantity }, //This will correctly decrement the availableQuantity as the sales field is increased
          },
        },
      }));
      //Update the product quantity
      const updated = await Product.bulkWrite(bulkOptions || []);
      console.log(updated);
      //Delete cart
      await Cart.findOneAndDelete({ user: req.user._id });
      //Send an Email to the user to confrim payment
      return responseHelper.successResponse(res, "Payment recieved, delivery in process...", order);
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
