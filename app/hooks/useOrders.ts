import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Order, Product, Customer, Quantity, orderSchema, productSchema, customerSchema, quantitySchema } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// --- Form schema ---
export const orderFormSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  product_id: z.string().min(1, 'Product is required'),
  quantity_id: z.string().min(1, 'Quantity is required'),
  custom_quantity_ml: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
  custom_price: z.string().optional(),
  status: z.enum(['Pending','Confirmed','Shipped','Delivered','Cancelled']),
  payment_status: z.enum(['Paid','Partial','Unpaid']),
  payment_method: z.enum(['Cash','bKash','Bank','Card']).optional(),
  discount: z.string().optional(),
  delivery_fee: z.string().optional(),
  product_cost: z.string().optional(),
  notes: z.string().optional(),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

export function useOrders() {
  const queryClient = useQueryClient();
  const [customerSearch, setCustomerSearch] = useState('');
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  // --- Orders query ---
  const ordersQuery = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_code,
          price,
          custom_price,
          custom_quantity_ml,
          status,
          payment_status,
          payment_method,
          discount,
          delivery_fee,
          product_cost,
          profit,
          total,
          notes,
          created_at,
          customer:customers(id, name, phone),
          product:products(
            id,
            name,
            price_10ml,
            price_15ml,
            price_30ml,
            price_100ml,
            total_stock_ml,
            low_stock_threshold_ml,
            active
          ),
          quantity:quantities(id, label, value_ml)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // --- Safe parsing to avoid crashing on invalid data ---
      const parsed = (data || []).map(d => {
        const result = orderSchema
          .extend({
            product: productSchema.partial().nullable().optional(),
            customer: customerSchema.nullable().optional(),
            quantity: quantitySchema.nullable().optional(),
          })
          .safeParse(d);

        if (!result.success) {
          console.error('Order parse error', result.error, d);
          return null;
        }

        return result.data;
      }).filter(Boolean) as Order[];

      return parsed;
    },
  });

  // --- Supporting queries ---
  const customersQuery = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase.from<'customers', Customer>('customers').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const productsQuery = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from<'products', Product>('products').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const quantitiesQuery = useQuery<Quantity[]>({
    queryKey: ['quantities'],
    queryFn: async () => {
      const { data, error } = await supabase.from<'quantities', Quantity>('quantities').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  // --- Filtered customers ---
  const filteredCustomers = customersQuery.data?.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // --- Form setup ---
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
  });

  const { watch, setValue, reset } = form;
  const watchProductId = watch('product_id');
  const watchQuantityId = watch('quantity_id');

  // --- Auto price calculation ---
  useEffect(() => {
    if (!productsQuery.data || !quantitiesQuery.data) return;

    const product = productsQuery.data.find(p => p.id === watchProductId);
    const quantity = quantitiesQuery.data.find(q => q.id === watchQuantityId);

    if (product && quantity) {
      let price = 0;
      switch (quantity.value_ml) {
        case 10: price = product.price_10ml; break;
        case 15: price = product.price_15ml; break;
        case 30: price = product.price_30ml; break;
        case 100: price = product.price_100ml; break;
        default: price = (product.price_10ml / 10) * quantity.value_ml;
      }
      setValue('price', price.toString());
    }
  }, [watchProductId, watchQuantityId, productsQuery.data, quantitiesQuery.data, setValue]);

  // --- Mutations ---
  const addOrderMutation = useMutation({
    mutationFn: async (newOrder: any) => {
      const { data, error } = await supabase.from('orders').insert([newOrder]);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      reset();
      setCustomerSearch('');
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (updatedOrder: any) => {
      const { data, error } = await supabase
        .from('orders')
        .update(updatedOrder)
        .eq('id', updatedOrder.id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setEditingOrderId(null);
      reset();
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  // --- Submit handler ---
  const onSubmit = async (values: OrderFormValues) => {
    let customerId = values.customer_id;

    if (!customersQuery.data?.some(c => c.id === values.customer_id)) {
      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert([{ name: values.customer_id }])
        .select()
        .single();
      if (error) return;
      customerId = newCustomer.id;
    }

    const orderData = {
      customer_id: customerId,
      product_id: values.product_id,
      quantity_id: values.quantity_id,
      custom_quantity_ml: values.custom_quantity_ml ? parseInt(values.custom_quantity_ml) : null,
      price: parseFloat(values.price),
      custom_price: values.custom_price ? parseFloat(values.custom_price) : null,
      status: values.status,
      payment_status: values.payment_status,
      payment_method: values.payment_method || null,
      discount: values.discount ? parseFloat(values.discount) : 0,
      delivery_fee: values.delivery_fee ? parseFloat(values.delivery_fee) : 0,
      product_cost: values.product_cost ? parseFloat(values.product_cost) : 0,
      notes: values.notes || null,
    };

    if (editingOrderId) {
      updateOrderMutation.mutate({ ...orderData, id: editingOrderId });
    } else {
      addOrderMutation.mutate(orderData);
    }
  };

  return {
    ordersQuery,
    customersQuery,
    productsQuery,
    quantitiesQuery,
    filteredCustomers,
    customerSearch,
    setCustomerSearch,
    editingOrderId,
    setEditingOrderId,
    form,
    onSubmit,
    addOrderMutation,
    updateOrderMutation,
    deleteOrderMutation,
  };
}
