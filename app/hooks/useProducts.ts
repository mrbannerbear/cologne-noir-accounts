import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Product } from '@/lib/types';
import { useForm, SubmitHandler } from 'react-hook-form';

export function useProducts() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  // 🟢 Fetch all products
  const productsQuery = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  // 🟢 React Hook Form setup
  const form = useForm<Product>({
    defaultValues: {
      name: '',
      brand: '',
      sku: '',
      gender: 'Unisex',
      season: "",
      top_notes: [""],
      middle_notes: [""],
      base_notes: [""],
      price_10ml: 0,
      price_15ml: 0,
      price_30ml: 0,
      price_100ml: 0,
      low_stock_threshold_ml: 0,
      active: true,
    },
  });

  // 🟢 Add or Update product
  const saveProductMutation = useMutation({
    mutationFn: async (product: Product) => {
      if (editingId) {
        const { data, error } = await supabase
          .from('products')
          .update(product)
          .eq('id', editingId)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([product])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      // 🔄 Optimistically update cache
      queryClient.setQueryData<Product[]>(['products'], (old) =>
        old ? [data, ...old.filter((p) => p.id !== data.id)] : [data]
      );
      form.reset();
      setEditingId(null);
    },
  });

  // 🗑️ Delete product
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // ✏️ Start edit
  const startEdit = (product: Product) => {
    setEditingId(product.id);
    form.reset(product);
  };

  const onSubmit: SubmitHandler<Product> = (data) => saveProductMutation.mutate(data);

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
