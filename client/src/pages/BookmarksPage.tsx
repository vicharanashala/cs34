import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import TagChip from '../components/TagChip';
import { bookmarksApi } from '../services/api';
import type { Bookmark } from '../types';
import toast from 'react-hot-toast';
import { Bookmark as BookmarkIcon, Trash2, Eye, MessageSquare } from 'lucide-react';

const BookmarksPage: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookmarksApi.getAll().then((res) => {
      setBookmarks(res.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleRemove = async (id: string) => {
    try {
      await bookmarksApi.remove(id);
      setBookmarks((prev) => prev.filter((b) => b._id !== id));
      toast.success('Bookmark removed');
    } catch {
      toast.error('Failed to remove bookmark');
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title"><BookmarkIcon size={22} style={{ display: 'inline', verticalAlign: 'middle' }} /> Bookmarks</h1>
        <span className="text-muted text-sm">{bookmarks.length} saved question{bookmarks.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? <LoadingSpinner /> : bookmarks.length === 0 ? (
        <EmptyState
          icon="🔖"
          title="No bookmarks yet"
          description="Bookmark questions to read them later"
          action={<Link to="/" className="btn btn-primary">Browse Questions</Link>}
        />
      ) : (
        <div className="grid-2 grid">
          {bookmarks.map((b) => {
            const q = b.questionId;
            if (!q || typeof q === 'string') return null;
            return (
              <div key={b._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} id={`bookmark-${b._id}`}>
                <div className="tag-list">
                  {q.tags?.map((t) => <TagChip key={t} tag={t} />)}
                </div>
                <Link to={`/questions/${q._id}`}>
                  <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    {q.title}
                  </h3>
                </Link>
                <p className="text-secondary text-sm">
                  {q.description?.slice(0, 100)}{q.description?.length > 100 && '…'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="question-card-meta">
                    <span><Eye size={12} /> {q.viewsCount}</span>
                    <span><MessageSquare size={12} /> {q.answersCount}</span>
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemove(b._id)}
                    id={`remove-bookmark-${b._id}`}
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export default BookmarksPage;
