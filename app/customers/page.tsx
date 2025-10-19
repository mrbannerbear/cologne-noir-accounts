'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Customer } from '@/lib/types';
import { useForm } from 'react-hook-form';

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- Fetch Customers ---
  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase.from<'customers', Customer>('customers').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  // --- Form setup ---
  const { register, handleSubmit, reset, setValue } = useForm<Customer>();

  // --- Add / Update Customer ---
  const saveCustomer = useMutation({
    mutationFn: async (customer: Customer) => {
      if (editingId) {
        const { data, error } = await supabase
          .from('customers')
          .update(customer)
          .eq('id', editingId);
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from('customers').insert([customer]);
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      reset();
      setEditingId(null);
    },
  });

  // --- Delete Customer ---
  const deleteCustomer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });

  const onSubmit = (data: Customer) => saveCustomer.mutate(data);

  const startEdit = (c: Customer) => {
    setEditingId(c.id);
    setValue('name', c.name);
    setValue('phone', c.phone);
    setValue('email', c.email);
  };

  if (isLoading) return <div>Loading customers...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customers</h1>

      <table className="w-full border rounded overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers?.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="border p-2">{c.name}</td>
              <td className="border p-2">{c.phone}</td>
              <td className="border p-2">{c.email}</td>
              <td className="border p-2 flex gap-2">
                <button
                  className="bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500"
                  onClick={() => startEdit(c)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 px-2 py-1 rounded hover:bg-red-600"
                  onClick={() => deleteCustomer.mutate(c.id)}
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
              <input {...register('phone')} placeholder="Phone" className="border p-1 rounded w-full" />
            </td>
            <td className="border p-2">
              <input {...register('email')} placeholder="Email" className="border p-1 rounded w-full" />
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
