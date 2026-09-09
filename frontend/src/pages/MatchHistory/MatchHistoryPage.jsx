import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchService } from '../../services/matchService';
import { useAuth } from '../../hooks/useAuth';
import { ReticleCard } from '../../components/common/ReticleCard';
import { CyberButton } from '../../components/common/CyberButton';
import { ROUTES } from '../../constants/routes';

export function MatchHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('ALL'); // ALL, VICTORY, DEFEAT, DRAW
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

  const fetchHistory = async (pageNum) => {
    setLoading(true);
    try {
      const data = await matchService.getMatchHistory(pageNum, 10);
      if (data && data.content) {
        setMatches(data.content);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        setMatches(data);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to load combat history:', err);
    } finally {
      setLoading(false);
    }
  };

  const parseMoves = (movesJson) => {
    if (!movesJson) return Array(9).fill(null);
    try {
      const parsed = JSON.parse(movesJson);
      const board = Array(9).fill(null);
      if (Array.isArray(parsed)) {
        parsed.forEach((m) => {
          if (m.index !== undefined && m.index >= 0 && m.index < 9) {
            board[m.index] = m.player;
          }
        });
      }
      return board;
    } catch (e) {
      return Array(9).fill(null);
    }
  };

  const filteredMatches = matches.filter((m) => {
    if (filter === 'ALL') return true;
    const isWin = m.winnerUsername === user?.gamerTag;
    const isDraw = m.status === 'DRAW' || !m.winnerUsername;
    if (filter === 'VICTORY') return isWin;
    if (filter === 'DEFEAT') return !isWin && !isDraw;
    if (filter === 'DRAW') return isDraw;
    return true;
  });

  const totalBattles = user?.totalMatches || matches.length;
  const totalWins = user?.wins || matches.filter((m) => m.winnerUsername === user?.gamerTag).length;
  const winRate = totalBattles > 0 ? Math.round((totalWins / totalBattles) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-ping"></span>
            <span className="font-label-data-sm text-primary uppercase tracking-widest text-xs">
              SECURE COMBAT ARCHIVES // SECTOR 07
            </span>
          </div>
          <h1 className="font-headline-lg text-2xl md:text-3xl text-on-surface font-extrabold tracking-wider mt-1">
            COMBAT <span className="text-primary-container">LOGS</span> & TELEMETRY
          </h1>
          <p className="font-label-data-md text-on-surface-variant text-sm mt-1">
            Historical encounter telemetry, neural combat ratings, and battle pass progression.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CyberButton variant="secondary" onClick={() => navigate(ROUTES.PLAY_ARENA)}>
            <span className="material-symbols-outlined text-sm">swords</span>
            ENTER ARENA
          </CyberButton>
          <CyberButton variant="ghost" onClick={() => navigate(ROUTES.LOBBY)}>
            LOBBY
          </CyberButton>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <ReticleCard className="p-4 bg-surface-container-low/60 border border-outline-variant/20">
          <span className="font-label-data-sm text-outline text-xs uppercase">TOTAL ENGAGEMENTS</span>
          <div className="text-2xl font-extrabold font-headline-lg text-on-surface mt-1">{totalBattles}</div>
          <span className="font-label-data-sm text-xs text-primary-fixed-dim">Lifetime Records</span>
        </ReticleCard>

        <ReticleCard className="p-4 bg-surface-container-low/60 border border-outline-variant/20">
          <span className="font-label-data-sm text-outline text-xs uppercase">VICTORIES</span>
          <div className="text-2xl font-extrabold font-headline-lg text-primary-container mt-1">{totalWins}</div>
          <span className="font-label-data-sm text-xs text-emerald-400 font-bold">Domination Rate</span>
        </ReticleCard>

        <ReticleCard className="p-4 bg-surface-container-low/60 border border-outline-variant/20">
          <span className="font-label-data-sm text-outline text-xs uppercase">WIN RATE</span>
          <div className="text-2xl font-extrabold font-headline-lg text-secondary mt-1">{winRate}%</div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-secondary h-full" style={{ width: `${winRate}%` }}></div>
          </div>
        </ReticleCard>

        <ReticleCard className="p-4 bg-surface-container-low/60 border border-outline-variant/20">
          <span className="font-label-data-sm text-outline text-xs uppercase">CURRENT CR</span>
          <div className="text-2xl font-extrabold font-headline-lg text-tertiary-fixed-dim mt-1">
            {user?.combatRating || 2450}
          </div>
          <span className="font-label-data-sm text-xs text-outline">{user?.rankDivision || 'DIAMOND III'}</span>
        </ReticleCard>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
        <div className="flex items-center gap-2">
          {['ALL', 'VICTORY', 'DEFEAT', 'DRAW'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded text-xs font-label-data-md uppercase tracking-wider transition ${
                filter === tab
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_10px_rgba(0,242,254,0.3)]'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <span className="text-xs font-label-data-sm text-outline">
          Showing {filteredMatches.length} Records
        </span>
      </div>

      {/* Match Table or List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-10 h-10 border-2 border-primary-container border-t-transparent rounded-full animate-spin"></div>
          <span className="font-label-data-md text-primary tracking-widest text-sm">
            ACCESSING ENCRYPTED ARCHIVES...
          </span>
        </div>
      ) : filteredMatches.length === 0 ? (
        <ReticleCard className="p-12 text-center bg-surface-container-low/40 border border-outline-variant/20">
          <span className="material-symbols-outlined text-4xl text-outline mb-2">folder_off</span>
          <h3 className="font-headline-md text-lg text-on-surface font-bold">NO COMBAT RECORDS FOUND</h3>
          <p className="font-label-data-md text-outline text-sm mt-1 max-w-md mx-auto">
            You haven't completed any engagements matching the selected filter. Enter the arena to calibrate your combat telemetry.
          </p>
          <div className="mt-6">
            <CyberButton variant="primary" onClick={() => navigate(ROUTES.PLAY_ARENA)}>
              START NEW MATCH
            </CyberButton>
          </div>
        </ReticleCard>
      ) : (
        <div className="space-y-3">
          {filteredMatches.map((m) => {
            const isWinner = m.winnerUsername === user?.gamerTag;
            const isDraw = m.status === 'DRAW' || !m.winnerUsername;
            const statusLabel = isDraw ? 'DRAW' : isWinner ? 'VICTORY' : 'DEFEAT';
            const badgeBg = isDraw
              ? 'bg-tertiary-fixed-dim/20 text-tertiary-fixed-dim border-tertiary-fixed-dim/40'
              : isWinner
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
              : 'bg-error-container/20 text-error border-error-container/40';

            const opponent =
              m.player1Username === user?.gamerTag ? m.player2Username : m.player1Username;
            const board = parseMoves(m.movesJson);

            return (
              <ReticleCard
                key={m.id}
                className="p-4 bg-surface-container-low/70 hover:bg-surface-container-high/60 transition border border-outline-variant/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left info: Result Badge & Opponent */}
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div
                    className={`px-3 py-1.5 rounded border text-xs font-headline-sm font-bold tracking-wider ${badgeBg}`}
                  >
                    {statusLabel}
                  </div>
                  <div>
                    <div className="font-label-data-md text-sm font-bold text-on-surface">
                      vs {opponent || 'NEURAL_AI_V2'}
                    </div>
                    <div className="font-label-data-sm text-xs text-outline">
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'RECENT'} •{' '}
                      {m.durationSeconds ? `${m.durationSeconds}s` : '35s'}
                    </div>
                  </div>
                </div>

                {/* Telemetry / Mini-Board Preview */}
                <div className="flex items-center gap-3">
                  <div className="grid grid-cols-3 gap-1 p-1 bg-surface-container-lowest border border-outline-variant/30 rounded">
                    {board.map((cell, cIdx) => (
                      <div
                        key={cIdx}
                        className={`w-5 h-5 flex items-center justify-center font-headline-sm text-[10px] font-bold rounded-sm ${
                          cell === 'X'
                            ? 'text-primary-container bg-primary-container/10'
                            : cell === 'O'
                            ? 'text-secondary bg-secondary/10'
                            : 'bg-surface-container'
                        }`}
                      >
                        {cell || ''}
                      </div>
                    ))}
                  </div>
                  <span className="font-label-data-sm text-[11px] text-outline hidden sm:inline">
                    FINAL GRID
                  </span>
                </div>

                {/* Rewards & Ratings */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div
                      className={`font-label-data-md text-sm font-bold ${
                        isWinner ? 'text-primary' : isDraw ? 'text-outline' : 'text-error'
                      }`}
                    >
                      {isWinner ? `+${m.rankPointsEarned || 25} CR` : isDraw ? '+0 CR' : `-${m.rankPointsEarned || 15} CR`}
                    </div>
                    <div className="font-label-data-sm text-xs text-secondary font-semibold">
                      +{m.xpEarned || 100} XP
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedMatch(selectedMatch?.id === m.id ? null : m)}
                    className="p-2 rounded bg-surface-container hover:bg-surface-container-highest text-outline hover:text-on-surface transition text-xs"
                    title="Inspect Telemetry"
                  >
                    <span className="material-symbols-outlined text-sm">analytics</span>
                  </button>
                </div>
              </ReticleCard>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-outline-variant/20 pt-4">
          <CyberButton
            variant="ghost"
            disabled={page === 0}
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          >
            PREVIOUS
          </CyberButton>
          <span className="font-label-data-sm text-xs text-outline">
            PAGE {page + 1} OF {totalPages}
          </span>
          <CyberButton
            variant="ghost"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((prev) => prev + 1)}
          >
            NEXT
          </CyberButton>
        </div>
      )}
    </div>
  );
}
