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
      console.log('📡 [GameCarousel] Fetching slider items...');
      const res = await fetch('/api/game/slider-items');
      console.log('📡 [GameCarousel] API response status:', res.status);
      const data = await res.json();
      console.log('📡 [GameCarousel] API response data:', data);
      console.log('📡 [GameCarousel] Items received:', data.items?.length || 0);
      setSliderItems(data.items || []);
    } catch (error) {
      console.error('❌ [GameCarousel] Error fetching slider items:', error);
    }
  };

  // Create infinite loop by triplicating items
  const infiniteItems = sliderItems.length > 0
    ? [...sliderItems, ...sliderItems, ...sliderItems]
    : [];

  // Simple update for roulette-style carousel (no 3D transforms needed)
  const updateItemTransforms = useCallback(() => {
    // No transforms needed for the 2D roulette style
    // Animation is handled purely by GSAP's x transform
  }, []);

  // Set initial position to show cards on both sides
  useEffect(() => {
    if (carouselRef.current && infiniteItems.length > 0) {
      // Position the carousel so that the middle set of items is centered
      // This will show cards on both left and right
      const itemWidth = 244; // 220px card + 24px gap
      const middleSetOffset = sliderItems.length * itemWidth;
      const centerOffset = window.innerWidth / 2 - itemWidth / 2;
      const initialX = -middleSetOffset + centerOffset;

      gsap.set(carouselRef.current, { x: initialX });
    }
  }, [infiniteItems.length, sliderItems.length]);

  // No continuous transform updates needed for 2D roulette style
  useEffect(() => {
    // Cleanup function for animation frame if needed
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const checkForNextPlayer = useCallback(async () => {
    try {
      console.log('🔍 [GameCarousel] Checking for next player...');
      const res = await fetch('/api/game/current');
      const data = await res.json();

      console.log('📊 [GameCarousel] Current game state:', {
        hasCurrentPlayer: !!data.currentPlayer,
        currentPlayerId: data.currentPlayer?.id,
        currentPlayerUsername: data.currentPlayer?.username,
        currentPlayerPlays: data.currentPlayer?.plays,
        queueLength: data.queueLength,
        isSpinning: isSpinning,
        trackedQueueId: currentQueueId,
        sliderItemsLoaded: sliderItems.length
      });

      // If there's a processing player and we're not spinning, start a game
      if (data.currentPlayer && !isSpinning) {
        // Prevent duplicate processing of the same player
        if (currentQueueId === data.currentPlayer.id) {
          console.log('⚠️  [GameCarousel] Already processing this player, skipping...', {
            queueId: data.currentPlayer.id,
            username: data.currentPlayer.username
          });
          return; // Already processing this player
        }

        // Ensure slider items are loaded before proceeding
        if (sliderItems.length === 0) {
          console.log('⏳ [GameCarousel] Waiting for slider items to load...', {
            sliderItemsLength: sliderItems.length
          });
          return;
        }

        console.log('🎮 [GameCarousel] Starting game for player:', {
          queueId: data.currentPlayer.id,
          username: data.currentPlayer.username,
          plays: data.currentPlayer.plays
        });

        setCurrentQueueId(data.currentPlayer.id);

        // Set spinning state immediately to prevent duplicate triggers
        setIsSpinning(true);

        console.log('🎭 [GameCarousel] Showing player modal for:', data.currentPlayer.username);

        // Show player modal
        window.dispatchEvent(new CustomEvent('showPlayer', {
          detail: { username: data.currentPlayer.username }
        }));

        console.log('⏰ [GameCarousel] Waiting 3 seconds before spin...');

        setTimeout(() => {
          console.log('🎰 [GameCarousel] Triggering spin for queueId:', data.currentPlayer.id);
          spinCarousel(data.currentPlayer.id);
        }, 3000);
      } else if (!data.currentPlayer) {
        console.log('💤 [GameCarousel] No player in queue to process');
      }
    } catch (error) {
      console.error('❌ [GameCarousel] Error checking queue:', error);
    }
  }, [isSpinning, currentQueueId, sliderItems.length, setIsSpinning]);

  // Poll for queue updates - ONLY trigger spins from API
  useEffect(() => {
    console.log('🔄 [GameCarousel] Setting up polling interval (2s)');
    const interval = setInterval(async () => {
      if (!isSpinning) {
        checkForNextPlayer();
      } else {
        console.log('⏸️  [GameCarousel] Skipping poll - currently spinning');
      }
    }, 2000);

    return () => {
      console.log('🛑 [GameCarousel] Clearing polling interval');
      clearInterval(interval);
    };
  }, [isSpinning, checkForNextPlayer]);

  const spinCarousel = useCallback(async (queueId: number) => {
    console.log('🎰 [GameCarousel.spinCarousel] Starting spin for queueId:', queueId);

    if (!carouselRef.current || sliderItems.length === 0) {
      console.error('❌ [GameCarousel.spinCarousel] Cannot spin - missing carousel ref or slider items');
      // Reset state if we can't spin
      setIsSpinning(false);
      setCurrentQueueId(null);
      return;
    }

    try {
      setIsSpinning(true);

      console.log('📡 [GameCarousel.spinCarousel] Calling /api/game/spin...');

      // Call spin API to determine outcome
      const spinRes = await fetch('/api/game/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueId })
      });

      const spinData = await spinRes.json();

      console.log('📥 [GameCarousel.spinCarousel] Spin API response:', {
        success: spinData.success,
        isWinner: spinData.isWinner,
        remainingPlays: spinData.remainingPlays,
        spinCount: spinData.spinCount
      });

    // Calculate target position
    let targetIndex;
    if (spinData.isWinner && spinData.product) {
      console.log('🏆 [GameCarousel.spinCarousel] WINNER! Finding product in slider:', spinData.product.title);
      // Find the winning product in the middle set
      const baseIndex = sliderItems.findIndex(item => item.id === spinData.product.id);
      if (baseIndex === -1) {
        console.warn('⚠️  [GameCarousel.spinCarousel] Product not found in slider, using random position');
        targetIndex = sliderItems.length + Math.floor(Math.random() * sliderItems.length);
      } else {
        targetIndex = sliderItems.length + baseIndex; // Middle set
        console.log('✅ [GameCarousel.spinCarousel] Product found at index:', baseIndex, '(targeting middle set)');
      }
    } else {
      console.log('🎯 [GameCarousel.spinCarousel] Not a winner, selecting "Try Again" filler');
      // Find a "Try Again" filler in middle set
      const fillerIndices = sliderItems
        .map((item, idx) => item.type === 'filler' ? idx : -1)
        .filter(idx => idx !== -1);
      const randomFillerIndex = fillerIndices[Math.floor(Math.random() * fillerIndices.length)] || 0;
      targetIndex = sliderItems.length + randomFillerIndex;
      console.log('✅ [GameCarousel.spinCarousel] Filler selected at index:', randomFillerIndex);
    }

    const itemWidth = 244; // Width of each item (220px) + gap (24px)
    const centerOffset = (window.innerWidth / 2) - (itemWidth / 2);

    // Calculate final position
    const targetPosition = -(targetIndex * itemWidth) + centerOffset;

    console.log('🎯 [GameCarousel.spinCarousel] Animation target calculated:', {
      targetIndex,
      targetPosition,
      itemWidth,
      centerOffset
    });

    // Create casino slot machine animation timeline
    console.log('🎬 [GameCarousel.spinCarousel] Starting GSAP animation...');
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
      onComplete: () => {
        console.log('🏁 [GameCarousel.spinCarousel] Animation complete!');

        setIsSpinning(false);
        setCurrentQueueId(null); // Reset so next player can be processed

        console.log('🔓 [GameCarousel.spinCarousel] Spinning state reset, queue ID cleared');

        // Show winner modal if applicable
        if (spinData.isWinner) {
          console.log('🎉 [GameCarousel.spinCarousel] Showing winner modal');
          window.dispatchEvent(new CustomEvent('showWinner', {
            detail: {
              username: spinData.winner?.username,
              product: spinData.product
            }
          }));
        }

        // Refresh slider items
        console.log('🔄 [GameCarousel.spinCarousel] Refreshing slider items...');
        fetchSliderItems();

        // Check if same player has more plays
        console.log('🔍 [GameCarousel.spinCarousel] Checking for remaining plays:', spinData.remainingPlays);
        if (spinData.remainingPlays > 0) {
          console.log('🔄 [GameCarousel.spinCarousel] Player has more plays! Setting up next spin...', {
            remainingPlays: spinData.remainingPlays,
            isWinner: spinData.isWinner,
            waitTime: spinData.isWinner ? 5000 : 0
          });

          // Wait for winner modal to close (5s) or immediately if no winner
          const waitTime = spinData.isWinner ? 5000 : 0;
          setTimeout(async () => {
            console.log('⏰ [GameCarousel.spinCarousel] Wait time elapsed, fetching current player...');
            // Fetch current player data to get username
            const currentRes = await fetch('/api/game/current');
            const currentData = await currentRes.json();

            console.log('📊 [GameCarousel.spinCarousel] Current player data:', {
              hasCurrentPlayer: !!currentData.currentPlayer,
              playerId: currentData.currentPlayer?.id,
              username: currentData.currentPlayer?.username,
              plays: currentData.currentPlayer?.plays
            });

            if (currentData.currentPlayer) {
              console.log('🎭 [GameCarousel.spinCarousel] Showing player modal for next play');
              // Show player modal again
              window.dispatchEvent(new CustomEvent('showPlayer', {
                detail: { username: currentData.currentPlayer.username }
              }));

              // Wait 3 seconds then spin again
              console.log('⏰ [GameCarousel.spinCarousel] Waiting 3 seconds before next spin...');
              setTimeout(() => {
                console.log('🔁 [GameCarousel.spinCarousel] Recursively calling spinCarousel for queueId:', queueId);
                spinCarousel(queueId);
              }, 3000);
            } else {
              console.warn('⚠️  [GameCarousel.spinCarousel] No current player found for next spin!');
            }
          }, waitTime);
        } else {
          console.log('✅ [GameCarousel.spinCarousel] No more plays for this player, spin complete');
        }
      }
    });
    } catch (error) {
      console.error('❌ [GameCarousel.spinCarousel] Error during spin:', error);
      // Reset state on error
      console.log('🔄 [GameCarousel.spinCarousel] Resetting state due to error');
      setIsSpinning(false);
      setCurrentQueueId(null);
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
      {/* Roulette Wrapper - CodePen Style */}
      <div
        className="relative overflow-hidden"
        style={{
          background: '#191B28',
          height: '400px',
          borderRadius: '12px',
        }}
      >
        {/* Center Selector Line */}
        <div
          className="absolute top-0 bottom-0 z-20"
          style={{
            left: '50%',
            width: '3px',
            backgroundColor: '#666',
            transform: 'translateX(-1.5px)',
          }}
        />

        {/* Gradient Overlays */}
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

        {/* Wheel Container */}
        <div
          ref={containerRef}
          className="absolute inset-0 flex items-center"
        >
          <div
            ref={carouselRef}
            className="flex gap-6 absolute"
            style={{
              left: '50%',
              height: '100%',
              alignItems: 'center',
            }}
          >
            {infiniteItems.map((item, index) => {
              const isFiller = item.type === 'filler';

              // Assign colors based on type - roulette style
              let cardColor = '#2D3035'; // black (default for products)
              if (isFiller) {
                cardColor = '#F95146'; // red for fillers
              } else if (index % 3 === 0) {
                cardColor = '#00C74D'; // green for some products
              }

              return (
                <div
                  key={`${item.id}-${index}`}
                  className="flex-shrink-0 rounded-lg overflow-hidden flex flex-col items-center justify-center"
                  style={{
                    width: '220px',
                    height: '320px',
                    backgroundColor: cardColor,
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {isFiller ? (
                    <div className="text-center px-4">
                      <div className="text-white font-bold text-2xl leading-tight">
                        {item.title}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="relative w-32 h-32 mb-4">
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <div className="text-white text-base font-semibold text-center px-3 leading-tight">
                        {item.title}
                      </div>
                      <div className="text-yellow-400 text-xl font-bold mt-2">
                        {item.price} лв
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status indicator */}
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
