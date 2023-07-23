import { Schema, model } from "mongoose";
import { IOrder, OrderStatus, PaymentMethod } from "./interface";

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
      },
    ],
    totalPrice: Number,
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    payment: {
      paymentMethod: {
        type: String,
        enum: Object.values(PaymentMethod),
        default: PaymentMethod.CARD,
      },
      isPaid: {
        type: Boolean,
        default: false,
      },
      paidAt: Date,
      paymentId: String,
    },
    deliveryPrice: Number,
    deliveredAt: Date,
    shipping: {
      address: String,
      city: String,
      country: String,
    },
  },
  { timestamps: true }
);

const Order = model<IOrder>("Orders", orderSchema);
export default Order;
