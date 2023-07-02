import { RequestHandler } from "express";
import Product from "../modules/products/schema";
import { responseHelper } from "../utils/responseHelper";
import BadRequestError from "../utils/errors/badRequest";
import ServerError from "../utils/errors/serverError";
import { Sort } from "../modules/products/interface";

export default class Controller {
  // create a new product by registered user
  static createProduct: RequestHandler = async (req, res, next) => {
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
        return res.status(400).json({ STATUS: "FAILURE", MESSAGE: "Product name already exists" });
      next(error);
    }
  };

  // get all products uploaded by all users (Admin)
  static getAllProducts: RequestHandler = async (req, res, next) => {
    try {
      const products = await Product.find();
      if (products.length === 0) throw new BadRequestError({ message: "No product found" });
      return responseHelper.successResponse(res, "All products fetched", products);
    } catch (error) {
      next(error);
    }
  };

  // GET ALL PRODUCTS UPLOADED BY A SPECIFIC USER (Vendor)

  //GET /products?category=electronics     ======>>>>> FILTER
  //GET /products?limit=2&skip=2             ======>>>>> PAGINATION
  //GET /products?sortBy=createdAt:desc      ======>>>>> SORT
  static getProductsByUser: RequestHandler = async (req, res, next) => {
    const sort: Sort = {};
    if (req.query.sortBy) {
      const splitted = (req.query.sortBy as string).split(":");
      sort[splitted[0] as keyof typeof sort] = splitted[1] === "desc" ? -1 : 1;
    }
    try {
      await req.user?.populate({
        path: "products",
        options: {
          limit: parseInt(req.query.limit as string),
          skip: parseInt(req.query.skip as string),
          sort,
        },
      });

      //Get all user products
      const products = req.user?.products;

      if (products?.length === 0)
        throw new BadRequestError({ message: "No product found, do upload some products 😊" });

      return responseHelper.successResponse(res, "All products fetched", products);
    } catch (error) {
      next(error);
    }
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
      const updatedData = await Product.findOneAndUpdate({ _id: req.params._id }, req.body, {
        new: true,
        runValidators: true,
      });
      if (!updatedData) throw new BadRequestError({ message: "Update failed" });
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

  // Get top products by highest number of ratings and review (Admin & Vendor)
  static getTopProducts: RequestHandler = async (req, res, next) => {
    const sortField = req.query.sortField?.toString() || "rating";
    const sortOrder = parseInt(req.query.sortOrder?.toString() as string) || -1;
    const limit = parseInt(req.query.limit?.toString() as string) || 5;
    const pipeline = [
      { $sort: { [sortField]: sortOrder } as Record<string, -1 | 1> },
      { $limit: limit },
    ];
    try {
      const products = await Product.aggregate(pipeline);
      if (products.length === 0) throw new BadRequestError({ message: "No product found" });
      return responseHelper.successResponse(res, "Top products fecthed successfully", products);
    } catch (error) {
      next(error);
    }
  };

  // advance search for products (Admin & Vendor)
  static advanceSearch: RequestHandler = async (req, res, next) => {
    const { name, category } = req.params;
    try {
      const product = await Product.find({
        name: {
          $regex: name,
          $options: "i",
        },
        category: {
          $regex: category,
          $options: "i",
        },
      });
      if (!product) throw new BadRequestError({ message: "Product not found" });
      responseHelper.successResponse(res, "Product fetched successfully", product);
    } catch (error) {
      next(error);
    }
  };
}
