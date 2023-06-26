import { Schema, model } from "mongoose";
import { IOrder, OrderStatus, PaymentMethod, PaymentStatus } from "./interface";

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    products: [
      {
        product: {
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
      paymentStatus: {
        type: String,
        enum: Object.values(PaymentStatus),
        default: PaymentStatus.PENDING,
      },
      isPaid: {
        type: Boolean,
        default: false,
      },
      paidAt: Date,
      paymentResult: {
        payerID: String,
        paymentId: String,
        orderId: String,
      },
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
