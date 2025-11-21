'use client';

import { useEffect, useState } from 'react';
import GameCarousel from '@/components/GameCarousel';
import Leaderboard from '@/components/Leaderboard';
import WinnerModal from '@/components/WinnerModal';
import PlayerModal from '@/components/PlayerModal';

export default function Home() {
  const [settings, setSettings] = useState<any>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    // Fetch settings
    fetch('/api/game/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(console.error);
  }, []);



  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center casino-gradient">
        <div className="text-4xl neon-text animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen casino-gradient overflow-hidden">
      <div className="container mx-auto px-4 py-28">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="my-4 flex items-center justify-center gap-2 text-5xl text-casino-gold font-semibold">
            <span>{settings.headline_text} </span>
          </div>
          <div className="flex items-center justify-center gap-2 text-5xl text-casino-gold font-semibold my-3">
            {/* <span className="text-6xl text-white font-bold">{settings.min_points_for_play}</span> */}
            {/* <img src="/hat.webp" alt="Coin" className="w-32 h-32" />
            <img src="/hat2.webp" alt="Coin" className="w-32 h-32" /> */}

          </div>
        </div>

        {/* Game Carousel */}
        <GameCarousel
          isSpinning={isSpinning}
          setIsSpinning={setIsSpinning}
        />

        {/* Leaderboard */}
        <Leaderboard />

        {/* Modals */}
        <PlayerModal />
        <WinnerModal />
      </div>
    </main>
  );
}
