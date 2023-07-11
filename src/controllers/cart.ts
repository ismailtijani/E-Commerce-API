import { RequestHandler } from "express";
import Cart from "../modules/carts/schema";
import { responseHelper } from "../utils/responseHelper";
import BadRequestError from "../utils/errors/badRequest";
import NotFoundError from "../utils/errors/notFound";

export default class Controller {
  static addCart: RequestHandler = async (req, res, next) => {
    try {
      //TODO: Write some logic to check available quanity and inform the user accordingly
      const cart = await Cart.create({
        user: req.user._id,
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
      const carts = await req.user?.populate({ path: "carts" });
      if (!carts) throw new NotFoundError("Empty cart, do add some products");
      return responseHelper.successResponse(res, "Products fetched successfully", carts);
    } catch (error) {
      next(error);
    }
  };

  static updateCart: RequestHandler = async (req, res, next) => {
    try {
      const updatedCart = await Cart.findOneAndUpdate({ _id: req.params._id }, req.body, {
        new: true,
        runValidators: true,
      });
      if (!updatedCart) throw new BadRequestError({ message: "Update failed" });
      return responseHelper.successResponse(res, "Item updated successfully", updatedCart);
    } catch (error) {
      next(error);
    }
  };

  static deleteCart: RequestHandler = async (req, res, next) => {
    try {
      const item = await Cart.findByIdAndDelete({ _id: req.params._id });
      if (item) throw new NotFoundError("Unable to delete item");
      return responseHelper.successResponse(res, "Item deleted from cart successfully");
    } catch (error) {
      next(error);
    }
  };
}
