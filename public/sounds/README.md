# Sound Effects for Casino Game

This directory contains sound effects for the casino wheel game.

## Required Sound Files

You need to add the following MP3 files to this directory:

### 1. `spin.mp3` - Spinning Sound
**When it plays:** When the carousel starts spinning
**Duration:** ~8 seconds (matches spin duration)
**Recommended sound:** 
- Roulette wheel spinning sound
- Mechanical wheel clicking sound
- Continuous whoosh/spin effect

**Free sources:**
- [Freesound.org - Roulette Wheel](https://freesound.org/search/?q=roulette+wheel)
- [Pixabay - Spinning Sounds](https://pixabay.com/sound-effects/search/spinning/)
- [Zapsplat - Casino Sounds](https://www.zapsplat.com/sound-effect-category/casino/)

### 2. `winner.mp3` - Winner Sound
**When it plays:** When player wins a product
**Duration:** 2-4 seconds
**Recommended sound:**
- Celebratory fanfare
- Casino jackpot sound
- Victory chime
- Coins dropping sound

**Free sources:**
- [Freesound.org - Winner](https://freesound.org/search/?q=winner+fanfare)
- [Pixabay - Victory Sounds](https://pixabay.com/sound-effects/search/victory/)
- [Zapsplat - Win Sounds](https://www.zapsplat.com/sound-effect-category/win/)

### 3. `try-again.mp3` - Try Again Sound
**When it plays:** When player lands on "Опитай пак" (try again/filler)
**Duration:** 1-2 seconds
**Recommended sound:**
- Gentle "aww" or disappointment sound
- Soft buzzer
- Neutral "try again" chime
- Light failure sound (not too harsh)

**Free sources:**
- [Freesound.org - Buzzer](https://freesound.org/search/?q=buzzer+soft)
- [Pixabay - Error Sounds](https://pixabay.com/sound-effects/search/error/)
- [Zapsplat - UI Sounds](https://www.zapsplat.com/sound-effect-category/user-interface/)

## Volume Levels

The sounds are configured with the following volume levels (0.0 - 1.0):
- **Spin sound:** 0.5 (50%)
- **Winner sound:** 0.7 (70%)
- **Try again sound:** 0.6 (60%)

You can adjust these in `/lib/useSoundEffects.ts` if needed.

## File Format

- **Format:** MP3
- **Recommended bitrate:** 128-192 kbps
- **Sample rate:** 44.1 kHz
- **Channels:** Stereo or Mono

## Testing

After adding the sound files:
1. Start the dev server: `pnpm dev`
2. Play the game
3. Listen for sounds at:
   - Spin start (after shuffle overlay)
   - Win result (when winning a product)
   - Try again result (when landing on filler)

## Troubleshooting

If sounds don't play:
1. Check browser console for errors
2. Ensure files are named exactly: `spin.mp3`, `winner.mp3`, `try-again.mp3`
3. Check file permissions
4. Try clicking on the page first (browsers require user interaction for audio)
5. Check browser's autoplay policy

## Creating Custom Sounds

You can create custom sounds using:
- **Audacity** (free audio editor)
- **GarageBand** (Mac)
- **FL Studio** (Windows/Mac)
- **Online tools:** [AudioMass](https://audiomass.co/), [TwistedWave](https://twistedwave.com/online)

## License

Ensure any sound effects you use are:
- Royalty-free
- Licensed for commercial use (if applicable)
- Properly attributed if required

Popular free sound libraries with commercial licenses:
- Freesound.org (check individual licenses)
- Pixabay (free for commercial use)
- Zapsplat (free tier available)
- Mixkit (free for commercial use)
