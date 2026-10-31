import { useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatDate } from '../format.js';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: '🟡 Pending' },
  { id: 'approved', label: '✅ Approved' },
  { id: 'rejected', label: '❌ Rejected' },
];

export default function Users() {
  const { users, loading, error: globalError, updateUserStatus, deleteUser } = useData();
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [localError, setLocalError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const error = localError || globalError;

  const filteredUsers = users.filter((u) => {
    const matchesTab = tab === 'all' || u.status === tab;
    const s = search.toLowerCase();
    const matchesSearch = !s || 
      u.email.toLowerCase().includes(s) || 
      u.telegramId.toLowerCase().includes(s) || 
      (u.username && u.username.toLowerCase().includes(s));
    return matchesTab && matchesSearch;
  });

  async function decide(user, status, reason) {
    setBusyId(user.id);
    setLocalError('');
    try {
      await updateUserStatus(user.id, status, reason);
      setEditingUser(null);
      setRejectTarget(null);
      setRejectReason('');
    } catch (err) {
      setLocalError(err.message || 'Action failed.');
    } finally {
      setBusyId(null);
    }
  }

  function openReject(user) {
    setEditingUser(null);
    setRejectTarget(user);
    setRejectReason('');
  }

  async function confirmReject() {
    if (!rejectTarget) return;
    setRejecting(true);
    setLocalError('');
    try {
      await updateUserStatus(rejectTarget.id, 'rejected', rejectReason.trim() || 'Your registration did not meet the requirements.');
      setRejectTarget(null);
      setRejectReason('');
    } catch (err) {
      setLocalError(err.message || 'Reject failed.');
    } finally {
      setRejecting(false);
    }
  }

  function openDelete(user) {
    setEditingUser(null);
    setDeleteTarget(user);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleting(true);
    setLocalError('');
    try {
      await deleteUser(target.id);
      setDeleteTarget(null);
    } catch (err) {
      setLocalError(err.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Users</h1>
        <p className="page-sub">Review, approve, reject or remove registered accounts.</p>
      </div>

      <div className="stack">
        <div className="card">
          <div className="card-head">
            <div className="tabs">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`tab${tab === t.id ? ' active' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form
              className="controls"
              onSubmit={(e) => {
                e.preventDefault();
                setSearch(query.trim());
              }}
            >
              <input
                className="input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search email, username or ID"
              />
              <button type="submit" className="btn">
                Search
              </button>
              {search ? (
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => {
                    setQuery('');
                    setSearch('');
                  }}
                >
                  Clear
                </button>
              ) : null}
            </form>
          </div>

          {error ? <div className="notice" style={{ marginBottom: 14 }}>{error}</div> : null}

          {loading && !users.length ? (
            <div className="skeleton">Loading…</div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty">No users found.</div>
          ) : (
            <div className="list">
              {filteredUsers.map((user) => (
                <div className="row" key={user.id}>
                  <div className="row-main">
                    <div className="row-title">{user.email}</div>
                    <div className="row-sub">
                      ID {user.telegramId}
                      {user.username ? ` • @${user.username}` : ''}
                      {user.firstName ? ` • ${user.firstName}` : ''} • joined {formatDate(user.createdAt)}
                    </div>
                  </div>

                  <StatusBadge status={user.status} />

                  <div className="row-actions">
                    {busyId === user.id ? (
                      <div className="row-loader">
                        <span className="spinner" />
                        Working…
                      </div>
                    ) : user.status === 'approved' ? (
                      <button
                        type="button"
                        className="btn btn-sm"
                        title="Edit"
                        onClick={() => setEditingUser(user)}
                      >
                        ✏️
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn btn-sm btn-approve"
                          title="Approve"
                          onClick={() => decide(user, 'approved')}
                        >
                          ✅
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-reject"
                          title="Reject"
                          onClick={() => openReject(user)}
                        >
                          ❌
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          title="Delete"
                          onClick={() => openDelete(user)}
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editingUser && (
        <div
          className="modal-overlay"
          onClick={() => (busyId ? null : setEditingUser(null))}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {busyId === editingUser.id ? (
              <div className="modal-loading">
                <span className="spinner" />
                <div>Working…</div>
              </div>
            ) : (
              <>
                <div className="modal-title">Manage User</div>
                <div className="modal-desc">
                  Actions for <strong>{editingUser.email}</strong>
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-reject"
                    onClick={() => openReject(editingUser)}
                  >
                    ❌ Reject User
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => openDelete(editingUser)}
                  >
                    🗑️ Delete User
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setEditingUser(null)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          className="modal-overlay"
          onClick={() => (deleting ? null : setDeleteTarget(null))}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {deleting ? (
              <div className="modal-loading">
                <span className="spinner" />
                <div>Deleting…</div>
              </div>
            ) : (
              <>
                <div className="modal-title">Delete User</div>
                <div className="modal-desc">
                  Permanently delete <strong>{deleteTarget.email}</strong>? This
                  cannot be undone.
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={confirmDelete}
                    disabled={deleting}
                  >
                    🗑️ Delete User
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setDeleteTarget(null)}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {rejectTarget && (
        <div
          className="modal-overlay"
          onClick={() => (rejecting ? null : setRejectTarget(null))}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {rejecting ? (
              <div className="modal-loading">
                <span className="spinner" />
                <div>Rejecting…</div>
              </div>
            ) : (
              <>
                <div className="modal-title">Reject User</div>
                <div className="modal-desc">
                  Provide a reason for rejecting <strong>{rejectTarget.email}</strong>. This will be sent to the user.
                </div>
                <div className="modal-actions">
                  <textarea
                    className="input"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter rejection reason..."
                    rows={4}
                    style={{ resize: 'vertical', minHeight: 80, width: '100%' }}
                    disabled={rejecting}
                  />
                  <button
                    type="button"
                    className="btn btn-reject"
                    onClick={confirmReject}
                    disabled={rejecting}
                  >
                    ❌ Confirm Reject
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setRejectTarget(null);
                      setRejectReason('');
                    }}
                    disabled={rejecting}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
