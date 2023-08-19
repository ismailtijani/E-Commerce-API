import { Types } from "mongoose";

export default interface ICart {
  user: Types.ObjectId;
  products: [
    {
      productId: Types.ObjectId;
      quantity: number;
    }
  ];
}
