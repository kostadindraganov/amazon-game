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
        // Dispatch close event to trigger spin
        window.dispatchEvent(new CustomEvent('playerModalClosed'));
      }, 5000);
    }) as EventListener;

    window.addEventListener('showPlayer', handleShowPlayer);

    return () => {
      window.removeEventListener('showPlayer', handleShowPlayer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-12 rounded-2xl border-4 border-white shadow-2xl max-w-2xl">
        <h2 className="text-4xl font-bold text-center mb-6 text-white truncate">
          В МОМЕНТА ИГРАЕ
        </h2>
        <p className="text-5xl font-bold text-center text-yellow-400 truncate">
          {username}
        </p>
      </div>
    </div>
  );
}
