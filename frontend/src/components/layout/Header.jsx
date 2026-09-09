import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAudio } from '../../hooks/useAudio';
import { CyberLogo } from '../common/CyberLogo';
import { ROUTES } from '../../constants/routes';

export function Header() {
  const { user, logout } = useAuth();
  const { soundOn, toggleSound } = useAudio();
  const [musicOn, setMusicOn] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Lobby', path: ROUTES.LOBBY },
    { label: 'Play Arena', path: ROUTES.PLAY_ARENA },
    { label: 'Leaderboard', path: ROUTES.LEADERBOARD },
    { label: 'Match History', path: ROUTES.MATCH_HISTORY },
  ];

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const avatarSrc =
    user?.avatarUrl ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCSXqdyHnS9BuGphkoQl7oUuxJNABrjK_Pa54SRVoJkBZ826RhOH7NZ4C2f_XfosMQHQ6EP3CPvRzKmdQVcgSsSWoIh9igN4BMQfihmx83lmDdOAIFqkmG9_X-IedcDxX_FsG5PXXuMmsnhIbkbHxEnaTTLBY4w5v6s2HZctqhrzhcBZpykxR6ZbvVh5fChGqlJIvreZhf0LB6wSYlUfj5AtA28tGweQ3ED33jmYzxKEY-cx0Y_kYDweQ';

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl z-50 shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
      <div className="h-16 w-full px-space-md flex items-center justify-between">
        {/* Brand Logo */}
        <NavLink to={ROUTES.LOBBY} className="flex items-center">
          <CyberLogo />
        </NavLink>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-space-xs">
          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-space-sm py-space-2xs font-headline-sm text-headline-sm transition-colors ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-bold rounded shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60 rounded'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right HUD: Server Players, Audio controls & User Profile */}
        <div className="flex items-center gap-space-sm">
          <div className="hidden md:flex items-center gap-space-xs px-space-xs py-space-2xs rounded bg-surface-container">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-ping"></span>
            <span className="font-label-data-sm text-label-data-sm text-primary">ONLINE - 14,820 PLAYERS</span>
          </div>

          <div className="flex items-center gap-space-2xs">
            <button
              onClick={toggleSound}
              type="button"
              title={soundOn ? 'Sound Effects Enabled' : 'Sound Effects Muted'}
              className={`p-space-2xs rounded transition-colors flex items-center justify-center ${
                soundOn ? 'text-primary-container hover:bg-surface-container-high' : 'text-outline hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined">{soundOn ? 'volume_up' : 'volume_off'}</span>
            </button>
            <button
              onClick={() => setMusicOn(!musicOn)}
              type="button"
              title={musicOn ? 'Arena Audio Active' : 'Arena Audio Muted'}
              className={`p-space-2xs rounded transition-colors flex items-center justify-center ${
                musicOn ? 'text-secondary hover:bg-surface-container-high' : 'text-outline hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined">{musicOn ? 'headphones' : 'headset_off'}</span>
            </button>
          </div>

          {/* User Profile Capsule */}
          <div className="relative">
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-space-xs pl-space-xs bg-surface-container-high rounded p-space-2xs cursor-pointer hover:bg-surface-container-highest transition"
            >
              <div className="relative flex items-center justify-center">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-surface-container-highest"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  ></path>
                  <path
                    className="text-primary-container"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="75, 100"
                    strokeWidth="3"
                  ></path>
                </svg>
                <img alt="Profile" className="w-8 h-8 rounded-full object-cover absolute" src={avatarSrc} />
              </div>

              <div className="hidden sm:flex flex-col">
                <div className="flex items-center gap-space-2xs">
                  <span className="font-label-data-md text-label-data-md font-bold text-on-surface truncate max-w-[110px]">
                    {user?.gamerTag || 'CYBER_VIPER'}
                  </span>
                  <span className="font-label-data-sm text-label-data-sm px-space-2xs bg-secondary-container text-on-secondary-container rounded">
                    LVL {user?.level || 42}
                  </span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-data-sm text-label-data-sm text-primary-fixed-dim">
                    {user?.rankDivision || 'DIAMOND III'}
                  </span>
                  <span className="font-label-data-sm text-label-data-sm text-outline">
                    {user?.combatRating || 2450} CR
                  </span>
                </div>
              </div>
            </div>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-surface-container-low border border-outline-variant/40 rounded-xl shadow-2xl py-1 z-50 backdrop-blur-xl"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-outline-variant/30">
                  <p className="font-label-data-md text-on-surface font-bold truncate">{user?.gamerTag || 'CYBER_VIPER'}</p>
                  <p className="font-label-data-sm text-outline truncate">{user?.email || 'viper@techronics.gg'}</p>
                </div>
                <NavLink
                  to={ROUTES.LOBBY}
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2 text-sm text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition"
                >
                  Combat Lobby
                </NavLink>
                <NavLink
                  to={ROUTES.MATCH_HISTORY}
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2 text-sm text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition"
                >
                  Match History
                </NavLink>
                <NavLink
                  to={ROUTES.LEADERBOARD}
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2 text-sm text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition"
                >
                  Global Rankings
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-container/20 transition flex items-center gap-2 border-t border-outline-variant/30 mt-1"
                >
                  <span className="material-symbols-outlined text-base">logout</span> Terminate Session
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
