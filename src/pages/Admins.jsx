import { useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { formatDate } from '../format.js';

export default function Admins() {
  const { admins, loading, error: globalError, addAdmin: addAdminAction, removeAdmin: removeAdminAction } = useData();
  const [identifier, setIdentifier] = useState('');
  const [localError, setLocalError] = useState('');
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [adding, setAdding] = useState(false);

  const error = localError || globalError;

  async function addAdmin(event) {
    event.preventDefault();
    const value = identifier.trim();
    if (!value) {
      setLocalError('Enter a username or Telegram ID.');
      return;
    }

    setAdding(true);
    setLocalError('');
    setMessage('');
    try {
      await addAdminAction(value);
      setIdentifier('');
      setMessage(`Added ${value} as admin.`);
    } catch (err) {
      setLocalError(err.message || 'Could not add the admin.');
    } finally {
      setAdding(false);
    }
  }

  async function removeAdmin(admin) {
    const label = admin.username ? `@${admin.username}` : admin.userId;
    if (!window.confirm(`Remove ${label} from admins?`)) return;

    setBusyId(admin._id);
    setLocalError('');
    setMessage('');
    try {
      await removeAdminAction(admin._id);
      setMessage(`Removed ${label}.`);
    } catch (err) {
      setLocalError(err.message || 'Could not remove the admin.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Admins</h1>
        <p className="page-sub">Grant or revoke panel access by username or Telegram ID.</p>
      </div>

      <div className="stack">
        <section className="card">
          <div className="card-head">
            <h2>Add an admin</h2>
          </div>

          <form className="controls" onSubmit={addAdmin}>
            <input
              className="input"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="@username or Telegram ID"
              autoComplete="off"
            />
            <button type="submit" className="btn btn-primary" disabled={adding}>
              {adding ? 'Adding…' : 'Add admin'}
            </button>
          </form>

          {error ? <div className="notice" style={{ marginTop: 14 }}>{error}</div> : null}
          {message ? <div className="notice notice-ok" style={{ marginTop: 14 }}>{message}</div> : null}
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Current admins</h2>
            <span className="badge badge-super">{admins.length} total</span>
          </div>

          {loading && !admins.length ? (
            <div className="skeleton">Loading…</div>
          ) : admins.length === 0 ? (
            <div className="empty">No admins yet.</div>
          ) : (
            <div className="list">
              {admins.map((admin) => (
                <div className="row" key={admin._id}>
                  <div className="row-main">
                    <div className="row-title">{admin.username ? `@${admin.username}` : admin.userId}</div>
                    <div className="row-sub">
                      {admin.username ? `Username • added ${formatDate(admin.createdAt)}` : `Telegram ID • added ${formatDate(admin.createdAt)}`}
                    </div>
                  </div>

                  <span className={`badge ${admin.isSuper ? 'badge-super' : 'badge-approved'}`}>
                    {admin.isSuper ? '👑 Super admin' : '🛡️ Admin'}
                  </span>

                  <div className="row-actions">
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      disabled={admin.isSuper || busyId === admin._id}
                      onClick={() => removeAdmin(admin)}
                    >
                      🗑️ Remove
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
