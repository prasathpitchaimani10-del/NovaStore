import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product: any;
  name: string;
  qty: number;
  price: number;
  image: string;
}

export interface IShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface IPaymentResult {
  id?: string;
  status?: string;
  update_time?: string;
  email_address?: string;
  last4?: string;
}

export interface IOrder extends Document {
  _id: any;
  user: any;
  orderItems: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: 'credit_card' | 'paypal' | 'cod';
  paymentResult?: IPaymentResult;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  discountPrice: number;
  totalPrice: number;
  couponCode?: string;
  isPaid: boolean;
  paidAt?: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'US' },
    phone: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (v: IOrderItem[]) => Array.isArray(v) && v.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['credit_card', 'paypal', 'cod'],
      default: 'credit_card',
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
      last4: String,
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
      min: 0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
      min: 0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
      min: 0,
    },
    discountPrice: {
      type: Number,
      required: true,
      default: 0.0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
      min: 0,
    },
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const OrderModel = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);
