import { useState, useCallback } from 'react';
import { toggleSound, isSoundEnabled, playClickSound, playMoveSound, playVictorySound, playDefeatSound } from '../utils/sound';

export function useAudio() {
  const [soundOn, setSoundOn] = useState(isSoundEnabled);

  const toggle = useCallback(() => {
    const next = toggleSound();
    setSoundOn(next);
  }, []);

  return {
    soundOn,
    toggleSound: toggle,
    playClick: playClickSound,
    playMove: playMoveSound,
    playVictory: playVictorySound,
    playDefeat: playDefeatSound,
  };
}
