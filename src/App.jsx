import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { api, resolveIdentity, setAdminKey } from './api.js';
import { DataProvider } from './context/DataContext.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Users from './pages/Users.jsx';
import Admins from './pages/Admins.jsx';

function Gate({ title, text }) {
  return (
    <div className="gate-wrap">
      <div className="gate-card">
        <div className="brand" style={{ marginBottom: 18 }}>
          <span className="brand-mark">🔐</span>
          <span>
            Credentials Bot
            <small>Admin panel</small>
          </span>
        </div>
        <h1>{title}</h1>
        <p className="page-sub">{text}</p>
      </div>
    </div>
  );
}

export default function App() {
  const [status, setStatus] = useState('loading');
  const [admin, setAdmin] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const identity = resolveIdentity();
    if (!identity) {
      setStatus('no-telegram');
      return;
    }

    setAdminKey(identity);
    api
      .verify()
      .then((data) => {
        setAdmin(data.admin);
        setStatus('ready');
      })
      .catch((err) => {
        setError(err.message || '');
        setStatus('denied');
      });
  }, []);

  if (status === 'loading') return <Gate title="Loading…" text="Checking your access." />;
  if (status === 'no-telegram')
    return <Gate title="Open from Telegram" text="This panel opens from the admin button inside the bot." />;
  if (status === 'denied') return <Gate title="Access denied" text={error || 'Your account is not an admin.'} />;

  return (
    <BrowserRouter>
      <DataProvider>
        <Routes>
          <Route element={<Layout admin={admin} />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/admins" element={<Admins />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </DataProvider>
    </BrowserRouter>
  );
}
