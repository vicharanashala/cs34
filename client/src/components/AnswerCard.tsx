import React, { useState } from 'react';
import { Star, Clock, Edit2, Trash2, CheckCircle } from 'lucide-react';
import type { Answer } from '../types';
import { useAuth } from '../context/AuthContext';
import Badge from './Badge';
import { answersApi } from '../services/api';
import toast from 'react-hot-toast';
import VoteButtons from './VoteButtons';
import ReportModal from './ReportModal';

interface AnswerCardProps {
  answer: Answer;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, content: string) => void;
  userVote?: 1 | -1 | null;
  onVoteChange?: (upvotes: number, downvotes: number, newUserVote: 1 | -1 | null) => void;
  onAccept?: (id: string) => void;
  questionAuthorId?: string;
}

const AnswerCard: React.FC<AnswerCardProps> = ({
  answer,
  onDelete,
  onUpdate,
  userVote,
  onVoteChange,
  onAccept,
  questionAuthorId
}) => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(answer.content);
  const [saving, setSaving] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const ago = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const isOwner = user && String(user._id) === String(answer.authorId._id);
  const canEdit = isOwner && answer.status === 'PENDING';

  const handleSave = async () => {
    setSaving(true);
    try {
      await answersApi.update(answer._id, { content: editContent });
      onUpdate?.(answer._id, editContent);
      setEditing(false);
      toast.success('Answer updated');
    } catch {
      toast.error('Failed to update answer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this answer?')) return;
    try {
      await answersApi.delete(answer._id);
      onDelete?.(answer._id);
      toast.success('Answer deleted');
    } catch {
      toast.error('Failed to delete answer');
    }
  };

  return (
    <div className="answer-card-wrapper">
      <VoteButtons
        targetId={answer._id}
        targetType="answer"
        upvotes={answer.upvotes ?? 0}
        downvotes={answer.downvotes ?? 0}
        userVote={userVote ?? null}
        onVoteChange={onVoteChange ?? (() => {})}
      />
      <div className={`answer-card fade-in${answer.isBestAnswer ? ' best-answer' : ''}${answer.isAccepted ? ' accepted-answer' : ''}`} id={`answer-${answer._id}`}>
      {answer.isFlagged && (
        <div className="flagged-answer-banner" style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))',
          color: '#ef4444',
          padding: '0.375rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8125rem',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          marginBottom: '0.5rem',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          ⚠️ Flagged for Admin Review
        </div>
      )}
      {answer.isAccepted && (
        <div className="accepted-answer-banner">
          <CheckCircle size={16} fill="currentColor" /> Accepted Answer
        </div>
      )}
      {answer.isBestAnswer && (
        <div className="best-answer-banner">
          <Star size={16} fill="currentColor" /> Best Answer
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="profile-avatar" style={{ width: 36, height: 36, fontSize: '0.9rem' }}>
            {answer.authorId?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <span className="font-bold text-sm">{answer.authorId?.name || 'Unknown'}</span>
            <div><Badge spPoints={answer.authorId?.spPoints || 0} /></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`status-badge status-${answer.status.toLowerCase()}`}>
            {answer.status}
          </span>
          <span className="text-muted text-xs flex items-center gap-1">
            <Clock size={12} /> {ago(answer.createdAt)}
          </span>
          {user && !isOwner && (
            <button
              className="text-muted text-xs"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: 0,
                color: 'var(--text-muted)'
              }}
              onClick={() => setReportModalOpen(true)}
            >
              🚩 Report
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div>
          <textarea
            className="form-input"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={5}
            id={`edit-answer-${answer._id}`}
          />
          <div className="flex gap-2 mt-2">
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="answer-content">{answer.content}</div>
      )}

      {((canEdit && !editing) || (user && String(user._id) === questionAuthorId && answer.status === 'APPROVED' && !answer.isAccepted)) && (
        <div className="answer-footer" style={{ marginTop: '0.75rem' }}>
          <div className="flex gap-2">
            {canEdit && !editing && (
              <>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)} id={`edit-btn-${answer._id}`}>
                  <Edit2 size={13} /> Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={handleDelete} id={`delete-btn-${answer._id}`}>
                  <Trash2 size={13} /> Delete
                </button>
              </>
            )}
            {user && String(user._id) === questionAuthorId && answer.status === 'APPROVED' && !answer.isAccepted && (
              <button
                className="btn btn-sm"
                onClick={() => onAccept?.(answer._id)}
                style={{
                  background: 'rgba(34, 197, 94, 0.15)',
                  color: '#22c55e',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <CheckCircle size={13} /> Accept Answer
              </button>
            )}
          </div>
        </div>
      )}
    </div>
    
    <ReportModal
      isOpen={reportModalOpen}
      onClose={() => setReportModalOpen(false)}
      answerId={answer._id}
    />
    </div>
  );
};

export default AnswerCard;
