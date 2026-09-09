import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';

// Web Audio API Firecracker Sound Synthesizer (Zero external audio files required, 0ms latency)
class FirecrackerAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playLaunch() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.35);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Audio fallback safe
    }
  }

  playExplosion(isBig = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * (isBig ? 0.6 : 0.3);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);

      // Generate brown/pink noise burst for realistic blast
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain factor
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isBig ? 800 : 1200, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + (isBig ? 0.5 : 0.25));

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(isBig ? 0.35 : 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (isBig ? 0.55 : 0.28));

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + (isBig ? 0.6 : 0.3));
    } catch {
      // Audio fallback safe
    }
  }

  playCrackle() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const count = 4 + Math.floor(Math.random() * 5);
      for (let i = 0; i < count; i++) {
        const delay = Math.random() * 0.25;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200 + Math.random() * 1800, now + delay);
        gain.gain.setValueAtTime(0.05, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.03);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.035);
      }
    } catch {
      // Safe fallback
    }
  }
}

const audioSynth = new FirecrackerAudio();

export function FirecrackerCelebration({
  winner = 'CyberPilot',
  gameMode = 'VS_AI',
  duration = 9000,
  onClose,
  onRematch,
}) {
  const canvasRef = useRef(null);
  const [visible, setVisible] = useState(true);
  const [blastCount, setBlastCount] = useState(0);
  const animationFrameRef = useRef(null);
  const rocketsRef = useRef([]);
  const particlesRef = useRef([]);
  const sparklersRef = useRef([]);

  // Trigger high-grade confetti canons
  const fireConfettiSalvo = useCallback(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { x: 0.15, y: 0.7 },
        colors: ['#00f2fe', '#ffd700', '#c084fc', '#ff3366', '#00ff88'],
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { x: 0.85, y: 0.7 },
        colors: ['#00f2fe', '#ffd700', '#c084fc', '#ff3366', '#00ff88'],
        disableForReducedMotion: true,
      });
    } catch {
      // Confetti fallback safe
    }
  }, []);

  // Launch a new firecracker rocket
  const launchRocket = useCallback((targetX = null, targetY = null) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const x = targetX ?? Math.random() * (canvas.width * 0.8) + canvas.width * 0.1;
    const targetHeight = targetY ?? Math.random() * (canvas.height * 0.45) + canvas.height * 0.15;
    const colors = [
      ['#00f2fe', '#4facfe', '#00c6ff'], // Cyan Neon
      ['#ffd700', '#facc15', '#fbbf24'], // Gold Amber
      ['#c084fc', '#a855f7', '#e879f9'], // Purple Hologram
      ['#10b981', '#34d399', '#059669'], // Emerald Laser
      ['#f43f5e', '#fb7185', '#e11d48'], // Ruby Laser
      ['#ffffff', '#e0f2fe', '#fef08a'], // Diamond Bright
    ];
    const colorPalette = colors[Math.floor(Math.random() * colors.length)];

    rocketsRef.current.push({
      x,
      y: canvas.height,
      vx: (Math.random() - 0.5) * 2.2,
      vy: -(Math.random() * 3 + 12),
      targetY: targetHeight,
      palette: colorPalette,
      trail: [],
    });

    audioSynth.playLaunch();
    setBlastCount((c) => c + 1);
  }, []);

  // Explode rocket into particles
  const explodeRocket = useCallback((x, y, palette) => {
    const particleCount = 70 + Math.floor(Math.random() * 50);
    const speedBase = 4.5 + Math.random() * 3;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.3;
      const speed = (Math.random() * 0.8 + 0.4) * speedBase;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: palette[Math.floor(Math.random() * palette.length)],
        alpha: 1,
        decay: Math.random() * 0.015 + 0.012,
        size: Math.random() * 2.5 + 1.8,
        flicker: Math.random() > 0.4,
      });
    }

    // Add crackling micro-sparks (string firecracker effect)
    for (let j = 0; j < 18; j++) {
      sparklersRef.current.push({
        x: x + (Math.random() - 0.5) * 60,
        y: y + (Math.random() - 0.5) * 60,
        delay: Math.random() * 25,
        color: '#ffffff',
      });
    }

    audioSynth.playExplosion(true);
    setTimeout(() => {
      audioSynth.playCrackle();
    }, 180);
  }, []);

  // Main Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Initial volley of firecrackers
    launchRocket(canvas.width * 0.25, canvas.height * 0.28);
    setTimeout(() => launchRocket(canvas.width * 0.5, canvas.height * 0.2), 300);
    setTimeout(() => launchRocket(canvas.width * 0.75, canvas.height * 0.28), 600);
    setTimeout(() => fireConfettiSalvo(), 450);

    // Staggered barrage loop
    const rocketInterval = setInterval(() => {
      if (Math.random() > 0.2) {
        launchRocket();
      }
      if (Math.random() > 0.6) {
        setTimeout(() => launchRocket(), 200);
      }
    }, 750);

    // Secondary Confetti Salvo
    const confettiInterval = setInterval(() => {
      fireConfettiSalvo();
    }, 2800);

    const render = () => {
      // Clear with slight trail for motion blur
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Render Rockets
      for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
        const r = rocketsRef.current[i];
        r.x += r.vx;
        r.y += r.vy;
        r.vy *= 0.98; // slight drag

        // Rocket Trail
        r.trail.push({ x: r.x, y: r.y, alpha: 0.9 });
        if (r.trail.length > 8) r.trail.shift();

        ctx.strokeStyle = r.palette[0];
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let t = 0; t < r.trail.length; t++) {
          const pt = r.trail[t];
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();

        // Spark at rocket tip
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Check if exploded
        if (r.y <= r.targetY || r.vy >= -1.5) {
          explodeRocket(r.x, r.y, r.palette);
          rocketsRef.current.splice(i, 1);
        }
      }

      // 2. Render Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.09; // gravity
        p.vx *= 0.97; // air resistance
        p.vy *= 0.97;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.flicker ? p.alpha * (0.6 + Math.random() * 0.4) : p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 3. Render Micro-Sparklers (Crackler effect)
      for (let s = sparklersRef.current.length - 1; s >= 0; s--) {
        const sp = sparklersRef.current[s];
        sp.delay -= 1;
        if (sp.delay <= 0) {
          ctx.save();
          ctx.fillStyle = '#fff7bc';
          ctx.shadowColor = '#ffd700';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          sparklersRef.current.splice(s, 1);
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    // Auto-timeout for passive celebration (banner remains dismissible)
    const autoCloseTimer = setTimeout(() => {
      clearInterval(rocketInterval);
      clearInterval(confettiInterval);
    }, duration);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(rocketInterval);
      clearInterval(confettiInterval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearTimeout(autoCloseTimer);
    };
  }, [explodeRocket, fireConfettiSalvo, launchRocket, duration]);

  if (!visible) return null;

  return (
    <>
      {/* 1. Full-screen HTML5 Canvas for firecracker particles (clicks pass right through to dashboard!) */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-50 transform-gpu"
        style={{ willChange: 'transform, opacity' }}
      />

      {/* 2. Celebration Victory Card at Top Center of Dashboard */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl animate-bounce-short pointer-events-auto">
        <div className="relative rounded-2xl bg-[#090f1d]/95 backdrop-blur-xl border-2 border-[#00f2fe] p-4 sm:p-5 shadow-[0_0_50px_rgba(0,242,254,0.5)] flex flex-col gap-3.5">
          {/* Neon Corner Tech Accents */}
          <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#ffd700]"></div>
          <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-[#ffd700]"></div>
          <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-[#00f2fe]"></div>
          <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#00f2fe]"></div>

          {/* Header Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl animate-spin-slow">🎆</span>
              <span className="text-xs font-black uppercase tracking-widest text-[#ffd700] drop-shadow-[0_0_8px_#ffd700]">
                VICTORY CELEBRATION!
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#00f2fe]/20 text-[#00f2fe] text-[10px] font-bold border border-[#00f2fe]/40">
                {gameMode === 'LOCAL_2P' ? '2-PLAYER DUEL' : 'NEURAL BATTLE'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setVisible(false);
                if (onClose) onClose();
              }}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer text-sm"
              title="Close Celebration"
            >
              ✕
            </button>
          </div>

          {/* Winner Headline & Rewards */}
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] via-[#ffd700] to-[#c084fc] drop-shadow-[0_0_15px_rgba(0,242,254,0.4)] tracking-wide">
              🏆 {winner} WINS!
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Match recorded to telemetry telemetry. Battle Matrix claimed with full honors!
            </p>
          </div>

          {/* Quick Reward Pill Badges */}
          <div className="grid grid-cols-2 gap-2 bg-[#060a14]/80 p-2.5 rounded-xl border border-white/10 text-center">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">EXP SURGE</span>
              <span className="text-sm font-black text-[#00f2fe]">+185 XP</span>
            </div>
            <div className="flex flex-col items-center border-l border-white/10">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">COMBAT RATING</span>
              <span className="text-sm font-black text-[#ffd700]">+24 CR</span>
            </div>
          </div>

          {/* Interactive Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                launchRocket();
                launchRocket();
                fireConfettiSalvo();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#111f3d] hover:bg-[#182b54] text-[#00f2fe] border border-[#00f2fe]/40 font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,242,254,0.2)] transition flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02]"
            >
              <span>💥</span>
              <span>FIRE MORE</span>
            </button>

            {onRematch && (
              <button
                type="button"
                onClick={() => {
                  setVisible(false);
                  onRematch();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#00c6ff] to-[#0072ff] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,198,255,0.5)] transition flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02]"
              >
                <span>⚡</span>
                <span>QUICK REMATCH</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setVisible(false);
                if (onClose) onClose();
              }}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs uppercase transition cursor-pointer"
            >
              DISMISS
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
