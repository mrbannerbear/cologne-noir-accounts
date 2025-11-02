'use client';

import { useEffect, useRef, useState } from 'react';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaSearch } from 'react-icons/fa';
import { useOrders } from '../hooks/useOrders';
import gsap from 'gsap';

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
  const [showForm, setShowForm] = useState(false);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  const formRef = useRef<HTMLDivElement | null>(null);
  const ordersRef = useRef<(HTMLElement | null)[]>([]);
  const headerRef = useRef<HTMLDivElement | null>(null);

  const watchProductId = watch('product_id');
  const watchQuantityId = watch('quantity_id');

  // Animate header on mount
  useEffect(() => {
    if (headerRef.current) {
      gsap.from(headerRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out'
      });
    }
  }, []);

  // Animate form opening
  useEffect(() => {
    if (showForm && formRef.current) {
      gsap.from(formRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out'
      });
    }
  }, [showForm]);

  // Animate orders list
  useEffect(() => {
    ordersRef.current.forEach((el, i) => {
      if (el) {
        gsap.from(el, {
          x: -20,
          opacity: 0,
          duration: 0.4,
          delay: i * 0.05,
          ease: 'power2.out'
        });
      }
    });
  }, [ordersQuery.data]);

  const handleEdit = (order: any) => {
    setEditingOrderId(order.id);
    setShowForm(true);
    setValue('customer_id', order.customer?.id || '');
    setCustomerSearch(order.customer?.name || '');
    setValue('product_id', order.product?.id || '');
    setValue('quantity_id', order.quantity?.id || '');
    setValue('price', order.price.toString());
    setValue('custom_price', order.custom_price?.toString() || '');
    setValue('custom_quantity_ml', order.custom_quantity_ml?.toString() || '');
    setValue('status', order.status);
    setValue('payment_status', order.payment_status);
    setValue('payment_method', order.payment_method || '');
    setValue('discount', order.discount?.toString() || '');
    setValue('delivery_fee', order.delivery_fee?.toString() || '');
    setValue('product_cost', order.product_cost?.toString() || '');
    setValue('notes', order.notes || '');
    
    gsap.to(formRef.current, {
      scale: 1.02,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    });
  };

  const handleDelete = (id: string) => {
    const element = ordersRef.current.find(el => el?.dataset.orderId === id.toString());
    if (element) {
      gsap.to(element, {
        x: 100,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => deleteOrderMutation.mutate(id)
      });
    } else {
      deleteOrderMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    setEditingOrderId(null);
    reset();
    setShowForm(false);
    setIsCustomerDropdownOpen(false);
  };

  const handleSubmitWithAnimation = async (data: any) => {
    await onSubmit(data);
    if (formRef.current) {
      gsap.to(formRef.current, {
        scale: 1,
        duration: 0.1,
        yoyo: true,
        repeat: 1
      });
    }
    setShowForm(false);
    reset();
    setIsCustomerDropdownOpen(false);
  };

  if (ordersQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Orders</h1>
          <p className="text-gray-800">Manage your customer orders</p>
        </div>

        {/* Add Order Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <FaPlus className="text-sm" />
            <span className="font-medium">New Order</span>
          </button>
        )}

        {/* Order Form */}
        {showForm && (
          <div
            ref={formRef}
            className="mb-6 bg-white rounded-2xl shadow-xl p-6 border border-slate-200 overflow-hidden pb-4"
          >
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              {editingOrderId ? 'Edit Order' : 'Create New Order'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Customer */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-2">Customer</label>
                <div className="relative">
                  <input
                    {...register('customer_id')}
                    value={customerSearch}
                    onChange={e => {
                      setCustomerSearch(e.target.value);
                      setValue('customer_id', e.target.value);
                      setIsCustomerDropdownOpen(true);
                    }}
                    onFocus={() => setIsCustomerDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsCustomerDropdownOpen(false), 150)}
                    placeholder="Search or add customer"
                    className="w-full px-4 py-2.5 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <FaSearch className="absolute left-3 top-3.5 text-slate-400 text-sm" />
                </div>
                {isCustomerDropdownOpen && (filteredCustomers?.length ?? 0) > 0 && (
                  <ul className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {filteredCustomers!.map(c => (
                      <li
                        key={c.id}
                        className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors duration-150 border-b border-slate-100 last:border-b-0"
                        onClick={() => {
                          setValue('customer_id', c.id);
                          setCustomerSearch(c.name);
                          setIsCustomerDropdownOpen(false);
                        }}
                      >
                        <div className="font-medium text-slate-800">{c.name}</div>
                        <div className="text-sm text-slate-500">{c.phone}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Product */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Product</label>
                <select
                  {...register('product_id')}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select product</option>
                  {productsQuery.data?.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Quantity</label>
                <select
                  {...register('quantity_id')}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select quantity</option>
                  {quantitiesQuery.data?.map(q => (
                    <option key={q.id} value={q.id}>{q.label}</option>
                  ))}
                </select>
              </div>

              {/* Custom quantity */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Custom Qty (ml)</label>
                <input
                  {...register('custom_quantity_ml')}
                  type="number"
                  placeholder="Optional"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Price</label>
                <input
                  {...register('price')}
                  type="number"
                  placeholder="Auto price"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Custom Price */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Custom Price</label>
                <input
                  {...register('custom_price')}
                  type="number"
                  placeholder="Optional"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select {...register('status')} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Payment Status</label>
                <select {...register('payment_status')} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                <select {...register('payment_method')} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                  <option value="">None</option>
                  <option value="Cash">Cash</option>
                  <option value="bKash">bKash</option>
                  <option value="Bank">Bank</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Discount</label>
                <input
                  {...register('discount')}
                  type="number"
                  placeholder="Optional"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Delivery Fee */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Delivery Fee</label>
                <input
                  {...register('delivery_fee')}
                  type="number"
                  placeholder="Optional"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Product Cost */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Product Cost</label>
                <input
                  {...register('product_cost')}
                  type="number"
                  placeholder="Optional"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  placeholder="Optional"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                ></textarea>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit(handleSubmitWithAnimation)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
              >
                <FaSave />
                Save
              </button>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full bg-white rounded-xl shadow-lg overflow-hidden">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Customer</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Product</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Qty</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Price</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Payment</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Discount</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Delivery Fee</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Profit</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Notes</th>
                <th className="px-4 py-2 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ordersQuery.data?.map((order, i) => (
                <tr
                  key={order.id}
                  ref={el => { ordersRef.current[i] = el; }}
                  data-order-id={order.id}
                  className="border-b last:border-b-0 hover:bg-blue-50 transition-colors duration-150"
                >
                  <td className="px-4 py-2">{order.customer?.name}</td>
                  <td className="px-4 py-2">{order.product?.name}</td>
                  <td className="px-4 py-2">{order.custom_quantity_ml ?? order.quantity?.label}</td>
                  <td className="px-4 py-2">{order.custom_price ?? order.price}</td>
                  <td className="px-4 py-2">{order.status}</td>
                  <td className="px-4 py-2">{order.payment_status} {order.payment_method ? `(${order.payment_method})` : ''}</td>
                  <td className="px-4 py-2">{order.discount}</td>
                  <td className="px-4 py-2">{order.delivery_fee}</td>
                  <td className="px-4 py-2">{order.profit}</td>
                  <td className="px-4 py-2">{order.total}</td>
                  <td className="px-4 py-2">{order.notes}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button onClick={() => handleEdit(order)} className="text-blue-600 hover:text-blue-800">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(order.id)} className="text-red-600 hover:text-red-800">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
