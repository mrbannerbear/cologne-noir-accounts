'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Order, Product, Customer, Quantity, orderSchema } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

// --- Form schema ---
const orderFormSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  product_id: z.string().min(1, 'Product is required'),
  quantity_id: z.string().min(1, 'Quantity is required'),
  custom_quantity_ml: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
  custom_price: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [customerSearch, setCustomerSearch] = useState('');
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  // --- Queries ---
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          price,
          custom_price,
          custom_quantity_ml,
          created_at,
          customer:customers(id, name, phone),
          product:products(id, name, price_10ml, price_15ml, price_30ml, price_100ml),
          quantity:quantities(id, label, value_ml)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return orderSchema.array().parse(data);
    },
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase.from<'customers', Customer>('customers').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from<'products', Product>('products').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: quantities } = useQuery<Quantity[]>({
    queryKey: ['quantities'],
    queryFn: async () => {
      const { data, error } = await supabase.from<'quantities', Quantity>('quantities').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const filteredCustomers = customers?.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // --- Form setup ---
  const { register, handleSubmit, reset, watch, setValue } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
  });

  const watchProductId = watch('product_id');
  const watchQuantityId = watch('quantity_id');

  useEffect(() => {
    if (!products || !quantities) return;

    const product = products.find((p) => p.id === watchProductId);
    const quantity = quantities.find((q) => q.id === watchQuantityId);

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
  }, [watchProductId, watchQuantityId, products, quantities, setValue]);

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

  const onSubmit = async (values: OrderFormValues) => {
    let customerId = values.customer_id;

    if (!customers?.some(c => c.id === values.customer_id)) {
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
    };

    if (editingOrderId) {
      updateOrderMutation.mutate({ ...orderData, id: editingOrderId });
    } else {
      addOrderMutation.mutate(orderData);
    }
  };

  if (ordersLoading) return <div>Loading...</div>;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Orders</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border shadow rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Quantity</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Custom Price</th>
              <th className="p-3 text-left">Created At</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Inline Form Row */}
            <tr className="bg-blue-50">
              <td className="p-2">
                <input
                  {...register('customer_id')}
                  value={customerSearch}
                  onChange={e => {
                    setCustomerSearch(e.target.value);
                    setValue('customer_id', e.target.value);
                  }}
                  placeholder="Type to search / add"
                  className="border rounded p-1 w-full"
                />
                {filteredCustomers && filteredCustomers.length > 0 && (
                  <ul className="absolute bg-white border rounded shadow max-h-32 overflow-y-auto z-10 mt-1">
                    {filteredCustomers.map(c => (
                      <li
                        key={c.id}
                        className="p-1 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setValue('customer_id', c.id);
                          setCustomerSearch(c.name);
                        }}
                      >
                        {c.name} ({c.phone})
                      </li>
                    ))}
                  </ul>
                )}
              </td>
              <td className="p-2">
                <select {...register('product_id')} className="border rounded p-1 w-full">
                  <option value="">Select product</option>
                  {products?.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </td>
              <td className="p-2">
                <select {...register('quantity_id')} className="border rounded p-1 w-full">
                  <option value="">Select qty</option>
                  {quantities?.map(q => (
                    <option key={q.id} value={q.id}>{q.label}</option>
                  ))}
                </select>
                <input
                  {...register('custom_quantity_ml')}
                  placeholder="Custom ml"
                  className="border rounded p-1 mt-1 w-full"
                />
              </td>
              <td className="p-2">
                <input
                  {...register('price')}
                  readOnly
                  className="border rounded p-1 w-full bg-gray-50"
                />
              </td>
              <td className="p-2">
                <input
                  {...register('custom_price')}
                  placeholder="Optional"
                  className="border rounded p-1 w-full"
                />
              </td>
              <td className="p-2">-</td>
              <td className="p-2 flex gap-2">
                <button
                  onClick={handleSubmit(onSubmit)}
                  className="bg-green-600 text-white p-1 rounded hover:bg-green-700"
                >
                  <FaSave />
                </button>
                {editingOrderId && (
                  <button
                    onClick={() => {
                      setEditingOrderId(null);
                      reset();
                    }}
                    className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                  >
                    <FaTimes />
                  </button>
                )}
              </td>
            </tr>

            {/* Existing orders */}
            {orders?.map(o => (
              <tr
                key={o.id}
                className={editingOrderId === o.id ? 'bg-yellow-50' : 'hover:bg-gray-50'}
              >
                <td className="p-2">{o.customer?.name}</td>
                <td className="p-2">{o.product?.name}</td>
                <td className="p-2">{o.custom_quantity_ml ?? o.quantity?.label}</td>
                <td className="p-2">{o.price}</td>
                <td className="p-2">{o.custom_price ?? '-'}</td>
                <td className="p-2">{new Date(o.created_at).toLocaleString()}</td>
                <td className="p-2 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingOrderId(o.id);
                      setValue('customer_id', o.customer?.id || '');
                      setCustomerSearch(o.customer?.name || '');
                      setValue('product_id', o.product?.id || '');
                      setValue('quantity_id', o.quantity?.id || '');
                      setValue('price', o.price.toString());
                      setValue('custom_price', o.custom_price?.toString() || '');
                      setValue(
                        'custom_quantity_ml',
                        o.custom_quantity_ml?.toString() || ''
                      );
                    }}
                    className="bg-yellow-400 text-white p-1 rounded hover:bg-yellow-500"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => deleteOrderMutation.mutate(o.id)}
                    className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
