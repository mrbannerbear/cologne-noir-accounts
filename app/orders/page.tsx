'use client';

import { useEffect, useRef, useState } from 'react';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaSearch, FaCalendar } from 'react-icons/fa';
import { useOrders, OrderFormValues } from '../hooks/useOrders';
import { Order, Customer } from '@/lib/types';
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
  const [showForm, setShowForm] = useState<boolean>(false);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState<boolean>(false);

  const formRef = useRef<HTMLDivElement | null>(null);
  const ordersRef = useRef<(HTMLDivElement | null)[]>([]);
  const headerRef = useRef<HTMLDivElement | null>(null);

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

  const handleEdit = (order: Order) => {
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
    setValue('payment_method', order.payment_method ?? undefined);
    setValue('discount', order.discount?.toString() || '');
    setValue('delivery_fee', order.delivery_fee?.toString() || '');
    setValue('product_cost', order.product_cost?.toString() || '');
    setValue('notes', order.notes || '');
    setValue('order_date', order.order_date?.split('T')[0] || '');
    setValue('delivery_date', order.delivery_date?.split('T')[0] || '');
    
    if (formRef.current) {
      gsap.to(formRef.current, {
        scale: 1.02,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this order?')) {
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
    }
  };

  const handleCancel = () => {
    setEditingOrderId(null);
    reset({ order_date: new Date().toISOString().split('T')[0] });
    setShowForm(false);
    setIsCustomerDropdownOpen(false);
  };

  const handleSubmitWithAnimation = async (data: OrderFormValues) => {
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
    reset({ order_date: new Date().toISOString().split('T')[0] });
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
            onClick={() => {
              reset({ order_date: new Date().toISOString().split('T')[0] });
              setShowForm(true);
            }}
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
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FaCalendar className="text-blue-600" />
              {editingOrderId ? 'Edit Order' : 'Create New Order'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Order Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Order Date *
                </label>
                <div className="relative">
                  <input
                    {...register('order_date')}
                    type="date"
                    className="w-full px-4 py-2.5 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <FaCalendar className="absolute left-3 top-3.5 text-slate-400 text-sm" />
                </div>
              </div>

              {/* Delivery Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Delivery Date
                </label>
                <div className="relative">
                  <input
                    {...register('delivery_date')}
                    type="date"
                    placeholder="Optional"
                    className="w-full px-4 py-2.5 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <FaCalendar className="absolute left-3 top-3.5 text-slate-400 text-sm" />
                </div>
              </div>

              {/* Customer */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-2">Customer *</label>
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
                    {filteredCustomers!.map((c: Customer) => (
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Product *</label>
                <select
                  {...register('product_id')}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                >
                  <option value="">Select product</option>
                  {productsQuery.data?.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Quantity *</label>
                <select
                  {...register('quantity_id')}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Price *</label>
                <input
                  {...register('price')}
                  type="number"
                  placeholder="Auto calculated"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Custom Price */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Custom Price</label>
                <input
                  {...register('custom_price')}
                  type="number"
                  placeholder="Optional override"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status *</label>
                <select {...register('status')} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white">
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Payment Status *</label>
                <select {...register('payment_status')} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white">
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                <select {...register('payment_method')} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white">
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
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Delivery Fee */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Delivery Fee</label>
                <input
                  {...register('delivery_fee')}
                  type="number"
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Product Cost */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Product Cost</label>
                <input
                  {...register('product_cost')}
                  type="number"
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  placeholder="Additional order notes..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                ></textarea>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleSubmit(handleSubmitWithAnimation)}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
              >
                <FaSave />
                <span>{editingOrderId ? 'Update' : 'Create'} Order</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 bg-slate-200 text-gray-900 px-6 py-2.5 rounded-lg hover:bg-slate-300 transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
              >
                <FaTimes />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-100 to-indigo-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Order Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Delivery Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Qty</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Payment</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ordersQuery.data?.map((order: Order, i: number) => (
                  <tr
                    key={order.id}
                    ref={(el) => { ordersRef.current[i] = el; }}
                    data-order-id={order.id}
                    className="border-b border-slate-100 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <td className="px-4 py-3 text-sm">
                      {order.order_date ? new Date(order.order_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{order.customer?.name}</td>
                    <td className="px-4 py-3 text-sm">{order.product?.name}</td>
                    <td className="px-4 py-3 text-sm">{order.custom_quantity_ml ?? order.quantity?.label}</td>
                    <td className="px-4 py-3 text-sm font-medium">{order.custom_price ?? order.price}৳</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{order.payment_status}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(order)}
                          className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-all duration-200 hover:scale-110 active:scale-95"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 hover:scale-110 active:scale-95"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {ordersQuery.data?.map((order: Order, i: number) => (
            <div
              key={order.id}
              ref={(el) => { ordersRef.current[i] = el; }}
              className="bg-white rounded-xl shadow-lg p-5 border border-slate-200"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{order.customer?.name}</h3>
                  <p className="text-sm text-slate-600">{order.product?.name}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                  order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm mb-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Order Date:</span>
                  <span className="font-medium">{order.order_date ? new Date(order.order_date).toLocaleDateString() : '-'}</span>
                </div>
                {order.delivery_date && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Delivery:</span>
                    <span className="font-medium">{new Date(order.delivery_date).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">Price:</span>
                  <span className="font-medium">{order.custom_price ?? order.price}৳</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(order)}
                  className="flex-1 p-2.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-all"
                >
                  <FaEdit className="inline mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(order.id)}
                  className="flex-1 p-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                >
                  <FaTrash className="inline mr-2" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {ordersQuery.data?.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-slate-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-slate-500">Create your first order to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}