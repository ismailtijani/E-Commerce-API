import { Schema, model } from "mongoose";
import { RatingEnum, CategoryEnum, IProduct } from "./interface";

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Product name is required"],
      unique: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
    },
    category: {
      type: String,
      trim: true,
      lowercase: true,
      enum: Object.values(CategoryEnum),
      required: [true, "Product category is required"],
      default: CategoryEnum.OTHERS,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    imageUrl: {
      type: String,
      required: [true, "Product image is required"],
    },
    countInStock: {
      type: Number,
      required: [true, "Product quatity is required"],
    },
    rating: {
      type: Number,
      enum: Object.values(RatingEnum),
    },
    reviews: [
      {
        type: String,
      },
    ],
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sales: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Product = model<IProduct>("Product", productSchema);
export default Product;
