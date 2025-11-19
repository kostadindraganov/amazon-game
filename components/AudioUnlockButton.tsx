'use client';

import { useState } from 'react';

interface AudioUnlockButtonProps {
    onUnlock: () => void;
}

export default function AudioUnlockButton({ onUnlock }: AudioUnlockButtonProps) {
    const [isVisible, setIsVisible] = useState(true);

    const handleClick = () => {
        onUnlock();
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-8 right-8 z-50 animate-pulse">
            <button
                onClick={handleClick}
                className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-casino-gold to-yellow-500 text-black font-bold text-lg rounded-full shadow-2xl hover:scale-110 transition-transform duration-200"
            >
                <span className="text-2xl">🔊</span>
                <span>Включи звука</span>
            </button>
        </div>
    );
}
