import { RequestHandler } from "express";
import Product from "../modules/products/schema";
import { responseHelper } from "../utils/responseHelper";
import BadRequestError from "../utils/errors/badRequest";
import ServerError from "../utils/errors/serverError";

export default class Controller {
  // create a new product by registered user
  static uploadProduct: RequestHandler = async (req, res, next) => {
    const { _id } = req.user;
    const { name, price, description, imageUrl, category, countInStock } = req.body;
    try {
      const product = await Product.create({
        name,
        price,
        description,
        imageUrl,
        category,
        countInStock,
        seller: _id,
      });
      return responseHelper.createdResponse(res, "Product created succesfully", product);
    } catch (error: any) {
      // catch  E11000 duplicate key error
      if (error.code === 11000)
        return res.status(400).json({ message: "Product name already exists" });
      next(error);
    }
  };

  // get all products uploaded by all users (Admin)
  static getAllProducts: RequestHandler = async (req, res, next) => {
    try {
      const products = await Product.find();
      return responseHelper.successResponse(res, "All products fetched", products);
    } catch (error) {
      next(error);
    }
  };

  // get all products uploaded by a specific user (Vendor)
  static getProductsByUser: RequestHandler = async (req, res, next) => {
    const products = await Product.find({ seller: req.params._id });
    return responseHelper.successResponse(res, "All products fetched", products);
  };

  // get a specific product by id
  static getProductById: RequestHandler = async (req, res, next) => {
    try {
      const product = await Product.findById(req.params._id);
      if (product)
        return responseHelper.successResponse(res, "Product retrieved successfully", product);
    } catch (error) {
      next(error);
    }
  };

  // update a specific product by id (Admin and Vendor)
  static updateProduct: RequestHandler = async (req, res, next) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "price", "description", "imageUrl", "category", "countInStock"];
    try {
      if (updates.length === 0) throw new BadRequestError({ message: "Invalid update!" });
      const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
      if (!isValidOperation) throw new BadRequestError({ message: "Invalid update" });
      // const product: any = await Product.findById(req.params._id);
      // if (!product) throw new BadRequestError({ message: "Product not found" });
      // updates.forEach((update) => (product[update] = req.body[update]));
      // await product.save();
      const updatedData = await Product.findOneAndUpdate({ _id: req.params._id }, updates, {
        new: true,
        runValidators: true,
      });
      if (!updatedData) throw new ServerError("Update failed, please try again");
      return responseHelper.successResponse(res, "Product updated successfully✅", updatedData);
    } catch (error) {
      next(error);
    }
  };

  // delete a specific product by id (Admin and Vendor)
  static deleteProduct: RequestHandler = async (req, res, next) => {
    try {
      const product = await Product.findByIdAndDelete(req.params._id);
      if (!product) throw new BadRequestError({ message: "Product not found" });
      return responseHelper.successResponse(res, "Producted deleted successfully");
    } catch (error) {
      next(error);
    }
  };

  // top 5 products by highest number of ratings
  static getTopProducts: RequestHandler = async (req, res, next) => {
    const sortField = req.query.sortField?.toString() || "rating";
    const sortOrder = parseInt(req.query.sortOrder?.toString()) || -1;
    const limit = parseInt(req.query.limit?.toString()) || 5;
    const pipeline = [{ $sort: { [sortField]: sortOrder } }, { $limit: limit }];
    try {
      const products = await Product.aggregate(pipeline);
      return responseHelper.successResponse(res, "Top products fecthed successfully", products);
    } catch (error) {
      next(error);
    }
  };
}

// A USER CAN VIEW THEIR TRANSACTION HISTORY.

//GET /transaction/transaction_history?transaction_type=debit     ======>>>>> FILTER
//GET /transaction/transaction_history?limit=2&skip=2             ======>>>>> PAGINATION
//GET /transaction/transaction_history?sortBy=createdAt:desc      ======>>>>> SORT
// static viewTransactionHistory: RequestHandler = async (req, res, next) => {
//   const match = {} as IMatch;
//   const sort: Sort = {};

//   //Check if user is quering by transaction type
//   if (req.query.transaction_type)
//     match.transaction_type = req.query.transaction_type === "credit" ? "credit" : "debit";
//   //Check if user is sorting in ascending or descending order
//   if (req.query.sortBy) {
//     const splitted = (req.query.sortBy as string).split(":");
//     sort[splitted[0] as keyof typeof sort] = splitted[1] === "desc" ? -1 : 1;
//   }

//   try {
//     await req.user?.populate({
//       path: "transactions",
//       match,
//       options: {
//         limit: parseInt(req.query.limit as string),
//         skip: parseInt(req.query.skip as string),
//         sort,
//       },
//     });
//     //Get all user transactions
//     const transactions = req.user?.transactions;

//     if (transactions?.length === 0)
//       throw new AppError({
//         message: "No transaction record, do make some transactions 😊",
//         statusCode: responseStatusCodes.NOT_FOUND,
//       });

//     return responseHelper.successResponse(res, transactions);
//   } catch (error) {
//     next(error);
//   }
// };
