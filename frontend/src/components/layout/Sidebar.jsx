import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAudio } from '../../hooks/useAudio';
import { ROUTES } from '../../constants/routes';

export function Sidebar({ onOpenModal, isOpenMobile, onCloseMobile }) {
  const { user } = useAuth();
  const { playClick } = useAudio();
  const navigate = useNavigate();
  const location = useLocation();

  const isLobby = location.pathname === ROUTES.LOBBY || location.pathname === ROUTES.HOME || location.pathname === '/';

  const handleNav = (action) => {
    playClick();
    if (onCloseMobile) onCloseMobile();

    if (action.type === 'route') {
      navigate(action.path);
    } else if (action.type === 'mode') {
      navigate(`${ROUTES.PLAY_ARENA}?mode=${action.mode}`);
    } else if (action.type === 'modal' && onOpenModal) {
      onOpenModal(action.modal);
    }
  };

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: 'home',
      active: isLobby,
      action: { type: 'route', path: ROUTES.LOBBY },
    },
    {
      id: 'vs-computer',
      label: 'vs Computer',
      icon: 'smart_toy',
      action: { type: 'mode', mode: 'VS_AI' },
    },
    {
      id: 'local-2player',
      label: 'Local 2-Player',
      icon: 'groups',
      action: { type: 'mode', mode: 'LOCAL_2P' },
    },
    {
      id: 'online-arena',
      label: 'Online Arena',
      icon: 'public',
      action: { type: 'mode', mode: 'ONLINE_RANKED' },
    },
    {
      id: 'tournament',
      label: 'Tournament',
      icon: 'emoji_events',
      action: { type: 'modal', modal: 'tournament' },
    },
    {
      id: 'challenges',
      label: 'Challenges',
      icon: 'adjust',
      action: { type: 'modal', modal: 'challenges' },
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: 'leaderboard',
      active: location.pathname === ROUTES.LEADERBOARD,
      action: { type: 'route', path: ROUTES.LEADERBOARD },
    },
    {
      id: 'statistics',
      label: 'Statistics',
      icon: 'bar_chart',
      action: { type: 'modal', modal: 'statistics' },
    },
    {
      id: 'match-history',
      label: 'Match History',
      icon: 'history',
      active: location.pathname === ROUTES.MATCH_HISTORY,
      action: { type: 'route', path: ROUTES.MATCH_HISTORY },
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'person',
      action: { type: 'modal', modal: 'profile' },
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
      action: { type: 'modal', modal: 'settings' },
    },
  ];

  const gamerTag = user?.gamerTag || 'CyberPilot';
  const userLevel = user?.level || 1;
  const userXp = user?.currentXp || 0;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-[#090e1a] border-r border-[#151f38] z-50 flex flex-col justify-between py-5 px-4 transition-transform duration-300 md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Logo Brand */}
        <div className="flex flex-col gap-6">
          <div
            onClick={() => handleNav({ type: 'route', path: ROUTES.LOBBY })}
            className="flex items-center gap-3 cursor-pointer select-none group px-1"
          >
            {/* Illuminated Cyan Circle with X */}
            <div className="w-10 h-10 rounded-full bg-[#00f2fe] flex items-center justify-center shadow-[0_0_18px_rgba(0,242,254,0.7)] group-hover:scale-105 transition-transform shrink-0">
              <span className="text-[#070b14] font-black text-xl leading-none select-none">✕</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-extrabold text-[15px] tracking-wider uppercase leading-tight group-hover:text-[#00f2fe] transition-colors">
                TIC-TAC-TOE
              </span>
              <span className="text-[10px] font-bold tracking-widest text-[#00f2fe]/80 uppercase leading-tight mt-0.5">
                ARCADE PRO V2
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-190px)] pr-1 scrollbar-thin">
            {navItems.map((item) => {
              const isActive = item.active;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item.action)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#0f1d38] text-[#00f2fe] border border-[#00f2fe]/40 shadow-[0_0_15px_rgba(0,242,254,0.15)] font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-[#11192e]'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[19px] shrink-0 ${
                      isActive ? 'text-[#00f2fe]' : 'text-slate-400 group-hover:text-white'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Pill Card */}
        <div
          onClick={() => handleNav({ type: 'modal', modal: 'profile' })}
          className="rounded-xl bg-[#0c1324] border border-[#1a2542] hover:border-[#00f2fe]/40 p-2.5 flex items-center gap-3 cursor-pointer transition-all duration-200 hover:bg-[#101930] group"
        >
          {/* Lightning square icon */}
          <div className="w-8 h-8 rounded-lg bg-[#0f1d38] border border-[#00f2fe]/30 flex items-center justify-center text-amber-400 shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              bolt
            </span>
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-white text-xs font-bold truncate group-hover:text-[#00f2fe] transition-colors">
              {gamerTag}
            </span>
            <span className="text-slate-400 text-[10px] truncate">
              Level {userLevel} • {userXp} XP
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
