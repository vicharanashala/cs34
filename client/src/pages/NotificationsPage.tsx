import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { notificationsApi } from '../services/api';
import type { Notification } from '../types';
import toast from 'react-hot-toast';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifs = async () => {
    try {
      const res = await notificationsApi.getAll();
      setNotifications(res.data.data?.notifications || []);
      setUnreadCount(res.data.data?.unreadCount || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifs(); }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      toast.error('Failed to mark read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch {
      toast.error('Failed');
    }
  };

  const ago = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">
          🔔 Notifications
          {unreadCount > 0 && (
            <span className="notif-badge" style={{ position: 'static', display: 'inline-flex', marginLeft: '0.5rem' }}>
              {unreadCount}
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead} id="mark-all-read-btn">
            Mark all read
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <LoadingSpinner />
        ) : notifications.length === 0 ? (
          <EmptyState icon="🔕" title="No notifications" description="You're all caught up!" />
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`notif-item${n.isRead ? '' : ' unread'}`}
              onClick={() => !n.isRead && handleMarkRead(n._id)}
              id={`notif-${n._id}`}
            >
              {!n.isRead && <div className="notif-dot" />}
              <div className="notif-text" style={{ flex: 1 }}>
                <div>{n.message}</div>
                <div className="notif-time">{ago(n.createdAt)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default NotificationsPage;
