import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Bookmark, Trophy, Bell, User,
  Shield, LogOut, PlusCircle, ArrowLeft, Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import Badge from './Badge';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      {location.pathname !== '/' && (
        <button className="btn-icon" onClick={() => navigate(-1)} style={{ marginRight: '0.5rem' }} title="Go Back">
          <ArrowLeft size={18} />
        </button>
      )}
      <Link to="/" className="navbar-brand">
        🎓 Campus Doubt Hub
      </Link>
      <div className="navbar-spacer" />
      <div className="navbar-actions">
        {user && <NotificationBell />}
        {user && (
          <Link to="/ask" className="btn btn-primary btn-sm" id="ask-question-btn">
            <PlusCircle size={15} /> Ask Question
          </Link>
        )}
        {user ? (
          <>
            <Link to="/profile" className="navbar-user" id="profile-nav-link">
              <User size={15} />
              <span>{user.name}</span>
              <Badge spPoints={user.spPoints} />
            </Link>
            <button
              className="btn-icon"
              onClick={handleLogout}
              title="Logout"
              id="logout-btn"
            >
              <LogOut size={17} />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const active = (path: string) => location.pathname === path ? ' active' : '';

  return (
    <aside className="layout-sidebar">
      <nav className="sidebar-nav">
        <span className="sidebar-label">Navigation</span>
        <Link to="/" className={`sidebar-link${active('/')}`} id="sidebar-dashboard">
          <Home size={17} /> Dashboard
        </Link>
        <Link to="/bookmarks" className={`sidebar-link${active('/bookmarks')}`} id="sidebar-bookmarks">
          <Bookmark size={17} /> Bookmarks
        </Link>
        <Link to="/leaderboard" className={`sidebar-link${active('/leaderboard')}`} id="sidebar-leaderboard">
          <Trophy size={17} /> Leaderboard
        </Link>
        <Link to="/activity" className={`sidebar-link${active('/activity')}`} id="sidebar-activity">
          <Activity size={17} /> Activity Feed
        </Link>
        {user && (
          <Link to="/notifications" className={`sidebar-link${active('/notifications')}`} id="sidebar-notifications">
            <Bell size={17} /> Notifications
          </Link>
        )}
        {user && (
          <Link to="/profile" className={`sidebar-link${active('/profile')}`} id="sidebar-profile">
            <User size={17} /> Profile
          </Link>
        )}
        {user?.role === 'ADMIN' && (
          <>
            <span className="sidebar-label">Admin</span>
            <Link to="/admin" className={`sidebar-link${active('/admin')}`} id="sidebar-admin">
              <Shield size={17} /> Admin Panel
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <Sidebar />
      <main className="layout-main">
        <div className="page-container fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
