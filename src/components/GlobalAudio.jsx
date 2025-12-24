import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import styles from './GlobalAudio.module.css';

const TIME_KEY = 'bg-music-time';
const PLAY_KEY = 'bg-music-playing';
const UNLOCK_KEY = 'bg-audio-unlocked';
const CAMPAIGN_KEY = 'campaign-popup-shown';

const FADE_DURATION = 500;
const START_DELAY = 1000;
const MAX_VOLUME = 0.6;
const ROUTE_FADE_VOLUME = 0.15;

const clamp = v => Math.min(1, Math.max(0, v));

/* =======================
   STYLES
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
  animation: fadeIn 0.5s ease forwards;
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
  useEffect(() => {
    const handleUnload = () => {
      localStorage.clear();
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  /* =======================
     FORCE POPUP IF UTM
  ======================= */
  useEffect(() => {
    if (!router.isReady) return;

    const isFromCampaign =
      router.query.utm_source || router.query.utm_medium || router.query.utm_content;

    const alreadyShown = sessionStorage.getItem(CAMPAIGN_KEY);

    if (isFromCampaign && !alreadyShown) {
      sessionStorage.setItem(CAMPAIGN_KEY, 'true');
      sessionStorage.removeItem(UNLOCK_KEY);
      sessionStorage.removeItem(PLAY_KEY);
      setUnlocked(false);
    }
  }, [router.isReady, router.query]);

  return (
    <>
      <audio ref={audioRef} src="/audio.mp3" preload="metadata" loop />

      {!unlocked && (
        <Overlay>
          <div className={styles.overlay}>
            <div className={styles.content}>
              {/* Loader dimasukkan di sini */}
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
// --- Bagian CSS untuk Loader (Styled Components) ---
const StyledWrapper = styled.div`
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .loading-wide {
    width: 150px;
    height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
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
    25% {
      opacity: 1;
    }
    50% {
      top: 30%;
      opacity: 1;
    }
    75% {
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
    25% {
      opacity: 1;
    }
    50% {
      left: 45%;
      opacity: 1;
    }
    75% {
      opacity: 1;
    }
    100% {
      left: 100%;
      opacity: 0;
    }
  }

  .animation-effect-light {
    animation: effect 0.2s 0.1s infinite linear;
  }
  .animation-effect-light-d {
    animation: effect 0.3s 0.2s infinite linear;
  }
  .animation-effect-rot {
    animation: rot 0.8s infinite cubic-bezier(0.65, 0.05, 0.36, 1);
  }
  .animation-effect-scale {
    animation: scale 0.8s infinite cubic-bezier(0.65, 0.05, 0.36, 1);
  }

  @keyframes effect {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
  @keyframes rot {
    0% {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(180deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  @keyframes scale {
    0% {
      scale: 1;
    }
    50% {
      scale: 1.9;
    }
    100% {
      scale: 1;
    }
  }
  .e1 {
    width: 1px;
    height: 40px;
    opacity: 0.3;
    position: absolute;
    top: 0;
    left: 8%;
  }
  .e2 {
    width: 60px;
    height: 1px;
    opacity: 0.8;
    position: absolute;
    top: 8%;
    left: 0;
  }
  .e3 {
    position: absolute;
    top: 10%;
    left: 12%;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-weight: 900;
    font-size: 18px;
    color: #fdfdfdff;
  }
  .e4 {
    width: 1px;
    height: 40px;
    opacity: 0.3;
    position: absolute;
    top: 90%;
    right: 10%;
  }
  .e5 {
    width: 40px;
    height: 1px;
    opacity: 0.3;
    position: absolute;
    top: 100%;
    right: 0;
  }
  .e6 {
    position: absolute;
    top: 100%;
    right: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 32px;
    color: #fefefeff;
  }
  .e7 {
    width: 1px;
    height: 20px;
    position: absolute;
    bottom: 0;
    left: 0;
    transform: rotate(45deg);
    animation: height 1s infinite cubic-bezier(0.65, 0.05, 0.36, 1);
  }
  @keyframes height {
    0% {
      bottom: 0%;
      left: 0%;
      height: 0px;
    }
    25% {
      height: 90px;
    }
    50% {
      bottom: 100%;
      left: 100%;
      height: 90px;
    }
    75% {
      height: 0px;
    }
    100% {
      bottom: 0%;
      left: 0%;
      height: 0px;
    }
  }
  .e8 {
    width: 20px;
    height: 1px;
    position: absolute;
    bottom: 50%;
    left: 0;
    animation: width 1.5s infinite cubic-bezier(0.65, 0.05, 0.36, 1);
  }
  @keyframes width {
    0% {
      left: 0%;
      width: 0px;
    }
    50% {
      left: 100%;
      width: 90px;
    }
    100% {
      left: 0%;
      width: 0px;
    }
  }
`;
