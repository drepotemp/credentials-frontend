import { NavLink } from 'react-router-dom';

const ITEMS = [
  { to: '/', icon: '📊', label: 'Dashboard', end: true },
  { to: '/users', icon: '👥', label: 'Users' },
  { to: '/admins', icon: '🛡️', label: 'Admins' },
];

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-group">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
