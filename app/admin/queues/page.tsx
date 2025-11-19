'use client';

import { useEffect, useState } from 'react';
import type { GameQueue } from '@/lib/supabase';

export default function AdminQueues() {
  const [queueEntries, setQueueEntries] = useState<GameQueue[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQueue();
    // Auto-refresh every 3 seconds
    const interval = setInterval(fetchQueue, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/queue');
      const data = await res.json();
      setQueueEntries(data.queue || []);
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, username: string) => {
    if (!confirm(`Are you sure you want to remove ${username} from the queue?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/queue/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete queue entry');
      }

      // Refresh the queue
      await fetchQueue();
      alert('Queue entry removed successfully');
    } catch (error) {
      console.error('Error deleting queue entry:', error);
      alert('Failed to remove queue entry');
    }
  };

  const handleClearQueue = async () => {
    if (!confirm('Are you sure you want to clear the ENTIRE queue? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch('/api/admin/queue', {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to clear queue');
      }

      // Refresh the queue
      await fetchQueue();
      alert('Queue cleared successfully');
    } catch (error) {
      console.error('Error clearing queue:', error);
      alert('Failed to clear queue');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500';
      case 'processing':
        return 'bg-blue-500/20 text-blue-300 border-blue-500';
      case 'done':
        return 'bg-green-500/20 text-green-300 border-green-500';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500';
    }
  };

  const pendingCount = queueEntries.filter(q => q.status === 'pending').length;
  const processingCount = queueEntries.filter(q => q.status === 'processing').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold text-casino-gold">Game Queue Management</h1>
          <button
            onClick={handleClearQueue}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-bold uppercase tracking-wider shadow-lg hover:shadow-red-900/20"
          >
            Clear Queue
          </button>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-sm text-gray-400">Pending</p>
            <p className="text-3xl font-bold text-yellow-400">{pendingCount}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Processing</p>
            <p className="text-3xl font-bold text-blue-400">{processingCount}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Total</p>
            <p className="text-3xl font-bold text-casino-gold">{queueEntries.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Position</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Username</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Plays Remaining</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Joined At</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading && queueEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : queueEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No entries in queue
                  </td>
                </tr>
              ) : (
                queueEntries.map((entry, index) => (
                  <tr key={entry.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4">
                      <span className="text-gray-300 font-mono">#{index + 1}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-casino-gold">
                        {entry.username}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-bold text-lg">
                        {entry.plays}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(entry.status)}`}>
                        {entry.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">
                      {new Date(entry.created_at).toLocaleString('bg-BG')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(entry.id, entry.username)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-semibold"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-400 text-center">
        Auto-refreshing every 3 seconds
      </div>
    </div>
  );
}
