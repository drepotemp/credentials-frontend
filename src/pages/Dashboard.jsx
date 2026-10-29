import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatDate } from '../format.js';

export default function Dashboard() {
  const { stats, users, loading, error: globalError, updateUserStatus } = useData();
  const [localError, setLocalError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const pending = users.filter(u => u.status === 'pending');
  const error = localError || globalError;

  async function decide(user, status) {
    setBusyId(user.id);
    setLocalError('');
    try {
      await updateUserStatus(user.id, status);
    } catch (err) {
      setLocalError(err.message || 'Action failed.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Dashboard</h1>
        <p className="page-sub">Overview of registrations and requests waiting for your decision.</p>
      </div>

      {error ? <div className="notice" style={{ marginBottom: 16 }}>{error}</div> : null}

      <div className="stack">
        <section className="stats">
          <div className="stat total">
            <div className="stat-label">Total users</div>
            <div className="stat-value">{stats?.total ?? '–'}</div>
          </div>
          <div className="stat pending">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{stats?.pending ?? '–'}</div>
          </div>
          <div className="stat approved">
            <div className="stat-label">Approved</div>
            <div className="stat-value">{stats?.approved ?? '–'}</div>
          </div>
          <div className="stat rejected">
            <div className="stat-label">Rejected</div>
            <div className="stat-value">{stats?.rejected ?? '–'}</div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Pending approvals</h2>
            <Link className="btn btn-sm" to="/users">
              View all users
            </Link>
          </div>

          {loading && !users.length ? (
            <div className="skeleton">Loading…</div>
          ) : pending.length === 0 ? (
            <div className="empty">No pending requests. Everything is up to date. 🎉</div>
          ) : (
            <div className="list">
              {pending.map((user) => (
                <div className="row" key={user.id}>
                  <div className="row-main">
                    <div className="row-title">{user.email}</div>
                    <div className="row-sub">
                      ID {user.telegramId}
                      {user.username ? ` • @${user.username}` : ''} • {formatDate(user.createdAt)}
                    </div>
                  </div>
                  <StatusBadge status={user.status} />
                  <div className="row-actions">
                    <button
                      type="button"
                      className="btn btn-sm btn-approve"
                      title="Approve"
                      disabled={busyId === user.id}
                      onClick={() => decide(user, 'approved')}
                    >
                      ✅
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-reject"
                      title="Reject"
                      disabled={busyId === user.id}
                      onClick={() => decide(user, 'rejected')}
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
