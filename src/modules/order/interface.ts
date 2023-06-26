import { Types } from "mongoose";

export interface IOrder {
  user: Types.ObjectId;
  products: [
    {
      product: Types.ObjectId;
      quantity: number;
    }
  ];
  totalPrice: number;
  payment: {
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    isPaid: boolean;
    paidAt: Date;
    paymentResult: {
      orderId: string;
      payerID: string;
      paymentId: string;
    };
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
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}
