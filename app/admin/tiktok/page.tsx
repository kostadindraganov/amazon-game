'use client';

import { useState, useEffect } from 'react';
import type { TikTokSettings, TikTokGiftLog } from '@/lib/supabase';

interface GiftLogsResponse {
  logs: TikTokGiftLog[];
  total: number;
}

export default function TikTokLivePage() {
  const [settings, setSettings] = useState<TikTokSettings | null>(null);
  const [username, setUsername] = useState('');
  const [logs, setLogs] = useState<TikTokGiftLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch settings
  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/tiktok/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data);
      if (data.username) {
        setUsername(data.username);
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.message || 'Failed to fetch settings');
    }
  };

  // Fetch logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/tiktok/logs');
      if (!response.ok) throw new Error('Failed to fetch logs');
      const data: GiftLogsResponse = await response.json();
      setLogs(data.logs);
      setTotal(data.total);
    } catch (err: any) {
      console.error('Error fetching logs:', err);
      setError(err.message || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  // Connect to TikTok Live
  const handleConnect = async () => {
    if (!username.trim()) {
      setError('Please enter a TikTok username');
      return;
    }

    try {
      setConnecting(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/admin/tiktok/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect');
      }

      setSuccess(data.message || 'Connected successfully!');
      await fetchSettings();
    } catch (err: any) {
      console.error('Error connecting:', err);
      setError(err.message || 'Failed to connect to TikTok Live');
    } finally {
      setConnecting(false);
    }
  };

  // Disconnect from TikTok Live
  const handleDisconnect = async () => {
    try {
      setConnecting(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/admin/tiktok/disconnect', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to disconnect');
      }

      setSuccess(data.message || 'Disconnected successfully!');
      await fetchSettings();
    } catch (err: any) {
      console.error('Error disconnecting:', err);
      setError(err.message || 'Failed to disconnect from TikTok Live');
    } finally {
      setConnecting(false);
    }
  };

  // Clear all logs
  const handleClearLogs = async () => {
    if (!confirm('Are you sure you want to clear all logs?')) return;

    try {
      const response = await fetch('/api/admin/tiktok/logs', {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to clear logs');

      setSuccess('Logs cleared successfully!');
      setSuccess('Logs cleared successfully!');
      await fetchLogs();
    } catch (err: any) {
      console.error('Error clearing logs:', err);
      setError(err.message || 'Failed to clear logs');
    }
  };

  // Initial load
  useEffect(() => {
    fetchSettings();
    fetchLogs();

    // Auto-refresh every 2 seconds
    const interval = setInterval(() => {
      fetchSettings();
      fetchLogs();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-casino-gold mb-2">TikTok Live Integration</h1>
        <p className="text-gray-400">Connect to TikTok Live streams and track gift events</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Connection Status */}
      {settings && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Connection Status</h2>
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${getStatusColor(settings.connection_status)} animate-pulse`}
              />
              <span className="text-sm text-gray-300 capitalize">
                {settings.connection_status}
              </span>
            </div>
          </div>

          {settings.is_connected && (
            <div className="mb-4 space-y-2 text-sm text-gray-300">
              <p>
                <span className="font-semibold">Username:</span> {settings.username}
              </p>
              {settings.room_id && (
                <p>
                  <span className="font-semibold">Room ID:</span> {settings.room_id}
                </p>
              )}
              {settings.last_connected_at && (
                <p>
                  <span className="font-semibold">Connected at:</span>{' '}
                  {formatDate(settings.last_connected_at)}
                </p>
              )}
            </div>
          )}

          {settings.error_message && (
            <div className={`mb-4 border px-3 py-2 rounded text-sm ${settings.connection_status === 'connecting'
              ? 'bg-yellow-900 border-yellow-700 text-yellow-200'
              : 'bg-red-900 border-red-700 text-red-200'
              }`}>
              {settings.error_message}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="TikTok username (e.g., @username)"
              disabled={settings.is_connected || connecting}
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {settings.is_connected ? (
              <button
                onClick={handleDisconnect}
                disabled={connecting}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
              >
                {connecting ? 'Disconnecting...' : 'Disconnect'}
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connecting || !username.trim()}
                className="px-6 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
              >
                {connecting ? 'Connecting...' : 'Connect'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Gift Logs */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Gift Logs</h2>
            <p className="text-sm text-gray-400 mt-1">
              Total: {total} gifts received
            </p>
          </div>
          <button
            onClick={handleClearLogs}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Clear Logs
          </button>
        </div>

        {loading && logs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No gifts received yet. Connect to a live stream to start tracking.
          </div>
        ) : (
          <div className="overflow-x-auto h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            <table className="w-full text-left text-sm relative">
              <thead className="text-xs uppercase bg-gray-700 text-gray-300 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 bg-gray-700">Time</th>
                  <th className="px-4 py-3 bg-gray-700">Username</th>
                  <th className="px-4 py-3 bg-gray-700">Gift</th>
                  <th className="px-4 py-3 bg-gray-700">Count</th>
                  <th className="px-4 py-3 bg-gray-700">Points</th>
                  <th className="px-4 py-3 bg-gray-700">Total Points</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-700 hover:bg-gray-750 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                      {new Date(log.received_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">
                      {log.username}
                      <div className="text-xs text-gray-400">@{log.unique_id}</div>
                    </td>
                    <td className="px-4 py-3 text-pink-400">{log.gift_name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-gray-300">{log.repeat_count}x</td>
                    <td className="px-4 py-3 text-yellow-400">{log.gift_points}</td>
                    <td className="px-4 py-3 text-green-400 font-semibold">
                      {log.total_points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}

      </div>
    </div>
  );
}
