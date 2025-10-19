import { z } from 'zod';

// --- Quantities ---
export const quantitySchema = z.object({
  id: z.string(),
  label: z.string(),
  value_ml: z.number(),
});

export type Quantity = z.infer<typeof quantitySchema>;

// --- Products ---
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  price_10ml: z.number(),
  price_15ml: z.number(),
  price_30ml: z.number(),
  price_100ml: z.number(),
});

export type Product = z.infer<typeof productSchema>;

// --- Customers ---
export const customerSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string().optional(),
  email: z.string().optional(),
});

export type Customer = z.infer<typeof customerSchema>;

// --- Orders ---
export const orderSchema = z.object({
  id: z.string(),
  price: z.number(),
  custom_price: z.number().nullable().optional(),
  custom_quantity_ml: z.number().nullable().optional(),
  created_at: z.string(),
  customer: customerSchema.optional(),
  product: productSchema.optional(),
  quantity: quantitySchema.optional(),
});

export type Order = z.infer<typeof orderSchema>;
