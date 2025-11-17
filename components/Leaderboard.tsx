'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Winner } from '@/lib/supabase';

export default function Leaderboard() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchWinners();

    // Refresh every 5 seconds
    const interval = setInterval(fetchWinners, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (winners.length === 0) return;

    // Rotate through winners every 3 seconds
    const rotateInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % winners.length);
    }, 3000);

    return () => clearInterval(rotateInterval);
  }, [winners.length]);

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
    return null; // Don't show anything if no winners
  }

  const currentWinner = winners[currentIndex];

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 px-4">
      <div className="max-h-[150px] overflow-hidden">
        {/* Winner Display with Flip Animation */}
        <div className="flip-container">
          <div
            key={currentWinner.id}
            className="flip-card animate-flip-vertical"
          >
            {/* Label on top */}
            <div className="text-center mb-2">
              <p className="text-base md:text-lg font-medium text-white/80">
                ПОСЛЕДНИ ПОБЕДИТЕЛИ
              </p>
            </div>

            {/* Winner Info */}
            <div className="flex items-center justify-center gap-4 md:gap-6 bg-black/30 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-white/10">
              {/* Product Image */}
              <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 relative bg-white/5 rounded-lg overflow-hidden border border-white/20">
                {currentWinner.product_image_url ? (
                  <Image
                    src={currentWinner.product_image_url}
                    alt={currentWinner.product_title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-3xl md:text-4xl">🎁</span>
                  </div>
                )}
              </div>

              {/* Winner Details */}
              <div className="flex-1 min-w-0">
                <p className="text-lg md:text-xl font-bold text-white truncate">
                  {currentWinner.username}
                </p>
                <p className="text-sm md:text-base text-white/70 truncate">
                  {currentWinner.product_title}
                </p>
              </div>

              {/* Price */}
              <div className="flex-shrink-0 text-right">
                <p className="text-xl md:text-2xl font-bold text-white whitespace-nowrap">
                  {currentWinner.product_price} лв
                </p>
                <p className="text-xs text-white/50 hidden md:block">
                  {new Date(currentWinner.won_at).toLocaleString('bg-BG', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
