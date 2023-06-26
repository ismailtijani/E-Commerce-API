import { Types } from "mongoose";

export default interface ICart {
  user: Types.ObjectId;
  products: [
    {
      product: Types.ObjectId;
      quantity: number;
    }
  ];
}
