import { Types } from "mongoose";

export interface IProduct {
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: CategoryEnum;
  availableQuantity: number;
  ratings: IRating[];
  reviews: string[];
  seller: Types.ObjectId;
  sales: number;
}

export enum CategoryEnum {
  FOOD = "food",
  ELECTRONICS = "electronics",
  CLOTHING = "clothing",
  FURNITURE = "furniture",
  OTHERS = "others",
}

export enum RatingEnum {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
}
export interface IRating {
  userId: Types.ObjectId;
  rating: RatingEnum;
}

export type Sort = { [key: string]: number };
