import React, { useEffect, useRef, useState } from 'react';
import { formatTime } from '../utils';
import cdImage from '../assets/vinyl-record-isolated.jpg';

export default function Player({ current, queue, onNext, onPrev, onEnded }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // when source changes, load and optionally play
    audio.pause();
    audio.currentTime = 0;
    setPosition(0);
    if (current) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {
        setIsPlaying(false); // if autoplay is blocked
      });
    }
  }, [current?.url]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setPosition(audio.currentTime);
    const onEndedInternal = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEndedInternal);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEndedInternal);
    };
  }, [onEnded]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(()=>{ /* autoplay policies */ });
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }

  function seekTo(ev) {
    const audio = audioRef.current;
    if (!audio || !current) return;
    const rect = ev.currentTarget.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    audio.currentTime = pct * current.duration;
    setPosition(audio.currentTime);
  }

  function changeVolume(e) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = e.target.value;
    setIsMuted(audio.volume === 0);
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  }

  return (
    <div className="panel">
      <div className="cd-container">
        <img 
          src={current?.coverUrl || cdImage}
          alt="CD Disc"
          className={`cd ${isPlaying ? 'spin' : 'paused'}`}
        />
      </div>
      {/* song info*/}
      <div className="header">
        <div style={{ flex: 1 }}>
          {current?.trackType && (
            <div
              className="small"
              style={{ color: "#9f9f9f", marginBottom: 4 }}
            >
              {current.trackType}
            </div>
          )}
          <div style={{ fontWeight: 700 }}>
            {current ? current.name : 'No song selected'}
          </div>
          <div className="small">
            {current ? `${formatTime(current.duration)}` : ''}
          </div>
        </div>

        <div className="controls">
          <button onClick={onPrev}>⏮</button>
          <button onClick={togglePlay}>
            {isPlaying ? '⏸' : '▶️'}
          </button>
          <button onClick={onNext}>⏭</button>
        </div>
      </div>

      <div className="small" style={{ marginTop: 8 }}>
        {formatTime(position)} / {formatTime(current?.duration)}
      </div>

      <div className="progress" onClick={seekTo} style={{ marginTop: 8 }}>
        <div
          className="bar"
          style={{
            width: current?.duration
              ? `${(position / current.duration) * 100}%`
              : '0%'
          }}
        />
      </div>

      <div style={{ marginTop: 8 }} className="hstack">
        <label className="small">Volume</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          defaultValue="1"
          onChange={changeVolume}
        />
        <button 
          onClick={toggleMute} 
          style={{
              border: 'none',
              background: '#ff4f4f',
              color: '#fff',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              transition: 'background 0.3s ease, transform 0.2s ease'
            }}
          onMouseEnter={(e) => e.target.style.background = '#ff2a2a'}
          onMouseLeave={(e) => e.target.style.background = '#ff4f4f'}
          onMouseDown={(e) => e.target.style.transform = 'scale(0.9)'}
          onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      {current?.url && (
        <audio
          ref={audioRef}
          src={current.url}
          onEnded={onNext}
        />
      )}
    </div>
  );
}