import { RequestHandler } from "express";
import Cart from "../modules/carts/schema";
import { responseHelper } from "../utils/responseHelper";
import BadRequestError from "../utils/errors/badRequest";
import NotFoundError from "../utils/errors/notFound";
import Product from "../modules/products/schema";

export default class Controller {
  static addCart: RequestHandler = async (req, res, next) => {
    const { productId, quantity } = req.body;

    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new BadRequestError({ message: "Product not found" });
      }
      // check if the added quantity is greater than the available quantity
      if (product.availableQuantity < quantity) {
        throw new BadRequestError({
          message: `Insufficient quantity, only ${product.availableQuantity} items are available.
          For more items, please contact the seller.`,
        });
      }
      //Create a new cart or update an existing cart in a single operation
      const cart = await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $push: { products: { $each: [{ productId, quantity }], $position: 0 } } },
        { upsert: true, new: true }
      );

      if (!cart) {
        throw new BadRequestError({ message: "Failed to update cart" });
      }

      const newCart = cart.toObject();
      return responseHelper.successResponse(
        res,
        `Cart ${newCart.products.length > 1 ? "updated" : "created"} successfully`,
        newCart
      );
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
