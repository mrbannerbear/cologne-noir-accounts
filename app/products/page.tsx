'use client';

import { useProducts } from '../hooks/useProducts';

export default function ProductsPage() {
  const {
    productsQuery,
    form,
    editingId,
    startEdit,
    deleteProductMutation,
    onSubmit,
  } = useProducts();

  const { register, handleSubmit } = form;

  if (productsQuery.isLoading) return <div>Loading products...</div>;

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
          {/* Existing products */}
          {productsQuery.data?.map(p => (
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
                  onClick={() => deleteProductMutation.mutate(p.id)}
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
