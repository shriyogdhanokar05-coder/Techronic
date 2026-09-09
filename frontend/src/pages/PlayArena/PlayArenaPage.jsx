import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAudio } from '../../hooks/useAudio';
import { useTicTacToe } from '../../hooks/useTicTacToe';
import { matchService } from '../../services/matchService';
import { SECTOR_NAMES } from '../../utils/aiOpponent';
import { ROUTES } from '../../constants/routes';

export function PlayArenaPage() {
  const [searchParams] = useSearchParams();
  const gameMode = searchParams.get('mode') || 'VS_AI';
  const aiDifficulty = searchParams.get('diff') || 'hard';
  const p1Callsign = searchParams.get('p1') || 'CYBER_VIPER';
  const isLocal2P = gameMode === 'LOCAL_2P' || gameMode === 'HOTSEAT';
  const isAiMode = gameMode === 'VS_AI';
  const isOnline = gameMode === 'ONLINE_RANKED' || gameMode === 'QUICK_MATCH';
  const p2Callsign = searchParams.get('p2') || (isLocal2P ? 'PILOT_TWO' : (isAiMode ? `NEURAL_AI [${aiDifficulty.toUpperCase()}]` : 'VORTEX_99'));

  const { user, refreshProfile } = useAuth();
  const { playClick } = useAudio();
  const navigate = useNavigate();

  const [lastCompletedMatch, setLastCompletedMatch] = useState(null);
  const [savingResult, setSavingResult] = useState(false);
  const [autoRedirectSeconds, setAutoRedirectSeconds] = useState(null);
  const [redirectCancelled, setRedirectCancelled] = useState(false);

  // Handle Game End: Record result to backend
  const handleGameEnd = useCallback(async ({ result, winner, board, durationSeconds, p1Score, p2Score }) => {
    try {
      setSavingResult(true);
      const payload = {
        resultType: winner === 'X' ? 'WIN' : (winner === 'O' ? (isLocal2P ? 'WIN' : 'LOSS') : 'DRAW'),
        player1Score: p1Score,
        player2Score: p2Score,
        boardState: board.map((c) => c || '').join(','),
        durationSeconds: durationSeconds || 45,
        gameMode,
        aiDifficulty,
        opponentTag: isAiMode ? `NEURAL_AI_${aiDifficulty.toUpperCase()}` : (isLocal2P ? p2Callsign : 'VORTEX_99'),
      };

      const recorded = await matchService.recordQuickResult(payload);
      setLastCompletedMatch(recorded);
      refreshProfile();
    } catch (err) {
      console.error('Failed to save match result to backend:', err);
    } finally {
      setSavingResult(false);
    }
  }, [isLocal2P, gameMode, aiDifficulty, isAiMode, p2Callsign, refreshProfile]);

  const {
    board,
    currentTurn,
    startingTurn,
    gameStatus,
    winner,
    winningLine,
    moveHistory,
    p1SeriesScore,
    p2SeriesScore,
    roundNumber,
    turnCountdown,
    formattedMatchTime,
    recommendedMove,
    makeMove,
    resetRound,
    restartSeries,
    forfeit,
  } = useTicTacToe({
    gameMode,
    aiDifficulty,
    onGameEnd: handleGameEnd,
  });

  const p1Avatar =
    user?.avatarUrl ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCSXqdyHnS9BuGphkoQl7oUuxJNABrjK_Pa54SRVoJkBZ826RhOH7NZ4C2f_XfosMQHQ6EP3CPvRzKmdQVcgSsSWoIh9igN4BMQfihmx83lmDdOAIFqkmG9_X-IedcDxX_FsG5PXXuMmsnhIbkbHxEnaTTLBY4w5v6s2HZctqhrzhcBZpykxR6ZbvVh5fChGqlJIvreZhf0LB6wSYlUfj5AtA28tGweQ3ED33jmYzxKEY-cx0Y_kYDweQ';

  const p2Avatar =
    isAiMode
      ? 'https://lh3.googleusercontent.com/aida/AEtjO1XUan5Ffk3FawSQDwTewKBqVm82wK3i_BFHm2D0JQ2Qk8P8_AP1EA3sITSuUr-MmD_Himw6Zi6r_OMSZXFYAB4HnMPVNX-ifE6XEJBUuImUfyBtLGebM6CtapuI8h7FW1Ad5142n-T16Vx6BesBdBgM-KsSM59b1_4SR4PHZWh2mmIXOfITshoScXSphP64N4rTr0AO1F65x9T9fVInh5MbxVnvCu8hIoenKlD6PJDGJF1RxHvRgr2G6k4P'
      : 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPjpcbljMZPeD6b_13RKUif_lG9d_MSdGLUF3jtTRUtQEkVgreKkzegW1jNITRM_TZBZYX4YoFqoPqGZax51uh4ThFt1RyogtM7TjOtVbB28ToeBqSELG7uVKPNgeZspuFINjaS5q_SNCjG8VSnaaVbTRULtIcWNI1lfDPsLdQ5CWkI5WJ5I3ANS_17OaNyUnW2Zm-AiIMKQm46MIqfQC3RovrQ5t1d05cWyRvdfpXg9WDxcVclPTvcg';

  const opponentRank =
    isAiMode
      ? 'NEURAL CORE'
      : isLocal2P
      ? 'LOCAL RIVAL'
      : 'TITAN II';

  const ringDashoffset = Math.round((100 * (15 - turnCountdown)) / 15);

  const isP1Win = winner === 'X';
  const isP2Win = winner === 'O' && isLocal2P;
  const isAnyWin = isP1Win || isP2Win;
  const winnerName = isP1Win ? p1Callsign : (isP2Win ? p2Callsign : (user?.gamerTag || 'CyberPilot'));

  // Auto-redirect to dashboard with firecracker celebration upon victory
  React.useEffect(() => {
    if (gameStatus !== 'IN_PROGRESS' && isAnyWin && !redirectCancelled) {
      setAutoRedirectSeconds(3);
      const timer = setInterval(() => {
        setAutoRedirectSeconds((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(timer);
            navigate(`${ROUTES.LOBBY}?victory=true&winner=${encodeURIComponent(winnerName)}&mode=${encodeURIComponent(gameMode)}`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameStatus, isAnyWin, redirectCancelled, winnerName, gameMode, navigate]);

  return (
    <div className="flex flex-col w-full relative overflow-hidden bg-background text-on-surface select-none pb-space-2xl min-h-screen">
      {/* Dynamic Ambient Cyber Matrix Lighting */}
      <div className="absolute -top-40 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute -bottom-20 left-10 w-80 h-80 bg-error/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Telemetry Sub-header Rail */}
      <div className="w-full bg-surface-container-lowest/80 backdrop-blur-md px-space-md py-space-xs shadow-md border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-space-xs font-label-data-sm text-label-data-sm uppercase tracking-widest text-on-surface-variant">
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-2xs text-primary">
              <span className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_#00f2fe] animate-pulse"></span>
              <span>MATCH STATUS: ROUND {String(roundNumber).padStart(2, '0')}</span>
            </div>
            <span className="text-outline-variant">/</span>
            <div className="flex items-center gap-space-2xs text-on-surface">
              <span className="material-symbols-outlined text-sm text-outline">timer</span>
              <span>
                MATCH TIME: <strong className="text-primary font-label-data-md">{formattedMatchTime}</strong>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-2xs text-primary-fixed-dim">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed-dim shadow-[0_0_6px_#00dce6]"></span>
              <span>PING: 18ms (OPTIMAL)</span>
            </div>
            <span className="text-outline-variant">/</span>
            <div className="flex items-center gap-space-2xs text-on-surface-variant">
              <span className="material-symbols-outlined text-sm text-outline">dns</span>
              <span>SERVER: US-EAST CYBER-01</span>
            </div>
            <span className="text-outline-variant">/</span>
            <div className="flex items-center gap-space-2xs text-tertiary-fixed-dim">
              <span className="material-symbols-outlined text-sm">security</span>
              <span>SPECTATORS: 1,492</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Duel Stage Header */}
      <div className="w-full max-w-7xl mx-auto px-space-md pt-space-md pb-space-sm">
        <div className="relative bg-surface-container-low/70 backdrop-blur-xl rounded-xl shadow-xl p-space-md overflow-hidden border border-outline-variant/20">
          <div className="absolute top-0 left-0 w-32 h-[2px] bg-gradient-to-r from-primary-container to-transparent"></div>
          <div className="absolute top-0 right-0 w-32 h-[2px] bg-gradient-to-l from-secondary to-transparent"></div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md items-center">
            {/* Player 1 (CYBER_VIPER / P1) */}
            <div className="md:col-span-4 flex items-center justify-start gap-space-sm">
              <div className={`relative group rounded-xl transition-all duration-300 ${currentTurn === 'X' ? 'ring-2 ring-primary-container shadow-[0_0_24px_rgba(0,242,254,0.55)] scale-105' : 'opacity-80'}`}>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden relative bg-surface-container-high border border-primary-container/40">
                  <img alt="Player 1" className="w-full h-full object-cover" src={p1Avatar} />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-dim/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-1 right-1 px-space-2xs bg-primary-container text-on-primary-container font-label-data-sm text-[9px] rounded font-bold">
                    {isLocal2P ? 'P1' : 'YOU'}
                  </div>
                </div>
                {currentTurn === 'X' && (
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary-container rounded-sm shadow-[0_0_8px_#00f2fe] animate-ping"></div>
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-space-xs">
                  <span className="font-headline-sm text-headline-sm text-primary tracking-wide truncate">
                    {p1Callsign}
                  </span>
                  <span className="px-space-2xs py-0.5 bg-primary-container/20 text-primary-container rounded text-label-data-sm font-label-data-sm shadow-[0_0_10px_rgba(0,242,254,0.3)]">
                    {isLocal2P ? 'LOCAL P1' : (user?.rankDivision || 'DIAMOND III')}
                  </span>
                </div>
                <div className="flex items-center gap-space-sm mt-0.5 font-label-data-sm text-label-data-sm text-on-surface-variant">
                  <span>
                    RATING: <strong className="text-primary-fixed">{user?.combatRating || 2450} CR</strong>
                  </span>
                  <span className="text-outline-variant">•</span>
                  <span className="text-primary-container font-bold flex items-center gap-1">
                    SYMBOL: <span className="font-headline-sm text-lg text-primary-container drop-shadow-[0_0_8px_#00f2fe]">✕</span>
                  </span>
                </div>
                <div className="flex items-center gap-space-xs mt-space-2xs">
                  <span className="text-label-data-sm text-outline">SERIES PTS:</span>
                  <span className="px-space-xs py-0.5 bg-surface-container-highest text-primary font-label-data-lg text-label-data-lg font-bold rounded shadow-inner">
                    {String(p1SeriesScore).padStart(2, '0')}
                  </span>
                  {currentTurn === 'X' && (
                    <span className="text-label-data-sm text-primary-container font-bold animate-pulse">ACTIVE TURN</span>
                  )}
                </div>
              </div>
            </div>

            {/* Center VS Nexus */}
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-24 h-24 bg-gradient-to-tr from-primary-container/30 to-secondary/30 rounded-full blur-xl animate-pulse"></div>
                <div className="relative w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center shadow-[0_0_30px_rgba(0,242,254,0.25)] border border-outline-variant/40">
                  <span className="font-display-hero-mobile text-headline-lg font-extrabold bg-gradient-to-r from-primary-container via-tertiary to-secondary bg-clip-text text-transparent italic tracking-tighter drop-shadow-[0_0_14px_rgba(221,183,255,0.8)]">
                    VS
                  </span>
                </div>
              </div>
              <div className="mt-space-2xs flex items-center gap-space-xs">
                <span className="h-0.5 w-6 bg-gradient-to-r from-transparent to-primary-container"></span>
                <span className="font-label-data-sm text-label-data-sm text-tertiary-fixed tracking-widest font-bold">
                  {isLocal2P
                    ? '2P LOCAL MULTIPLAYER (PASS & PLAY)'
                    : isAiMode
                    ? `1P VS NEURAL COMPUTER [${aiDifficulty.toUpperCase()}]`
                    : 'ONLINE MULTIPLAYER RANKED DUEL'}
                </span>
                <span className="h-0.5 w-6 bg-gradient-to-l from-transparent to-secondary"></span>
              </div>
            </div>

            {/* Player 2 (Opponent / P2 / Computer) */}
            <div className="md:col-span-4 flex items-center justify-end gap-space-sm text-right">
              <div className="flex flex-col min-w-0 items-end">
                <div className="flex items-center gap-space-xs">
                  <span className="px-space-2xs py-0.5 bg-secondary-container/40 text-secondary rounded text-label-data-sm font-label-data-sm shadow-[0_0_10px_rgba(221,183,255,0.2)]">
                    {opponentRank}
                  </span>
                  <span className="font-headline-sm text-headline-sm text-secondary tracking-wide truncate">
                    {p2Callsign}
                  </span>
                </div>
                <div className="flex items-center gap-space-sm mt-0.5 font-label-data-sm text-label-data-sm text-on-surface-variant">
                  <span className="text-secondary font-bold flex items-center gap-1">
                    SYMBOL: <span className="font-headline-sm text-lg text-secondary drop-shadow-[0_0_8px_#ddb7ff]">○</span>
                  </span>
                  <span className="text-outline-variant">•</span>
                  <span>
                    RATING: <strong className="text-secondary-fixed">2,410 CR</strong>
                  </span>
                </div>
                <div className="flex items-center gap-space-xs mt-space-2xs">
                  {currentTurn === 'O' && (
                    <span className="text-label-data-sm text-secondary font-bold animate-pulse">ACTIVE TURN</span>
                  )}
                  <span className="px-space-xs py-0.5 bg-surface-container-highest text-secondary font-label-data-lg text-label-data-lg font-bold rounded shadow-inner">
                    {String(p2SeriesScore).padStart(2, '0')}
                  </span>
                  <span className="text-label-data-sm text-outline">:SERIES PTS</span>
                </div>
              </div>

              <div className={`relative group rounded-xl transition-all duration-300 ${currentTurn === 'O' ? 'ring-2 ring-secondary shadow-[0_0_24px_rgba(221,183,255,0.55)] scale-105' : 'opacity-80'}`}>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden relative bg-surface-container-high border border-secondary/40">
                  <img className="w-full h-full object-cover" alt="Opponent avatar" src={p2Avatar} />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-dim/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-1 left-1 px-space-2xs bg-secondary text-on-secondary font-label-data-sm text-[9px] rounded font-bold">
                    {isLocal2P ? 'P2' : (isAiMode ? 'BOT' : 'RIVAL')}
                  </div>
                </div>
                {currentTurn === 'O' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-sm shadow-[0_0_8px_#ddb7ff] animate-ping"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Turn Indicator Active Cyber Banner */}
      <div className="w-full max-w-7xl mx-auto px-space-md my-space-xs">
        <div className={`relative w-full rounded-lg bg-gradient-to-r from-surface-container-lowest via-surface-container to-surface-container-lowest p-space-sm overflow-hidden border transition-all duration-300 ${
          currentTurn === 'X'
            ? 'shadow-[0_0_25px_rgba(0,242,254,0.22)] border-primary-container/40'
            : 'shadow-[0_0_25px_rgba(221,183,255,0.22)] border-secondary/40'
        }`}>
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary-container to-transparent"></div>
          <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm px-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                  <circle className="text-surface-variant" cx="20" cy="20" fill="none" r="16" stroke="currentColor" strokeWidth="3"></circle>
                  <circle
                    className={`${currentTurn === 'X' ? 'text-primary-container shadow-[0_0_10px_#00f2fe]' : 'text-secondary shadow-[0_0_10px_#ddb7ff]'} transition-all duration-500`}
                    cx="20"
                    cy="20"
                    fill="none"
                    r="16"
                    stroke="currentColor"
                    strokeDasharray="100"
                    strokeDashoffset={ringDashoffset}
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  ></circle>
                </svg>
                <span className={`absolute font-label-data-md text-label-data-md font-bold ${currentTurn === 'X' ? 'text-primary' : 'text-secondary'}`}>
                  {turnCountdown}s
                </span>
              </div>

              <div>
                <div className="flex items-center gap-space-xs">
                  <span className={`w-2.5 h-2.5 rounded-full ${currentTurn === 'X' ? 'bg-primary-container' : 'bg-secondary'} animate-ping`}></span>
                  <span className={`font-headline-sm text-headline-sm uppercase tracking-wide ${currentTurn === 'X' ? 'text-primary' : 'text-secondary'}`}>
                    {isLocal2P
                      ? (currentTurn === 'X'
                          ? `👉 ${p1Callsign}'S TURN [✕] — PLAYER 1 MAKE YOUR MOVE`
                          : `👉 ${p2Callsign}'S TURN [○] — PASS DEVICE TO PLAYER 2`
                        )
                      : isAiMode
                      ? (currentTurn === 'X'
                          ? 'YOUR TURN [✕] — SELECT MATRIX SECTOR'
                          : '🤖 COMPUTER AI CALCULATING MOVE... [○]'
                        )
                      : (currentTurn === 'X'
                          ? 'PLAYER X TURN (YOUR MOVE)'
                          : 'PLAYER O TURN (RIVAL CALCULATING...)'
                        )
                    }
                  </span>
                </div>
                <p className="font-label-data-sm text-label-data-sm text-on-surface-variant">
                  {isLocal2P
                    ? `PLAYERS TAKE TURNS ONE AFTER THE OTHER • CURRENT TURN: ${currentTurn === 'X' ? `${p1Callsign} [✕]` : `${p2Callsign} [○]`}`
                    : 'LOCK IN SECTOR COORDINATE BEFORE DISCONNECTION TIMEOUT'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-space-sm">
              <div className="hidden lg:flex flex-col text-right">
                <span className="font-label-data-sm text-label-data-sm text-outline uppercase">
                  {isLocal2P ? 'LOCAL PASS & PLAY' : 'STRATAGEM RECOMMENDATION'}
                </span>
                <span className="font-label-data-md text-label-data-md text-tertiary-fixed font-bold">
                  {isLocal2P
                    ? 'ALTERNATING TURN PROTOCOL'
                    : (recommendedMove !== null
                        ? `SECTOR [${SECTOR_NAMES[recommendedMove]}] DEFENSIVE INTERCEPT`
                        : 'SYNCHRONIZING BATTLE TACTICS...')}
                </span>
              </div>
              <div className="px-space-sm py-space-2xs bg-primary-container/10 rounded flex items-center gap-space-xs text-primary-container font-label-data-sm text-label-data-sm">
                <span className="material-symbols-outlined text-base animate-pulse">
                  {isLocal2P ? 'groups' : 'radar'}
                </span>
                <span>{isLocal2P ? '2P HOTSEAT' : 'TELEMETRY LIVE'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Battlefield Core Grid & Tactical Sidebar */}
      <div className="w-full max-w-7xl mx-auto px-space-md py-space-sm grid grid-cols-1 lg:grid-cols-12 gap-space-md items-start">
        {/* Left Auxiliary / Grid Zone (8 cols) */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center relative">
          <div className="w-full relative bg-surface-container-lowest/60 rounded-xl p-space-md sm:p-space-lg shadow-2xl flex flex-col items-center border border-outline-variant/30">
            {/* Top HUD bar */}
            <div className="w-full flex items-center justify-between mb-space-md font-label-data-sm text-label-data-sm text-outline">
              <div className="flex items-center gap-space-xs">
                <span className="text-primary font-bold">MATRIX 3x3</span>
                <span>//</span>
                <span>HEURISTIC GRID OVERLAY</span>
              </div>
              <div className="flex items-center gap-space-xs text-primary-fixed-dim">
                <span className="material-symbols-outlined text-sm">grid_guides</span>
                <span>QUANTUM-SYNC ACTIVE</span>
              </div>
            </div>

            {/* 3x3 Glowing Battlefield Grid */}
            <div className="relative p-space-sm bg-surface-container-high/40 backdrop-blur-2xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-[540px] w-full aspect-square flex items-center justify-center border border-outline-variant/20">
              {/* Cyber Circuit Conduits (Grid Dividers) */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none p-space-sm">
                <div className="absolute top-space-sm bottom-space-sm left-1/3 w-[2px] bg-gradient-to-b from-primary-container/20 via-primary-container to-primary-container/20 shadow-[0_0_12px_#00f2fe]"></div>
                <div className="absolute top-space-sm bottom-space-sm left-2/3 w-[2px] bg-gradient-to-b from-secondary/20 via-secondary to-secondary/20 shadow-[0_0_12px_#ddb7ff]"></div>
                <div className="absolute left-space-sm right-space-sm top-1/3 h-[2px] bg-gradient-to-r from-primary-container/20 via-primary-container to-primary-container/20 shadow-[0_0_12px_#00f2fe]"></div>
                <div className="absolute left-space-sm right-space-sm top-2/3 h-[2px] bg-gradient-to-r from-secondary/20 via-secondary to-secondary/20 shadow-[0_0_12px_#ddb7ff]"></div>
              </div>

              {/* The Cells Grid */}
              <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-space-xs relative z-10">
                {board.map((cellValue, idx) => {
                  const isWinningCell = winningLine && winningLine.includes(idx);
                  const isRecommended = recommendedMove === idx && !cellValue;

                  if (cellValue === 'X') {
                    return (
                      <div
                        key={idx}
                        className={`relative group flex items-center justify-center bg-surface-container/60 backdrop-blur-xl rounded-lg overflow-hidden cursor-default shadow-sm ${
                          isWinningCell ? 'ring-2 ring-primary-container bg-primary-container/20 shadow-[0_0_30px_#00f2fe]' : ''
                        }`}
                      >
                        <span className="absolute top-2 left-2 font-label-data-sm text-label-data-sm text-primary-container/70">
                          [{SECTOR_NAMES[idx]}]
                        </span>
                        <div className="relative flex items-center justify-center animate-pulse">
                          <span className="font-display-hero text-display-hero sm:text-7xl font-extrabold text-primary-container drop-shadow-[0_0_24px_#00f2fe]">
                            ✕
                          </span>
                          <div className="absolute w-16 h-16 bg-primary-container/20 rounded-full blur-xl pointer-events-none"></div>
                        </div>
                        <span className="absolute bottom-1.5 right-2 font-label-data-sm text-[9px] text-primary truncate max-w-[80px]">
                          {p1Callsign}
                        </span>
                      </div>
                    );
                  }

                  if (cellValue === 'O') {
                    return (
                      <div
                        key={idx}
                        className={`relative group flex items-center justify-center bg-surface-container/60 backdrop-blur-xl rounded-lg overflow-hidden cursor-default shadow-sm ${
                          isWinningCell ? 'ring-2 ring-secondary bg-secondary-container/30 shadow-[0_0_30px_#ddb7ff]' : ''
                        }`}
                      >
                        <span className="absolute top-2 left-2 font-label-data-sm text-label-data-sm text-secondary/70">
                          [{SECTOR_NAMES[idx]}]
                        </span>
                        <div className="relative flex items-center justify-center">
                          <span className="font-display-hero text-display-hero sm:text-7xl font-extrabold text-secondary drop-shadow-[0_0_24px_#ddb7ff]">
                            ○
                          </span>
                        </div>
                        <span className="absolute bottom-1.5 right-2 font-label-data-sm text-[9px] text-secondary truncate max-w-[80px]">
                          {p2Callsign}
                        </span>
                      </div>
                    );
                  }

                  // Empty Cell
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAiMode && currentTurn !== 'X'}
                      onClick={() => makeMove(idx)}
                      className={`group relative flex items-center justify-center bg-surface-container-lowest/70 hover:bg-primary-container/15 backdrop-blur-xl rounded-lg transition-all duration-200 cursor-pointer overflow-hidden active:scale-95 shadow-inner ${
                        isRecommended ? 'border border-tertiary-fixed/50' : ''
                      }`}
                    >
                      <span className={`absolute top-2 left-2 font-label-data-sm text-label-data-sm ${isRecommended ? 'text-tertiary-fixed font-bold' : 'text-outline group-hover:text-primary'}`}>
                        [{SECTOR_NAMES[idx]}]
                      </span>

                      {isRecommended && (
                        <span className="absolute top-2 right-2 px-1 bg-tertiary-container text-on-tertiary-container font-label-data-sm text-[8px] rounded uppercase font-bold">
                          RECOMMENDED
                        </span>
                      )}

                      <div className="opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100 flex items-center justify-center">
                        <span className={`font-display-hero text-display-hero font-light ${currentTurn === 'X' ? 'text-primary-container drop-shadow-[0_0_15px_#00f2fe]' : 'text-secondary drop-shadow-[0_0_15px_#ddb7ff]'}`}>
                          {currentTurn === 'X' ? '✕' : '○'}
                        </span>
                      </div>
                      <span className={`absolute bottom-2 text-label-data-sm font-label-data-sm opacity-0 group-hover:opacity-100 uppercase tracking-widest transition-opacity ${currentTurn === 'X' ? 'text-primary' : 'text-secondary'}`}>
                        CLAIM [{SECTOR_NAMES[idx]}] ({currentTurn === 'X' ? p1Callsign : p2Callsign})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom In-Match Action Controls */}
            <div className="w-full flex items-center justify-between mt-space-md pt-space-xs border-t border-outline-variant/30 text-sm">
              <div className="flex items-center gap-space-xs">
                <button
                  type="button"
                  onClick={() => resetRound()}
                  className="px-space-sm py-space-2xs bg-surface-container hover:bg-surface-container-high rounded text-on-surface font-label-data-sm text-label-data-sm flex items-center gap-1 transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span> RESET ROUND
                </button>
                {isLocal2P && (
                  <button
                    type="button"
                    onClick={() => restartSeries()}
                    className="px-space-sm py-space-2xs bg-surface-container hover:bg-surface-container-high rounded text-outline hover:text-on-surface font-label-data-sm text-label-data-sm flex items-center gap-1 transition cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">restart_alt</span> RESET SERIES
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={forfeit}
                className="px-space-sm py-space-2xs bg-error-container/20 hover:bg-error-container/40 text-error rounded font-label-data-sm text-label-data-sm flex items-center gap-1 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">flag</span> CONCEDE DUEL
              </button>
            </div>
          </div>
        </div>

        {/* Right Tactical Sidebar / Battle Log (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          {/* Tactical Moves Log */}
          <div className="bg-surface-container-low/70 backdrop-blur-xl rounded-xl p-space-md shadow-xl border border-outline-variant/20 flex flex-col gap-space-xs">
            <div className="flex items-center justify-between pb-space-2xs border-b border-outline-variant/30">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary-container text-lg">receipt_long</span>
                <span className="font-headline-sm uppercase text-on-surface">COMBAT LOG</span>
              </div>
              <span className="font-label-data-sm text-outline text-xs">
                MOVES: {moveHistory.length}/9
              </span>
            </div>

            <div className="flex flex-col gap-space-2xs max-h-56 overflow-y-auto pr-1">
              {moveHistory.length === 0 ? (
                <p className="text-outline font-label-data-sm text-xs italic py-4 text-center">
                  Awaiting initial coordinates lock-in...
                </p>
              ) : (
                moveHistory.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-space-2xs rounded bg-surface-container/50 font-label-data-sm text-xs"
                  >
                    <div className="flex items-center gap-space-xs">
                      <span className={`font-bold ${m.player === 'X' ? 'text-primary' : 'text-secondary'}`}>
                        {m.player === 'X' ? `✕ ${p1Callsign}` : `○ ${p2Callsign}`}
                      </span>
                      <span className="text-on-surface">CLAIMED [{m.sector}]</span>
                    </div>
                    <span className="text-outline">{m.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Strategy Directive Card */}
          <div className="bg-surface-container-low/70 backdrop-blur-xl rounded-xl p-space-md shadow-xl border border-outline-variant/20 flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs text-secondary">
              <span className="material-symbols-outlined text-lg">psychology</span>
              <span className="font-headline-sm uppercase">TACTICAL ANALYSIS</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {gameStatus === 'IN_PROGRESS'
                ? 'Control of center sector B2 dictates 68% of duel trajectories. Utilize diagonal flank pressure to force defensive blunders.'
                : gameStatus === 'WIN'
                ? 'Target compromised! Tactical superiority confirmed. Experience and CR dispatched to pilot record.'
                : gameStatus === 'LOSS'
                ? 'Sector lost. Analyze counter-maneuvers and engage in rematch protocol.'
                : 'Stalemate achieved. Both pilots executed defensive symmetry.'}
            </p>
          </div>

          {/* Action Links */}
          <div className="flex flex-col gap-space-xs">
            <button
              type="button"
              onClick={() => {
                playClick();
                navigate(ROUTES.MATCH_RESULT);
              }}
              className="w-full py-space-xs rounded bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-data-sm text-label-data-sm uppercase tracking-wider flex items-center justify-center gap-1 transition"
            >
              <span className="material-symbols-outlined text-base">analytics</span> VIEW TELEMETRY RESULT
            </button>
            <button
              type="button"
              onClick={() => {
                playClick();
                navigate(ROUTES.LOBBY);
              }}
              className="w-full py-space-xs rounded bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface font-label-data-sm text-label-data-sm uppercase tracking-wider flex items-center justify-center gap-1 transition"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span> RETURN TO LOBBY
            </button>
          </div>
        </div>
      </div>

      {/* Game Outcome Modal */}
      {gameStatus !== 'IN_PROGRESS' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-space-md animate-fadeIn">
          <div className="relative max-w-lg w-full bg-surface-container-low border border-primary-container/40 rounded-2xl p-space-lg shadow-[0_0_50px_rgba(0,242,254,0.3)] flex flex-col items-center text-center gap-space-md">
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-primary-container pointer-events-none"></div>
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-primary-container pointer-events-none"></div>

            {/* Header / Winner Title */}
            <div className="flex flex-col items-center">
              {isLocal2P ? (
                <>
                  <h2
                    className={`font-display-hero text-4xl sm:text-5xl uppercase font-bold tracking-tight ${
                      winner === 'X'
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-primary-container via-surface-tint to-primary-fixed-dim drop-shadow-[0_0_20px_#00f2fe]'
                        : winner === 'O'
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-secondary-container via-secondary to-secondary-fixed drop-shadow-[0_0_20px_#ddb7ff]'
                        : 'text-outline drop-shadow-[0_0_20px_rgba(132,148,149,0.5)]'
                    }`}
                  >
                    {winner === 'X' ? `🏆 ${p1Callsign} WINS!` : winner === 'O' ? `🏆 ${p2Callsign} WINS!` : '🤝 STALEMATE!'}
                  </h2>
                  <span className="font-label-data-sm uppercase tracking-widest mt-1 text-outline">
                    {winner === 'X'
                      ? `PLAYER 1 (✕) TAKES ROUND ${roundNumber}`
                      : winner === 'O'
                      ? `PLAYER 2 (○) TAKES ROUND ${roundNumber}`
                      : 'HONORS EVEN // PERFECT SYMMETRY'}
                  </span>
                </>
              ) : (
                <>
                  <h2
                    className={`font-display-hero text-5xl uppercase font-bold tracking-tight ${
                      winner === 'X'
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-primary-container via-surface-tint to-secondary drop-shadow-[0_0_20px_#00f2fe]'
                        : winner === 'O'
                        ? 'text-error drop-shadow-[0_0_20px_rgba(255,180,171,0.5)]'
                        : 'text-outline drop-shadow-[0_0_20px_rgba(132,148,149,0.5)]'
                    }`}
                  >
                    {winner === 'X' ? 'VICTORY!' : winner === 'O' ? 'DEFEAT!' : 'STALEMATE!'}
                  </h2>
                  <span className="font-label-data-sm uppercase tracking-widest text-outline mt-1">
                    {winner === 'X'
                      ? 'FLAWLESS TACTICAL TRIUMPH'
                      : winner === 'O'
                      ? 'SECTOR OVERRUN BY OPPONENT'
                      : 'NEUTRAL MATRIX CONFLICT'}
                  </span>
                </>
              )}
            </div>

            {/* Middle Stats Box */}
            {isLocal2P ? (
              <div className="grid grid-cols-2 gap-space-md w-full bg-surface-container/60 p-space-md rounded-xl border border-outline-variant/30">
                <div className="flex flex-col items-center">
                  <span className="font-label-data-sm text-outline uppercase">{p1Callsign} [✕]</span>
                  <span className="font-headline-lg text-primary font-bold text-3xl mt-1">
                    {p1SeriesScore} <span className="text-xs font-normal text-outline">WINS</span>
                  </span>
                </div>
                <div className="flex flex-col items-center border-l border-outline-variant/30">
                  <span className="font-label-data-sm text-outline uppercase">{p2Callsign} [○]</span>
                  <span className="font-headline-lg text-secondary font-bold text-3xl mt-1">
                    {p2SeriesScore} <span className="text-xs font-normal text-outline">WINS</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-space-md w-full bg-surface-container/60 p-space-md rounded-xl border border-outline-variant/30">
                <div className="flex flex-col items-center">
                  <span className="font-label-data-sm text-outline uppercase">COMBAT RATING</span>
                  <span className="font-headline-sm text-primary font-bold">
                    {winner === 'X' ? '+24 CR' : winner === 'O' ? '-15 CR' : '+3 CR'}
                  </span>
                </div>
                <div className="flex flex-col items-center border-l border-outline-variant/30">
                  <span className="font-label-data-sm text-outline uppercase">EXP SURGE</span>
                  <span className="font-headline-sm text-secondary font-bold">
                    {winner === 'X' ? '+185 XP' : winner === 'O' ? '+50 XP' : '+80 XP'}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full mt-space-xs">
              {/* Prominent Victory Celebration Button */}
              {isAnyWin && (
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    navigate(`${ROUTES.LOBBY}?victory=true&winner=${encodeURIComponent(winnerName)}&mode=${encodeURIComponent(gameMode)}`);
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00f2fe] via-[#ffd700] to-[#c084fc] hover:brightness-110 text-[#070b14] font-black text-sm md:text-base uppercase tracking-wider shadow-[0_0_30px_rgba(0,242,254,0.6)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2.5 cursor-pointer animate-pulse"
                >
                  <span className="text-xl">🎆</span>
                  <span>CLAIM VICTORY & CELEBRATE IN DASHBOARD</span>
                  <span className="text-xl">🎆</span>
                </button>
              )}

              {/* Auto Redirect Countdown Bar */}
              {isAnyWin && autoRedirectSeconds !== null && !redirectCancelled && (
                <div className="flex items-center justify-between w-full px-3 py-1.5 bg-[#060a14]/70 border border-[#00f2fe]/30 rounded-lg text-xs text-slate-300">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00f2fe] animate-ping"></span>
                    <span>Auto-showing celebration on dashboard in <strong className="text-[#ffd700]">{autoRedirectSeconds}s</strong>...</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setRedirectCancelled(true);
                      setAutoRedirectSeconds(null);
                    }}
                    className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Cancel Auto-Jump
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-space-sm w-full">
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setRedirectCancelled(true);
                    setAutoRedirectSeconds(null);
                    resetRound();
                  }}
                  className="flex-1 py-space-sm px-space-md rounded bg-gradient-to-r from-primary-container to-surface-tint text-on-primary font-headline-sm font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(0,242,254,0.4)] hover:brightness-110 transition cursor-pointer"
                >
                  NEXT ROUND // PLAY AGAIN
                </button>
                {isLocal2P ? (
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setRedirectCancelled(true);
                      setAutoRedirectSeconds(null);
                      restartSeries();
                    }}
                    className="flex-1 py-space-sm px-space-md rounded bg-surface-container-high hover:bg-surface-container-highest text-secondary font-headline-sm font-bold tracking-wider uppercase transition cursor-pointer"
                  >
                    RESET SERIES (0-0)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setRedirectCancelled(true);
                      setAutoRedirectSeconds(null);
                      navigate(ROUTES.MATCH_RESULT);
                    }}
                    className="flex-1 py-space-sm px-space-md rounded bg-surface-container-high hover:bg-surface-container-highest text-primary font-headline-sm font-bold tracking-wider uppercase transition cursor-pointer"
                  >
                    DETAILED TELEMETRY
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  playClick();
                  if (isAnyWin) {
                    navigate(`${ROUTES.LOBBY}?victory=true&winner=${encodeURIComponent(winnerName)}&mode=${encodeURIComponent(gameMode)}`);
                  } else {
                    navigate(ROUTES.LOBBY);
                  }
                }}
                className="w-full py-2 rounded bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface font-label-data-sm text-label-data-sm uppercase tracking-wider transition cursor-pointer"
              >
                RETURN TO LOBBY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
