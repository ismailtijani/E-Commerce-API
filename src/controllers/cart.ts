import { RequestHandler } from "express";
import Cart from "../modules/carts/schema";
import { responseHelper } from "../utils/responseHelper";
import BadRequestError from "../utils/errors/badRequest";
import NotFoundError from "../utils/errors/notFound";
import Product from "../modules/products/schema";

export default class Controller {
  static checkIfProductExist: RequestHandler = async (req, res, next) => {
    try {
      //Check the Product availability and quantity
      const product = await Product.findById(req.body.productId, "availableQuantity");
      if (!product) {
        throw new BadRequestError("Product not found");
      }
      // check if the added quantity is greater than the available quantity
      if (product.availableQuantity < req.body.quantity) {
        throw new BadRequestError(
          "Insufficient quantity, only " +
            product.availableQuantity +
            " items are available." +
            " For more items, please contact the seller."
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };

  static addCart: RequestHandler = async (req, res, next) => {
    const { productId, quantity } = req.body;

    try {
      //Create a new cart or update an existing cart in a single operation
      const cart = await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $push: { products: { $each: [{ productId, quantity }], $position: 0 } } },
        { upsert: true, new: true }
      );

      if (!cart) {
        throw new BadRequestError("Failed to update cart");
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
      await req.user?.populate({ path: "carts" });
      const carts = req.user.carts;
      if (!carts || carts.length === 0) throw new NotFoundError("Empty cart, do add some products");
      return responseHelper.successResponse(res, "Cart fetched successfully", carts);
    } catch (error) {
      next(error);
    }
  };

  static updateCart: RequestHandler = async (req, res, next) => {
    const { productId, quantity } = req.body as { productId: string; quantity: number };
    const cartId = req.params._id;
    try {
      // Find the cart and update the quantity directly in the database
      const updatedCart = await Cart.findOneAndUpdate(
        {
          _id: cartId,
          "products.productId": productId,
        },
        { $set: { "products.$.quantity": quantity } },
        { new: true, lean: true }
      );

      if (!updatedCart) {
        throw new BadRequestError(
          `Product with the ID ${productId} is not available in your cart.`
        );
      }

      return responseHelper.successResponse(res, "Item updated successfully", updatedCart);
    } catch (error) {
      next(error);
    }
  };

  static deleteCart: RequestHandler = async (req, res, next) => {
    try {
      const item = await Cart.findByIdAndDelete({ _id: req.params._id });
      if (!item) throw new NotFoundError("Unable to delete item");
      return responseHelper.successResponse(res, "Item deleted from cart successfully");
    } catch (error) {
      next(error);
    }
  };
}
