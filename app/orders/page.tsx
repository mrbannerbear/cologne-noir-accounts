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

  const { register, handleSubmit, reset, setValue } = form;
  const [showForm, setShowForm] = useState(false);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  const formRef = useRef<HTMLDivElement | null>(null);
  const ordersRef = useRef<(HTMLElement | null)[]>([]);
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
        scale: 0.98,
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
            className="mb-6 bg-white rounded-2xl shadow-xl p-6 border border-slate-200 overflow-hidden"
          >
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              {editingOrderId ? 'Edit Order' : 'Create New Order'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Customer */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Customer
                </label>
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Product
                </label>
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quantity
                </label>
                <select
                  {...register('quantity_id')}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                >
                  <option value="">Select quantity</option>
                  {quantitiesQuery.data?.map(q => (
                    <option key={q.id} value={q.id}>{q.label}</option>
                  ))}
                </select>
                <input
                  {...register('custom_quantity_ml')}
                  placeholder="Or enter custom ml"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mt-2"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Price
                </label>
                <input
                  {...register('price')}
                  readOnly
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                />
              </div>

              {/* Custom Price */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Custom Price
                </label>
                <input
                  {...register('custom_price')}
                  placeholder="Optional override"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={handleSubmit(handleSubmitWithAnimation)}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
              >
                <FaSave />
                <span>{editingOrderId ? 'Update' : 'Create'} Order</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-slate-200 text-slate-700 px-6 py-2.5 rounded-lg hover:bg-slate-300 transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
              >
                <FaTimes />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Quantity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Custom Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ordersQuery.data?.map((o, i) => (
                  <tr
                    key={o.id}
                    ref={el => { ordersRef.current[i] = el }}
                    data-order-id={o.id}
                    className="border-b border-slate-100 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 text-slate-800">{o.customer?.name}</td>
                    <td className="px-6 py-4 text-slate-800">{o.product?.name}</td>
                    <td className="px-6 py-4 text-slate-600">{o.custom_quantity_ml ?? o.quantity?.label}</td>
                    <td className="px-6 py-4 text-slate-800 font-medium">{o.price}</td>
                    <td className="px-6 py-4 text-slate-600">{o.custom_price ? `{o.custom_price}` : '-'}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(o)}
                          className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-all duration-200 hover:scale-110 active:scale-95"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(o.id)}
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

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {ordersQuery.data?.map((o, i) => (
            <div
              key={o.id}
              ref={el => { ordersRef.current[i] = el; }}
              data-order-id={o.id}
              className="bg-white rounded-xl shadow-lg p-5 border border-slate-200 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{o.customer?.name}</h3>
                  <p className="text-sm text-slate-500">{new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(o)}
                    className="p-2.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-all duration-200 active:scale-95"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(o.id)}
                    className="p-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 active:scale-95"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Product</span>
                  <span className="text-sm font-medium text-slate-800">{o.product?.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Quantity</span>
                  <span className="text-sm font-medium text-slate-800">{o.custom_quantity_ml ?? o.quantity?.label}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Price</span>
                  <span className="text-sm font-medium text-slate-800">{o.price}</span>
                </div>
                {o.custom_price && (
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-slate-600">Custom Price</span>
                    <span className="text-sm font-medium text-green-600">{o.custom_price}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {ordersQuery.data?.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-slate-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No orders yet</h3>
            <p className="text-slate-500">Create your first order to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
