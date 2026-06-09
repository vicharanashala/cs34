import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { usersApi } from '../services/api';
import type { User } from '../types';

const LeaderboardPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.getLeaderboard().then((res) => {
      setUsers(res.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const rankClass = (i: number) =>
    i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : '';

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">🏆 Leaderboard</h1>
        <span className="text-muted text-sm">Top contributors ranked by Skill Points</span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th>Badge</th>
                <th>SP Points</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u._id} id={`leaderboard-row-${i + 1}`}>
                  <td>
                    <span className={`rank-badge${rankClass(i) ? ' ' + rankClass(i) : ''}`}
                      style={!rankClass(i) ? { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' } : {}}>
                      {i + 1}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="profile-avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                        {u.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{u.name}</div>
                        <div className="text-muted text-xs">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><Badge spPoints={u.spPoints} /></td>
                  <td>
                    <span className="sp-display">⚡ {u.spPoints} SP</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default LeaderboardPage;
