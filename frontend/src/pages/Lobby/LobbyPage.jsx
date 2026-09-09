import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAudio } from '../../hooks/useAudio';
import { matchService } from '../../services/matchService';
import { questService } from '../../services/questService';
import { ROUTES } from '../../constants/routes';
import { FirecrackerCelebration } from '../../components/common/FirecrackerCelebration';

export function LobbyPage() {
  const { user, logout } = useAuth();
  const { playClick, soundOn, toggleSound } = useAudio();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Victory celebration from match completion
  const victoryParam = searchParams.get('victory') === 'true';
  const winnerParam = searchParams.get('winner');
  const modeParam = searchParams.get('mode') || 'VS_AI';

  const [showCelebration, setShowCelebration] = useState(victoryParam);
  const [celebrationWinner, setCelebrationWinner] = useState(winnerParam || user?.gamerTag || 'CyberPilot');

  useEffect(() => {
    if (victoryParam) {
      setShowCelebration(true);
      if (winnerParam) setCelebrationWinner(winnerParam);
    }
  }, [victoryParam, winnerParam]);

  // State
  const [activeModal, setActiveModal] = useState(null); // 'single_player' | 'local_2p' | 'online_arena' | 'tournament' | 'challenges' | 'statistics' | 'profile' | 'settings' | null
  const [aiDifficulty, setAiDifficulty] = useState('hard');
  const [p1Callsign, setP1Callsign] = useState(user?.gamerTag || 'CyberPilot');
  const [p2Callsign, setP2Callsign] = useState('PILOT_TWO');
  const [copiedLink, setCopiedLink] = useState(false);
  const [quests, setQuests] = useState([]);
  const [recentMatch, setRecentMatch] = useState(null);

  useEffect(() => {
    if (user?.gamerTag) {
      setP1Callsign(user.gamerTag);
    }
  }, [user?.gamerTag]);

  useEffect(() => {
    async function loadLobbyData() {
      try {
        const [recent, questsData] = await Promise.all([
          matchService.getLastEncounter().catch(() => null),
          questService.getTacticalQuests().catch(() => []),
        ]);
        if (recent) setRecentMatch(recent);
        if (questsData) setQuests(questsData);
      } catch (e) {
        console.error('Failed to load telemetry:', e);
      }
    }
    loadLobbyData();
  }, []);

  const handleLaunch = (mode, diff, p1, p2) => {
    playClick();
    const query = new URLSearchParams({ mode });
    if (diff) query.set('diff', diff);
    if (p1) query.set('p1', p1);
    if (p2) query.set('p2', p2);
    navigate(`${ROUTES.PLAY_ARENA}?${query.toString()}`);
  };

  const handleCopyInvite = () => {
    playClick();
    navigator.clipboard?.writeText(window.location.origin + ROUTES.PLAY_ARENA + '?mode=ONLINE_RANKED&room=TX-ARENA');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const gamerTag = user?.gamerTag || 'CyberPilot';
  const userLevel = user?.level || 1;
  const currentXp = user?.currentXp || 0;
  const xpThreshold = 250;
  const xpPercent = Math.min(100, Math.round((currentXp / xpThreshold) * 100));

  const victories = user?.victories ?? 0;
  const winRate = user?.winRate ?? 0;
  const winStreak = user?.winStreak ?? 0;

  return (
    <div className="w-full min-h-screen bg-[#070b14] text-slate-100 p-5 md:p-8 lg:p-10 flex flex-col gap-6 max-w-[1400px] mx-auto select-none transform-gpu">
      {/* Full-Screen Firecracker Celebration Overlay on Victory */}
      {showCelebration && (
        <FirecrackerCelebration
          winner={celebrationWinner}
          gameMode={modeParam}
          duration={9000}
          onClose={() => {
            setShowCelebration(false);
            setSearchParams({});
          }}
          onRematch={() => {
            setShowCelebration(false);
            setSearchParams({});
            handleLaunch('VS_AI', aiDifficulty);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* 1. TOP CARD: PLAYER PROFILE & TELEMETRY PROGRESS          */}
      {/* ========================================================= */}
      <section className="w-full rounded-2xl bg-[#0b1220]/95 border border-[#16223d] p-6 shadow-xl flex flex-col gap-6 relative overflow-hidden transform-gpu">
        {/* Subtle Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-80 h-32 bg-[#00f2fe]/5 blur-3xl pointer-events-none"></div>

        {/* Top Part: Avatar + Level + XP Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 w-full">
          {/* Avatar Box */}
          <div className="relative w-16 h-16 rounded-2xl bg-[#0e1832] border border-[#00f2fe]/40 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(0,242,254,0.15)]">
            <span className="material-symbols-outlined text-amber-400 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              bolt
            </span>
            <span className="absolute -bottom-2 bg-amber-400 text-[#070b14] font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wide">
              LVL {userLevel}
            </span>
          </div>

          {/* Details & XP Bar */}
          <div className="flex flex-col flex-1 gap-1.5 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide truncate">
                  {gamerTag}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setCelebrationWinner(gamerTag);
                    setShowCelebration(true);
                  }}
                  className="px-2.5 py-1 rounded-full bg-[#ffd700]/10 hover:bg-[#ffd700]/25 border border-[#ffd700]/40 text-[#ffd700] text-[11px] font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,215,0,0.25)] transition cursor-pointer hover:scale-105 active:scale-95"
                  title="Launch Victory Firecrackers"
                >
                  <span>🎆</span>
                  <span className="hidden sm:inline">FIRECRACKERS</span>
                </button>
              </div>
              <span className="text-xs font-mono text-slate-400 font-medium">
                {currentXp} / {xpThreshold} XP
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>XP Progress</span>
            </div>

            <div className="w-full h-2 bg-[#121c35] rounded-full overflow-hidden p-[1px]">
              <div
                className="h-full bg-gradient-to-r from-[#00f2fe] via-[#00c6ff] to-[#3b82f6] rounded-full shadow-[0_0_10px_rgba(0,242,254,0.7)] transition-all duration-500"
                style={{ width: `${Math.max(5, xpPercent)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-[#16223d]" />

        {/* Bottom Part: 3 Large Colored Metric Stats */}
        <div className="grid grid-cols-3 text-center divide-x divide-[#16223d]/80 pt-1">
          {/* Stat 1: WINS */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              WINS
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#00f2fe] mt-1 drop-shadow-[0_0_12px_rgba(0,242,254,0.4)]">
              {victories}
            </span>
          </div>

          {/* Stat 2: WIN RATE */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              WIN RATE
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#c084fc] mt-1 drop-shadow-[0_0_12px_rgba(192,132,252,0.4)]">
              {winRate}%
            </span>
          </div>

          {/* Stat 3: BEST STREAK */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              BEST STREAK
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#facc15] mt-1 drop-shadow-[0_0_12px_rgba(250,204,21,0.4)]">
              {winStreak}
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. HERO CARD: "JUMP STRAIGHT IN"                          */}
      {/* ========================================================= */}
      <section className="w-full rounded-2xl bg-gradient-to-r from-[#0d1630] via-[#12163b] to-[#1c1240] border border-[#202c50] p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden transform-gpu">
        {/* Glow orb */}
        <div className="absolute right-10 -top-10 w-72 h-72 bg-[#00f2fe]/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col gap-2 z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f2fe]/10 border border-[#00f2fe]/30 w-fit">
            <span className="w-2 h-2 rounded-full bg-[#00f2fe] animate-pulse"></span>
            <span className="text-[#00f2fe] font-extrabold text-[11px] tracking-wider uppercase">
              READY TO PLAY
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight mt-1">
            Jump Straight In
          </h1>

          <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
            Launch an instant match against our adaptive AI with your favorite settings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleLaunch('VS_AI', aiDifficulty)}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#00c6ff] via-[#0072ff] to-[#00f2fe] hover:brightness-110 text-white font-black text-sm md:text-base uppercase tracking-wider shadow-[0_0_30px_rgba(0,198,255,0.65)] flex items-center justify-center gap-2.5 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0 z-10"
        >
          <span className="material-symbols-outlined text-xl leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>
            play_arrow
          </span>
          <span>QUICK PLAY</span>
        </button>
      </section>

      {/* ========================================================= */}
      {/* 3. "SELECT GAME MODE" SECTION                             */}
      {/* ========================================================= */}
      <section className="flex flex-col gap-4 w-full transform-gpu">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
          SELECT GAME MODE
        </h3>

        {/* Top 3 Primary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Single Player */}
          <div
            onClick={() => {
              playClick();
              setActiveModal('single_player');
            }}
            className="rounded-2xl bg-[#0b1426] border border-[#162544] hover:border-[#00f2fe]/60 p-6 transition-all duration-150 hover:shadow-[0_0_30px_rgba(0,242,254,0.2)] flex flex-col justify-between cursor-pointer group transform-gpu active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-[#00f2fe]/10 border border-[#00f2fe]/30 text-[#00f2fe] flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                <span className="material-symbols-outlined text-2xl">smart_toy</span>
              </div>
              <span className="bg-[#111f38] text-slate-300 text-[11px] font-medium px-3 py-1 rounded-full border border-slate-700/60">
                Minimax Engine
              </span>
            </div>

            <div className="mt-8">
              <h4 className="text-xl font-bold text-white group-hover:text-[#00f2fe] transition-colors">
                Single Player
              </h4>
              <p className="text-slate-400 text-xs mt-1">
                vs Neural AI (4 Difficulties)
              </p>
            </div>

            <div className="mt-6 pt-2 flex items-center text-xs font-bold text-[#00f2fe] gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>Enter Mode</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>

          {/* Card 2: Local Multiplayer */}
          <div
            onClick={() => {
              playClick();
              setActiveModal('local_2p');
            }}
            className="rounded-2xl bg-[#120e2a] border border-[#251b4c] hover:border-[#a855f7]/60 p-6 transition-all duration-150 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] flex flex-col justify-between cursor-pointer group transform-gpu active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/30 text-[#a855f7] flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                <span className="material-symbols-outlined text-2xl">groups</span>
              </div>
              <span className="bg-[#1f153f] text-slate-300 text-[11px] font-medium px-3 py-1 rounded-full border border-slate-700/60">
                2 Players
              </span>
            </div>

            <div className="mt-8">
              <h4 className="text-xl font-bold text-white group-hover:text-[#c084fc] transition-colors">
                Local Multiplayer
              </h4>
              <p className="text-slate-400 text-xs mt-1">
                Pass &amp; Play on 1 Device
              </p>
            </div>

            <div className="mt-6 pt-2 flex items-center text-xs font-bold text-[#c084fc] gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>Enter Mode</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>

          {/* Card 3: Online Arena */}
          <div
            onClick={() => {
              playClick();
              setActiveModal('online_arena');
            }}
            className="rounded-2xl bg-[#091720] border border-[#14313a] hover:border-[#10b981]/60 p-6 transition-all duration-150 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] flex flex-col justify-between cursor-pointer group transform-gpu active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                <span className="material-symbols-outlined text-2xl">public</span>
              </div>
              <span className="bg-[#0f2c30] text-slate-300 text-[11px] font-medium px-3 py-1 rounded-full border border-slate-700/60">
                Live Sync
              </span>
            </div>

            <div className="mt-8">
              <h4 className="text-xl font-bold text-white group-hover:text-[#10b981] transition-colors">
                Online Arena
              </h4>
              <p className="text-slate-400 text-xs mt-1">
                Room Codes &amp; Matchmaking
              </p>
            </div>

            <div className="mt-6 pt-2 flex items-center text-xs font-bold text-[#10b981] gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>Enter Mode</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>
        </div>

        {/* Bottom 3 Secondary Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 4: Tournament */}
          <div
            onClick={() => {
              playClick();
              setActiveModal('tournament');
            }}
            className="rounded-2xl bg-[#191208] border border-[#382610] hover:border-[#f59e0b]/60 p-5 transition-all duration-150 hover:shadow-[0_0_25px_rgba(245,158,11,0.18)] flex items-center justify-between cursor-pointer group transform-gpu active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl">emoji_events</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white group-hover:text-[#f59e0b] transition-colors">
                  Cyber Cup
                </span>
                <span className="text-[11px] text-slate-400">Championship</span>
              </div>
            </div>

            <span className="bg-[#291b0a] text-amber-300 text-[11px] font-medium px-3 py-1 rounded-full border border-amber-800/40">
              Win Trophy
            </span>
          </div>

          {/* Card 5: Instant (Blitz Speed Duel) */}
          <div
            onClick={() => {
              playClick();
              handleLaunch('VS_AI', 'hard');
            }}
            className="rounded-2xl bg-[#0a1529] border border-[#14264a] hover:border-[#3b82f6]/60 p-5 transition-all duration-150 hover:shadow-[0_0_25px_rgba(59,130,246,0.18)] flex items-center justify-between cursor-pointer group transform-gpu active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-[#3b82f6] flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl">bolt</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white group-hover:text-[#3b82f6] transition-colors">
                  Blitz Duel
                </span>
                <span className="text-[11px] text-slate-400">5-Sec Turns</span>
              </div>
            </div>

            <span className="bg-[#102042] text-blue-300 text-[11px] font-medium px-3 py-1 rounded-full border border-blue-800/40">
              Instant
            </span>
          </div>

          {/* Card 6: Challenges / Bounties */}
          <div
            onClick={() => {
              playClick();
              setActiveModal('challenges');
            }}
            className="rounded-2xl bg-[#210c17] border border-[#441830] hover:border-[#f43f5e]/60 p-5 transition-all duration-150 hover:shadow-[0_0_25px_rgba(244,63,94,0.18)] flex items-center justify-between cursor-pointer group transform-gpu active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f43f5e]/10 border border-[#f43f5e]/30 text-[#f43f5e] flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl">adjust</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white group-hover:text-[#f43f5e] transition-colors">
                  Bounties
                </span>
                <span className="text-[11px] text-slate-400">Daily Quests</span>
              </div>
            </div>

            <span className="bg-[#361125] text-rose-300 text-[11px] font-medium px-3 py-1 rounded-full border border-rose-800/40">
              +XP Bounty
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. MODALS & CONFIG DIALOGS                                */}
      {/* ========================================================= */}

      {/* Modal A: Single Player (Vs Computer) Configuration */}
      {activeModal === 'single_player' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-md w-full bg-[#0c1527] border border-[#00f2fe]/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,242,254,0.3)] flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#00f2fe]/10 border border-[#00f2fe]/30 text-[#00f2fe] flex items-center justify-center">
                  <span className="material-symbols-outlined">smart_toy</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">Single Player</h3>
                  <span className="text-slate-400 text-xs">Configure AI Threat Level</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select AI Subroutine
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'easy', label: 'EASY', desc: 'Recruit Heuristics' },
                  { id: 'med', label: 'MEDIUM', desc: 'Tactician Counter' },
                  { id: 'hard', label: 'HARD', desc: 'Commander Traps' },
                  { id: 'expert', label: 'EXPERT', desc: 'Unbeatable Minimax' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      playClick();
                      setAiDifficulty(item.id);
                    }}
                    className={`p-3 rounded-xl flex flex-col text-left transition-all cursor-pointer ${
                      aiDifficulty === item.id
                        ? 'bg-[#0f2345] border border-[#00f2fe] shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                        : 'bg-[#101c36] border border-[#1b2b4e] text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <span className={`text-xs font-bold ${aiDifficulty === item.id ? 'text-[#00f2fe]' : 'text-white'}`}>
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveModal(null);
                handleLaunch('VS_AI', aiDifficulty);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00c6ff] to-[#0072ff] hover:brightness-110 text-white font-bold text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(0,198,255,0.5)] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">play_arrow</span>
              <span>START VS AI ({aiDifficulty.toUpperCase()})</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal B: Local Multiplayer (Pass & Play) Configuration */}
      {activeModal === 'local_2p' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-md w-full bg-[#120e2a] border border-[#a855f7]/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(168,85,247,0.3)] flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/30 text-[#a855f7] flex items-center justify-center">
                  <span className="material-symbols-outlined">groups</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">Local Multiplayer</h3>
                  <span className="text-slate-400 text-xs">2 Players Pass &amp; Play</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#1c1540] border border-[#33226a] text-xs text-slate-300 leading-relaxed">
              💡 Players take turns on this same screen: <strong className="text-[#00f2fe]">Player 1 (✕)</strong> moves first, then passes turn to <strong className="text-[#c084fc]">Player 2 (○)</strong>.
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#00f2fe] uppercase">Player 1 [✕] Callsign</label>
                <input
                  type="text"
                  maxLength={15}
                  value={p1Callsign}
                  onChange={(e) => setP1Callsign(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#1a143d] border border-[#33226a] text-white text-xs focus:border-[#00f2fe] focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#c084fc] uppercase">Player 2 [○] Callsign</label>
                <input
                  type="text"
                  maxLength={15}
                  value={p2Callsign}
                  onChange={(e) => setP2Callsign(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#1a143d] border border-[#33226a] text-white text-xs focus:border-[#c084fc] focus:outline-none"
                />
              </div>

              {/* Quick Tag Presets */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">PRESETS:</span>
                {['PILOT_TWO', 'GHOST', 'SHADOW', 'TITAN'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      playClick();
                      setP2Callsign(tag);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-[#22184d] hover:bg-[#2e2069] text-[10px] text-slate-300 hover:text-[#c084fc] transition cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveModal(null);
                handleLaunch('LOCAL_2P', null, p1Callsign, p2Callsign);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#9333ea] to-[#a855f7] hover:brightness-110 text-white font-bold text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(168,85,247,0.5)] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">play_arrow</span>
              <span>START 2-PLAYER DUEL</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal C: Online Arena (Matchmaking) */}
      {activeModal === 'online_arena' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-md w-full bg-[#091720] border border-[#10b981]/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(16,185,129,0.3)] flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] flex items-center justify-center">
                  <span className="material-symbols-outlined">public</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">Online Arena</h3>
                  <span className="text-slate-400 text-xs">Global Matchmaking &amp; Duels</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  handleLaunch('ONLINE_RANKED');
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#059669] to-[#10b981] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">military_tech</span>
                  <span>ENTER RANKED QUEUE</span>
                </span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  handleLaunch('QUICK_MATCH');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#112d35] hover:bg-[#163a44] text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-[#10b981]">flash_on</span>
                  <span>QUICK MATCH (CASUAL)</span>
                </span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>

              <button
                type="button"
                onClick={handleCopyInvite}
                className="w-full py-2.5 px-4 rounded-xl bg-[#112d35] hover:bg-[#163a44] text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-[#10b981]">content_copy</span>
                  <span>{copiedLink ? 'INVITE LINK COPIED!' : 'COPY PRIVATE INVITE LINK'}</span>
                </span>
                <span className="material-symbols-outlined text-sm">link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal D: Tournament Bracket */}
      {activeModal === 'tournament' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-md w-full bg-[#191208] border border-[#f59e0b]/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(245,158,11,0.3)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] flex items-center justify-center">
                  <span className="material-symbols-outlined">emoji_events</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">Cyber Cup Invitational</h3>
                  <span className="text-amber-400/80 text-xs font-semibold">Season 08 Grand Finals</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#2b1c09] border border-amber-900/50 flex flex-col gap-1.5 text-xs">
              <span className="text-amber-300 font-bold uppercase tracking-wider">PRIZE POOL: 50,000 CR + APEX REAPER BADGE</span>
              <p className="text-slate-300">
                Qualifying round open to Diamond tier pilots and above. Play online matches to elevate your qualifier seeding.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveModal(null);
                navigate(ROUTES.LEADERBOARD);
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#070b14] font-bold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              VIEW LEADERBOARD STANDINGS
            </button>
          </div>
        </div>
      )}

      {/* Modal E: Tactical Bounties & Challenges */}
      {activeModal === 'challenges' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-md w-full bg-[#210c17] border border-[#f43f5e]/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(244,63,94,0.3)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#f43f5e]/10 border border-[#f43f5e]/30 text-[#f43f5e] flex items-center justify-center">
                  <span className="material-symbols-outlined">adjust</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">Tactical Bounties</h3>
                  <span className="text-rose-400/80 text-xs font-semibold">Resets in 04h 21m</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {(quests.length > 0 ? quests : [
                { title: 'Matrix Dominance', currentCount: 2, targetCount: 3, rewardXp: 450 },
                { title: 'Diagonal Trap Intercept', currentCount: 1, targetCount: 2, rewardXp: 300 },
                { title: 'Speed Victor Blitz', currentCount: 3, targetCount: 5, rewardXp: 500 },
              ]).map((q, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#321223] border border-rose-900/40 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white font-semibold">{q.title}</span>
                    <span className="text-rose-400 font-bold">+{q.rewardXp} XP</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1f0915] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.round((q.currentCount / q.targetCount) * 100))}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-400 text-right">
                    {q.currentCount} / {q.targetCount} Completed
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal F: Statistics */}
      {activeModal === 'statistics' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-md w-full bg-[#0b1220] border border-[#00f2fe]/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,242,254,0.3)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#00f2fe]/10 border border-[#00f2fe]/30 text-[#00f2fe] flex items-center justify-center">
                  <span className="material-symbols-outlined">bar_chart</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">Combat Statistics</h3>
                  <span className="text-slate-400 text-xs">Career Pilot Telemetry</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#101c36] border border-[#1b2b4e]">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total Matches</span>
                <p className="text-xl font-extrabold text-white mt-1">
                  {(user?.victories || 0) + (user?.defeats || 0) + (user?.draws || 0)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#101c36] border border-[#1b2b4e]">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Combat Rating</span>
                <p className="text-xl font-extrabold text-[#00f2fe] mt-1">{user?.combatRating || 2450} CR</p>
              </div>
              <div className="p-3 rounded-xl bg-[#101c36] border border-[#1b2b4e]">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Win Rate</span>
                <p className="text-xl font-extrabold text-[#c084fc] mt-1">{winRate}%</p>
              </div>
              <div className="p-3 rounded-xl bg-[#101c36] border border-[#1b2b4e]">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Rank Division</span>
                <p className="text-xs font-bold text-[#facc15] mt-2 truncate">{user?.rankDivision || 'DIAMOND III'}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveModal(null);
                navigate(ROUTES.MATCH_HISTORY);
              }}
              className="w-full py-2.5 rounded-xl bg-[#132345] hover:bg-[#182c58] text-[#00f2fe] font-bold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              VIEW FULL MATCH HISTORY
            </button>
          </div>
        </div>
      )}

      {/* Modal G: Profile & Logout */}
      {activeModal === 'profile' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-sm w-full bg-[#0b1220] border border-[#00f2fe]/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,242,254,0.3)] flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-lg">Pilot Profile</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#101c36] border border-[#1b2b4e]">
              <div className="w-12 h-12 rounded-xl bg-[#0f1d38] border border-[#00f2fe]/40 flex items-center justify-center text-amber-400">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  bolt
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-white font-bold text-base truncate">{gamerTag}</span>
                <span className="text-slate-400 text-xs">Level {userLevel} • {user?.rankDivision || 'Elite Athlete'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveModal(null);
                logout();
                navigate(ROUTES.LOGIN);
              }}
              className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span>SIGN OUT PILOT</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal H: Settings */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-sm w-full bg-[#0b1220] border border-[#00f2fe]/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,242,254,0.3)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-lg">Arena Settings</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#101c36]">
                <span className="text-xs font-semibold text-white">Tactical Sound Effects</span>
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${soundOn ? 'bg-[#00f2fe] text-black' : 'bg-slate-700 text-slate-400'}`}
                >
                  {soundOn ? 'ENABLED' : 'MUTED'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
