import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';

const TIME_KEY = 'bg-music-time';
const PLAY_KEY = 'bg-music-playing';
const UNLOCK_KEY = 'bg-audio-unlocked';

const FADE_DURATION = 500;
const START_DELAY = 1000;
const MAX_VOLUME = 0.6;
const ROUTE_FADE_VOLUME = 0.15;

const clamp = v => Math.min(1, Math.max(0, v));

/* =======================
   STYLES
======================= */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Modal = styled.div`
  background: #111;
  color: #fff;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  max-width: 420px;

  button {
    margin-top: 24px;
    padding: 14px 28px;
    font-size: 16px;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    background: white;
    color: black;
  }
`;

/* =======================
   COMPONENT
======================= */
export default function GlobalAudio() {
  const audioRef = useRef(null);
  const fadeRef = useRef(null);
  const startTimeoutRef = useRef(null);

  const [unlocked, setUnlocked] = useState(false);
  const router = useRouter();

  /* =======================
     Fade Engine
  ======================= */
  const fadeVolume = (from, to, cb) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (fadeRef.current) cancelAnimationFrame(fadeRef.current);

    const start = performance.now();
    const safeFrom = clamp(from);
    const safeTo = clamp(to);

    const step = now => {
      const p = Math.min((now - start) / FADE_DURATION, 1);
      audio.volume = clamp(safeFrom + (safeTo - safeFrom) * p);

      if (p < 1) fadeRef.current = requestAnimationFrame(step);
      else cb?.();
    };

    fadeRef.current = requestAnimationFrame(step);
  };

  /* =======================
     START EXPERIENCE
  ======================= */
  const startExperience = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    localStorage.setItem(UNLOCK_KEY, 'true');
    localStorage.setItem(PLAY_KEY, 'true');

    audio.volume = 0;

    try {
      await audio.play();
      fadeVolume(0, MAX_VOLUME);
      setUnlocked(true);
    } catch {
      console.warn('Autoplay blocked');
    }
  };

  /* =======================
     Restore State
  ======================= */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const wasUnlocked = localStorage.getItem(UNLOCK_KEY) === 'true';
    const wasPlaying = localStorage.getItem(PLAY_KEY) === 'true';
    const savedTime = Number(localStorage.getItem(TIME_KEY));

    setUnlocked(wasUnlocked);

    const onLoaded = async () => {
      if (!isNaN(savedTime)) audio.currentTime = savedTime;
      audio.volume = 0;

      if (wasUnlocked && wasPlaying) {
        startTimeoutRef.current = setTimeout(async () => {
          try {
            await audio.play();
            fadeVolume(0, MAX_VOLUME);
          } catch {
            console.log('a');
          }
        }, START_DELAY);
      }
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    return () => audio.removeEventListener('loadedmetadata', onLoaded);
  }, []);

  /* =======================
     Persist Time
  ======================= */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const save = () => localStorage.setItem(TIME_KEY, audio.currentTime.toString());

    audio.addEventListener('timeupdate', save);
    return () => audio.removeEventListener('timeupdate', save);
  }, []);

  /* =======================
     Fade on Route Change
  ======================= */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const start = () => fadeVolume(audio.volume, ROUTE_FADE_VOLUME);
    const end = () => fadeVolume(audio.volume, MAX_VOLUME);

    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', end);
    router.events.on('routeChangeError', end);

    return () => {
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', end);
      router.events.off('routeChangeError', end);
    };
  }, [router.events]);

  /* =======================
     Cleanup
  ======================= */
  useEffect(() => {
    return () => {
      if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
      if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
    };
  }, []);

  return (
    <>
      <audio ref={audioRef} src="/audio.mp3" preload="metadata" loop />

      {!unlocked && (
        <Overlay>
          <Modal>
            <h1>Welcome</h1>
            <p>This site uses background audio experience.</p>
            <button onClick={startExperience}>START</button>
          </Modal>
        </Overlay>
      )}
    </>
  );
}
