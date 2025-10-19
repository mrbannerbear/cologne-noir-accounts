'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Product } from '@/lib/types';
import { useForm } from 'react-hook-form';

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from<'products', Product>('products').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const { register, handleSubmit, reset, setValue } = useForm<Product>();

  const saveProduct = useMutation({
    mutationFn: async (product: Product) => {
      if (editingId) {
        const { data, error } = await supabase.from('products').update(product).eq('id', editingId);
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from('products').insert([product]);
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      reset();
      setEditingId(null);
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const onSubmit = (data: Product) => saveProduct.mutate(data);

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setValue('name', p.name);
    setValue('price_10ml', p.price_10ml);
    setValue('price_15ml', p.price_15ml);
    setValue('price_30ml', p.price_30ml);
    setValue('price_100ml', p.price_100ml);
  };

  if (isLoading) return <div>Loading products...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      <table className="w-full border rounded overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">10ml</th>
            <th className="border p-2">15ml</th>
            <th className="border p-2">30ml</th>
            <th className="border p-2">100ml</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products?.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">{p.price_10ml}</td>
              <td className="border p-2">{p.price_15ml}</td>
              <td className="border p-2">{p.price_30ml}</td>
              <td className="border p-2">{p.price_100ml}</td>
              <td className="border p-2 flex gap-2">
                <button
                  className="bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500"
                  onClick={() => startEdit(p)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 px-2 py-1 rounded hover:bg-red-600"
                  onClick={() => deleteProduct.mutate(p.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {/* Inline add/edit row */}
          <tr className="bg-gray-50">
            <td className="border p-2">
              <input {...register('name')} placeholder="Name" className="border p-1 rounded w-full" />
            </td>
            <td className="border p-2">
              <input {...register('price_10ml')} placeholder="Price" className="border p-1 rounded w-full" />
            </td>
            <td className="border p-2">
              <input {...register('price_15ml')} placeholder="Price" className="border p-1 rounded w-full" />
            </td>
            <td className="border p-2">
              <input {...register('price_30ml')} placeholder="Price" className="border p-1 rounded w-full" />
            </td>
            <td className="border p-2">
              <input {...register('price_100ml')} placeholder="Price" className="border p-1 rounded w-full" />
            </td>
            <td className="border p-2">
              <button
                className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                onClick={handleSubmit(onSubmit)}
              >
                {editingId ? 'Update' : 'Add'}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
