import { Types } from "mongoose";

export default interface ICart {
  user: Types.ObjectId;
  items: [
    {
      productId: Types.ObjectId;
      quantity: number;
    }
  ];
}
