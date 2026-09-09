import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAudio } from '../../hooks/useAudio';
import { matchService } from '../../services/matchService';
import { ROUTES } from '../../constants/routes';

export function MatchResultPage() {
  const { user } = useAuth();
  const { playClick, playVictory } = useAudio();
  const navigate = useNavigate();

  const [lastMatch, setLastMatch] = useState(null);

  useEffect(() => {
    playVictory();
    async function loadLatestMatch() {
      try {
        const match = await matchService.getLastEncounter();
        if (match) setLastMatch(match);
      } catch (err) {
        console.error('Failed to load last match:', err);
      }
    }
    loadLatestMatch();
  }, [playVictory]);

  const p1Score = lastMatch?.player1Score ?? 2;
  const p2Score = lastMatch?.player2Score ?? 1;
  const crGained = lastMatch?.crChange ?? 24;
  const xpGained = lastMatch?.xpEarned ?? 185;
  const opponentTag = lastMatch?.player2Tag ?? 'VORTEX_99';
  const resultOutcome = lastMatch?.resultType ?? 'WIN';

  const xpPercent = Math.min(100, Math.round(((user?.currentXp || 8635) / 10000) * 100));

  return (
    <div className="flex flex-col w-full relative overflow-hidden bg-background text-on-surface min-h-screen">
      {/* Background Matrix Glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-primary-container/20 via-secondary/15 to-transparent blur-[120px] rounded-full opacity-70"></div>
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary-container/10 blur-[90px] rounded-full"></div>
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-secondary/15 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-space-md py-space-xl flex flex-col gap-space-xl">
        {/* Header Hero Banner */}
        <div className="flex flex-col items-center text-center relative pt-space-xs">
          <div className="inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-surface-container-high/80 backdrop-blur-md shadow-md mb-space-sm border border-outline-variant/30">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-ping"></span>
            <span className="font-label-data-sm text-label-data-sm uppercase tracking-widest text-primary-fixed-dim">
              ARENA TELEMETRY // SESSION #{lastMatch?.roomCode || '8849-TX'}
            </span>
            <span className="text-outline text-label-data-sm">•</span>
            <span className="font-label-data-sm text-label-data-sm text-tertiary-fixed-dim">
              {lastMatch?.gameMode || 'COMPETITIVE RANKED'}
            </span>
          </div>

          <div className="relative flex items-center justify-center">
            <h1 className="font-display-hero text-display-hero uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-tertiary-container via-primary-container to-secondary drop-shadow-[0_0_35px_rgba(0,242,254,0.45)] select-none">
              {resultOutcome === 'WIN' ? 'VICTORY!' : resultOutcome === 'LOSS' ? 'DEFEAT' : 'STALEMATE'}
            </h1>
            <div className="hidden md:flex absolute -right-28 top-2 items-center gap-space-2xs px-space-xs py-space-2xs rounded bg-surface-container-highest/60 backdrop-blur-md border border-outline-variant/30">
              <span className="material-symbols-outlined text-tertiary-container text-body-lg">military_tech</span>
              <span className="font-label-data-sm text-label-data-sm text-tertiary">DOMINANT WIN</span>
            </div>
          </div>

          <p className="font-headline-sm text-headline-sm text-primary-fixed uppercase tracking-wider mt-space-2xs">
            MATCH COMPLETED <span className="text-outline">//</span> FLAWLESS TACTICAL TRIUMPH
          </p>

          {/* Series Scoreboard Capsule */}
          <div className="mt-space-md flex items-center justify-center gap-space-lg">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-full bg-primary-container/20 p-space-2xs flex items-center justify-center">
                <span className="font-label-data-lg text-label-data-lg font-bold text-primary-container">✕</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-label-data-lg text-label-data-lg font-bold text-on-surface">
                  {user?.gamerTag || 'CYBER_VIPER'}
                </span>
                <span className="font-label-data-sm text-label-data-sm text-primary">WINNER // BLUE NODE</span>
              </div>
            </div>

            <div className="flex items-center gap-space-xs bg-surface-container-lowest/90 px-space-md py-space-xs rounded-xl shadow-xl border border-outline-variant/40">
              <span className="font-headline-lg text-headline-lg font-black text-primary-container">{p1Score}</span>
              <span className="font-headline-sm text-headline-sm text-outline-variant px-space-2xs">-</span>
              <span className="font-headline-lg text-headline-lg font-black text-surface-bright">{p2Score}</span>
            </div>

            <div className="flex items-center gap-space-sm flex-row-reverse">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest p-space-2xs flex items-center justify-center">
                <span className="font-label-data-lg text-label-data-lg font-bold text-outline">○</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="font-label-data-lg text-label-data-lg font-bold text-outline">{opponentTag}</span>
                <span className="font-label-data-sm text-label-data-sm text-outline-variant">DEFEATED // RED NODE</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Column Diagnostics & Rewards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-stretch">
          {/* Column 1: Telemetry & Rewards (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-space-md bg-surface-container-low/70 backdrop-blur-xl rounded-xl p-space-lg shadow-xl relative overflow-hidden border border-outline-variant/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary-container">token</span>
                <span className="font-headline-sm text-headline-sm uppercase text-on-surface">Telemetry &amp; Rewards</span>
              </div>
              <span className="font-label-data-sm text-label-data-sm px-space-xs py-space-2xs rounded bg-surface-container-high text-primary-fixed">
                CYCLE 14
              </span>
            </div>

            {/* Experience Surge Card */}
            <div className="bg-surface-container-highest/40 backdrop-blur-md rounded-lg p-space-md flex flex-col gap-space-xs border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <span className="font-label-data-sm text-label-data-sm uppercase tracking-wider text-outline">
                  EXPERIENCE SURGE
                </span>
                <span className="font-label-data-lg text-label-data-lg font-bold text-primary-container animate-pulse">
                  +{xpGained} XP EARNED
                </span>
              </div>
              <div className="flex items-end justify-between mt-space-2xs">
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  Level {user?.level || 42} → {(user?.level || 42) + 1}
                </span>
                <span className="font-label-data-sm text-label-data-sm text-on-surface-variant font-mono">
                  {(user?.currentXp || 8635).toLocaleString()} / 10,000 XP
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-surface-container-lowest overflow-hidden mt-space-2xs p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-fixed-dim via-primary-container to-secondary transition-all duration-1000 shadow-[0_0_12px_rgba(0,242,254,0.6)]"
                  style={{ width: `${xpPercent}%` }}
                ></div>
              </div>
              <span className="font-label-data-sm text-label-data-sm text-outline mt-space-2xs tracking-tight">
                {Math.max(0, 10000 - (user?.currentXp || 8635)).toLocaleString()} XP needed for next Tier Unlock
              </span>
            </div>

            {/* Combat Rating Card */}
            <div className="bg-surface-container-highest/40 backdrop-blur-md rounded-lg p-space-md flex flex-col gap-space-xs border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <span className="font-label-data-sm text-label-data-sm uppercase tracking-wider text-outline">
                  COMBAT RATING
                </span>
                <span className="font-label-data-lg text-label-data-lg font-bold text-tertiary-container">
                  +{crGained} CR GAIN
                </span>
              </div>
              <div className="flex items-baseline gap-space-xs mt-space-2xs">
                <span className="font-display-hero-mobile text-display-hero-mobile font-bold text-on-surface tracking-tight">
                  {user?.combatRating || 2474}
                </span>
                <span className="font-label-data-md text-label-data-md text-tertiary font-bold">CR</span>
              </div>
              <div className="flex items-center gap-space-xs text-secondary-fixed">
                <span className="material-symbols-outlined text-body-md">social_leaderboard</span>
                <span className="font-label-data-sm text-label-data-sm font-semibold">
                  {user?.rankDivision || 'Master Division'} • Global Rank #{user?.globalRank || 842}
                </span>
              </div>
            </div>

            {/* Unlocked Badge */}
            <div className="bg-gradient-to-r from-secondary-container/50 to-surface-container-high/60 backdrop-blur-md rounded-lg p-space-md flex items-center gap-space-md shadow-md mt-auto border border-secondary/30">
              <div className="w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center shrink-0 shadow-lg">
                <span className="material-symbols-outlined text-secondary-fixed text-headline-sm">workspace_premium</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-data-sm text-label-data-sm uppercase font-bold text-secondary">
                  NEW BADGE UNLOCKED
                </span>
                <span className="font-headline-sm text-headline-sm text-tertiary leading-tight">
                  TACTICAL MASTER (Stage II)
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  5 Consecutive Precision Wins Achieved
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Combat Diagnostics (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-space-md bg-surface-container-low/70 backdrop-blur-xl rounded-xl p-space-lg shadow-xl border border-outline-variant/20">
            <div className="flex items-center justify-between pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary-container">speed</span>
                <span className="font-headline-sm text-headline-sm uppercase text-on-surface">Combat Diagnostics</span>
              </div>
              <span className="font-label-data-sm text-outline text-xs">PRECISION MATRIX</span>
            </div>

            <div className="grid grid-cols-2 gap-space-sm">
              <div className="p-space-sm rounded bg-surface-container/60 flex flex-col gap-1 border border-outline-variant/10">
                <span className="font-label-data-sm text-outline uppercase">MOVE ACCURACY</span>
                <span className="font-headline-sm text-primary">94.2%</span>
                <span className="text-xs text-primary-fixed-dim">Heuristic Rating: S+</span>
              </div>

              <div className="p-space-sm rounded bg-surface-container/60 flex flex-col gap-1 border border-outline-variant/10">
                <span className="font-label-data-sm text-outline uppercase">AVG RESPONSE</span>
                <span className="font-headline-sm text-primary">1.4s</span>
                <span className="text-xs text-primary-fixed-dim">Near Instantaneous</span>
              </div>

              <div className="p-space-sm rounded bg-surface-container/60 flex flex-col gap-1 border border-outline-variant/10">
                <span className="font-label-data-sm text-outline uppercase">WIN STREAK</span>
                <span className="font-headline-sm text-error flex items-center gap-1">
                  {user?.winStreak || 7}
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    local_fire_department
                  </span>
                </span>
                <span className="text-xs text-error font-semibold">ON FIRE (+25% BONUS)</span>
              </div>

              <div className="p-space-sm rounded bg-surface-container/60 flex flex-col gap-1 border border-outline-variant/10">
                <span className="font-label-data-sm text-outline uppercase">APEX COUNTERS</span>
                <span className="font-headline-sm text-secondary">3</span>
                <span className="text-xs text-outline">Diagonal Trap Neutralized</span>
              </div>
            </div>

            <div className="mt-auto bg-surface-container/50 p-space-sm rounded-lg flex flex-col gap-space-2xs">
              <span className="font-label-data-sm text-outline uppercase tracking-wider">
                DECRYPTED MATCH TELEMETRY
              </span>
              <p className="font-label-data-sm text-xs text-on-surface-variant font-mono">
                PACKETS_SYNC: 128-TICK // CHECKSUM_VALID: 0x9F42E // ELO_SPREAD: +12.4% // PROTOCOL: TECHRONICS_V8
              </p>
            </div>
          </div>

          {/* Column 3: Tactical Actions (3 cols) */}
          <div className="lg:col-span-3 flex flex-col justify-between gap-space-md bg-surface-container-low/70 backdrop-blur-xl rounded-xl p-space-lg shadow-xl border border-outline-variant/20">
            <div className="flex flex-col gap-space-2xs">
              <span className="font-headline-sm text-headline-sm uppercase text-on-surface">TACTICAL ACTIONS</span>
              <p className="font-body-sm text-outline">Select your subsequent deployment protocol.</p>
            </div>

            <div className="flex flex-col gap-space-sm">
              <button
                type="button"
                onClick={() => {
                  playClick();
                  const query = new URLSearchParams();
                  if (lastMatch?.gameMode) query.set('mode', lastMatch.gameMode);
                  if (lastMatch?.aiDifficulty) query.set('diff', lastMatch.aiDifficulty);
                  if (lastMatch?.player2Tag) query.set('p2', lastMatch.player2Tag);
                  navigate(`${ROUTES.PLAY_ARENA}?${query.toString()}`);
                }}
                className="w-full py-space-sm px-space-md rounded font-headline-sm text-headline-sm uppercase tracking-wider bg-gradient-to-r from-primary-container via-surface-tint to-primary-fixed-dim text-on-primary font-bold shadow-[0_0_20px_rgba(0,242,254,0.45)] hover:shadow-[0_0_30px_rgba(0,242,254,0.7)] hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center gap-space-xs cursor-pointer"
              >
                <span className="material-symbols-outlined">refresh</span> PLAY AGAIN / REMATCH
              </button>

              <button
                type="button"
                onClick={() => {
                  playClick();
                  navigate(ROUTES.LOBBY);
                }}
                className="w-full py-space-sm px-space-md rounded font-headline-sm text-headline-sm uppercase tracking-wider bg-surface-container-high hover:bg-surface-container-highest text-on-surface hover:text-primary transition flex items-center justify-center gap-space-xs"
              >
                <span className="material-symbols-outlined">home</span> RETURN TO LOBBY
              </button>

              <button
                type="button"
                onClick={() => {
                  playClick();
                  navigate(ROUTES.LEADERBOARD);
                }}
                className="w-full py-space-sm px-space-md rounded font-headline-sm text-headline-sm uppercase tracking-wider bg-surface-container hover:bg-surface-container-high text-secondary hover:text-secondary-fixed transition flex items-center justify-center gap-space-xs"
              >
                <span className="material-symbols-outlined">leaderboard</span> VIEW LEADERBOARD
              </button>
            </div>

            <span className="font-label-data-sm text-[11px] text-outline text-center uppercase tracking-widest">
              TELEMETRY LOG SAVED TO CLOUD
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
