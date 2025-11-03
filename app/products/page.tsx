"use client";
import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { useProducts } from "@/app/hooks/useProducts";
import { Product } from "@/lib/types";

export default function ProductsPage() {
  const {
    productsQuery,
    form,
    editingId,
    setEditingId,
    saveProductMutation,
    deleteProductMutation,
    startEdit,
    onSubmit,
  } = useProducts();

  const [selected, setSelected] = useState<Product | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterSeason, setFilterSeason] = useState("");
  const modalRef = useRef<HTMLDivElement | null>(null);

  const { data: products = [], isLoading } = productsQuery;

  // Extract unique values for filters
  const brands = Array.from(new Set(products.map(p => p.brand))).sort();
  const genders = Array.from(new Set(products.map(p => p.gender))).sort();
  const seasons = Array.from(new Set(products.map(p => p.season).filter(Boolean))).sort();

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = !filterBrand || p.brand === filterBrand;
    const matchesGender = !filterGender || p.gender === filterGender;
    const matchesSeason = !filterSeason || p.season === filterSeason;
    
    return matchesSearch && matchesBrand && matchesGender && matchesSeason;
  });

  // 🟢 GSAP open animation
  useEffect(() => {
    if (selected && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [selected]);

  // 🔴 Close modal animation
  const closeModal = () => {
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        opacity: 0,
        y: 30,
        scale: 0.9,
        duration: 0.25,
        ease: "power1.in",
        onComplete: () => {
          setSelected(null);
          setEditMode(false);
          setEditingId(null);
          form.reset();
        },
      });
    } else {
      setSelected(null);
      setEditMode(false);
      setEditingId(null);
      form.reset();
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete ${product.name}? This action cannot be undone.`)) return;
    
    try {
      await deleteProductMutation.mutateAsync(product.id);
      closeModal();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const handleEdit = (product: Product) => {
    startEdit(product);
    setEditMode(true);
  };

  const handleSaveFromModal = async () => {
    try {
      await form.handleSubmit(onSubmit)();
      closeModal();
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleAddNewProduct = () => {
    form.reset({
      name: '',
      brand: '',
      sku: '',
      gender: 'Unisex',
      season: "",
      top_notes: [],
      middle_notes: [],
      base_notes: [],
      price_10ml: 0,
      price_15ml: 0,
      price_30ml: 0,
      price_100ml: 0,
      low_stock_threshold_ml: 100,
      total_stock_ml: 0,
      active: true,
    });
    setEditingId(null);
    setShowAddModal(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterBrand("");
    setFilterGender("");
    setFilterSeason("");
  };

  // 🧭 Loading / Empty states
  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Loading products...
      </div>
    );

  if (!products.length)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Products</h1>
          <button
            onClick={handleAddNewProduct}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + Add Product
          </button>
        </div>
        <div className="flex items-center justify-center min-h-[400px] text-slate-600">
          No products found. Add your first product to get started!
        </div>

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6 relative overflow-y-auto max-h-[90vh]">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  form.reset();
                }}
                className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 text-2xl"
              >
                ✕
              </button>
              
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Add New Product</h2>
              <ProductForm
                form={form}
                onSave={async () => {
                  await form.handleSubmit(onSubmit)();
                  setShowAddModal(false);
                }}
                onCancel={() => {
                  setShowAddModal(false);
                  form.reset();
                }}
                isSubmitting={saveProductMutation.isPending}
              />
            </div>
          </div>
        )}
      </div>
    );

  // 🧱 Main UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Products</h1>
        <button
          onClick={handleAddNewProduct}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          + Add Product
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search by name or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Brands</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>

          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Genders</option>
            {genders.map(gender => (
              <option key={gender} value={gender}>{gender}</option>
            ))}
          </select>

          <select
            value={filterSeason}
            onChange={(e) => setFilterSeason(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Seasons</option>
            {seasons.map(season => (
              <option key={season} value={season}>{season}</option>
            ))}
          </select>
        </div>

        {(searchTerm || filterBrand || filterGender || filterSeason) && (
          <div className="mt-3 flex justify-between items-center">
            <p className="text-sm text-slate-600">
              Showing {filteredProducts.length} of {products.length} products
            </p>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-2xl shadow bg-white">
        <table className="w-full text-left">
          <thead className="bg-slate-100 text-slate-700 text-sm uppercase">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Brand</th>
              <th className="px-6 py-3">Price (10ml)</th>
              <th className="px-6 py-3">Gender</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => {
              const isLow = p.total_stock_ml < p.low_stock_threshold_ml;
              return (
                <tr
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={`cursor-pointer hover:bg-slate-50 transition-all ${
                    isLow ? "bg-red-50 text-red-700" : ""
                  }`}
                >
                  <td className="px-6 py-4 font-medium">{p.name}</td>
                  <td className="px-6 py-4">{p.brand}</td>
                  <td className="px-6 py-4">{p.price_10ml}৳</td>
                  <td className="px-6 py-4">{p.gender}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* View/Edit Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6 relative overflow-y-auto max-h-[90vh]"
          >
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 text-2xl"
            >
              ✕
            </button>

            {editMode ? (
              <ProductForm
                form={form}
                onSave={handleSaveFromModal}
                onCancel={() => {
                  setEditMode(false);
                  form.reset();
                }}
                onDelete={() => handleDelete(selected)}
                isSubmitting={saveProductMutation.isPending}
              />
            ) : (
              <ProductView
                product={selected}
                onEdit={() => handleEdit(selected)}
                onDelete={() => handleDelete(selected)}
              />
            )}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6 relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => {
                setShowAddModal(false);
                form.reset();
              }}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 text-2xl"
            >
              ✕
            </button>
            
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Add New Product</h2>
            <ProductForm
              form={form}
              onSave={async () => {
                await form.handleSubmit(onSubmit)();
                setShowAddModal(false);
              }}
              onCancel={() => {
                setShowAddModal(false);
                form.reset();
              }}
              isSubmitting={saveProductMutation.isPending}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// 🔁 Reusable section for notes
const NoteSection = ({
  title,
  notes,
}: {
  title: string;
  notes?: string[];
}) => {
  if (!notes?.length) return null;
  return (
    <div>
      <p className="text-slate-700 font-medium">{title}</p>
      <p className="text-slate-600 text-sm">{notes.join(", ")}</p>
    </div>
  );
};

// 👁️ Product View Component
const ProductView = ({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-800 mb-4">{product.name}</h2>
      
      <div className="space-y-3 mb-6">
        <InfoRow label="Brand" value={product.brand} />
        <InfoRow label="SKU" value={product.sku || "N/A"} />
        <InfoRow label="Gender" value={product.gender} />
        <InfoRow label="Season" value={product.season || "N/A"} />
        <InfoRow label="Total Stock" value={`${product.total_stock_ml}ml`} />
        <InfoRow label="Low Stock Threshold" value={`${product.low_stock_threshold_ml}ml`} />
        <InfoRow label="Status" value={product.active ? "Active" : "Inactive"} />
      </div>

      <div className="mb-6 space-y-2">
        <NoteSection title="Top Notes" notes={product.top_notes} />
        <NoteSection title="Middle Notes" notes={product.middle_notes} />
        <NoteSection title="Base Notes" notes={product.base_notes} />
      </div>

      <div className="border-t pt-4 mb-6">
        <h3 className="font-medium text-slate-700 mb-3">Prices</h3>
        <div className="grid grid-cols-2 gap-3">
          <InfoRow label="10ml" value={`${product.price_10ml}৳`} />
          <InfoRow label="15ml" value={`${product.price_15ml}৳`} />
          <InfoRow label="30ml" value={`${product.price_30ml}৳`} />
          <InfoRow label="100ml" value={`${product.price_100ml}৳`} />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onEdit}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Edit Product
        </button>
        <button
          onClick={onDelete}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

// ✏️ Product Form Component
const ProductForm = ({
  form,
  onSave,
  onCancel,
  onDelete,
  isSubmitting,
}: {
  form: any;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  isSubmitting?: boolean;
}) => {
  const { register, watch, setValue } = form;
  const watchedData = watch();

  const handleNotesChange = (field: 'top_notes' | 'middle_notes' | 'base_notes', value: string) => {
    setValue(field, value.split(',').map(n => n.trim()).filter(Boolean));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
          <input
            type="text"
            {...register('name', { required: true })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Brand *</label>
          <input
            type="text"
            {...register('brand', { required: true })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
          <input
            type="text"
            {...register('sku')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
          <select
            {...register('gender', { required: true })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Unisex">Unisex</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Season</label>
          <input
            type="text"
            {...register('season')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Total Stock (ml) *</label>
          <input
            type="number"
            {...register('total_stock_ml', { required: true, valueAsNumber: true })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Low Stock Threshold (ml) *</label>
          <input
            type="number"
            {...register('low_stock_threshold_ml', { required: true, valueAsNumber: true })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Price 10ml (৳) *</label>
          <input
            type="number"
            {...register('price_10ml', { required: true, valueAsNumber: true })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Price 15ml (৳) *</label>
          <input
            type="number"
            {...register('price_15ml', { required: true, valueAsNumber: true })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Price 30ml (৳) *</label>
          <input
            type="number"
            {...register('price_30ml', { required: true, valueAsNumber: true })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Price 100ml (৳) *</label>
          <input
            type="number"
            {...register('price_100ml', { required: true, valueAsNumber: true })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Top Notes (comma-separated)</label>
          <input
            type="text"
            value={watchedData.top_notes?.join(', ') || ''}
            onChange={(e) => handleNotesChange('top_notes', e.target.value)}
            placeholder="e.g., Bergamot, Lemon, Orange"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Middle Notes (comma-separated)</label>
          <input
            type="text"
            value={watchedData.middle_notes?.join(', ') || ''}
            onChange={(e) => handleNotesChange('middle_notes', e.target.value)}
            placeholder="e.g., Rose, Jasmine, Lavender"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Base Notes (comma-separated)</label>
          <input
            type="text"
            value={watchedData.base_notes?.join(', ') || ''}
            onChange={(e) => handleNotesChange('base_notes', e.target.value)}
            placeholder="e.g., Vanilla, Musk, Sandalwood"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register('active')}
          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
        />
        <label className="text-sm font-medium text-slate-700">Active Product</label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onSave}
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 text-slate-700 rounded-lg transition-colors"
        >
          Cancel
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isSubmitting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

// 📝 Info Row Component
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between py-2 border-b border-slate-100">
    <span className="font-medium text-slate-700">{label}:</span>
    <span className="text-slate-600">{value}</span>
  </div>
);