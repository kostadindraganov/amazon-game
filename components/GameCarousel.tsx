'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import type { SliderItem } from '@/lib/supabase';
import { SpinRoulette } from 'react-spin-roulette';
import { useSoundEffects } from '@/lib/useSoundEffects';
import IdleProductShowcase from './IdleProductShowcase';
import GameCard from './GameCard';

interface GameCarouselProps {
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

export default function GameCarousel({ isSpinning, setIsSpinning }: GameCarouselProps) {
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([]);
  const [winningIndex, setWinningIndex] = useState<number>(0);
  const [currentQueueId, setCurrentQueueId] = useState<number | null>(null);
  const [pendingSpinQueueId, setPendingSpinQueueId] = useState<number | null>(null);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [isWinnerModalShowing, setIsWinnerModalShowing] = useState<boolean>(false);
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const lastActivityTimeRef = useRef<number>(Date.now());

  // Sound effects
  const { playSpinSound, playWinnerSound, playTryAgainSound, stopSpinSound, unlockAudio, isAudioUnlocked } = useSoundEffects();

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

  const productItems = useMemo(() =>
    sliderItems.filter(item => item.type === 'product'),
    [sliderItems]
  );

  // Custom prize renderer for cards
  const renderPrize = useCallback((prize: any) => {
    const item = prize.value as SliderItem;
    const index = prize.index as number;
    const isFiller = item.type === 'filler';

    return (
      <GameCard item={item} index={index} isFiller={isFiller} />
    );
  }, []);

  // Custom indicator (center selection line)
  const renderIndicator = useCallback(() => (
    <div
      className="absolute top-0 bottom-0 z-20"
      style={{
        left: '50%',
        width: '5px',
        backgroundColor: '#fbcd00ff',
        transform: 'translateX(-1.5px)',
      }}
    />
  ), []);

  // Fisher-Yates shuffle algorithm for true randomization
  const shuffleArray = useCallback(<T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

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

      // Don't check for next player if winner modal is showing or if spinning
      if (data.currentPlayer && !isSpinning && !isWinnerModalShowing) {
        if (currentQueueId === data.currentPlayer.id) {
          lastActivityTimeRef.current = Date.now();
          setIsIdle(false);
          return;
        }

        if (sliderItems.length === 0) {
          return;
        }

        setCurrentQueueId(data.currentPlayer.id);
        setPendingSpinQueueId(data.currentPlayer.id);

        // Reset idle state when new player appears
        lastActivityTimeRef.current = Date.now();
        setIsIdle(false);

        window.dispatchEvent(new CustomEvent('showPlayer', {
          detail: { username: data.currentPlayer.username }
        }));
      }
    } catch (error) {
      // Silently handle error
    }
  }, [isSpinning, isWinnerModalShowing, currentQueueId, sliderItems.length]);

  // Idle check interval
  useEffect(() => {
    const idleInterval = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityTimeRef.current;
      // 20 seconds idle timeout
      if (timeSinceLastActivity > 20000 && !isSpinning && !currentQueueId && !isWinnerModalShowing && !isIdle) {
        setIsIdle(true);
      }
    }, 1000);

    return () => clearInterval(idleInterval);
  }, [isSpinning, currentQueueId, isWinnerModalShowing, isIdle]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSpinning) {
        checkForNextPlayer();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isSpinning, checkForNextPlayer]);

  const spinCarousel = useCallback(async (queueId: number) => {
    // Reset idle timer
    lastActivityTimeRef.current = Date.now();
    setIsIdle(false);

    // Fetch fresh slider items before shuffling
    // This ensures we have up-to-date data but cards only change during shuffle overlay
    let freshItems: SliderItem[];
    try {
      const res = await fetch('/api/game/slider-items');
      const data = await res.json();
      freshItems = data.items || [];

      if (freshItems.length === 0) {
        setIsSpinning(false);
        setCurrentQueueId(null);
        return;
      }

      // Update state with fresh items (this happens before shuffle overlay)
      setSliderItems(freshItems);
    } catch (error) {
      setIsSpinning(false);
      setCurrentQueueId(null);
      return;
    }

    try {
      // Step 1: Call spin API to get winner result
      const spinRes = await fetch('/api/game/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueId })
      });

      const spinData = await spinRes.json();

      // Step 2: Determine winning item ID
      let winningItemId: string | null = null;
      if (spinData.isWinner && spinData.product) {
        winningItemId = spinData.product.id;
      }

      // Step 3: Show shuffling overlay
      setIsShuffling(true);

      // Timing configuration
      const preShuffleDelay = 1000; // Show overlay 500ms before shuffle starts
      const shuffleSteps = 6; // Number of visible shuffle iterations
      const shuffleInterval = 200; // Time between each shuffle (ms)
      const postShuffleDelay = 1000; // Keep overlay 500ms after shuffle ends

      // Step 4: Wait before starting shuffle (overlay visible, cards static)
      setTimeout(() => {
        // Perform animated shuffle - multiple shuffle steps during overlay
        // This creates a visual shuffling effect where cards reorder multiple times
        let shuffleCount = 0;
        let workingItems = [...freshItems];

        const performShuffleStep = () => {
          if (shuffleCount < shuffleSteps) {
            workingItems = shuffleArray(workingItems);
            setSliderItems([...workingItems]);
            shuffleCount++;
            setTimeout(performShuffleStep, shuffleInterval);
          }
        };

        // Start the shuffle animation
        performShuffleStep();

        // Calculate final shuffle and winning index
        // We need to do this after all shuffles complete
        setTimeout(() => {
          // Final shuffle
          const finalShuffled = shuffleArray(workingItems);

          // Step 5: Recalculate winning index in final shuffled array
          let targetIndex;
          if (winningItemId) {
            targetIndex = finalShuffled.findIndex(item => item.id === winningItemId);

            // Fallback if winner item not found after shuffle
            if (targetIndex === -1) {
              const fillerIndices = finalShuffled
                .map((item, idx) => item.type === 'filler' ? idx : -1)
                .filter(idx => idx !== -1);
              targetIndex = fillerIndices[Math.floor(Math.random() * fillerIndices.length)] || 0;
            }
          } else {
            // No winner, select random filler
            const fillerIndices = finalShuffled
              .map((item, idx) => item.type === 'filler' ? idx : -1)
              .filter(idx => idx !== -1);
            targetIndex = fillerIndices[Math.floor(Math.random() * fillerIndices.length)] || 0;
          }

          // Store in refs instead of window object
          spinDataRef.current = spinData;
          queueIdRef.current = queueId;

          // Apply final shuffled state
          setSliderItems(finalShuffled);

          // Wait after shuffle completes (overlay still visible, cards static)
          setTimeout(() => {
            setIsShuffling(false);
            setWinningIndex(targetIndex);
            setIsSpinning(true);
            // Play spin sound when carousel starts spinning
            playSpinSound();
          }, postShuffleDelay); // Hide overlay after post-shuffle delay
        }, shuffleSteps * shuffleInterval);
      }, preShuffleDelay); // Start shuffle after pre-shuffle delay
    } catch (error) {
      setIsShuffling(false);
      setIsSpinning(false);
      setCurrentQueueId(null);
    }
  }, [setIsSpinning, setCurrentQueueId, shuffleArray, playSpinSound]);

  const handleSpinComplete = useCallback(async () => {
    const spinData = spinDataRef.current;
    const queueId = queueIdRef.current;

    setIsSpinning(false);
    setCurrentQueueId(null);

    // Stop spin sound
    stopSpinSound();

    // Reset idle timer
    lastActivityTimeRef.current = Date.now();

    if (spinData?.isWinner) {
      // Play winner sound
      playWinnerSound();
      // Set flag to prevent checkForNextPlayer from running
      setIsWinnerModalShowing(true);
      window.dispatchEvent(new CustomEvent('showWinner', {
        detail: {
          username: spinData.winner?.username,
          product: spinData.product
        }
      }));

      // Don't proceed to next player here - wait for winnerModalClosed event
    } else {
      // Play try again sound for non-winners
      playTryAgainSound();

      // For non-winners, proceed immediately to next player if available
      if (spinData?.remainingPlays > 0) {
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
      }
    }

    // Cleanup refs
    spinDataRef.current = null;
    queueIdRef.current = null;
  }, [setIsSpinning, setCurrentQueueId, stopSpinSound, playWinnerSound, playTryAgainSound]);

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

  useEffect(() => {
    const handleWinnerModalClosed = async () => {
      // Clear the winner modal showing flag
      setIsWinnerModalShowing(false);

      // When winner modal closes, check for next player
      try {
        const currentRes = await fetch('/api/game/current');
        const currentData = await currentRes.json();

        if (currentData.currentPlayer) {
          setPendingSpinQueueId(currentData.currentPlayer.id);
          window.dispatchEvent(new CustomEvent('showPlayer', {
            detail: { username: currentData.currentPlayer.username }
          }));
        }
      } catch (error) {
        // Silently handle error
      }
    };

    window.addEventListener('winnerModalClosed', handleWinnerModalClosed);
    return () => window.removeEventListener('winnerModalClosed', handleWinnerModalClosed);
  }, []);

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

        {isIdle && !isSpinning && !currentQueueId ? (
          <IdleProductShowcase products={productItems} />
        ) : (
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
        )}

        {/* Shuffling overlay */}
        {isShuffling && (
          <div className="absolute inset-0 z-30 flex items-center justify-center">
            {/* Blur backdrop */}
            <div className="absolute inset-0 backdrop-blur-md bg-black/60" />

            {/* Animated text */}
            <div className="relative z-40">
              <h2 className="text-6xl font-bold text-casino-gold animate-pulse">
                Разбъркване
              </h2>
            </div>
          </div>
        )}

        {/* Audio unlock button */}
        {!isAudioUnlocked && (
          <div className="absolute bottom-4 right-4 z-40">
            <button
              onClick={unlockAudio}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-casino-gold to-yellow-500 text-black font-bold text-sm rounded-full shadow-2xl hover:scale-110 transition-transform duration-200 animate-pulse"
            >
              <span className="text-xl">🔊</span>
              <span>Включи звука</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
