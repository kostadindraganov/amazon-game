'use client';

import { useEffect, useState } from 'react';

export default function PlayerModal() {
  const [show, setShow] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const handleShowPlayer = ((e: CustomEvent) => {
      setUsername(e.detail.username);
      setShow(true);

      setTimeout(() => {
        setShow(false);
      }, 3000);
    }) as EventListener;

    window.addEventListener('showPlayer', handleShowPlayer);

    return () => {
      window.removeEventListener('showPlayer', handleShowPlayer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gradient-to-br from-purple-900 to-pink-900 p-12 rounded-3xl border-4 border-casino-gold neon-border max-w-2xl">
        <h2 className="text-5xl font-bold text-center mb-6 neon-text animate-glow">
          В МОМЕНТА ИГРАЕ
        </h2>
        <p className="text-6xl font-bold text-center text-casino-gold animate-pulse">
          {username}
        </p>
      </div>
    </div>
  );
}
