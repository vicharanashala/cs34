import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import { feedApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { ActivityItem } from '../types';
import { Link } from 'react-router-dom';
import { Clock, HelpCircle, MessageCircle, CheckCircle } from 'lucide-react';

const ActivityFeedPage: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'global' | 'my'>('global');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const res = activeTab === 'global'
        ? await feedApi.getGlobal(page)
        : await feedApi.getUser(page);
      setActivities(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const ago = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const renderIcon = (action: string) => {
    switch (action) {
      case 'asked':
        return <HelpCircle size={18} className="activity-icon asked" />;
      case 'answered':
        return <MessageCircle size={18} className="activity-icon answered" />;
      case 'accepted':
        return <CheckCircle size={18} className="activity-icon accepted" />;
      default:
        return <HelpCircle size={18} className="activity-icon default" />;
    }
  };

  const getQuestionId = (activity: ActivityItem) => {
    return activity.metadata?.questionId || activity.targetId;
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Activity Feed</h1>
      </div>

      {/* Tabs */}
      <div className="admin-filter-bar" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`filter-btn${activeTab === 'global' ? ' active' : ''}`}
          onClick={() => setActiveTab('global')}
        >
          🌍 Global Feed
        </button>
        {user && (
          <button
            className={`filter-btn${activeTab === 'my' ? ' active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            👤 My Activity
          </button>
        )}
      </div>

      {/* Activity Timeline */}
      {loading ? (
        <LoadingSpinner />
      ) : activities.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No activity recorded"
          description="Activities like questions and answers will appear here."
        />
      ) : (
        <div className="activity-timeline">
          {activities.map((activity) => {
            const questionId = getQuestionId(activity);
            const questionTitle = activity.metadata?.questionTitle || 'View Question';
            return (
              <div key={activity._id} className="activity-item">
                <div className="activity-icon-container">
                  {renderIcon(activity.action)}
                </div>
                <div className="activity-content">
                  <p className="activity-text">
                    <strong className="activity-user">{activity.userId?.name || 'Someone'}</strong>{' '}
                    {activity.action === 'asked' && 'asked a new question:'}
                    {activity.action === 'answered' && 'answered the question:'}
                    {activity.action === 'accepted' && 'accepted an answer on:'}
                    {' '}
                    <Link to={`/questions/${questionId}`} className="activity-link">
                      "{questionTitle}"
                    </Link>
                  </p>
                  <span className="activity-time">
                    <Clock size={12} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />
                    {ago(activity.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </Layout>
  );
};

export default ActivityFeedPage;
