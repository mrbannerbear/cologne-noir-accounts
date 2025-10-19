'use client';

import { useCustomers } from '../hooks/useCustomers';

export default function CustomersPage() {
  const {
    customersQuery,
    form,
    editingId,
    startEdit,
    deleteCustomerMutation,
    onSubmit,
  } = useCustomers();

  const { register, handleSubmit } = form;

  if (customersQuery.isLoading) return <div>Loading customers...</div>;

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
          {/* Existing customers */}
          {customersQuery.data?.map(c => (
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
                  onClick={() => deleteCustomerMutation.mutate(c.id)}
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
