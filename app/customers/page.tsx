'use client';

import { useEffect, useRef, useState } from 'react';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';
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

  const { register, handleSubmit, reset } = form;
  const [showForm, setShowForm] = useState(false);
  const customersRef = useRef<(HTMLDivElement | null)[]>([]);
  const formRef = useRef(null);
  const headerRef = useRef(null);

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

  useEffect(() => {
    customersRef.current.forEach((el, i) => {
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
  }, [customersQuery.data]);

  const handleEdit = (customer: { id: string; name: string; phone?: string | undefined; email?: string | undefined; }) => {
    startEdit(customer);
    setShowForm(true);
    
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
    const element = customersRef.current.find(el => el?.dataset.customerId === id.toString());
    if (element) {
      gsap.to(element, {
        x: 100,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => deleteCustomerMutation.mutate(id)
      });
    } else {
      deleteCustomerMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    reset();
    setShowForm(false);
  };

  const handleSubmitWithAnimation = async (data: { id: string; name: string; phone?: string | undefined; email?: string | undefined; }) => {
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
  };

  if (customersQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Customers</h1>
          <p className="text-gray-800">Manage your customer relationships</p>
        </div>

        {/* Add Customer Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
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

            {/* Form Actions */}
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
                className="flex items-center gap-2 bg-slate-200 text-slate-700 px-6 py-2.5 rounded-lg hover:bg-slate-300 transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
              >
                <FaTimes />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}

        {/* Customers List - Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-teal-100 to-cyan-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Email</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customersQuery.data?.map((c, i) => (
                  <tr
                    key={c.id}
                    ref={el => { customersRef.current[i] = el; }}
                    data-customer-id={c.id}
                    className="border-b border-slate-100 hover:bg-teal-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-slate-800 font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700">
                        <FaPhone className="text-teal-600 text-xs" />
                        {c.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700">
                        <FaEnvelope className="text-teal-600 text-xs" />
                        {c.email || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customers List - Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {customersQuery.data?.map((c, i) => (
            <div
              key={c.id}
              ref={el => { customersRef.current[i] = el; }}
              data-customer-id={c.id}
              className="bg-white rounded-xl shadow-lg p-5 border border-slate-200 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-800 truncate">{c.name}</h3>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEdit(c)}
                      className="p-2.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-all duration-200 active:scale-95"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 active:scale-95"
                    >
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
                    <div className="text-sm text-slate-800 font-medium truncate">{c.phone}</div>
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
        {customersQuery.data?.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-slate-400 text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No customers yet</h3>
            <p className="text-slate-500">Add your first customer to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}