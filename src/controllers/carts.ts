import { RequestHandler } from "express";
import Cart from "../modules/carts/schema";
import { responseHelper } from "../utils/responseHelper";
import BadRequestError from "../utils/errors/badRequest";
import NotFoundError from "../utils/errors/notFound";

export default class Controller {
  static addCart: RequestHandler = async (req, res, next) => {
    try {
      const cart = await Cart.create({
        user: req.user?._id,
        products: [
          {
            productId: req.body.productId,
            quantity: req.body.quantity,
          },
        ],
      });
      return responseHelper.successResponse(res, "Cart created successfully", cart);
    } catch (error) {
      next(error);
    }
  };

  static viewCart: RequestHandler = async (req, res, next) => {
    try {
      const carts = await Cart.find({ _id: req.user?._id });
      if (!carts) throw new NotFoundError("Empty cart, do add some products");
      return responseHelper.successResponse(res, "Products fetched successfully", carts);
    } catch (error) {
      next(error);
    }
  };

  //   static updateCart: RequestHandler = async (req, res, next) => {};
}
