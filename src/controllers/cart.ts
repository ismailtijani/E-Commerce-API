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
      else if (product.availableQuantity < req.body.quantity) {
        throw new BadRequestError(
          "Insufficient quantity, only " +
            product.availableQuantity +
            " items are available." +
            " For more items, please contact the seller."
        );
      } else next();
    } catch (error) {
      next(error);
    }
  };

  static addCart: RequestHandler = async (req, res, next) => {
    const { productId, quantity } = req.body;

    try {
      //Create a new cart or update an existing cart in a single operation
      let cart = await Cart.findOne({ user: req.user._id });

      if (!cart) {
        cart = new Cart({ user: req.user._id, products: [] });
      }

      const existingProductIndex = cart.products.findIndex(
        (product) => product.productId.toString() === productId.toString()
      );

      if (existingProductIndex !== -1) {
        cart.products[existingProductIndex].quantity = quantity;
      } else {
        cart.products.push({ productId, quantity });
      }

      await cart.save(); // Save the updated cart
      return responseHelper.successResponse(
        res,
        `Cart ${cart.products.length > 1 ? "updated" : "created"} successfully`,
        cart
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

  static deleteCart: RequestHandler = async (req, res, next) => {
    try {
      const cart = await Cart.findOne({ user: req.user._id });

      if (!cart) {
        throw new NotFoundError("Unable to delete item");
      }

      const removedProductIndex = cart.products.findIndex(
        (product) => product.productId.toString() === req.params._id
      );

      if (removedProductIndex === -1) {
        throw new BadRequestError("Product not found in your cart");
      }

      cart.products.splice(removedProductIndex, 1); // Remove the product from the array

      await cart.save(); // Save the updated cart after product removal

      return responseHelper.successResponse(res, "Item deleted from cart successfully");
    } catch (error) {
      next(error);
    }
  };
}
