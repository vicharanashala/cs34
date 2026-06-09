import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { adminApi, reportsApi } from '../services/api';
import type { Answer, Analytics, Question, Report } from '../types';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Star, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';
type ReportStatusFilter = 'ALL' | 'PENDING' | 'REVIEWED' | 'DISMISSED';

const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'answers' | 'reports'>('overview');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [reportFilter, setReportFilter] = useState<ReportStatusFilter>('PENDING');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // States for checkboxes per report card
  const [rejectAnswers, setRejectAnswers] = useState<Record<string, boolean>>({});
  const [clearFlags, setClearFlags] = useState<Record<string, boolean>>({});

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAnalytics();
      setAnalytics(res.data.data || null);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnswers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAnswers(filter === 'ALL' ? undefined : filter);
      setAnswers(res.data.data || []);
    } catch {
      toast.error('Failed to load answers');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const res = await reportsApi.getReports(reportFilter === 'ALL' ? undefined : reportFilter);
      setReports(res.data.data || []);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setReportsLoading(false);
    }
  }, [reportFilter]);

  // Load analytics once on mount
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Load answers when tab is answers or filter changes
  useEffect(() => {
    if (activeTab === 'answers') {
      fetchAnswers();
    }
  }, [activeTab, fetchAnswers]);

  // Load reports when tab is reports or reportFilter changes
  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab, fetchReports]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await adminApi.approveAnswer(id);
      setAnswers((prev) => prev.map((a) => a._id === id ? res.data.data! : a));
      toast.success('Answer approved! +10 SP awarded');
      adminApi.getAnalytics().then((res) => setAnalytics(res.data.data || null)).catch(() => {});
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await adminApi.rejectAnswer(id);
      setAnswers((prev) => prev.map((a) => a._id === id ? res.data.data! : a));
      toast.success('Answer rejected');
      adminApi.getAnalytics().then((res) => setAnalytics(res.data.data || null)).catch(() => {});
    } catch {
      toast.error('Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBestAnswer = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await adminApi.markBestAnswer(id);
      setAnswers((prev) => {
        const qId = String(res.data.data?.questionId);
        return prev.map((a) => {
          if (String(a.questionId) === qId || (typeof a.questionId === 'object' && String((a.questionId as Question)._id) === qId)) {
            return { ...a, isBestAnswer: a._id === id };
          }
          return a;
        });
      });
      toast.success('Best answer marked!');
    } catch {
      toast.error('Failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismissReport = async (reportId: string, clearFlag: boolean) => {
    setActionLoading(reportId);
    try {
      await reportsApi.dismiss(reportId, clearFlag);
      toast.success(clearFlag ? 'Report dismissed and flag cleared' : 'Report dismissed');
      setReports((prev) => prev.map((r) => r._id === reportId ? { ...r, status: 'DISMISSED' as const } : r));
    } catch {
      toast.error('Failed to dismiss report');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReviewReport = async (reportId: string, rejectAnswer: boolean) => {
    setActionLoading(reportId);
    try {
      await reportsApi.review(reportId, rejectAnswer);
      toast.success(rejectAnswer ? 'Report reviewed and answer rejected' : 'Report marked as reviewed');
      setReports((prev) => prev.map((r) => r._id === reportId ? { ...r, status: 'REVIEWED' as const } : r));
      adminApi.getAnalytics().then((res) => setAnalytics(res.data.data || null)).catch(() => {});
    } catch {
      toast.error('Failed to review report');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAnswerByReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete the reported answer? This will delete the answer and all associated reports.')) return;
    setActionLoading(reportId);
    try {
      await reportsApi.delete(reportId);
      toast.success('Answer and reports deleted');
      
      const reportToDelete = reports.find((r) => r._id === reportId);
      const targetAnswerId = reportToDelete?.answerId?._id;
      if (targetAnswerId) {
        setReports((prev) => prev.filter((r) => r.answerId?._id !== targetAnswerId));
      } else {
        setReports((prev) => prev.filter((r) => r._id !== reportId));
      }
      adminApi.getAnalytics().then((res) => setAnalytics(res.data.data || null)).catch(() => {});
    } catch {
      toast.error('Failed to delete answer');
    } finally {
      setActionLoading(null);
    }
  };

  const ago = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const analyticsCards = analytics ? [
    { label: 'Total Users', value: analytics.totalUsers, color: 'var(--info)', icon: '👥' },
    { label: 'Total Questions', value: analytics.totalQuestions, color: 'var(--accent-light)', icon: '❓' },
    { label: 'Total Answers', value: analytics.totalAnswers, color: 'var(--text-primary)', icon: '💬' },
    { label: 'Active Users (7d)', value: analytics.activeUsers ?? 0, color: '#f59e0b', icon: '🔥' },
    { label: 'Acceptance Rate', value: `${analytics.acceptanceRate ?? 0}%`, color: '#22c55e', icon: '✅' },
    { label: 'Avg Answers / Q', value: analytics.avgAnswersPerQ ?? 0, color: '#ec4899', icon: '📊' },
    { label: 'Pending', value: analytics.pendingAnswers, color: 'var(--warning)', icon: '⏳' },
    { label: 'Approved', value: analytics.approvedAnswers, color: 'var(--success)', icon: '✅' },
    { label: 'Rejected', value: analytics.rejectedAnswers, color: 'var(--danger)', icon: '❌' },
  ] : [];

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">🛡️ Admin Dashboard</h1>
      </div>

      {/* Tab Navigation */}
      <div className="sort-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          className={`sort-tab-btn${activeTab === 'overview' ? ' active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Dashboard Overview
        </button>
        <button
          className={`sort-tab-btn${activeTab === 'answers' ? ' active' : ''}`}
          onClick={() => setActiveTab('answers')}
        >
          💬 Answer Moderation
        </button>
        <button
          className={`sort-tab-btn${activeTab === 'reports' ? ' active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          🚩 Reported Content
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <>
          {loading && !analytics ? (
            <LoadingSpinner />
          ) : (
            <>
              {analytics && (
                <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                  {analyticsCards.map(({ label, value, color, icon }) => (
                    <div key={label} className="stat-card">
                      <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{icon}</div>
                      <div className="stat-value" style={{ color }}>{value}</div>
                      <div className="stat-label">{label}</div>
                    </div>
                  ))}
                </div>
              )}

              {analytics && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                  {/* Top Contributors */}
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>🏆 Top Contributors</h3>
                    {(!analytics.topContributors || analytics.topContributors.length === 0) ? (
                      <p className="text-muted text-sm">No contributors found.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {analytics.topContributors.map((contrib, idx) => (
                          <div key={contrib._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                            <span>
                              <strong style={{ color: 'var(--text-secondary)', marginRight: '0.5rem' }}>#{idx + 1}</strong>
                              {contrib.name}
                            </span>
                            <span style={{ fontWeight: 700, color: 'var(--accent-light)' }}>{contrib.spPoints} SP</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Trending Questions */}
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>🔥 Trending Questions</h3>
                    {(!analytics.trendingQuestions || analytics.trendingQuestions.length === 0) ? (
                      <p className="text-muted text-sm">No trending questions.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {analytics.trendingQuestions.map((q) => (
                          <div key={q._id} style={{ fontSize: '0.9rem' }}>
                            <Link to={`/questions/${q._id}`} style={{ color: 'var(--accent-light)', fontWeight: 600, display: 'block', textDecoration: 'none' }}>
                              {q.title}
                            </Link>
                            <div className="text-muted text-xs" style={{ marginTop: '0.15rem' }}>
                              Score: {Math.round(q.trendingScore || 0)} | {q.answersCount} answers | {q.viewsCount} views
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ANSWERS MODERATION TAB */}
      {activeTab === 'answers' && (
        <>
          <div className="page-header">
            <h2>Answer Moderation</h2>
            <div className="admin-filter-bar">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as StatusFilter[]).map((f) => (
                <button
                  key={f}
                  className={`filter-btn${filter === f ? ' active' : ''}`}
                  onClick={() => setFilter(f)}
                  id={`admin-filter-${f.toLowerCase()}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : answers.length === 0 ? (
            <EmptyState icon="📭" title="No answers found" description="Nothing to moderate right now." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {answers.map((answer) => {
                const q = answer.questionId as Question;
                const isExp = expanded === answer._id;
                const isLoading = actionLoading === answer._id;

                return (
                  <div key={answer._id} className="admin-answer-card" id={`admin-answer-${answer._id}`}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Question:{' '}
                      <span style={{ color: 'var(--accent-light)' }}>
                        {typeof q === 'object' ? q.title : String(q)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                      <div className="profile-avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                        {answer.authorId?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <span className="font-bold text-sm">{answer.authorId?.name || 'Unknown'}</span>
                        <div><Badge spPoints={answer.authorId?.spPoints || 0} /></div>
                      </div>
                      <span className={`status-badge status-${answer.status.toLowerCase()}`} style={{ marginLeft: 'auto' }}>
                        {answer.status}
                      </span>
                      {answer.isBestAnswer && <span className="badge badge-mentor">⭐ Best</span>}
                      <span className="text-muted text-xs">{ago(answer.createdAt)}</span>
                    </div>

                    <div
                      className="answer-content"
                      style={{
                        maxHeight: isExp ? 'none' : '80px',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {answer.content}
                      {!isExp && answer.content.length > 200 && (
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          height: '2rem',
                          background: 'linear-gradient(transparent, var(--bg-card))'
                        }} />
                      )}
                    </div>
                    {answer.content.length > 200 && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ alignSelf: 'flex-start' }}
                        onClick={() => setExpanded(isExp ? null : answer._id)}
                      >
                        {isExp ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Show more</>}
                      </button>
                    )}

                    <div className="admin-answer-actions">
                      {answer.status === 'PENDING' && (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleApprove(answer._id)}
                            disabled={isLoading}
                            id={`approve-btn-${answer._id}`}
                          >
                            <CheckCircle size={14} /> Approve (+10 SP)
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleReject(answer._id)}
                            disabled={isLoading}
                            id={`reject-btn-${answer._id}`}
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </>
                      )}
                      {answer.status === 'APPROVED' && !answer.isBestAnswer && (
                        <button
                          className="btn btn-sm"
                          onClick={() => handleBestAnswer(answer._id)}
                          disabled={isLoading}
                          id={`best-btn-${answer._id}`}
                          style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}
                        >
                          <Star size={14} /> Mark Best Answer
                        </button>
                      )}
                      {answer.status !== 'PENDING' && (
                        <span className="text-muted text-xs" style={{ alignSelf: 'center' }}>
                          {answer.status === 'APPROVED' ? '✅ Approved — read-only' : '❌ Rejected — read-only'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* REPORTED CONTENT TAB */}
      {activeTab === 'reports' && (
        <>
          <div className="page-header">
            <h2>Spam / Moderation Reports</h2>
            <div className="admin-filter-bar">
              {(['ALL', 'PENDING', 'REVIEWED', 'DISMISSED'] as ReportStatusFilter[]).map((f) => (
                <button
                  key={f}
                  className={`filter-btn${reportFilter === f ? ' active' : ''}`}
                  onClick={() => setReportFilter(f)}
                  id={`admin-report-filter-${f.toLowerCase()}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {reportsLoading ? (
            <LoadingSpinner />
          ) : reports.length === 0 ? (
            <EmptyState icon="🛡️" title="No reports found" description="Clear of spam for now!" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {reports.map((report) => {
                const answer = report.answerId;
                const question = answer?.questionId;
                const author = answer?.authorId;
                const reporter = report.reporterId;
                const isExp = expanded === report._id;
                const isLoading = actionLoading === report._id;

                const shouldReject = rejectAnswers[report._id] ?? true;
                const shouldClearFlag = clearFlags[report._id] ?? true;

                return (
                  <div key={report._id} className="admin-answer-card" id={`admin-report-${report._id}`}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      Question:{' '}
                      {question ? (
                        <Link to={`/questions/${question._id}`} style={{ color: 'var(--accent-light)', fontWeight: 600, textDecoration: 'none' }}>
                          {question.title}
                        </Link>
                      ) : (
                        <span style={{ color: 'var(--danger)', fontStyle: 'italic' }}>Deleted Question</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <span className="text-muted">Reported by:</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{reporter?.name || 'Unknown User'}</strong>
                        <span className="text-muted">({reporter?.email || 'N/A'})</span>
                      </div>
                      <span
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        🚩 {report.reason}
                      </span>
                    </div>

                    {report.comment && (
                      <div
                        style={{
                          background: 'var(--bg-elevated)',
                          borderLeft: '3px solid var(--accent)',
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.85rem',
                          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                          fontStyle: 'italic',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        &ldquo;{report.comment}&rdquo;
                      </div>
                    )}

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        Answer by <strong style={{ color: 'var(--text-secondary)' }}>{author?.name || 'Unknown'}</strong> (Badge:{' '}
                        {author ? <Badge spPoints={author.spPoints} /> : 'N/A'})
                      </div>

                      <div
                        className="answer-content"
                        style={{
                          maxHeight: isExp ? 'none' : '80px',
                          overflow: 'hidden',
                          position: 'relative',
                          fontSize: '0.9rem',
                        }}
                      >
                        {answer?.content || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Answer content not available</span>}
                        {!isExp && answer?.content && answer.content.length > 200 && (
                          <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            height: '2rem',
                            background: 'linear-gradient(transparent, var(--bg-card))'
                          }} />
                        )}
                      </div>

                      {answer?.content && answer.content.length > 200 && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }}
                          onClick={() => setExpanded(isExp ? null : report._id)}
                        >
                          {isExp ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Show more</>}
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span className="text-muted">Reported: {ago(report.createdAt)}</span>
                        <span className={`status-badge status-${report.status.toLowerCase()}`}>
                          {report.status}
                        </span>
                      </div>
                    </div>

                    {report.status === 'PENDING' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <input
                              type="checkbox"
                              checked={shouldClearFlag}
                              onChange={(e) => setClearFlags({ ...clearFlags, [report._id]: e.target.checked })}
                            />
                            Clear flagged status on answer
                          </label>

                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <input
                              type="checkbox"
                              checked={shouldReject}
                              onChange={(e) => setRejectAnswers({ ...rejectAnswers, [report._id]: e.target.checked })}
                            />
                            Reject answer content
                          </label>
                        </div>

                        <div className="admin-answer-actions">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleDismissReport(report._id, shouldClearFlag)}
                            disabled={isLoading}
                            id={`dismiss-report-btn-${report._id}`}
                          >
                            <CheckCircle size={14} /> Dismiss Report
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleReviewReport(report._id, shouldReject)}
                            disabled={isLoading}
                            id={`review-report-btn-${report._id}`}
                            style={{ background: 'var(--accent)', border: '1px solid var(--accent)' }}
                          >
                            <CheckCircle size={14} /> Mark Reviewed
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteAnswerByReport(report._id)}
                            disabled={isLoading}
                            id={`delete-reported-answer-btn-${report._id}`}
                          >
                            <Trash2 size={14} /> Delete Answer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default AdminDashboardPage;
