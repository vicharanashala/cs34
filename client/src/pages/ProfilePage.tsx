import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { usersApi } from '../services/api';
import type { User, UserStats, Question, Answer, ReputationEntry } from '../types';


const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [reputationHistory, setReputationHistory] = useState<ReputationEntry[]>([]);
  const [topAnswers, setTopAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'questions' | 'answers' | 'reputation'>('questions');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, activityRes] = await Promise.all([
          usersApi.getProfile(),
          usersApi.getActivity(),
        ]);
        setUser(profileRes.data.data?.user || null);
        setStats(profileRes.data.data?.stats || null);
        setQuestions(activityRes.data.data?.questions || []);
        setAnswers(activityRes.data.data?.answers || []);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setReputationHistory((profileRes.data.data as any)?.reputationHistory || []);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setTopAnswers((profileRes.data.data as any)?.topAnswers || []);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const ago = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;
  if (!user) return <Layout><p>Failed to load profile.</p></Layout>;

  return (
    <Layout>
      {/* Hero */}
      <div className="profile-hero" style={{ marginBottom: '1rem' }}>
        <div className="profile-avatar">{user.name[0]?.toUpperCase()}</div>
        <div className="profile-info">
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge spPoints={user.spPoints} showPoints />
            {user.role === 'ADMIN' && (
              <span className="badge badge-expert">🛡️ Admin</span>
            )}
          </div>
        </div>
      </div>

      {/* Badge Progression */}
      {stats && stats.badgeProgress !== undefined && (
        <div className="badge-progression-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Badge Progression</span>
            <span style={{ fontWeight: 700, color: 'var(--accent-light)' }}>{stats.badgeProgress}% to next level</span>
          </div>
          <div className="badge-progress" style={{ height: '8px', background: 'var(--border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ width: `${stats.badgeProgress}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-light) 100%)', borderRadius: 'var(--radius-full)' }} />
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          {[
            { label: 'Questions Asked', value: stats.questionsAsked, icon: '❓' },
            { label: 'Answers Submitted', value: stats.answersSubmitted, icon: '💬' },
            { label: 'Approved Answers', value: stats.approvedAnswers, icon: '✅' },
            { label: 'Best Answers', value: stats.bestAnswers, icon: '⭐' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="stat-card">
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{icon}</div>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Activity Tabs */}
      <div className="admin-filter-bar" style={{ marginBottom: '1.25rem' }}>
        <button
          className={`filter-btn${activeTab === 'questions' ? ' active' : ''}`}
          onClick={() => setActiveTab('questions')}
          id="tab-questions"
        >
          ❓ My Questions ({questions.length})
        </button>
        <button
          className={`filter-btn${activeTab === 'answers' ? ' active' : ''}`}
          onClick={() => setActiveTab('answers')}
          id="tab-answers"
        >
          💬 My Answers ({answers.length})
        </button>
        <button
          className={`filter-btn${activeTab === 'reputation' ? ' active' : ''}`}
          onClick={() => setActiveTab('reputation')}
          id="tab-reputation"
        >
          ⭐ Reputation ({reputationHistory.length})
        </button>
      </div>

      {activeTab === 'questions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {questions.length === 0 ? (
            <p className="text-muted">No questions yet. <Link to="/ask" style={{ color: 'var(--accent-light)' }}>Ask one!</Link></p>
          ) : questions.map((q) => (
            <Link key={q._id} to={`/questions/${q._id}`} className="question-card" id={`profile-q-${q._id}`}>
              <h3 className="question-card-title">{q.title}</h3>
              <div className="question-card-meta">
                <span>👁 {q.viewsCount} views</span>
                <span>💬 {q.answersCount} answers</span>
                <span>{ago(q.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {activeTab === 'answers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {answers.length === 0 ? (
            <p className="text-muted">No answers yet.</p>
          ) : answers.map((a) => {
            const q = a.questionId as Question;
            return (
              <div key={a._id} className="answer-card" id={`profile-a-${a._id}`}>
                {typeof q !== 'string' && q?.title && (
                  <Link to={`/questions/${q._id}`} style={{ color: 'var(--accent-light)', fontWeight: 600, display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    ↗ {q.title}
                  </Link>
                )}
                <p className="text-secondary text-sm" style={{ marginBottom: '0.5rem' }}>
                  {a.content.slice(0, 150)}{a.content.length > 150 && '…'}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`status-badge status-${a.status.toLowerCase()}`}>{a.status}</span>
                  {a.isBestAnswer && <span className="badge badge-mentor">⭐ Best Answer</span>}
                  <span className="text-muted text-xs">{ago(a.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'reputation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Answers Showcase */}
          <div>
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem', fontWeight: 700 }}>Top Contributions</h3>
            {topAnswers.length === 0 ? (
              <p className="text-muted">No answers with votes yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {topAnswers.map((a) => {
                  const q = a.questionId as Question;
                  return (
                    <div key={a._id} className="answer-card" style={{ margin: 0 }}>
                      {typeof q !== 'string' && q?.title && (
                        <Link to={`/questions/${q._id}`} style={{ color: 'var(--accent-light)', fontWeight: 600, display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                          ↗ {q.title}
                        </Link>
                      )}
                      <p className="text-secondary text-sm" style={{ marginBottom: '0.5rem' }}>
                        {a.content.slice(0, 150)}{a.content.length > 150 && '…'}
                      </p>
                      <div className="flex items-center gap-2">
                        <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.8rem' }}>
                          Score: {a.upvotes - a.downvotes} ({a.upvotes}▲ / {a.downvotes}▼)
                        </span>
                        {a.isBestAnswer && <span className="badge badge-mentor">⭐ Best</span>}
                        {a.isAccepted && <span className="badge badge-expert" style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', color: '#22c55e' }}>✓ Accepted</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reputation Log */}
          <div>
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem', fontWeight: 700 }}>Reputation Log</h3>
            {reputationHistory.length === 0 ? (
              <p className="text-muted">No reputation changes yet.</p>
            ) : (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                {reputationHistory.map((entry) => {
                  const isPositive = entry.amount >= 0;
                  return (
                    <div key={entry._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                      <div>
                        <span style={{
                          fontWeight: 700,
                          color: isPositive ? '#22c55e' : '#ef4444',
                          marginRight: '0.75rem',
                          display: 'inline-block',
                          minWidth: '45px'
                        }}>
                          {isPositive ? `+${entry.amount}` : entry.amount} SP
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {entry.reason === 'answer_approved' && 'Answer approved by moderator'}
                          {entry.reason === 'upvote_received' && 'Upvote received on your post'}
                          {entry.reason === 'downvote_received' && 'Downvote received on your post'}
                          {entry.reason === 'best_answer' && 'Your answer marked as Best Answer'}
                          {entry.reason === 'answer_accepted' && 'Your answer accepted by author'}
                          {entry.reason === 'upvote_removed' && 'Upvote removed from your post'}
                          {entry.reason === 'downvote_removed' && 'Downvote removed from your post'}
                        </span>
                      </div>
                      <span className="text-muted text-xs">{ago(entry.createdAt)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProfilePage;
