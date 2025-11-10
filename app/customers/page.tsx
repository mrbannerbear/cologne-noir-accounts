'use client';

import { useEffect, useRef, useState } from 'react';
import {
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaPlus,
  FaUser,
  FaPhone,
  FaEnvelope,
} from 'react-icons/fa';
import { useCustomers } from '../hooks/useCustomers';
import gsap from 'gsap';

export default function CustomersPage() {
  const {
    customersQuery,
    form,
    editingId,
    startEdit,
    deleteCustomerMutation,
    onSubmit,
  } = useCustomers();

  const { register, handleSubmit, reset, setValue } = form;
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const customersRef = useRef<(HTMLDivElement | null)[]>([]);
  const formRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Animate header (kept simple)
  useEffect(() => {
    if (formRef.current) {
      // no-op header animation moved to parent in original; keep form animation as before
    }
  }, []);

  useEffect(() => {
    if (showForm && formRef.current) {
      gsap.from(formRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.35,
        ease: 'power2.out',
      });
    }
  }, [showForm]);

  useEffect(() => {
    customersRef.current.forEach((el, i) => {
      if (el) {
        gsap.from(el, {
          x: -20,
          opacity: 0,
          duration: 0.36,
          delay: i * 0.04,
          ease: 'power2.out',
        });
      }
    });
  }, [customersQuery.data]);

  const handleEdit = (customer: any) => {
    // allow hook to set editing id, but also reset the form with the full object
    startEdit(customer);
    // populate the form with all fields (safe: if some fields missing, setValue won't crash)
    reset({
      id: customer.id,
      name: customer.name ?? '',
      phone: customer.phone ?? '',
      email: customer.email ?? '',
      address: customer.address ?? '',
      city: customer.city ?? '',
      customer_type: customer.customer_type ?? 'New',
      notes: customer.notes ?? '',
      total_orders: customer.total_orders ?? 0,
      total_spent: customer.total_spent ?? 0,
      last_order_date: customer.last_order_date ?? undefined,
      created_at: customer.created_at ?? undefined,
    });
    setShowForm(true);

    if (formRef.current) {
      gsap.to(formRef.current, {
        scale: 1.02,
        duration: 0.18,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      });
    }
  };

  const handleDelete = (id: string) => {
    const element = customersRef.current.find(
      (el) => el?.dataset.customerId === id.toString()
    );
    if (element) {
      gsap.to(element, {
        x: 100,
        opacity: 0,
        duration: 0.28,
        ease: 'power2.in',
        onComplete: () => deleteCustomerMutation.mutate(id),
      });
    } else {
      deleteCustomerMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    reset();
    setShowForm(false);
  };

  const handleSubmitWithAnimation = async (data: any) => {
    // keep totals/last_order_date read-only: ensure we don't accidentally overwrite server-generated values
    // remove read-only props if present
    const payload = { ...data };
    delete payload.total_orders;
    delete payload.total_spent;
    delete payload.last_order_date;
    delete payload.created_at;

    await onSubmit(payload);
    if (formRef.current) {
      gsap.to(formRef.current, {
        scale: 1,
        duration: 0.12,
        yoyo: true,
        repeat: 1,
      });
    }
    setShowForm(false);
    reset();
  };

  // Open customer modal (view-only)
  const handleCustomerClick = (customer: any) => {
    setSelectedCustomer(customer);
    // lock scroll
    document.body.style.overflow = 'hidden';
    // run animations next tick
    setTimeout(() => {
      if (overlayRef.current && modalRef.current) {
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.22 }
        );
        gsap.fromTo(
          modalRef.current,
          { y: 30, opacity: 0, scale: 0.98 },
          { y: 0, opacity: 1, scale: 1, duration: 0.28, ease: 'power3.out' }
        );
      }
    }, 0);
  };

  const closeModal = () => {
    if (modalRef.current && overlayRef.current) {
      gsap.to(modalRef.current, {
        y: 14,
        opacity: 0,
        scale: 0.98,
        duration: 0.2,
        ease: 'power2.in',
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          setSelectedCustomer(null);
          document.body.style.overflow = '';
        },
      });
    } else {
      setSelectedCustomer(null);
      document.body.style.overflow = '';
    }
  };

  if (customersQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading customers...</div>
      </div>
    );
  }

  const customers = customersQuery.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Customers
          </h1>
          <p className="text-gray-800">Manage your customer relationships</p>
        </div>

        {/* Add Customer Button */}
        {!showForm && (
          <button
            onClick={() => {
              // reset and open blank form
              reset({
                name: '',
                phone: '',
                email: '',
                address: '',
                city: '',
                customer_type: 'New',
                notes: '',
                total_orders: 0,
                total_spent: 0,
                last_order_date: undefined,
              });
              setShowForm(true);
            }}
            className="mb-6 flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <FaPlus className="text-sm" />
            <span className="font-medium">New Customer</span>
          </button>
        )}

        {/* Customer Form */}
        {showForm && (
          <div
            ref={formRef}
            className="mb-6 bg-white rounded-2xl shadow-xl p-6 border border-slate-200 overflow-hidden"
          >
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FaUser className="text-teal-600" />
              {editingId ? 'Edit Customer' : 'Create New Customer'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    {...register('name')}
                    placeholder="Enter customer name"
                    className="w-full px-4 py-2.5 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  />
                  <FaUser className="absolute left-3 top-3.5 text-slate-400 text-sm" />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    {...register('phone')}
                    type="tel"
                    placeholder="Enter phone number"
                    className="w-full px-4 py-2.5 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  />
                  <FaPhone className="absolute left-3 top-3.5 text-slate-400 text-sm" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="Enter email address"
                    className="w-full px-4 py-2.5 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  />
                  <FaEnvelope className="absolute left-3 top-3.5 text-slate-400 text-sm" />
                </div>
              </div>
            </div>

            {/* Address / City / Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Address
                </label>
                <input
                  {...register('address')}
                  placeholder="Street / area"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  City
                </label>
                <input
                  {...register('city')}
                  placeholder="City"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Customer Type
                </label>
                <select
                  {...register('customer_type')}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white"
                >
                  <option value="New">New</option>
                  <option value="Regular">Regular</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Notes
              </label>
              <textarea
                {...register('notes')}
                placeholder='e.g. "Loves woody scents"'
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 min-h-[80px]"
              />
            </div>

            {/* Read-only stats (show in form but disabled) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Total Orders</label>
                <input {...register('total_orders')} readOnly className="w-full px-4 py-2.5 border border-slate-100 rounded-lg bg-slate-50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Total Spent</label>
                <input {...register('total_spent')} readOnly className="w-full px-4 py-2.5 border border-slate-100 rounded-lg bg-slate-50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Last Order</label>
                <input {...register('last_order_date')} readOnly className="w-full px-4 py-2.5 border border-slate-100 rounded-lg bg-slate-50" />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-3 pt-4 border-t border-slate-200 pb-4">
              <button
                onClick={handleSubmit(handleSubmitWithAnimation)}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
              >
                <FaSave />
                <span>{editingId ? 'Update' : 'Create'} Customer</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-slate-200 text-gray-900 px-6 py-2.5 rounded-lg hover:bg-slate-300 transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
              >
                <FaTimes />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}

        {/* Customers Table */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-teal-100 to-cyan-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Spent</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Last Order</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => {
                  const lastOrderPretty = c.last_order_date
                    ? new Date(c.last_order_date).toLocaleDateString()
                    : '-';
                  return (
                    <tr
                      key={c.id}
                      ref={(el) => { customersRef.current[i] = el; }}
                      data-customer-id={c.id}
                      onClick={(e) => {
                        // avoid opening modal when clicking edit/delete buttons
                        if (!(e.target as HTMLElement).closest('button')) handleCustomerClick(c);
                      }}
                      className="border-b border-slate-100 hover:bg-teal-50 transition-colors duration-200 cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {c.name?.charAt(0)?.toUpperCase() ?? '?'}
                          </div>
                          <span className="text-slate-800 font-medium">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{c.phone || '-'}</td>
                      <td className="px-6 py-4">{c.email || '-'}</td>
                      <td className="px-6 py-4">{c.customer_type || 'New'}</td>
                      <td className="px-6 py-4">{(c.total_spent ?? 0).toLocaleString()}</td>
                      <td className="px-6 py-4">{lastOrderPretty}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(c)}
                            className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-all duration-200 hover:scale-110 active:scale-95"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 hover:scale-110 active:scale-95"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {customers.map((c, i) => (
            <div
              key={c.id}
              ref={(el) => { customersRef.current[i] = el; }}
              data-customer-id={c.id}
              onClick={(e) => {
                if (!(e.target as HTMLElement).closest('button')) handleCustomerClick(c);
              }}
              className="bg-white rounded-xl shadow-lg p-5 border border-slate-200 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {c.name?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-800 truncate">{c.name}</h3>
                  <div className="text-sm text-slate-600 mt-1">
                    {c.customer_type || 'New'} · Spent: {(c.total_spent ?? 0).toLocaleString()}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleEdit(c)} className="p-2.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-all duration-200 active:scale-95">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 active:scale-95">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <FaPhone className="text-teal-600 text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-600 font-medium">Phone</div>
                    <div className="text-sm text-slate-800 font-medium truncate">{c.phone || '-'}</div>
                  </div>
                </div>

                {c.email && (
                  <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg">
                    <div className="p-2 bg-cyan-100 rounded-lg">
                      <FaEnvelope className="text-cyan-600 text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-600 font-medium">Email</div>
                      <div className="text-sm text-slate-800 font-medium truncate">{c.email}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {customers.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-slate-400 text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No customers yet</h3>
            <p className="text-slate-500">Add your first customer to get started</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedCustomer && (
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === overlayRef.current) closeModal();
          }}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden"
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <FaTimes size={18} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-3xl mb-4">
                {selectedCustomer.name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-2">{selectedCustomer.name}</h2>

              <div className="mt-3 text-sm text-slate-600 w-full text-left space-y-2">
                <div className="flex items-center gap-3">
                  <FaPhone className="text-teal-600" />
                  <span>{selectedCustomer.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-cyan-600" />
                  <span>{selectedCustomer.email || 'N/A'}</span>
                </div>

                <div className="mt-2">
                  <div className="text-xs text-slate-500">Address</div>
                  <div className="text-sm text-slate-800">{selectedCustomer.address || '-'}</div>
                </div>

                <div className="mt-2">
                  <div className="text-xs text-slate-500">City</div>
                  <div className="text-sm text-slate-800">{selectedCustomer.city || '-'}</div>
                </div>

                <div className="mt-2">
                  <div className="text-xs text-slate-500">Customer Type</div>
                  <div className="text-sm text-slate-800">{selectedCustomer.customer_type || 'New'}</div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                  <div>
                    <div className="text-xs text-slate-500">Total Orders</div>
                    <div className="text-slate-800 font-medium">{selectedCustomer.total_orders ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Total Spent</div>
                    <div className="text-slate-800 font-medium">{(selectedCustomer.total_spent ?? 0).toLocaleString()}</div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-xs text-slate-500">Last Order</div>
                  <div className="text-sm text-slate-800">{selectedCustomer.last_order_date ? new Date(selectedCustomer.last_order_date).toLocaleString() : '-'}</div>
                </div>

                {selectedCustomer.notes && (
                  <div className="mt-3">
                    <div className="text-xs text-slate-500">Notes</div>
                    <div className="text-sm text-slate-800">{selectedCustomer.notes}</div>
                  </div>
                )}

                <div className="text-xs text-slate-400 mt-4">ID: {selectedCustomer.id}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
