import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, MessageSquare, Clock, ArrowUp } from 'lucide-react';
import type { Question } from '../types';
import TagChip from './TagChip';

interface QuestionCardProps {
  question: Question;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  const ago = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <Link to={`/questions/${question._id}`} className="question-card" id={`question-${question._id}`}>
      <div className="tag-list" style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {question.tags.map((tag) => <TagChip key={tag} tag={tag} />)}
        </div>
        {question.trendingScore !== undefined && question.trendingScore > 15 && (
          <span className="trending-badge" title={`Trending Score: ${Math.round(question.trendingScore)}`}>
            🔥 Trending
          </span>
        )}
      </div>
      <h3 className="question-card-title">{question.title}</h3>
      <p className="text-secondary text-sm" style={{ marginBottom: '0.75rem', lineHeight: 1.5 }}>
        {question.description.slice(0, 150)}{question.description.length > 150 && '…'}
      </p>
      <div className="question-card-meta">
        <span className={`question-card-votes ${(question.upvotes - question.downvotes) > 0 ? 'positive' : (question.upvotes - question.downvotes) < 0 ? 'negative' : 'neutral'}`}>
          <ArrowUp size={13} /> {question.upvotes - question.downvotes} votes
        </span>
        <span><Eye size={13} /> {question.viewsCount} views</span>
        <span><MessageSquare size={13} /> {question.answersCount} answers</span>
        <span><Clock size={13} /> {ago(question.createdAt)}</span>
        <span style={{ marginLeft: 'auto' }}>
          by <strong style={{ color: 'var(--text-primary)' }}>
            {question.author?.name || 'Unknown'}
          </strong>
        </span>
      </div>
    </Link>
  );
};

export default QuestionCard;
