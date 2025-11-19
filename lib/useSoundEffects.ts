'use client';

import { useCallback, useRef, useEffect, useState } from 'react';

interface SoundEffects {
    playSpinSound: () => void;
    playWinnerSound: () => void;
    playTryAgainSound: () => void;
    stopSpinSound: () => void;
    unlockAudio: () => void;
    isAudioUnlocked: boolean;
}

export function useSoundEffects(): SoundEffects {
    const spinSoundRef = useRef<HTMLAudioElement | null>(null);
    const winnerSoundRef = useRef<HTMLAudioElement | null>(null);
    const tryAgainSoundRef = useRef<HTMLAudioElement | null>(null);
    const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

    useEffect(() => {
        // Initialize audio elements
        if (typeof window !== 'undefined') {
            spinSoundRef.current = new Audio('/sounds/spin.mp3');
            winnerSoundRef.current = new Audio('/sounds/winner.mp3');
            tryAgainSoundRef.current = new Audio('/sounds/try-again.mp3');

            // Set volume levels
            if (spinSoundRef.current) spinSoundRef.current.volume = 0.5;
            if (winnerSoundRef.current) winnerSoundRef.current.volume = 0.7;
            if (tryAgainSoundRef.current) tryAgainSoundRef.current.volume = 0.6;

            // Preload audio files
            if (spinSoundRef.current) spinSoundRef.current.load();
            if (winnerSoundRef.current) winnerSoundRef.current.load();
            if (tryAgainSoundRef.current) tryAgainSoundRef.current.load();
        }

        // Cleanup
        return () => {
            if (spinSoundRef.current) {
                spinSoundRef.current.pause();
                spinSoundRef.current = null;
            }
            if (winnerSoundRef.current) {
                winnerSoundRef.current.pause();
                winnerSoundRef.current = null;
            }
            if (tryAgainSoundRef.current) {
                tryAgainSoundRef.current.pause();
                tryAgainSoundRef.current = null;
            }
        };
    }, []);

    const unlockAudio = useCallback(() => {
        if (isAudioUnlocked) {

            return;
        }

        // Play and immediately pause each sound to unlock audio context
        const sounds = [spinSoundRef.current, winnerSoundRef.current, tryAgainSoundRef.current];
        sounds.forEach(sound => {
            if (sound) {
                sound.play().then(() => {
                    sound.pause();
                    sound.currentTime = 0;
                }).catch(() => {
                    // Ignore errors during unlock
                });
            }
        });
        setIsAudioUnlocked(true);

    }, [isAudioUnlocked]);

    const playSpinSound = useCallback(() => {
        if (spinSoundRef.current) {
            spinSoundRef.current.currentTime = 0;

            spinSoundRef.current.play().catch(err => {
                console.error('Failed to play spin sound:', err);
            });
        } else {
            console.warn('Spin sound audio element not initialized.');
        }
    }, []);

    const stopSpinSound = useCallback(() => {
        if (spinSoundRef.current) {
            spinSoundRef.current.pause();
            spinSoundRef.current.currentTime = 0;

        }
    }, []);

    const playWinnerSound = useCallback(() => {
        if (winnerSoundRef.current) {
            winnerSoundRef.current.currentTime = 0;

            winnerSoundRef.current.play().catch(err => {
                console.error('Failed to play winner sound:', err);
            });
        } else {
            console.warn('Winner sound audio element not initialized.');
        }
    }, []);

    const playTryAgainSound = useCallback(() => {
        if (tryAgainSoundRef.current) {
            tryAgainSoundRef.current.currentTime = 0;

            tryAgainSoundRef.current.play().catch(err => {
                console.error('Failed to play try again sound:', err);
            });
        } else {
            console.warn('Try again sound audio element not initialized.');
        }
    }, []);

    return {
        playSpinSound,
        playWinnerSound,
        playTryAgainSound,
        stopSpinSound,
        unlockAudio,
        isAudioUnlocked,
    };
}
