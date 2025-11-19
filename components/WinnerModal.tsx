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
        // Dispatch event to notify that winner modal is closed
        window.dispatchEvent(new Event('winnerModalClosed'));
      }, 15000);
    }) as EventListener;

    window.addEventListener('showWinner', handleShowWinner);

    return () => {
      window.removeEventListener('showWinner', handleShowWinner);
    };
  }, []);

  if (!show || !winnerData) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gradient-to-br from-yellow-600 via-casino-gold to-yellow-600 p-6 rounded-2xl border-4 border-white shadow-2xl max-w-3xl">
        <div className="bg-black/80 p-3 rounded-2xl">
          <h2 className="text-5xl font-bold text-center mb-4 text-casino-gold">
            🎉 ЧЕСТИТО!🎉
          </h2>

          <p className="text-5xl font-bold text-center mb-3 text-white">
            на - {winnerData.username}
          </p>

          <p className="text-3xl font-bold text-center text-casino-gold mb-2">
            ТИ СПЕЧЕЛИ
          </p>

          <h3 className="text-5xl font-bold text-center text-white mb-3">
            {winnerData.product.title}
          </h3>



          <div className="bg-white-500/70 p-4 rounded-xl mb-2">
            <div className="relative w-full h-40">
              <Image
                src={winnerData.product.image_url}
                alt={winnerData.product.title}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>


          <div className="bg-yellow-500/20 border-4 border-yellow-500 rounded-xl px-5 py-2 mt-2 mb-6">
            <p className="text-3xl text-center text-white leading-8 font-semibold">
              Моля, <span className="font-bold text-casino-gold text-3xl">{winnerData.username}</span> да изпрати на лично ТЕЛ. И АДРЕС за доставка. Изпращаме до 3 дни с Еконт
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
