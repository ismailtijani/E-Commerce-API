import { RequestHandler } from "express";
import Paystack from "paystack";
import Order from "../modules/order/schema";
import BadRequestError from "../utils/errors/badRequest";
import { responseHelper } from "../utils/responseHelper";
import ServerError from "../utils/errors/serverError";
import crypto from "crypto";

// Initialize Paystack with your API key
const secret = process.env.PAYSTACK_MAIN_KEY as string;
const paystack = Paystack(secret);

export default class Payment {
  static payment: RequestHandler = async (req, res, next) => {
    try {
      const order = await Order.findById(req.query.orderId);
      if (!order) throw new BadRequestError({ message: "Order not found" });

      // Call Paystack to initialize payment
      const paymentResponse = await paystack.transaction.initialize({
        name: req.user.firstName,
        email: req.user.email,
        amount: order.totalPrice * 100, // Paystack expects amount in kobo (multiply by 100 to convert to kobo)
        currency: "NGN",
        reference: order.payment.paymentId,
      });

      // Check if payment initialization was successful
      if (!paymentResponse.status || !paymentResponse.data.authorization_url) {
        throw new ServerError("Payment initialization failed.");
      }

      // Return payment authorization URL to the client
      return responseHelper.successResponse(res, `Payment complete! Reference: `, {
        authorization_url: paymentResponse.data.authorization_url,
      });
    } catch (error) {
      next(error);
    }
  };

  // To receive event and Paystack data from convoy webhook
  static paymentStatus: RequestHandler = async (req, res, next) => {
    //validate event
    const hash = crypto.createHmac("sha512", secret).update(JSON.stringify(req.body)).digest("hex");
    try {
      if (hash == req.headers["x-paystack-signature"]) {
        // Retrieve the request's body
        const { event, data } = req.body;
        if (event === "charge.success") {
          const { reference } = data;
          const order = await Order.findOne({ reference });
          if (!order) throw new BadRequestError({ message: "Order not found" });
        }
        res.send(200);
      }
    } catch (error) {
      next(error);
    }
  };
}
