'use client';

import { useEffect, useRef, useState } from 'react';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaBox } from 'react-icons/fa';
import { useProducts } from '../hooks/useProducts';
import gsap from 'gsap';

export default function ProductsPage() {
  const {
    productsQuery,
    form,
    editingId,
    startEdit,
    deleteProductMutation,
    onSubmit,
  } = useProducts();

  const { register, handleSubmit, reset } = form;
  const [showForm, setShowForm] = useState(false);
  const productsRef = useRef<(HTMLTableRowElement | HTMLDivElement | null)[]>([]);
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
    productsRef.current.forEach((el, i) => {
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
  }, [productsQuery.data]);

  const handleEdit = (product: { id: string; name: string; price_10ml: number; price_15ml: number; price_30ml: number; price_100ml: number; }) => {
    startEdit(product);
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
    const element = productsRef.current.find(el => el?.dataset.productId === id.toString());
    if (element) {
      gsap.to(element, {
        x: 100,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => deleteProductMutation.mutate(id)
      });
    } else {
      deleteProductMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    reset();
    setShowForm(false);
  };

  const handleSubmitWithAnimation = async (data: { id: string; name: string; price_10ml: number; price_15ml: number; price_30ml: number; price_100ml: number; }) => {
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
  };

  if (productsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-800">Manage your product catalog and pricing</p>
        </div>

        {/* Add Product Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <FaPlus className="text-sm" />
            <span className="font-medium">New Product</span>
          </button>
        )}

        {/* Product Form */}
        {showForm && (
          <div
            ref={formRef}
            className="mb-6 bg-white rounded-2xl shadow-xl p-6 border border-slate-200 overflow-hidden"
          >
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FaBox className="text-purple-600" />
              {editingId ? 'Edit Product' : 'Create New Product'}
            </h2>
            
            <div className="grid grid-cols-1 gap-4 mb-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Product Name
                </label>
                <input
                  {...register('name')}
                  placeholder="Enter product name"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Pricing Grid */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pricing by Size
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      10ml
                    </label>
                    <input
                      {...register('price_10ml')}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      15ml
                    </label>
                    <input
                      {...register('price_15ml')}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      30ml
                    </label>
                    <input
                      {...register('price_30ml')}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      100ml
                    </label>
                    <input
                      {...register('price_100ml')}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={handleSubmit(handleSubmitWithAnimation)}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
              >
                <FaSave />
                <span>{editingId ? 'Update' : 'Create'} Product</span>
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

        {/* Products List - Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-purple-100 to-fuchsia-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Product Name</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">10ml</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">15ml</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">30ml</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">100ml</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {productsQuery.data?.map((p, i) => (
                  <tr
                    key={p.id}
                    ref={el => { productsRef.current[i] = el; }}
                    data-product-id={p.id}
                    className="border-b border-slate-100 hover:bg-purple-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 text-slate-800 font-medium">{p.name}</td>
                    <td className="px-6 py-4 text-center text-slate-700">${p.price_10ml}</td>
                    <td className="px-6 py-4 text-center text-slate-700">${p.price_15ml}</td>
                    <td className="px-6 py-4 text-center text-slate-700">${p.price_30ml}</td>
                    <td className="px-6 py-4 text-center text-slate-700">${p.price_100ml}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-all duration-200 hover:scale-110 active:scale-95"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
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

        {/* Products List - Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {productsQuery.data?.map((p, i) => (
            <div
              key={p.id}
              ref={el => { productsRef.current[i] = el; }}
              data-product-id={p.id}
              className="bg-white rounded-xl shadow-lg p-5 border border-slate-200 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FaBox className="text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">{p.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="p-2.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-all duration-200 active:scale-95"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 active:scale-95"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              
              {/* Price Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                  <div className="text-xs text-slate-600 font-medium mb-1">10ml</div>
                  <div className="text-lg font-bold text-purple-700">${p.price_10ml}</div>
                </div>
                <div className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 rounded-lg p-3">
                  <div className="text-xs text-slate-600 font-medium mb-1">15ml</div>
                  <div className="text-lg font-bold text-fuchsia-700">${p.price_15ml}</div>
                </div>
                <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg p-3">
                  <div className="text-xs text-slate-600 font-medium mb-1">30ml</div>
                  <div className="text-lg font-bold text-violet-700">${p.price_30ml}</div>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-3">
                  <div className="text-xs text-slate-600 font-medium mb-1">100ml</div>
                  <div className="text-lg font-bold text-pink-700">${p.price_100ml}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {productsQuery.data?.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-slate-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No products yet</h3>
            <p className="text-slate-500">Add your first product to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}