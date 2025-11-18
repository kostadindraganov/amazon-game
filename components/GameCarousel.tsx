'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import type { SliderItem } from '@/lib/supabase';
import { SpinRoulette } from 'react-spin-roulette';

interface GameCarouselProps {
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

export default function GameCarousel({ isSpinning, setIsSpinning }: GameCarouselProps) {
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([]);
  const [winningIndex, setWinningIndex] = useState<number>(0);
  const [currentQueueId, setCurrentQueueId] = useState<number | null>(null);
  const [pendingSpinQueueId, setPendingSpinQueueId] = useState<number | null>(null);

  // Use refs instead of window object for better memory management
  const spinDataRef = useRef<any>(null);
  const queueIdRef = useRef<number | null>(null);

  // Memoize prizes transformation to prevent unnecessary recalculations
  const prizes = useMemo(() =>
    sliderItems.map((item, index) => ({
      id: item.id,
      label: item.title,
      image: item.type === 'product' ? item.image_url : undefined,
      value: item,
      index,
    })),
    [sliderItems]
  );

  // Custom prize renderer for cards
  const renderPrize = useCallback((prize: any) => {
    const item = prize.value as SliderItem;
    const isFiller = item.type === 'filler';
    const index = prize.index as number;

    let cardColor = '#2D3035';
    if (isFiller) {
      cardColor = '#F95146';
    } else if (index % 3 === 0) {
      cardColor = '#00C74D';
    }

    return (
      <div
        className="flex flex-col items-center justify-between rounded-lg overflow-hidden"
        style={{
          width: '240px',
          height: '340px',
          backgroundColor: cardColor,
          border: '2px solid rgba(255, 255, 255, 0.1)',
          padding: '16px',
        }}
      >
        {isFiller ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white font-bold text-2xl text-center leading-tight">
              {item.title}
            </div>
          </div>
        ) : (
          <>
            <div className="text-white text-sm font-semibold text-center leading-tight">
              {item.title}
            </div>
            <div className="relative flex-shrink-0" style={{ width: '180px', height: '180px' }}>
              <Image
                src={item.image_url}
                alt={item.title}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="text-yellow-400 text-xl font-bold">
              {item.price} лв
            </div>
          </>
        )}
      </div>
    );
  }, []);

  // Custom indicator (center selection line)
  const renderIndicator = useCallback(() => (
    <div
      className="absolute top-0 bottom-0 z-20"
      style={{
        left: '50%',
        width: '3px',
        backgroundColor: '#666',
        transform: 'translateX(-1.5px)',
      }}
    />
  ), []);

  const fetchSliderItems = useCallback(async () => {
    try {
      const res = await fetch('/api/game/slider-items');
      const data = await res.json();
      setSliderItems(data.items || []);
    } catch (error) {
      // Silently handle error - could add error state if needed
    }
  }, []);

  useEffect(() => {
    fetchSliderItems();
  }, [fetchSliderItems]);

  const checkForNextPlayer = useCallback(async () => {
    try {
      const res = await fetch('/api/game/current');
      const data = await res.json();

      if (data.currentPlayer && !isSpinning) {
        if (currentQueueId === data.currentPlayer.id) {
          return;
        }

        if (sliderItems.length === 0) {
          return;
        }

        setCurrentQueueId(data.currentPlayer.id);
        setPendingSpinQueueId(data.currentPlayer.id);

        window.dispatchEvent(new CustomEvent('showPlayer', {
          detail: { username: data.currentPlayer.username }
        }));
      }
    } catch (error) {
      // Silently handle error
    }
  }, [isSpinning, currentQueueId, sliderItems.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSpinning) {
        checkForNextPlayer();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isSpinning, checkForNextPlayer]);

