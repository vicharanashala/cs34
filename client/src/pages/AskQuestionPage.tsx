import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import TagChip from '../components/TagChip';
import { questionsApi } from '../services/api';
import { QUESTION_TAGS } from '../types';
import type { QuestionTag } from '../types';
import toast from 'react-hot-toast';

const AskQuestionPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<QuestionTag[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleTag = (tag: QuestionTag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tags.length === 0) { toast.error('Please select at least one tag'); return; }
    setLoading(true);
    try {
      const res = await questionsApi.create({ title, description, tags });
      toast.success('Question posted!');
      navigate(`/questions/${res.data.data!._id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to post question';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Ask a Question</h1>
      </div>

      <div className="card" style={{ maxWidth: 800 }}>
        <form onSubmit={handleSubmit} id="ask-question-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Question Title *</label>
            <input
              id="question-title"
              type="text"
              className="form-input"
              placeholder="e.g. How do I implement useEffect correctly?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={5}
              maxLength={200}
            />
            <span className="text-muted text-xs">{title.length}/200</span>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              id="question-description"
              className="form-input"
              placeholder="Describe your problem in detail. Include what you've already tried…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={20}
              rows={7}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags * (select 1-5)</label>
            <div className="tag-list">
              {QUESTION_TAGS.map((tag) => (
                <TagChip
                  key={tag}
                  tag={tag}
                  active={tags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                />
              ))}
            </div>
            {tags.length === 0 && (
              <span className="form-error">Select at least one tag</span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              id="submit-question-btn"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Posting…' : '🚀 Post Question'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AskQuestionPage;
