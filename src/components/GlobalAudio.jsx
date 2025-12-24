import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import styles from './GlobalAudio.module.css';

const TIME_KEY = 'bg-music-time';
const PLAY_KEY = 'bg-music-playing';
const UNLOCK_KEY = 'bg-audio-unlocked';

const FADE_DURATION = 500;
const START_DELAY = 1000;
const MAX_VOLUME = 0.6;
const ROUTE_FADE_VOLUME = 0.15;

const clamp = v => Math.min(1, Math.max(0, v));

/* =======================
   LOADER
======================= */
const Loader = () => {
  return (
    <StyledWrapper>
      <div className="loading">
        <div className="loading-wide">
          <div className="l1 color" />
          <div className="l2 color" />
          <div className="e1 color animation-effect-light" />
          <div className="e2 color animation-effect-light-d" />
          <div className="e3 animation-effect-rot">X</div>
          <div className="e4 color animation-effect-light" />
          <div className="e5 color animation-effect-light-d" />
          <div className="e6 animation-effect-scale">*</div>
          <div className="e7 color" />
          <div className="e8 color" />
        </div>
      </div>
    </StyledWrapper>
  );
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/* =======================
   COMPONENT
======================= */
export default function GlobalAudio() {
  const audioRef = useRef(null);
  const fadeRef = useRef(null);
  const startTimeoutRef = useRef(null);
  const router = useRouter();

  const [unlocked, setUnlocked] = useState(false);

  /* =======================
     FADE ENGINE
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
     RESTORE STATE (LOAD)
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
     HANDLE REFRESH (pageshow)
  ======================= */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePageShow = async () => {
      const unlocked = localStorage.getItem(UNLOCK_KEY) === 'true';
      const playing = localStorage.getItem(PLAY_KEY) === 'true';

      if (!unlocked || !playing) return;

      audio.volume = 0;

      try {
        await audio.play();
        fadeVolume(0, MAX_VOLUME);
      } catch {
        console.warn('Autoplay blocked on refresh');
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  /* =======================
     PERSIST TIME
  ======================= */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const saveTime = () => localStorage.setItem(TIME_KEY, audio.currentTime.toString());

    audio.addEventListener('timeupdate', saveTime);
    return () => audio.removeEventListener('timeupdate', saveTime);
  }, []);

  /* =======================
     SYNC PLAY STATE
  ======================= */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => localStorage.setItem(PLAY_KEY, 'true');
    const onPause = () => localStorage.setItem(PLAY_KEY, 'false');

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  /* =======================
     FADE ON ROUTE CHANGE
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
     CLEANUP
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
          <div className={styles.overlay}>
            <div className={styles.content}>
              <Loader />
              <h1>Welcome</h1>
              <p>to my portfolio</p>
              <button onClick={startExperience}>Enter</button>
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
}

/* =======================
   LOADER STYLES
======================= */
const StyledWrapper = styled.div`
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .loading-wide {
    width: 150px;
    height: 150px;
    position: relative;
  }
  .color {
    background-color: #00ffffff;
  }
  .l1 {
    width: 15px;
    height: 65px;
    position: absolute;
    animation: move-h 1.2s infinite cubic-bezier(0.65, 0.05, 0.36, 1);
  }
  .l2 {
    width: 15px;
    height: 60px;
    position: absolute;
    transform: rotate(90deg);
    animation: move-v 1.2s infinite cubic-bezier(0.65, 0.05, 0.36, 1);
  }
  @keyframes move-h {
    0% {
      top: 0;
      opacity: 0;
    }
    50% {
      top: 30%;
      opacity: 1;
    }
    100% {
      top: 100%;
      opacity: 0;
    }
  }
  @keyframes move-v {
    0% {
      left: 0;
      opacity: 0;
    }
    50% {
      left: 45%;
      opacity: 1;
    }
    100% {
      left: 100%;
      opacity: 0;
    }
  }
`;
