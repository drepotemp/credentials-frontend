import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

export default function Layout({ admin }) {
  const name = admin?.username ? `@${admin.username}` : admin?.userId || 'admin';

  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">
            <span className="brand-mark">🔐</span>
            <span>
              Credentials Bot
              <small>Admin panel</small>
            </span>
          </div>
          <span className="badge badge-super">
            {admin?.isSuper ? '👑 Super admin' : '🛡️ Admin'}: {name}
          </span>
        </div>
      </header>

      <main className="container page">
        <Outlet />
      </main>

      <Navbar />
    </>
  );
}
