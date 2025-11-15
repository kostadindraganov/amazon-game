'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Winner } from '@/lib/supabase';

export default function AdminWinners() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchWinners();
  }, [page]);

  const fetchWinners = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/winners?page=${page}&limit=50`);
      const data = await res.json();
      setWinners(data.winners);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching winners:', error);
      alert('Failed to fetch winners');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-casino-gold">Winners History</h1>
        <div className="text-right">
          <p className="text-sm text-gray-400">Total Winners</p>
          <p className="text-3xl font-bold text-casino-gold">{total}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Image</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Username</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Won At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : winners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No winners yet
                  </td>
                </tr>
              ) : (
                winners.map((winner) => (
                  <tr key={winner.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4">
                      <div className="relative w-16 h-16">
                        <Image
                          src={winner.product_image_url}
                          alt={winner.product_title}
                          fill
                          className="object-contain bg-white rounded"
                          unoptimized
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-casino-gold">
                        {winner.username}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white">
                      {winner.product_title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-400">
                        {winner.product_price} лв
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">
                      {new Date(winner.won_at).toLocaleString('bg-BG')}
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
