import { Types } from "mongoose";

export interface IOrder {
  userId: Types.ObjectId;
  products: [
    {
      productId: Types.ObjectId;
      quantity: number;
    }
  ];
  totalPrice: number;
  payment: {
    paymentMethod: PaymentMethod;
    isPaid: boolean;
    paidAt: Date;
    paymentId: string;
  };
  deliveryPrice: number;
  status: OrderStatus;
  //   isDelivered: boolean;
  deliveredAt: Date;
  shipping: {
    address: string;
    city: string;
    country: string;
  };
}

export enum PaymentMethod {
  CASH = "cash",
  CARD = "card",
}

export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}
