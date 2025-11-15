'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import Image from 'next/image';
import type { SliderItem } from '@/lib/supabase';

interface GameCarouselProps {
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

export default function GameCarousel({ isSpinning, setIsSpinning }: GameCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([]);
  const [currentQueueId, setCurrentQueueId] = useState<number | null>(null);

  // Fetch slider items
  useEffect(() => {
    fetchSliderItems();
  }, []);

  const fetchSliderItems = async () => {
    try {
      const res = await fetch('/api/game/slider-items');
      const data = await res.json();
      setSliderItems(data.items);
    } catch (error) {
      console.error('Error fetching slider items:', error);
    }
  };

  // Poll for queue updates
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isSpinning) {
        checkForNextPlayer();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isSpinning]);

  const checkForNextPlayer = async () => {
    try {
      const res = await fetch('/api/game/current');
      const data = await res.json();

      // If there's a processing player and we're not spinning, start a game
      if (data.currentPlayer && !isSpinning) {
        setCurrentQueueId(data.currentPlayer.id);
        setTimeout(() => {
          spinCarousel(data.currentPlayer.id);
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking queue:', error);
    }
  };

  const spinCarousel = useCallback(async (queueId: number) => {
    if (!carouselRef.current || sliderItems.length === 0) return;

    setIsSpinning(true);

    // Call spin API to determine outcome
    const spinRes = await fetch('/api/game/spin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queueId })
    });

    const spinData = await spinRes.json();

    // Calculate target position
    let targetIndex;
    if (spinData.isWinner && spinData.product) {
      // Find the winning product in the slider
      targetIndex = sliderItems.findIndex(item => item.id === spinData.product.id);
      if (targetIndex === -1) targetIndex = Math.floor(Math.random() * sliderItems.length);
    } else {
      // Find a "Try Again" filler
      const fillerIndices = sliderItems
        .map((item, idx) => item.type === 'filler' ? idx : -1)
        .filter(idx => idx !== -1);
      targetIndex = fillerIndices[Math.floor(Math.random() * fillerIndices.length)] || 0;
    }

    const itemWidth = 300; // Width of each item + gap
    const centerOffset = (window.innerWidth / 2) - (itemWidth / 2);
    const targetPosition = -(targetIndex * itemWidth) + centerOffset;

    // Add extra spins for effect
    const extraDistance = sliderItems.length * itemWidth * 3;
    const totalDistance = targetPosition - extraDistance;

    // GSAP animation
    gsap.to(carouselRef.current, {
      x: totalDistance,
      duration: 5,
      ease: 'power3.out',
      onComplete: () => {
        setIsSpinning(false);

        // Show winner modal if applicable
        if (spinData.isWinner) {
          // Trigger winner modal
          window.dispatchEvent(new CustomEvent('showWinner', {
            detail: {
              username: spinData.winner?.username,
              product: spinData.product
            }
          }));
        }

        // Refresh slider items
        fetchSliderItems();

        // Check if same player has more plays
        if (spinData.remainingPlays > 0) {
          setTimeout(() => {
            spinCarousel(queueId);
          }, 5000);
        }
      }
    });

  }, [sliderItems, setIsSpinning]);

  const handleManualSpin = () => {
    if (isSpinning) return;

    // Trigger next player from queue
    fetch('/api/game/queue/next', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.hasNext) {
          setCurrentQueueId(data.player.id);
          setTimeout(() => {
            spinCarousel(data.player.id);
          }, 2000);
        } else {
          alert('No players in queue. Use API to add players.');
        }
      })
      .catch(console.error);
  };

  if (sliderItems.length === 0) {
    return <div className="text-center py-20">Loading carousel...</div>;
  }

  return (
    <div className="relative mb-16">
      {/* Pointer/Arrow */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-16 z-30">
        <div className="text-8xl animate-bounce">
          ⬇️
        </div>
      </div>

      {/* Carousel Container */}
      <div className="overflow-hidden relative h-96 neon-border rounded-xl bg-black/50 backdrop-blur-sm">
        <div
          ref={carouselRef}
          className="flex gap-8 absolute top-1/2 transform -translate-y-1/2"
          style={{ left: '50%' }}
        >
          {sliderItems.map((item, index) => {
            const isFiller = item.type === 'filler';

            return (
              <div
                key={`${item.id}-${index}`}
                className="relative flex-shrink-0 transition-transform duration-300 hover:scale-105"
                style={{ width: '250px' }}
              >
                <div className={`
                  rounded-lg overflow-hidden shadow-2xl
                  ${isFiller ? 'bg-gray-800 border-4 border-red-600' : 'bg-gradient-to-br from-purple-600 to-pink-600 border-4 border-casino-gold'}
                `}>
                  <div className="aspect-square relative bg-white">
                    {isFiller ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold text-red-600">
                          {item.title}
                        </span>
                      </div>
                    ) : (
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        className="object-contain p-4"
                        unoptimized
                      />
                    )}
                  </div>
                  <div className="p-4 text-center bg-black/70">
                    <h3 className="text-lg font-bold text-white truncate">
                      {item.title}
                    </h3>
                    {!isFiller && (
                      <p className="text-casino-gold text-xl font-bold">
                        {item.price} лв
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spin Button */}
      <div className="text-center mt-8">
        <button
          onClick={handleManualSpin}
          disabled={isSpinning}
          className={`
            px-16 py-6 text-3xl font-bold rounded-full
            transition-all duration-300 transform
            ${isSpinning
              ? 'bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-casino-purple to-casino-neon hover:scale-110 neon-border animate-pulse'
            }
          `}
        >
          {isSpinning ? '🎰 SPINNING...' : '🎰 ЗАВЪРТИ'}
        </button>
      </div>
    </div>
  );
}