  const spinCarousel = useCallback(async (queueId: number) => {
    if (sliderItems.length === 0) {
      setIsSpinning(false);
      setCurrentQueueId(null);
      return;
    }

    try {
      const spinRes = await fetch('/api/game/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueId })
      });

      const spinData = await spinRes.json();

      let targetIndex;
      if (spinData.isWinner && spinData.product) {
        targetIndex = sliderItems.findIndex(item => item.id === spinData.product.id);

        if (targetIndex === -1) {
          const fillerIndices = sliderItems
            .map((item, idx) => item.type === 'filler' ? idx : -1)
            .filter(idx => idx !== -1);
          targetIndex = fillerIndices[Math.floor(Math.random() * fillerIndices.length)] || 0;
        }
      } else {
        const fillerIndices = sliderItems
          .map((item, idx) => item.type === 'filler' ? idx : -1)
          .filter(idx => idx !== -1);
        targetIndex = fillerIndices[Math.floor(Math.random() * fillerIndices.length)] || 0;
      }

      // Store in refs instead of window object
      spinDataRef.current = spinData;
      queueIdRef.current = queueId;

      setWinningIndex(targetIndex);
      setIsSpinning(true);
    } catch (error) {
      setIsSpinning(false);
      setCurrentQueueId(null);
    }
  }, [sliderItems, setIsSpinning, setCurrentQueueId]);

  const handleSpinComplete = useCallback(async () => {
    const spinData = spinDataRef.current;
    const queueId = queueIdRef.current;

    setIsSpinning(false);
    setCurrentQueueId(null);

    if (spinData?.isWinner) {
      window.dispatchEvent(new CustomEvent('showWinner', {
        detail: {
          username: spinData.winner?.username,
          product: spinData.product
        }
      }));
    }

    fetchSliderItems();

    if (spinData?.remainingPlays > 0) {
      const waitTime = spinData.isWinner ? 5000 : 0;

      setTimeout(async () => {
        try {
          const currentRes = await fetch('/api/game/current');
          const currentData = await currentRes.json();

          if (currentData.currentPlayer) {
            setPendingSpinQueueId(queueId);
            window.dispatchEvent(new CustomEvent('showPlayer', {
              detail: { username: currentData.currentPlayer.username }
            }));
          }
        } catch (error) {
          // Silently handle error
        }
      }, waitTime);
    }

    // Cleanup refs
    spinDataRef.current = null;
    queueIdRef.current = null;
  }, [setIsSpinning, setCurrentQueueId, fetchSliderItems]);

  useEffect(() => {
    const handlePlayerModalClosed = () => {
      if (pendingSpinQueueId !== null) {
        spinCarousel(pendingSpinQueueId);
        setPendingSpinQueueId(null);
      }
    };

    window.addEventListener('playerModalClosed', handlePlayerModalClosed);
    return () => window.removeEventListener('playerModalClosed', handlePlayerModalClosed);
  }, [pendingSpinQueueId, spinCarousel]);

  if (sliderItems.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl neon-text animate-pulse">Loading carousel...</div>
      </div>
    );
  }

  return (
    <div className="relative mb-4">
      <div
        className="relative overflow-hidden"
        style={{
          background: '#191B28',
          height: '100%',
          borderRadius: '12px',
        }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
          style={{
            width: '300px',
            background: 'linear-gradient(to right, #191B28 0%, transparent 100%)',
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
          style={{
            width: '300px',
            background: 'linear-gradient(to left, #191B28 0%, transparent 100%)',
          }}
        />

        <SpinRoulette
          prizes={prizes}
          winningIndex={winningIndex}
          isSpinning={isSpinning}
          onComplete={handleSpinComplete}
          duration={8000}
          orientation="horizontal"
          prizeSize={264}
          minSpins={1}
          className="w-full h-full"
          renderPrize={renderPrize}
          renderIndicator={renderIndicator}
          easing="cubic-bezier(0.65, 0, 0.35, 1)"
        />
      </div>

      {isSpinning && (
        <div className="text-center mt-6">
          <div
            className="inline-block px-6 py-3 rounded-full"
            style={{
              background: 'linear-gradient(to right, #F95146, #00C74D)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <span className="text-xl font-bold text-white animate-pulse">🎰 SPINNING...</span>
          </div>
        </div>
      )}
    </div>
  );
}
