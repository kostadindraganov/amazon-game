'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/supabase';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [winAtSpinCount, setWinAtSpinCount] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  // Spin state
  const [spinState, setSpinState] = useState<{ current_spin_count: number } | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchSpinState();
  }, [page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products?page=${page}&limit=50`);
      const data = await res.json();
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpinState = async () => {
    try {
      const res = await fetch('/api/game/current');
      const data = await res.json();
      setSpinState(data.spinState);
    } catch (error) {
      console.error('Error fetching spin state:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Get upload URL
      const urlRes = await fetch('/api/admin/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type
        })
      });

      const { uploadUrl, fileUrl } = await urlRes.json();

      // Upload to R2
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (!uploadRes.ok) throw new Error('Upload failed');

      setUploadedImageUrl(fileUrl);
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !price || !uploadedImageUrl) {
      alert('Please fill all fields and upload an image');
      return;
    }

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          price: parseFloat(price),
          image_url: uploadedImageUrl,
          win_at_spin_count: winAtSpinCount ? parseInt(winAtSpinCount) : undefined
        })
      });

      if (!res.ok) throw new Error('Failed to create product');

      alert('Product created successfully!');
      setTitle('');
      setPrice('');
      setWinAtSpinCount('');
      setUploadedImageUrl('');
      fetchProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete');

      alert('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'active' | 'won') => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update status');

      // Update local state to reflect the change immediately
      setProducts(products.map(p =>
        p.id === id ? { ...p, status: newStatus } : p
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update product status');
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-casino-gold">Product Management</h1>

      {/* Spin State Count */}
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-6 rounded-xl mb-6 border border-purple-500">
        <h2 className="text-xl font-bold mb-2 text-white">Current Spin State</h2>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-casino-gold">
            {spinState ? spinState.current_spin_count : '...'}
          </div>
          <div className="text-gray-300">
            <div className="text-sm">Total Spins</div>
            <button
              onClick={fetchSpinState}
              className="text-xs text-purple-300 hover:text-purple-200 underline"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-gray-800 p-6 rounded-xl mb-8 border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-white">Add New Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Product Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="iPhone 15 Pro"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Price (лв)
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="1600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Win at Spin Count
            </label>
            <input
              type="number"
              min="1"
              value={winAtSpinCount}
              onChange={(e) => setWinAtSpinCount(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="100"
            />
            <p className="text-sm text-gray-400 mt-1">
              This product will be awarded at this specific spin count (optional)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
              disabled={uploading}
            />
            {uploading && <p className="text-sm text-gray-400 mt-2">Uploading...</p>}
            {uploadedImageUrl && (
              <div className="mt-2">
                <p className="text-sm text-green-400">✓ Image uploaded</p>
                <div className="relative w-32 h-32 mt-2">
                  <Image
                    src={uploadedImageUrl}
                    alt="Preview"
                    fill
                    className="object-contain bg-white rounded-lg"
                    unoptimized
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            disabled={uploading || !uploadedImageUrl}
          >
            Add Product
          </button>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Image</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">WinAt</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4">
                      <div className="relative w-16 h-16">
                        <Image
                          src={product.image_url}
                          alt={product.title}
                          fill
                          className="object-contain bg-white rounded"
                          unoptimized
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">{product.title}</td>
                    <td className="px-6 py-4 text-casino-gold font-bold">
                      {product.price} лв
                    </td>
                    <td className="px-6 py-4 text-white">
                      {product.win_at_spin_count ?? '-'}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={product.status}
                        onChange={(e) => handleStatusChange(product.id, e.target.value as 'active' | 'won')}
                        className={`
                          px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer
                          focus:ring-2 focus:ring-purple-500 focus:outline-none
                          transition-colors
                          ${product.status === 'active'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-red-600 text-white hover:bg-red-700'
                          }
                        `}
                      >
                        <option value="active" className="bg-gray-800">Active</option>
                        <option value="won" className="bg-gray-800">Won</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-900 flex justify-between items-center">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-gray-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
