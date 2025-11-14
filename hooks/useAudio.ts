
import { useCallback, useEffect, useRef } from 'react';

// NOTE: Since actual audio files cannot be uploaded, this hook is a placeholder.
// In a real environment, you would provide valid URLs to audio files.
// For now, it will not produce sound but the logic is in place.
export const useAudio = (src: string, loop: boolean = false) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = loop;
    audioRef.current = audio;
  }, [src, loop]);

  const play = useCallback(() => {
    audioRef.current?.play().catch(e => console.log("Audio play failed. User interaction might be needed.", e));
  }, []);
  
  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);
  
  const stop = useCallback(() => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
  }, []);

  return { play, pause, stop };
};
