import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Layout } from '../components/layout/Layout';
import { LoginPage } from '../pages/Auth/LoginPage';
import { RegisterPage } from '../pages/Auth/RegisterPage';
import { LobbyPage } from '../pages/Lobby/LobbyPage';
import { PlayArenaPage } from '../pages/PlayArena/PlayArenaPage';
import { MatchResultPage } from '../pages/MatchResult/MatchResultPage';
import { LeaderboardPage } from '../pages/Leaderboard/LeaderboardPage';
import { MatchHistoryPage } from '../pages/MatchHistory/MatchHistoryPage';
import { ROUTES } from '../constants/routes';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

      {/* Protected In-Game Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LOBBY} replace />} />
          <Route path={ROUTES.LOBBY} element={<LobbyPage />} />
          <Route path={ROUTES.PLAY_ARENA} element={<PlayArenaPage />} />
          <Route path={ROUTES.MATCH_RESULT} element={<MatchResultPage />} />
          <Route path={ROUTES.LEADERBOARD} element={<LeaderboardPage />} />
          <Route path={ROUTES.MATCH_HISTORY} element={<MatchHistoryPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={ROUTES.LOBBY} replace />} />
    </Routes>
  );
}
