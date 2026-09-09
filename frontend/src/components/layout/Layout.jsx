import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ROUTES } from '../../constants/routes';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hide sidebar during active arena gameplay
  const isPlayArena = location.pathname === ROUTES.PLAY_ARENA;
  const showSidebar = !isPlayArena;

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col text-slate-100 selection:bg-[#00f2fe]/30 selection:text-[#00f2fe]">
      {/* Mobile Top Header */}
      {showSidebar && (
        <div className="md:hidden h-14 bg-[#090e1a] border-b border-[#151f38] px-4 flex items-center justify-between z-30 sticky top-0">
          <div
            onClick={() => navigate(ROUTES.LOBBY)}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#00f2fe] flex items-center justify-center shadow-[0_0_12px_rgba(0,242,254,0.6)]">
              <span className="text-[#070b14] font-black text-sm">✕</span>
            </div>
            <span className="text-white font-extrabold text-sm tracking-wider uppercase">
              TIC-TAC-TOE
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg bg-[#0e1628] text-slate-300 hover:text-white"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      )}

      {showSidebar && (
        <Sidebar
          isOpenMobile={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
      )}

      <div className={`${showSidebar ? 'md:pl-64' : ''} flex-1 flex flex-col transition-all duration-200`}>
        <main className="flex-1 w-full flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
