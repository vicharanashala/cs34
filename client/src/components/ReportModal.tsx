import React, { useState } from 'react';
import { X } from 'lucide-react';
import { reportsApi } from '../services/api';
import type { ReportReason } from '../types';
import toast from 'react-hot-toast';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  answerId: string;
  onSubmitSuccess?: () => void;
}

const REASONS: ReportReason[] = [
  'Spam',
  'Irrelevant',
  'Incorrect Information',
  'Offensive Content',
  'Duplicate Answer',
  'Other'
];

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, answerId, onSubmitSuccess }) => {
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast.error('Please select a reason for reporting');
      return;
    }

    setSubmitting(true);
    try {
      const res = await reportsApi.create({ answerId, reason, comment: comment.trim() || undefined });
      if (res.data.success) {
        toast.success('Report submitted successfully. Thank you!');
        if (onSubmitSuccess) onSubmitSuccess();
        onClose();
        setReason('');
        setComment('');
      } else {
        toast.error(res.data.error || 'Failed to submit report');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to submit report';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        width: '100%',
        maxWidth: '480px',
        padding: '1.75rem',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative'
      }}>
        <button className="btn-icon" onClick={onClose} style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem'
        }}>
          <X size={18} />
        </button>

        <h3 style={{ marginBottom: '1.25rem', fontSize: '1.25rem', fontWeight: 800 }}>🚩 Report Content</h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Reason for reporting (Required)
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {REASONS.map((r) => (
                <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="report-comment" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Additional Details (Optional)
            </label>
            <textarea
              id="report-comment"
              placeholder="Provide more context..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                color: 'var(--text-primary)',
                resize: 'vertical',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
