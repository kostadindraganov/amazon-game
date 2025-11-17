'use client';

import { useEffect, useState } from 'react';
import type { Settings } from '@/lib/supabase';

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [sliderItemCount, setSliderItemCount] = useState(100);
  const [minPointsForPlay, setMinPointsForPlay] = useState(300);
  const [headlineText, setHeadlineText] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setSettings(data);

      // Set form values
      setSliderItemCount(data.slider_item_count);
      setMinPointsForPlay(data.min_points_for_play);
      setHeadlineText(data.headline_text);
    } catch (error) {
      console.error('Error fetching settings:', error);
      alert('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slider_item_count: sliderItemCount,
          min_points_for_play: minPointsForPlay,
          headline_text: headlineText
        })
      });

      if (!res.ok) throw new Error('Failed to update settings');

      alert('Settings updated successfully!');
      fetchSettings();
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-2xl">Loading settings...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-casino-gold">Game Settings</h1>

      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Total Slider Items
            </label>
            <input
              type="number"
              min="1"
              value={sliderItemCount}
              onChange={(e) => setSliderItemCount(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <p className="text-sm text-gray-400 mt-1">
              Total number of items in the slider (including "Try Again" fillers)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Minimum Points to Play
            </label>
            <input
              type="number"
              min="1"
              value={minPointsForPlay}
              onChange={(e) => setMinPointsForPlay(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <p className="text-sm text-gray-400 mt-1">
              Minimum points required for one spin
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Homepage Headline Text
            </label>
            <input
              type="text"
              value={headlineText}
              onChange={(e) => setHeadlineText(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Играй за награди като изпратиш 300 точки"
              required
            />
            <p className="text-sm text-gray-400 mt-1">
              Text displayed above the carousel on the home page
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>

        {/* Current Stats */}
        {settings && (
          <div className="mt-8 pt-8 border-t border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-white">Current Configuration</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400">Slider Items</p>
                <p className="text-2xl font-bold text-casino-gold">{settings.slider_item_count}</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400">Min Points</p>
                <p className="text-2xl font-bold text-casino-gold">{settings.min_points_for_play}</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400">Last Updated</p>
                <p className="text-sm text-gray-300">
                  {new Date(settings.updated_at).toLocaleString('bg-BG')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
