import { useEffect, useRef } from 'react';

export function useAutoPlayOnScroll() {
  const audioRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    audioRef.current = new Audio('/audio.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.6;

    const playAudio = async () => {
      if (startedRef.current) return;

      try {
        await audioRef.current.play();
        startedRef.current = true;

        window.removeEventListener('scroll', playAudio);
        window.removeEventListener('click', playAudio);
      } catch (err) {
        console.warn('Autoplay blocked:', err);
      }
    };

    window.addEventListener('scroll', playAudio, { passive: true });
    window.addEventListener('click', playAudio);

    return () => {
      window.removeEventListener('scroll', playAudio);
      window.removeEventListener('click', playAudio);
      audioRef.current?.pause();
    };
  }, []);
}
