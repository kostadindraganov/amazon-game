'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface WinnerData {
  username: string;
  product: {
    title: string;
    price: number;
    image_url: string;
  };
}

export default function WinnerModal() {
  const [show, setShow] = useState(false);
  const [winnerData, setWinnerData] = useState<WinnerData | null>(null);

  useEffect(() => {
    const handleShowWinner = ((e: CustomEvent) => {
      setWinnerData(e.detail);
      setShow(true);

      setTimeout(() => {
        setShow(false);
      }, 5000);
    }) as EventListener;

    window.addEventListener('showWinner', handleShowWinner);

    return () => {
      window.removeEventListener('showWinner', handleShowWinner);
    };
  }, []);

  if (!show || !winnerData) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gradient-to-br from-yellow-600 via-casino-gold to-yellow-600 p-12 rounded-3xl border-8 border-white shadow-2xl max-w-3xl animate-bounce-slow">
        <div className="bg-black/80 p-8 rounded-2xl">
          <h2 className="text-6xl font-bold text-center mb-8 text-casino-gold animate-glow">
            🎉 ЧЕСТИТО! 🎉
          </h2>

          <p className="text-4xl font-bold text-center mb-6 text-white">
            {winnerData.username}
          </p>

          <div className="bg-white p-6 rounded-xl mb-6">
            <div className="relative w-full h-64">
              <Image
                src={winnerData.product.image_url}
                alt={winnerData.product.title}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>

          <h3 className="text-3xl font-bold text-center text-casino-gold mb-2">
            {winnerData.product.title}
          </h3>

          <p className="text-5xl font-bold text-center text-white neon-text">
            {winnerData.product.price} лв
          </p>
        </div>
      </div>
    </div>
  );
}
