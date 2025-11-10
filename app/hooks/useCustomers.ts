import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Customer } from "@/lib/types";
import { useForm } from "react-hook-form";

export function useCustomers() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- Fetch Customers ---
  const customersQuery = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from<"customers", Customer>("customers")
        .select("*");
      if (error) throw error;
      return data || [];
    },
  });

  // --- Form setup ---
  const form = useForm<Customer>({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      customer_type: "New",
      notes: "",
      total_orders: 0,
      total_spent: 0,
    },
  });

  // --- Add / Update Customer ---
  const saveCustomerMutation = useMutation({
    mutationFn: async (customer: Customer) => {
      if (editingId) {
        const { data, error } = await supabase
          .from("customers")
          .update(customer)
          .eq("id", editingId);
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("customers")
          .insert([customer]);
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      form.reset();
      setEditingId(null);
    },
  });

  // --- Delete Customer ---
  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });

  const startEdit = (c: Customer) => {
    setEditingId(c.id);
    form.setValue("name", c.name);
    form.setValue("phone", c.phone);
    form.setValue("email", c.email);
  };

  const onSubmit = (data: Customer) => saveCustomerMutation.mutate(data);

  return {
    customersQuery,
    form,
    editingId,
    setEditingId,
    saveCustomerMutation,
    deleteCustomerMutation,
    startEdit,
    onSubmit,
  };
}
