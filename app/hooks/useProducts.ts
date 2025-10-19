import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Product } from '@/lib/types';
import { useForm } from 'react-hook-form';

export function useProducts() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- Queries ---
  const productsQuery = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from<'products', Product>('products').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  // --- Form setup ---
  const form = useForm<Product>();

  const saveProductMutation = useMutation({
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
      form.reset();
      setEditingId(null);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    form.setValue('name', p.name);
    form.setValue('price_10ml', p.price_10ml);
    form.setValue('price_15ml', p.price_15ml);
    form.setValue('price_30ml', p.price_30ml);
    form.setValue('price_100ml', p.price_100ml);
  };

  const onSubmit = (data: Product) => saveProductMutation.mutate(data);

  return {
    productsQuery,
    form,
    editingId,
    setEditingId,
    saveProductMutation,
    deleteProductMutation,
    startEdit,
    onSubmit,
  };
}
