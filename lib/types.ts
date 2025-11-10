import { z } from 'zod';

// Order schema with new date fields
export const orderSchema = z.object({
  id: z.string(),
  order_code: z.string(),
  customer_id: z.string(),
  product_id: z.string(),
  quantity_id: z.string(),
  custom_quantity_ml: z.number().nullable().optional(),
  price: z.number(),
  custom_price: z.number().nullable().optional(),
  status: z.enum(['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']),
  payment_status: z.enum(['Paid', 'Partial', 'Unpaid']),
  payment_method: z.enum(['Cash', 'bKash', 'Bank', 'Card']).nullable().optional(),
  discount: z.number().default(0),
  delivery_fee: z.number().default(0),
  product_cost: z.number().default(0),
  profit: z.number().optional(),
  total: z.number().optional(),
  notes: z.string().nullable().optional(),
  order_date: z.string().optional(), // New field
  delivery_date: z.string().nullable().optional(), // New field
  created_at: z.string().optional(),
  customer: z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string().nullable().optional(),
  }).nullable().optional(),
  product: z.object({
    id: z.string(),
    name: z.string(),
    price_10ml: z.number(),
    price_15ml: z.number(),
    price_30ml: z.number(),
    price_100ml: z.number(),
    total_stock_ml: z.number(),
    low_stock_threshold_ml: z.number(),
    active: z.boolean(),
  }).nullable().optional(),
  quantity: z.object({
    id: z.string(),
    label: z.string(),
    value_ml: z.number(),
  }).nullable().optional(),
});

export type Order = z.infer<typeof orderSchema>;

// Customer schema
export const customerSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  customer_type: z.enum(['New', 'Regular', 'VIP']).default('New'),
  notes: z.string().nullable().optional(),
  total_orders: z.number().default(0),
  total_spent: z.number().default(0),
  last_order_date: z.string().nullable().optional(),
  created_at: z.string().optional(),
});

export type Customer = z.infer<typeof customerSchema>;

// Product schema
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string(),
  sku: z.string().nullable().optional(),
  gender: z.enum(['Male', 'Female', 'Unisex']),
  season: z.string().nullable().optional(),
  top_notes: z.array(z.string()).default([]),
  middle_notes: z.array(z.string()).default([]),
  base_notes: z.array(z.string()).default([]),
  price_10ml: z.number(),
  price_15ml: z.number(),
  price_30ml: z.number(),
  price_100ml: z.number(),
  total_stock_ml: z.number().default(0),
  low_stock_threshold_ml: z.number().default(100),
  active: z.boolean().default(true),
  created_at: z.string().optional(),
});

export type Product = z.infer<typeof productSchema>;

// Quantity schema
export const quantitySchema = z.object({
  id: z.string(),
  label: z.string(),
  value_ml: z.number(),
});

export type Quantity = z.infer<typeof quantitySchema>;