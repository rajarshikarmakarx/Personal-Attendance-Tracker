import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

/* ── Presently theme tokens ── */
const C = {
  void:        '#080b13',
  panel:       '#111a2c',
  panelSoft:   '#0e1626',
  hairline:    'rgba(255,255,255,0.09)',
  hairlineSoft:'rgba(255,255,255,0.06)',
  cream:       '#f3ecdd',
  soft:        '#c7cfe0',
  muted:       '#8a93ab',
  gold:        '#e3b76a',
  goldSoft:    '#f0cd8f',
  goldDim:     'rgba(227,183,106,0.14)',
};

const links = [
  { to: '/', label: 'Dashboard', id: 'nav-dashboard', icon: (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M2 8.5L8 3L14 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3.5 7.5V13H6.5V10H9.5V13H12.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
  { to: '/today', label: 'Today', id: 'nav-today', icon: (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 7H14" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5.5 1.5V4.5M10.5 1.5V4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )},
  { to: '/history', label: 'History', id: 'nav-history', icon: (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
  { to: '/statistics', label: 'Statistics', id: 'nav-statistics', icon: (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="8" width="3" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="6.5" y="5" width="3" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="11" y="3" width="3" height="10" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
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
      <style>{`
        @keyframes driftDown {
          from { opacity:0; transform:translateY(-10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .pv-nav-link {
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          font-family: 'Inter', sans-serif;
          transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          color: ${C.muted};
          border: 1px solid transparent;
        }
        .pv-nav-link:hover { color: ${C.soft}; background: rgba(255,255,255,0.03); border-color: ${C.hairline}; }
        .pv-nav-link.active { color: ${C.cream}; background: rgba(227,183,106,0.1); border-color: rgba(227,183,106,0.3); }
        .pv-mobile-link {
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          gap: 10px;
          color: ${C.muted};
          transition: color 0.2s ease, background 0.2s ease;
        }
        .pv-mobile-link:hover { color: ${C.cream}; background: rgba(255,255,255,0.03); }
        .pv-mobile-link.active { color: ${C.goldSoft}; background: rgba(227,183,106,0.1); }
      `}</style>

      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(8,11,19,0.94)',
          borderBottom: `1px solid ${C.hairlineSoft}`,
          animation: 'driftDown 0.5s ease both',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 60,
          }}
        >
          {/* Logo + nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2.5C12 2.5 15.5 6 15.5 10.5C15.5 14.2 12.8 16.8 12 17.5C11.2 16.8 8.5 14.2 8.5 10.5C8.5 6 12 2.5 12 2.5Z"
                  fill={C.gold} opacity="0.9"
                />
                <circle cx="12" cy="20" r="1.6" fill={C.gold} opacity="0.5" />
              </svg>
              <span
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 600,
                  fontSize: 18,
                  color: C.cream,
                  letterSpacing: '-0.3px',
                }}
              >
                Presently
              </span>
            </div>

            {/* Desktop nav links */}
            <div className="nav-desktop-container" style={{ display: 'flex', gap: 3 }}>
              {links.map(({ to, label, id, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  id={id}
                  end={to === '/'}
                  className={({ isActive }) => `pv-nav-link${isActive ? ' active' : ''}`}
                >
                  {icon}
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Group badge */}
            {profile && (
              <div
                style={{
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(227,183,106,0.1)',
                  border: '1px solid rgba(227,183,106,0.28)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.gold,
                  letterSpacing: '0.3px',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                Gr.{profile.group_number}
              </div>
            )}

            {/* User email */}
            {user && (
              <span
                className="nav-user-email"
                style={{
                  fontSize: 12,
                  color: C.muted,
                  maxWidth: 150,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontFamily: "'Inter', sans-serif",
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
                padding: '6px 13px',
                borderRadius: 8,
                border: `1px solid ${C.hairline}`,
                background: 'transparent',
                color: C.muted,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
              onMouseEnter={e => {
                const t = e.currentTarget;
                t.style.borderColor = 'rgba(217,95,106,0.4)';
                t.style.color = '#e88090';
                t.style.background = 'rgba(217,95,106,0.08)';
              }}
              onMouseLeave={e => {
                const t = e.currentTarget;
                t.style.borderColor = C.hairline;
                t.style.color = C.muted;
                t.style.background = 'transparent';
              }}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
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
                padding: 7,
                borderRadius: 8,
                border: `1px solid ${C.hairline}`,
                background: 'transparent',
                color: C.soft,
                cursor: 'pointer',
              }}
              className="mobile-menu-btn"
            >
              <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
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
              background: 'rgba(0,0,0,0.65)',
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
              width: 264,
              background: 'rgba(8,11,19,0.97)',
              borderLeft: `1px solid ${C.hairline}`,
              zIndex: 95,
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              animation: 'slideInRight 0.3s var(--ease-out-expo) both',
            }}
          >
            <div
              style={{
                marginBottom: 18,
                fontFamily: "'Fraunces', serif",
                fontWeight: 500,
                fontSize: 18,
                color: C.cream,
              }}
            >
              Menu
            </div>
            {links.map(({ to, label, id, icon }) => (
              <NavLink
                key={to}
                to={to}
                id={`mobile-${id}`}
                end={to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `pv-mobile-link${isActive ? ' active' : ''}`}
              >
                {icon}
                {label}
              </NavLink>
            ))}
            <div style={{ marginTop: 'auto', paddingTop: 20 }}>
              <button
                onClick={handleSignOut}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 10,
                  border: `1px solid ${C.hairline}`,
                  background: 'transparent',
                  color: C.muted,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
