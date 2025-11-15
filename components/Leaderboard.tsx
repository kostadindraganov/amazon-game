'use client';

import { useEffect, useState } from 'react';
import type { Winner } from '@/lib/supabase';

export default function Leaderboard() {
  const [winners, setWinners] = useState<Winner[]>([]);

  useEffect(() => {
    fetchWinners();

    // Refresh every 5 seconds
    const interval = setInterval(fetchWinners, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchWinners = async () => {
    try {
      const res = await fetch('/api/game/leaderboard');
      const data = await res.json();
      setWinners(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  if (winners.length === 0) {
    return (
      <div className="max-w-4xl mx-auto mt-16">
        <h2 className="text-4xl font-bold text-center mb-8 neon-text">
          🏆 ПОСЛЕДНИ ПОБЕДИТЕЛИ 🏆
        </h2>
        <p className="text-center text-gray-400 text-xl">
          Все още няма победители. Бъдете първи!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-16">
      <h2 className="text-4xl font-bold text-center mb-8 neon-text animate-glow">
        🏆 ПОСЛЕДНИ ПОБЕДИТЕЛИ 🏆
      </h2>

      <div className="space-y-4">
        {winners.map((winner, index) => (
          <div
            key={winner.id}
            className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm p-6 rounded-xl border-2 border-casino-gold/50 hover:border-casino-gold transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className={`
                  text-4xl font-bold w-12 h-12 flex items-center justify-center rounded-full
                  ${index === 0 ? 'bg-yellow-500 text-black' : ''}
                  ${index === 1 ? 'bg-gray-300 text-black' : ''}
                  ${index === 2 ? 'bg-orange-600 text-white' : ''}
                  ${index > 2 ? 'bg-purple-700 text-white' : ''}
                `}>
                  {index + 1}
                </div>

                <div>
                  <p className="text-2xl font-bold text-casino-gold">
                    {winner.username}
                  </p>
                  <p className="text-lg text-gray-300">
                    {winner.product_title}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-3xl font-bold text-casino-gold neon-text">
                  {winner.product_price} лв
                </p>
                <p className="text-sm text-gray-400">
                  {new Date(winner.won_at).toLocaleString('bg-BG')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
