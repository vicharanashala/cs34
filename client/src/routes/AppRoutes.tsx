import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import AskQuestionPage from '../pages/AskQuestionPage';
import QuestionDetailPage from '../pages/QuestionDetailPage';
import ProfilePage from '../pages/ProfilePage';
import LeaderboardPage from '../pages/LeaderboardPage';
import NotificationsPage from '../pages/NotificationsPage';
import BookmarksPage from '../pages/BookmarksPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import ActivityFeedPage from '../pages/ActivityFeedPage';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <RegisterPage />}
      />

      {/* Public (but better with auth) */}
      <Route path="/" element={<DashboardPage />} />
      <Route path="/questions/:id" element={<QuestionDetailPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/activity" element={<ActivityFeedPage />} />

      {/* Protected */}
      <Route path="/ask" element={<ProtectedRoute><AskQuestionPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/bookmarks" element={<ProtectedRoute><BookmarksPage /></ProtectedRoute>} />

      {/* Admin Only */}
      <Route
        path="/admin"
        element={<ProtectedRoute adminOnly><AdminDashboardPage /></ProtectedRoute>}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
