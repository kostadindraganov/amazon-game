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

  if (!currentWinner) {
    return null;
  }

  return (
    <div className="w-full mx-auto mt-8 block">
      <h2 className="text-center text-3xl font-black text-yellow-400 mb-4 tracking-wider drop-shadow-md uppercase">
        Победителите
      </h2>
      <div className="h-[220px] overflow-hidden border-2 border-solid border-yellow-300/50 rounded-xl shadow-lg shadow-yellow-900/20">
        {/* Winner Display with Flip Animation */}
        <div className="flip-container h-full">
          <div
            key={currentWinner.id}
            className="flip-card animate-flip-vertical h-full"
          >
            {/* Winner Info - 2 Columns Layout */}
            <div className="grid grid-cols-2 gap-2 h-full bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-md p-2 border border-white/10">

              {/* Column 1: Image with Price & Date Overlays */}
              <div className="relative w-full h-full rounded-lg overflow-hidden border border-white/20 shadow-inner bg-black/20">
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
                    <span className="text-5xl">🎁</span>
                  </div>
                )}

                {/* Date Overlay (Top Left) */}
                <div className="absolute top-0 left-0 bg-black/60 backdrop-blur-sm text-white font-black px-3 py-1 rounded-br-xl border-b border-r border-white/20 z-10 text-md">
                  {new Date(currentWinner.won_at).toLocaleString('bg-BG', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </div>

                {/* Price Overlay (Bottom Right) */}
                <div className="absolute bottom-0 right-0 bg-red-600/90 backdrop-blur-sm text-white font-black px-3 py-1 rounded-tl-xl text-lg shadow-lg border-t border-l border-white/20 z-10">
                  {currentWinner.product_price} лв
                </div>
              </div>

              {/* Column 2: Info (Title & Winner) - Centered */}
              <div className="flex flex-col justify-center items-center text-center h-full gap-2 overflow-hidden">

                {/* Row 1: Title */}
                <div className="w-full flex flex-col justify-center items-center overflow-hidden">
                  <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest mb-0.5">Спечелено:</p>
                  <p className="text-2xl md:text-3xl leading-tight text-white font-black truncate w-full drop-shadow-sm">
                    {currentWinner.product_title}
                  </p>
                </div>

                <div className="w-1/2 h-px bg-white/10 my-1"></div>

                {/* Row 2: Winner */}
                <div className="w-full flex flex-col justify-center items-center overflow-hidden">
                  <p className="text-[10px] text-yellow-300 uppercase font-bold tracking-wider mb-0.5">Победител:</p>
                  <p className="text-2xl md:text-3xl font-black text-white truncate w-full">
                    {currentWinner.username}
                  </p>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
