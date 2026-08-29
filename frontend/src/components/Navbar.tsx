import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const links = [
  { to: '/', label: 'Dashboard', id: 'nav-dashboard', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8.5L8 3L14 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3.5 7.5V13H6.5V10H9.5V13H12.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )},
  { to: '/today', label: 'Today', id: 'nav-today', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M2 7H14" stroke="currentColor" strokeWidth="1.5"/><path d="M5.5 1.5V4.5M10.5 1.5V4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
  )},
  { to: '/history', label: 'History', id: 'nav-history', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )},
  { to: '/statistics', label: 'Statistics', id: 'nav-statistics', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="8" width="3" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5"/><rect x="6.5" y="5" width="3" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.5"/><rect x="11" y="3" width="3" height="10" rx="0.5" stroke="currentColor" strokeWidth="1.5"/></svg>
  )},
];

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
  };

  return (
    <>
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(6, 6, 10, 0.7)',
          backdropFilter: 'blur(20px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
          borderBottom: '1px solid var(--border)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
          }}
        >
          {/* Logo + nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent-gradient)',
                  backgroundSize: '200% 200%',
                  animation: 'gradientShift 4s ease infinite',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15,
                  fontWeight: 800,
                  color: '#fff',
                  boxShadow: '0 4px 20px var(--glow-purple)',
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                A
              </div>
              <span
                style={{
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.5px',
                }}
              >
                Attendance
              </span>
            </div>

            {/* Desktop nav links */}
            <div
              className="desktop-nav-links"
              style={{
                display: 'flex',
                gap: 4,
                padding: 4,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {links.map(({ to, label, id, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  id={id}
                  end={to === '/'}
                  style={({ isActive }) => ({
                    padding: '7px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'all 0.25s var(--ease-smooth)',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    background: isActive
                      ? 'var(--accent-gradient)'
                      : 'transparent',
                    backgroundSize: isActive ? '200% 200%' : 'auto',
                    animation: isActive ? 'gradientShift 4s ease infinite' : 'none',
                    boxShadow: isActive
                      ? '0 4px 16px var(--glow-purple), inset 0 1px 0 rgba(255,255,255,0.15)'
                      : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: "'Inter', sans-serif",
                  })}
                >
                  {icon}
                  <span className="nav-label">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Group badge */}
            {profile && (
              <div
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: profile.group_number === 1
                    ? 'rgba(124, 58, 237, 0.12)'
                    : 'rgba(16, 185, 129, 0.12)',
                  border: `1px solid ${profile.group_number === 1
                    ? 'rgba(124, 58, 237, 0.3)'
                    : 'rgba(16, 185, 129, 0.3)'}`,
                  fontSize: 11,
                  fontWeight: 700,
                  color: profile.group_number === 1 ? '#a78bfa' : '#34d399',
                  letterSpacing: '0.4px',
                }}
              >
                Gr. {profile.group_number}
              </div>
            )}

            {/* User email */}
            {user && (
              <span
                className="nav-user-email"
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  maxWidth: 150,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.email}
              </span>
            )}

            {/* Sign out */}
            <button
              id="btn-sign-out"
              onClick={handleSignOut}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-muted)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                transition: 'all 0.25s var(--ease-smooth)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
              onMouseEnter={e => {
                const t = e.currentTarget;
                t.style.borderColor = 'rgba(244, 63, 94, 0.4)';
                t.style.color = '#fb7185';
                t.style.background = 'rgba(244, 63, 94, 0.08)';
                t.style.boxShadow = '0 0 16px rgba(244, 63, 94, 0.15)';
              }}
              onMouseLeave={e => {
                const t = e.currentTarget;
                t.style.borderColor = 'var(--border)';
                t.style.color = 'var(--text-muted)';
                t.style.background = 'transparent';
                t.style.boxShadow = 'none';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2H3.5C2.67 2 2 2.67 2 3.5V10.5C2 11.33 2.67 12 3.5 12H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M9 4L12 7L9 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 7H5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              Sign out
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                display: 'none',
                padding: 8,
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
              className="mobile-menu-btn"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 5H15M3 9H15M3 13H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile slide-out menu */}
      {mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 90,
              animation: 'fadeInUp 0.2s ease both',
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 280,
              background: 'rgba(6, 6, 10, 0.95)',
              backdropFilter: 'blur(24px)',
              borderLeft: '1px solid var(--border)',
              zIndex: 95,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              animation: 'slideInRight 0.3s var(--ease-out-expo) both',
            }}
          >
            <div style={{ marginBottom: 16, fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>
              Menu
            </div>
            {links.map(({ to, label, id, icon }) => (
              <NavLink
                key={to}
                to={to}
                id={`mobile-${id}`}
                end={to === '/'}
                onClick={() => setMobileOpen(false)}
                style={({ isActive }) => ({
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent-gradient)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                })}
              >
                {icon}
                {label}
              </NavLink>
            ))}
          </div>
        </>
      )}
    </>
  );
}
