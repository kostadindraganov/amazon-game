'use client';

import { useEffect, useState, useCallback } from 'react';
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

  // Transform SliderItem[] to Prize[] for react-spin-roulette
  const prizes = sliderItems.map((item, index) => ({
    id: item.id,
    label: item.title,
    image: item.type === 'product' ? item.image_url : undefined,
    value: item, // Store full item for rendering
    index, // Store index for deterministic color
  }));

  // Custom prize renderer for cards
  const renderPrize = useCallback((prize: any) => {
    const item = prize.value as SliderItem;
    const isFiller = item.type === 'filler';
    const index = prize.index as number;

    // Determine card color deterministically based on index
    let cardColor = '#2D3035'; // dark (default for products)
    if (isFiller) {
      cardColor = '#F95146'; // red for fillers
    } else if (index % 3 === 0) {
      cardColor = '#00C74D'; // green for some products (deterministic distribution)
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
  }, []);

  // Fetch slider items
  useEffect(() => {
    fetchSliderItems();
  }, [fetchSliderItems]);

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

        // Store pending spin queue ID - spin will trigger when modal closes
        setPendingSpinQueueId(data.currentPlayer.id);

        // Show player modal
        window.dispatchEvent(new CustomEvent('showPlayer', {
          detail: { username: data.currentPlayer.username }
        }));
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

    if (sliderItems.length === 0) {
      console.error('❌ [GameCarousel.spinCarousel] Cannot spin - no slider items');
      setIsSpinning(false);
      setCurrentQueueId(null);
      return;
    }

    try {
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

      // Calculate target index
      let targetIndex;
      if (spinData.isWinner && spinData.product) {
        console.log('🏆 [GameCarousel.spinCarousel] WINNER! Finding product in slider:', spinData.product.title);
        targetIndex = sliderItems.findIndex(item => item.id === spinData.product.id);

        if (targetIndex === -1) {
          console.warn('⚠️  [GameCarousel.spinCarousel] Product not found in slider, using random filler');
          const fillerIndices = sliderItems
            .map((item, idx) => item.type === 'filler' ? idx : -1)
            .filter(idx => idx !== -1);
          targetIndex = fillerIndices[Math.floor(Math.random() * fillerIndices.length)] || 0;
        } else {
          console.log('✅ [GameCarousel.spinCarousel] Product found at index:', targetIndex);
        }
      } else {
        console.log('🎯 [GameCarousel.spinCarousel] Not a winner, selecting "Try Again" filler');
        const fillerIndices = sliderItems
          .map((item, idx) => item.type === 'filler' ? idx : -1)
          .filter(idx => idx !== -1);
        targetIndex = fillerIndices[Math.floor(Math.random() * fillerIndices.length)] || 0;
        console.log('✅ [GameCarousel.spinCarousel] Filler selected at index:', targetIndex);
      }

      console.log('🎯 [GameCarousel.spinCarousel] Setting winning index:', targetIndex);

      // Store spinData for onComplete callback
      (window as any).__currentSpinData = spinData;
      (window as any).__currentQueueId = queueId;

      // Set winning index and trigger spin
      setWinningIndex(targetIndex);
      setIsSpinning(true);

    } catch (error) {
      console.error('❌ [GameCarousel.spinCarousel] Error during spin:', error);
      setIsSpinning(false);
      setCurrentQueueId(null);
    }
  }, [sliderItems, setIsSpinning]);

  const handleSpinComplete = useCallback(async () => {
    console.log('🏁 [GameCarousel.handleSpinComplete] Animation complete!');

    const spinData = (window as any).__currentSpinData;
    const queueId = (window as any).__currentQueueId;

    setIsSpinning(false);
    setCurrentQueueId(null);

    console.log('🔓 [GameCarousel.handleSpinComplete] Spinning state reset, queue ID cleared');

    // Show winner modal if applicable
    if (spinData?.isWinner) {
      console.log('🎉 [GameCarousel.handleSpinComplete] Showing winner modal');
      window.dispatchEvent(new CustomEvent('showWinner', {
        detail: {
          username: spinData.winner?.username,
          product: spinData.product
        }
      }));
    }

    // Refresh slider items
    console.log('🔄 [GameCarousel.handleSpinComplete] Refreshing slider items...');
    fetchSliderItems();

    // Check if same player has more plays
    console.log('🔍 [GameCarousel.handleSpinComplete] Checking for remaining plays:', spinData?.remainingPlays);
    if (spinData?.remainingPlays > 0) {
      console.log('🔄 [GameCarousel.handleSpinComplete] Player has more plays!', {
        remainingPlays: spinData.remainingPlays,
        isWinner: spinData.isWinner,
        waitTime: spinData.isWinner ? 5000 : 0
      });

      const waitTime = spinData.isWinner ? 5000 : 0;
      setTimeout(async () => {
        console.log('⏰ [GameCarousel.handleSpinComplete] Wait time elapsed, fetching current player...');
        const currentRes = await fetch('/api/game/current');
        const currentData = await currentRes.json();

        console.log('📊 [GameCarousel.handleSpinComplete] Current player data:', {
          hasCurrentPlayer: !!currentData.currentPlayer,
          playerId: currentData.currentPlayer?.id,
          username: currentData.currentPlayer?.username,
          plays: currentData.currentPlayer?.plays
        });

        if (currentData.currentPlayer) {
          console.log('🎭 [GameCarousel.handleSpinComplete] Showing player modal for next play');

          // Store pending spin queue ID - spin will trigger when modal closes
          setPendingSpinQueueId(queueId);

          window.dispatchEvent(new CustomEvent('showPlayer', {
            detail: { username: currentData.currentPlayer.username }
          }));
        } else {
          console.warn('⚠️  [GameCarousel.handleSpinComplete] No current player found for next spin!');
        }
      }, waitTime);
    } else {
      console.log('✅ [GameCarousel.handleSpinComplete] No more plays for this player, spin complete');
    }

    // Cleanup
    delete (window as any).__currentSpinData;
    delete (window as any).__currentQueueId;
  }, [spinCarousel, setIsSpinning, fetchSliderItems]);

  // Listen for player modal close event to trigger spin
  useEffect(() => {
    const handlePlayerModalClosed = () => {
      if (pendingSpinQueueId !== null) {
        console.log('🎰 [GameCarousel] Player modal closed, triggering spin for queueId:', pendingSpinQueueId);
        spinCarousel(pendingSpinQueueId);
        setPendingSpinQueueId(null);
      }
    };

    window.addEventListener('playerModalClosed', handlePlayerModalClosed);

    return () => {
      window.removeEventListener('playerModalClosed', handlePlayerModalClosed);
    };
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
      {/* Roulette Wrapper */}
      <div
        className="relative overflow-hidden"
        style={{
          background: '#191B28',
          height: '100%',
          borderRadius: '12px',
        }}
      >
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

        {/* React Spin Roulette Component */}
        <SpinRoulette
          prizes={prizes}
          winningIndex={winningIndex}
          isSpinning={isSpinning}
          onComplete={handleSpinComplete}
          duration={8000}
          orientation="horizontal"
          prizeSize={264}
          minSpins={2}
          className="w-full h-full"
          renderPrize={renderPrize}
          renderIndicator={renderIndicator}
          easing="cubic-bezier(0.65, 0, 0.35, 1)"
        />
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
