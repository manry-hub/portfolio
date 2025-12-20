import { useEffect, useRef } from 'react';

export function useAutoPlayOnScroll() {
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio('/audio.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.6;

    return () => audioRef.current?.pause();
  }, []);

  const play = async () => {
    try {
      await audioRef.current.play();
    } catch (err) {
      console.warn('Audio blocked:', err);
    }
  };

  return { play };
}
