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
    const interval = setInterval(fetchWinners, 10000);
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
    <div className="w-full  mx-auto mt-2 px-2">
      <div className="max-h-[170px] overflow-hidden border-2 border-solid border-white-500/70 rounded-lg">
        {/* Winner Display with Flip Animation */}
        <div className="flip-container">
          <div
            key={currentWinner.id}
            className="flip-card animate-flip-vertical"
          >
            {/* Winner Info - Equal Width Columns */}
            <div className="grid grid-cols-5 gap-2 md:gap-4 items-center bg-black/30 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-white/10">
              {/* Column 1: Product Image */}
              <div className="flex justify-between">
                <div className="w-24 h-24  relative bg-white/5 rounded-lg overflow-hidden border border-white/20">
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
              </div>

              {/* Column 2: Product Title */}
              <div className="text-center px-2">
                <p className="text-3xl  text-white/90 font-bold text-left">
                  {currentWinner.product_title}
                </p>
              </div>

              {/* Column 3: Winner Username */}
              <div className="text-center px-2">
                <p className="text-lg text-white/70 mb-1">ПОБЕДИТЕЛ:</p>
                <p className="text-2xl font-bold text-white truncate">
                  {currentWinner.username}
                </p>
              </div>

              {/* Column 4: Price */}
              <div className="text-center px-2">
                <p className="text-3xl font-bold text-white whitespace-nowrap">
                  {currentWinner.product_price} лв
                </p>
              </div>

              {/* Column 5: Date */}
              <div className="text-center px-2">
                <p className="text-2xl font-bold text-white/70">
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
