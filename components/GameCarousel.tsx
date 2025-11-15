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
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([]);
  const [currentQueueId, setCurrentQueueId] = useState<number | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

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

  // Create infinite loop by triplicating items
  const infiniteItems = sliderItems.length > 0
    ? [...sliderItems, ...sliderItems, ...sliderItems]
    : [];

  // Update 3D transforms based on position
  const updateItemTransforms = useCallback(() => {
    if (!carouselRef.current || !containerRef.current) return;

    const items = carouselRef.current.children;
    const containerCenter = containerRef.current.offsetWidth / 2;

    Array.from(items).forEach((item) => {
      const htmlItem = item as HTMLElement;
      const itemRect = htmlItem.getBoundingClientRect();
      const containerRect = containerRef.current!.getBoundingClientRect();

      // Calculate distance from center
      const itemCenter = itemRect.left + itemRect.width / 2 - containerRect.left;
      const distanceFromCenter = Math.abs(itemCenter - containerCenter);
      const maxDistance = containerCenter;
      const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);

      // Scale: center = 1.4, sides = 0.6
      const scale = 1.4 - (normalizedDistance * 0.8);

      // Opacity: center = 1, sides = 0.3
      const opacity = 1 - (normalizedDistance * 0.7);

      // 3D rotation
      const rotationY = (itemCenter - containerCenter) / 10;
      const translateZ = (1 - normalizedDistance) * 100;

      gsap.set(htmlItem, {
        scale,
        opacity,
        rotationY,
        z: translateZ,
        transformOrigin: 'center center'
      });
    });

    animationFrameRef.current = requestAnimationFrame(updateItemTransforms);
  }, []);

  // Start transform updates when items are loaded
  useEffect(() => {
    if (infiniteItems.length > 0 && !isSpinning) {
      updateItemTransforms();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [infiniteItems.length, isSpinning, updateItemTransforms]);

  // Poll for queue updates - ONLY trigger spins from API
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
        // Prevent duplicate processing of the same player
        if (currentQueueId === data.currentPlayer.id) {
          return; // Already processing this player
        }

        // Ensure slider items are loaded before proceeding
        if (sliderItems.length === 0) {
          console.log('Waiting for slider items to load...');
          return;
        }

        setCurrentQueueId(data.currentPlayer.id);

        // Set spinning state immediately to prevent duplicate triggers
        setIsSpinning(true);

        // Show player modal
        window.dispatchEvent(new CustomEvent('showPlayer', {
          detail: { username: data.currentPlayer.username }
        }));

        setTimeout(() => {
          spinCarousel(data.currentPlayer.id);
        }, 3000);
      }
    } catch (error) {
      console.error('Error checking queue:', error);
    }
  };

  const spinCarousel = useCallback(async (queueId: number) => {
    if (!carouselRef.current || sliderItems.length === 0) {
      // Reset state if we can't spin
      setIsSpinning(false);
      setCurrentQueueId(null);
      return;
    }

    try {
      // Stop transform updates during spin
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

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
      // Find the winning product in the middle set
      const baseIndex = sliderItems.findIndex(item => item.id === spinData.product.id);
      if (baseIndex === -1) {
        targetIndex = sliderItems.length + Math.floor(Math.random() * sliderItems.length);
      } else {
        targetIndex = sliderItems.length + baseIndex; // Middle set
      }
    } else {
      // Find a "Try Again" filler in middle set
      const fillerIndices = sliderItems
        .map((item, idx) => item.type === 'filler' ? idx : -1)
        .filter(idx => idx !== -1);
      const randomFillerIndex = fillerIndices[Math.floor(Math.random() * fillerIndices.length)] || 0;
      targetIndex = sliderItems.length + randomFillerIndex;
    }

    const itemWidth = 320; // Width of each item + gap
    const centerOffset = (window.innerWidth / 2) - (itemWidth / 2);

    // Calculate final position
    const targetPosition = -(targetIndex * itemWidth) + centerOffset;

    // Create casino slot machine animation timeline
    const timeline = gsap.timeline();

    // Phase 1: Fast acceleration (like pulling slot lever)
    timeline.to(carouselRef.current, {
      x: '-=800',
      duration: 0.3,
      ease: 'power2.in',
    });

    // Phase 2: High speed spinning
    timeline.to(carouselRef.current, {
      x: targetPosition - 2000,
      duration: 3,
      ease: 'none',
    });

    // Phase 3: Gradual deceleration (slot machine slow down)
    timeline.to(carouselRef.current, {
      x: targetPosition - 500,
      duration: 1.5,
      ease: 'power1.out',
    });

    // Phase 4: Final positioning with bounce (mechanical stop)
    timeline.to(carouselRef.current, {
      x: targetPosition,
      duration: 1.2,
      ease: 'elastic.out(0.8, 0.4)',
      onUpdate: updateItemTransforms,
      onComplete: () => {
        setIsSpinning(false);
        setCurrentQueueId(null); // Reset so next player can be processed

        // Restart transform updates
        updateItemTransforms();

        // Show winner modal if applicable
        if (spinData.isWinner) {
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
          // Wait for winner modal to close (5s) or immediately if no winner
          const waitTime = spinData.isWinner ? 5000 : 0;
          setTimeout(async () => {
            // Fetch current player data to get username
            const currentRes = await fetch('/api/game/current');
            const currentData = await currentRes.json();

            if (currentData.currentPlayer) {
              // Show player modal again
              window.dispatchEvent(new CustomEvent('showPlayer', {
                detail: { username: currentData.currentPlayer.username }
              }));

              // Wait 3 seconds then spin again
              setTimeout(() => {
                spinCarousel(queueId);
              }, 3000);
            }
          }, waitTime);
        }
      }
    });
    } catch (error) {
      console.error('Error during spin:', error);
      // Reset state on error
      setIsSpinning(false);
      setCurrentQueueId(null);
      updateItemTransforms();
    }
  }, [sliderItems, setIsSpinning, updateItemTransforms]);

  if (sliderItems.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl neon-text animate-pulse">Loading carousel...</div>
      </div>
    );
  }

  return (
    <div className="relative mb-16">
      {/* Carousel Container with 3D Perspective */}
      <div
        ref={containerRef}
        className="overflow-hidden relative h-[500px] neon-border rounded-xl bg-black/50 backdrop-blur-sm"
        style={{
          perspective: '2000px',
          perspectiveOrigin: 'center center'
        }}
      >
        {/* Center indicator line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-casino-gold/50 z-20 transform -translate-x-1/2 shadow-lg shadow-casino-gold/50" />

        {/* Gradient overlays for depth */}
        <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />

        <div
          ref={carouselRef}
          className="flex gap-12 absolute top-1/2 transform -translate-y-1/2"
          style={{
            left: '50%',
            transformStyle: 'preserve-3d',
          }}
        >
          {infiniteItems.map((item, index) => {
            const isFiller = item.type === 'filler';

            return (
              <div
                key={`${item.id}-${index}`}
                className="relative flex-shrink-0"
                style={{
                  width: '280px',
                  transformStyle: 'preserve-3d',
                }}
              >
                <div className={`
                  rounded-xl overflow-hidden shadow-2xl
                  ${isFiller
                    ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-4 border-red-600/50'
                    : 'bg-gradient-to-br from-purple-600 to-pink-600 border-4 border-casino-gold'
                  }
                `}>
                  <div className="aspect-square relative bg-white">
                    {isFiller ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                        <span className="text-3xl font-bold text-red-500 text-center px-4">
                          {item.title}
                        </span>
                      </div>
                    ) : (
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        className="object-contain p-6"
                        unoptimized
                      />
                    )}
                  </div>
                  <div className="p-4 text-center bg-black/80">
                    <h3 className="text-lg font-bold text-white truncate">
                      {item.title}
                    </h3>
                    {!isFiller && (
                      <p className="text-casino-gold text-2xl font-bold mt-1">
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

      {/* Status indicator */}
      {isSpinning && (
        <div className="text-center mt-8">
          <div className="inline-block px-8 py-4 bg-gradient-to-r from-casino-purple to-casino-neon rounded-full neon-border">
            <span className="text-2xl font-bold animate-pulse">🎰 SPINNING...</span>
          </div>
        </div>
      )}
    </div>
  );
}
