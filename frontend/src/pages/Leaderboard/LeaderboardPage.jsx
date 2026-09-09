import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAudio } from '../../hooks/useAudio';
import { leaderboardService } from '../../services/leaderboardService';
import { DIVISIONS } from '../../constants/ranks';
import { ROUTES } from '../../constants/routes';

export function LeaderboardPage() {
  const { user } = useAuth();
  const { playClick } = useAudio();
  const navigate = useNavigate();

  const [category, setCategory] = useState('GLOBAL');
  const [division, setDivision] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [podium, setPodium] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [myEntry, setMyEntry] = useState(null);

  useEffect(() => {
    async function loadPodium() {
      try {
        const top3 = await leaderboardService.getPodium();
        if (top3 && top3.length > 0) {
          setPodium(top3);
        }
      } catch (err) {
        console.error('Error loading podium:', err);
      }
    }
    loadPodium();
  }, []);

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);
      try {
        const [pageData, meData] = await Promise.all([
          leaderboardService.getLeaderboard({
            category,
            division: division === 'All Divisions' ? 'ALL' : division,
            search,
            page: 0,
            size: 20,
          }),
          leaderboardService.getMyEntry().catch(() => null),
        ]);

        if (pageData && pageData.content) {
          setLeaderboardData(pageData.content);
        }
        if (meData) {
          setMyEntry(meData);
        }
      } catch (err) {
        console.error('Error loading leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, [category, division, search]);

  const tabs = [
    { id: 'GLOBAL', label: 'GLOBAL RANKINGS', icon: 'public' },
    { id: 'FRIENDS', label: 'FRIENDS LEAGUE', icon: 'group' },
    { id: 'WEEKLY', label: 'WEEKLY TOURNAMENT', icon: 'military_tech' },
    { id: 'ELITE', label: 'SEASON 04 ELITE', icon: 'workspace_premium' },
  ];

  // Default podium if not yet loaded from backend
  const firstPlace = podium[0] || {
    gamerTag: 'NEXUS_PRIME',
    rankDivision: 'GRANDMASTER',
    combatRating: 3120,
    winRate: 88.5,
    avatarUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1XUan5Ffk3FawSQDwTewKBqVm82wK3i_BFHm2D0JQ2Qk8P8_AP1EA3sITSuUr-MmD_Himw6Zi6r_OMSZXFYAB4HnMPVNX-ifE6XEJBUuImUfyBtLGebM6CtapuI8h7FW1Ad5142n-T16Vx6BesBdBgM-KsSM59b1_4SR4PHZWh2mmIXOfITshoScXSphP64N4rTr0AO1F65x9T9fVInh5MbxVnvCu8hIoenKlD6PJDGJF1RxHvRgr2G6k4P',
  };

  const secondPlace = podium[1] || {
    gamerTag: 'GLITCH_QUEEN',
    rankDivision: 'GRANDMASTER',
    combatRating: 2980,
    winRate: 85.0,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOSaESbB5KiDfmUc4QqLFYjviXw5X62xwWrqtkH-a6aSjl-RQVbj3g69udj9j_3uoZVWOuyEsURVXLvrYAUIMnuMeu4n2N8WcdW4AJCgcy54NFhbV9cp62-xWWWrtEip_9SAdHXlb1Ytks_PzFyzy9hdM58F0FUxfZAt-0e_ksWnrwewtdz0v1f-yxHU0sDLKC_YPgeaF9HAZfWAqf1i70cNHqcHPNKBE9m8T3w7t9NHoNjnr47iylNA',
  };

  const thirdPlace = podium[2] || {
    gamerTag: 'CYBER_PHANTOM',
    rankDivision: 'MASTER',
    combatRating: 2740,
    winRate: 81.2,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPjpcbljMZPeD6b_13RKUif_lG9d_MSdGLUF3jtTRUtQEkVgreKkzegW1jNITRM_TZBZYX4YoFqoPqGZax51uh4ThFt1RyogtM7TjOtVbB28ToeBqSELG7uVKPNgeZspuFINjaS5q_SNCjG8VSnaaVbTRULtIcWNI1lfDPsLdQ5CWkI5WJ5I3ANS_17OaNyUnW2Zm-AiIMKQm46MIqfQC3RovrQ5t1d05cWyRvdfpXg9WDxcVclPTvcg',
  };

  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full overflow-hidden px-space-md lg:px-space-xl py-space-lg flex flex-col gap-space-xl">
        {/* Dynamic Glows */}
        <div className="absolute -top-32 left-1/3 w-96 h-96 bg-primary-container/10 blur-[140px] pointer-events-none rounded-full"></div>
        <div className="absolute top-1/4 -right-20 w-[30rem] h-[30rem] bg-secondary/10 blur-[160px] pointer-events-none rounded-full"></div>

        {/* Telemetry Row */}
        <div className="flex flex-col gap-space-md z-10">
          <div className="flex flex-wrap items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-xs">
              <span className="w-2.5 h-2.5 bg-primary-container animate-ping rounded-full"></span>
              <span className="font-label-data-sm text-label-data-sm uppercase tracking-widest text-primary">
                LIVE SERVER TELEMETRY • CLUSTER-EU-CENTRAL
              </span>
              <span className="text-outline/40">|</span>
              <span className="font-label-data-sm text-label-data-sm text-outline">EPOCH SYNC: 14:29:08 UTC</span>
            </div>
            <div className="flex items-center gap-space-2xs bg-surface-container-lowest/80 backdrop-blur-md px-space-sm py-space-2xs rounded-full border border-outline-variant/30">
              <span className="font-label-data-sm text-label-data-sm text-outline">SEASON RUNTIME:</span>
              <span className="font-label-data-sm text-label-data-sm text-secondary font-bold">
                STAGE 04 // 68% COMPLETE
              </span>
            </div>
          </div>

          {/* Controls Hub */}
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-space-md bg-surface-container-low/70 backdrop-blur-2xl p-space-sm rounded-xl shadow-xl border border-outline-variant/20">
            {/* Category Tab Buttons */}
            <div className="flex items-center flex-wrap gap-space-2xs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    playClick();
                    setCategory(tab.id);
                  }}
                  className={`px-space-md py-space-xs rounded font-headline-sm text-headline-sm transition-all flex items-center gap-space-2xs ${
                    category === tab.id
                      ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_16px_rgba(0,242,254,0.35)]'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Filter & Search Controls */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-space-xs">
              {/* Division Dropdown */}
              <div className="relative min-w-[170px] flex-1 sm:flex-initial">
                <select
                  aria-label="Division Selector"
                  value={division}
                  onChange={(e) => {
                    playClick();
                    setDivision(e.target.value);
                  }}
                  className="w-full bg-surface-container-lowest text-on-surface font-label-data-sm text-label-data-sm px-space-sm py-space-xs rounded appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-container border border-outline-variant/40"
                >
                  {DIVISIONS.map((d) => (
                    <option key={d} value={d === 'ALL DIVISIONS' ? 'ALL' : d}>
                      {d}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-base">
                  expand_more
                </span>
              </div>

              {/* Search Input Bar */}
              <div className="relative flex-1 sm:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base">
                  search
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search gamer tag, clan or ID..."
                  className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline/60 font-body-sm text-body-sm pl-9 pr-space-sm py-space-xs rounded focus:outline-none focus:ring-1 focus:ring-primary-container transition-all border border-outline-variant/40"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hero Spotlight (Top 3 Podium) */}
        <div className="relative flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <div className="h-4 w-1 bg-tertiary-fixed-dim rounded-full"></div>
              <span className="font-label-data-sm text-label-data-sm uppercase tracking-widest text-on-surface">
                APEX TIER // GLOBAL MASTERS SPOTLIGHT
              </span>
            </div>
            <span className="font-label-data-sm text-label-data-sm text-outline hidden sm:inline-block">
              DATA CYCLE: LIVE STREAMED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md items-end pt-space-md">
            {/* 2ND PLACE PODIUM */}
            <div className="order-2 md:order-1 relative flex flex-col bg-surface-container-low/80 backdrop-blur-xl rounded-xl p-space-md shadow-2xl transition-transform hover:-translate-y-1 border border-outline-variant/30">
              <div className="absolute -top-3 left-4 px-space-xs py-space-2xs bg-surface-variant text-on-surface font-label-data-sm text-label-data-sm rounded flex items-center gap-1 shadow-md">
                <span className="text-on-surface font-bold">#2</span>
                <span className="text-outline">SILVER CROWN</span>
              </div>
              <div className="flex flex-col items-center text-center mt-space-sm gap-space-xs">
                <div className="relative w-20 h-20 rounded-full p-1 bg-gradient-to-b from-inverse-surface/80 to-surface-variant shadow">
                  <img
                    alt="Glitch Queen"
                    className="w-full h-full rounded-full object-cover"
                    src={secondPlace.avatarUrl}
                  />
                  <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface text-xs font-bold shadow">
                    2
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-1">
                    {secondPlace.gamerTag}
                    <span className="material-symbols-outlined text-sm text-secondary">verified</span>
                  </span>
                  <span className="font-label-data-sm text-label-data-sm text-secondary bg-secondary-container/40 px-2 py-0.5 rounded mt-0.5">
                    {secondPlace.rankDivision}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-space-xs w-full mt-space-sm p-space-xs bg-surface-container-lowest/70 rounded">
                  <div className="flex flex-col items-center">
                    <span className="font-label-data-sm text-label-data-sm text-outline">RATING</span>
                    <span className="font-label-data-lg text-label-data-lg text-on-surface font-bold">
                      {secondPlace.combatRating} CR
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-label-data-sm text-label-data-sm text-outline">WIN RATE</span>
                    <span className="font-label-data-lg text-label-data-lg text-primary font-bold">
                      {secondPlace.winRate}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 1ST PLACE PODIUM (Gold Holographic) */}
            <div className="order-1 md:order-2 relative flex flex-col bg-surface-container/90 backdrop-blur-2xl rounded-xl p-space-lg shadow-[0_0_35px_rgba(255,211,161,0.22)] transition-transform hover:-translate-y-1.5 md:-mt-6 border border-tertiary-fixed/50">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-space-sm py-space-2xs bg-gradient-to-r from-tertiary-fixed-dim to-tertiary-container text-on-tertiary-container font-label-data-sm text-label-data-sm font-bold rounded-full flex items-center gap-1.5 shadow-lg">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  crown
                </span>
                <span>CHAMPION APEX #1</span>
              </div>
              <div className="flex flex-col items-center text-center mt-space-md gap-space-xs">
                <div className="relative w-24 h-24 rounded-full p-1.5 bg-gradient-to-tr from-tertiary via-tertiary-container to-secondary shadow-[0_0_20px_rgba(255,211,161,0.4)]">
                  <img
                    alt="Nexus Prime"
                    className="w-full h-full rounded-full object-cover"
                    src={firstPlace.avatarUrl}
                  />
                  <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-bold text-sm shadow">
                    1
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-headline-md text-headline-md text-primary flex items-center gap-1">
                    {firstPlace.gamerTag}
                    <span className="material-symbols-outlined text-base text-tertiary-container">verified</span>
                  </span>
                  <span className="font-label-data-sm text-label-data-sm text-tertiary-container bg-tertiary-container/20 px-2 py-0.5 rounded mt-0.5 font-bold">
                    {firstPlace.rankDivision}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-space-xs w-full mt-space-sm p-space-xs bg-surface-container-lowest/80 rounded border border-tertiary-container/20">
                  <div className="flex flex-col items-center">
                    <span className="font-label-data-sm text-label-data-sm text-outline">RATING</span>
                    <span className="font-label-data-lg text-label-data-lg text-tertiary-fixed font-bold">
                      {firstPlace.combatRating} CR
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-label-data-sm text-label-data-sm text-outline">WIN RATE</span>
                    <span className="font-label-data-lg text-label-data-lg text-primary font-bold">
                      {firstPlace.winRate}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3RD PLACE PODIUM */}
            <div className="order-3 relative flex flex-col bg-surface-container-low/80 backdrop-blur-xl rounded-xl p-space-md shadow-2xl transition-transform hover:-translate-y-1 border border-outline-variant/30">
              <div className="absolute -top-3 left-4 px-space-xs py-space-2xs bg-surface-variant text-on-surface font-label-data-sm text-label-data-sm rounded flex items-center gap-1 shadow-md">
                <span className="text-on-surface font-bold">#3</span>
                <span className="text-outline">BRONZE CYBER</span>
              </div>
              <div className="flex flex-col items-center text-center mt-space-sm gap-space-xs">
                <div className="relative w-20 h-20 rounded-full p-1 bg-gradient-to-b from-tertiary-container/60 to-surface-variant shadow">
                  <img
                    alt="Cyber Phantom"
                    className="w-full h-full rounded-full object-cover"
                    src={thirdPlace.avatarUrl}
                  />
                  <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface text-xs font-bold shadow">
                    3
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-1">
                    {thirdPlace.gamerTag}
                  </span>
                  <span className="font-label-data-sm text-label-data-sm text-outline bg-surface-container px-2 py-0.5 rounded mt-0.5">
                    {thirdPlace.rankDivision}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-space-xs w-full mt-space-sm p-space-xs bg-surface-container-lowest/70 rounded">
                  <div className="flex flex-col items-center">
                    <span className="font-label-data-sm text-label-data-sm text-outline">RATING</span>
                    <span className="font-label-data-lg text-label-data-lg text-on-surface font-bold">
                      {thirdPlace.combatRating} CR
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-label-data-sm text-label-data-sm text-outline">WIN RATE</span>
                    <span className="font-label-data-lg text-label-data-lg text-primary font-bold">
                      {thirdPlace.winRate}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Rankings Table */}
        <div className="w-full bg-surface-container-low/70 backdrop-blur-xl rounded-xl p-space-md shadow-xl border border-outline-variant/20 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 font-label-data-sm text-outline text-xs uppercase tracking-wider">
                <th className="py-space-xs px-space-sm">Rank</th>
                <th className="py-space-xs px-space-sm">Combat Pilot</th>
                <th className="py-space-xs px-space-sm">Division</th>
                <th className="py-space-xs px-space-sm">Rating</th>
                <th className="py-space-xs px-space-sm">Record</th>
                <th className="py-space-xs px-space-sm">Win Rate</th>
                <th className="py-space-xs px-space-sm">Streak</th>
                <th className="py-space-xs px-space-sm text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 font-body-sm">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-outline font-label-data-md">
                    SYNCHRONIZING GLOBAL LEADERBOARD DATA...
                  </td>
                </tr>
              ) : leaderboardData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-outline font-label-data-md">
                    No combat pilots found for specified criteria.
                  </td>
                </tr>
              ) : (
                leaderboardData.map((row) => (
                  <tr
                    key={row.userId}
                    className={`hover:bg-surface-container-high/40 transition ${
                      row.isCurrentUser ? 'bg-primary-container/10' : ''
                    }`}
                  >
                    <td className="py-space-xs px-space-sm font-label-data-md font-bold text-primary">
                      #{row.rank}
                    </td>
                    <td className="py-space-xs px-space-sm">
                      <div className="flex items-center gap-space-xs">
                        <img
                          src={
                            row.avatarUrl ||
                            'https://lh3.googleusercontent.com/aida/AEtjO1XUan5Ffk3FawSQDwTewKBqVm82wK3i_BFHm2D0JQ2Qk8P8_AP1EA3sITSuUr-MmD_Himw6Zi6r_OMSZXFYAB4HnMPVNX-ifE6XEJBUuImUfyBtLGebM6CtapuI8h7FW1Ad5142n-T16Vx6BesBdBgM-KsSM59b1_4SR4PHZWh2mmIXOfITshoScXSphP64N4rTr0AO1F65x9T9fVInh5MbxVnvCu8hIoenKlD6PJDGJF1RxHvRgr2G6k4P'
                          }
                          alt=""
                          className="w-7 h-7 rounded-full object-cover border border-outline-variant/40"
                        />
                        <div className="flex flex-col">
                          <span className="font-label-data-md font-bold text-on-surface">{row.gamerTag}</span>
                          <span className="text-[10px] text-outline">LVL {row.level || 42}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-space-xs px-space-sm">
                      <span className="px-2 py-0.5 rounded text-[11px] font-label-data-sm font-semibold bg-surface-container text-secondary">
                        {row.rankDivision}
                      </span>
                    </td>
                    <td className="py-space-xs px-space-sm font-label-data-md font-bold text-primary-fixed">
                      {row.combatRating} CR
                    </td>
                    <td className="py-space-xs px-space-sm text-outline font-label-data-sm">
                      {row.victories}W / {row.defeats}L / {row.draws}D
                    </td>
                    <td className="py-space-xs px-space-sm font-label-data-sm font-bold text-primary-container">
                      {row.winRate}%
                    </td>
                    <td className="py-space-xs px-space-sm">
                      <span className="font-label-data-sm text-error font-bold flex items-center gap-1">
                        {row.winStreak}W
                        {row.winStreak >= 5 && (
                          <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                            local_fire_department
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-space-xs px-space-sm text-right">
                      <button
                        type="button"
                        onClick={() => {
                          playClick();
                          navigate(`${ROUTES.PLAY_ARENA}?mode=ONLINE_RANKED&rival=${row.gamerTag}`);
                        }}
                        className="px-space-xs py-1 rounded bg-surface-container-high hover:bg-primary-container hover:text-on-primary-container text-primary font-label-data-sm text-xs uppercase tracking-wider transition"
                      >
                        Challenge
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Sticky Current User Row */}
        {myEntry && (
          <div className="sticky bottom-4 w-full bg-surface-container-high/90 backdrop-blur-2xl rounded-xl p-space-sm shadow-[0_0_25px_rgba(0,242,254,0.25)] border border-primary-container/40 flex items-center justify-between z-20">
            <div className="flex items-center gap-space-md">
              <span className="font-headline-sm text-primary-container font-black">
                #{myEntry.rank}
              </span>
              <div className="flex items-center gap-space-xs">
                <img
                  src={myEntry.avatarUrl || user?.avatarUrl}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover border border-primary-container/60"
                />
                <div className="flex flex-col">
                  <span className="font-headline-sm text-sm text-on-surface font-bold">
                    {myEntry.gamerTag} (YOU)
                  </span>
                  <span className="text-[11px] text-primary-fixed-dim font-label-data-sm">
                    {myEntry.rankDivision} • {myEntry.combatRating} CR
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-space-lg font-label-data-sm text-xs">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-outline">WIN RATE</span>
                <span className="text-primary-container font-bold">{myEntry.winRate}%</span>
              </div>
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-outline">STREAK</span>
                <span className="text-error font-bold">{myEntry.winStreak} WINS</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  playClick();
                  navigate(ROUTES.PLAY_ARENA);
                }}
                className="px-space-md py-space-xs rounded bg-primary-container text-on-primary-container font-headline-sm font-bold uppercase shadow-md hover:brightness-110 transition"
              >
                DEPLOY
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
