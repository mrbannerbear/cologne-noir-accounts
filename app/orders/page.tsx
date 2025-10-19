'use client';

import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { useOrders } from '../hooks/useOrders';

export default function OrdersPage() {
  const {
    ordersQuery,
    productsQuery,
    quantitiesQuery,
    filteredCustomers,
    customerSearch,
    setCustomerSearch,
    editingOrderId,
    setEditingOrderId,
    form,
    onSubmit,
    deleteOrderMutation,
  } = useOrders();

  const { register, handleSubmit, reset, setValue, watch } = form;

  if (ordersQuery.isLoading) return <div>Loading...</div>;

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
            {/* Form Row */}
            <tr className="bg-blue-50">
              {/* Customer */}
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
                {(filteredCustomers?.length ?? 0) > 0 && (
                  <ul className="absolute bg-white border rounded shadow max-h-32 overflow-y-auto z-10 mt-1">
                    {filteredCustomers?.map(c => (
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

              {/* Product */}
              <td className="p-2">
                <select {...register('product_id')} className="border rounded p-1 w-full">
                  <option value="">Select product</option>
                  {productsQuery.data?.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </td>

              {/* Quantity */}
              <td className="p-2">
                <select {...register('quantity_id')} className="border rounded p-1 w-full">
                  <option value="">Select qty</option>
                  {quantitiesQuery.data?.map(q => (
                    <option key={q.id} value={q.id}>{q.label}</option>
                  ))}
                </select>
                <input
                  {...register('custom_quantity_ml')}
                  placeholder="Custom ml"
                  className="border rounded p-1 mt-1 w-full"
                />
              </td>

              {/* Price */}
              <td className="p-2">
                <input
                  {...register('price')}
                  readOnly
                  className="border rounded p-1 w-full bg-gray-50"
                />
              </td>

              {/* Custom Price */}
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
                    onClick={() => { setEditingOrderId(null); reset(); }}
                    className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                  >
                    <FaTimes />
                  </button>
                )}
              </td>
            </tr>

            {/* Existing Orders */}
            {ordersQuery.data?.map(o => (
              <tr key={o.id} className={editingOrderId === o.id ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
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
                      setValue('custom_quantity_ml', o.custom_quantity_ml?.toString() || '');
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
