import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { votesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface VoteButtonsProps {
  targetId: string;
  targetType: 'question' | 'answer';
  upvotes: number;
  downvotes: number;
  userVote: 1 | -1 | null;
  onVoteChange: (upvotes: number, downvotes: number, newUserVote: 1 | -1 | null) => void;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({
  targetId, targetType, upvotes, downvotes, userVote, onVoteChange
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const netScore = upvotes - downvotes;

  const handleVote = async (value: 1 | -1) => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const res = await votesApi.cast({ targetId, targetType, value });
      const data = res.data.data!;
      const newUserVote = data.action === 'removed' ? null : value;
      onVoteChange(data.upvotes, data.downvotes, newUserVote);
    } catch {
      toast.error('Failed to vote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vote-buttons">
      <button
        className={`vote-btn${userVote === 1 ? ' active-up' : ''}`}
        onClick={() => handleVote(1)}
        disabled={loading}
        title="Upvote"
      >
        <ChevronUp size={22} />
      </button>
      <span className={`vote-count${netScore > 0 ? ' positive' : netScore < 0 ? ' negative' : ''}`}>
        {netScore}
      </span>
      <button
        className={`vote-btn${userVote === -1 ? ' active-down' : ''}`}
        onClick={() => handleVote(-1)}
        disabled={loading}
        title="Downvote"
      >
        <ChevronDown size={22} />
      </button>
    </div>
  );
};

export default VoteButtons;
