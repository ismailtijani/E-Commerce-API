import { Types } from "mongoose";

export default interface ICart {
  user: Types.ObjectId;
  products: [
    {
      productId: string;
      quantity: number;
    }
  ];
}
