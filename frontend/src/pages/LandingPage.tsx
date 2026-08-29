import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Presently — attendance tracker landing page
 * Flat, lofi-night aesthetic. No blur, no glass. Warm lamplight over deep navy.
 */

const COLORS = {
  void: '#080b13',
  deep: '#0b1120',
  panel: '#111a2c',
  panelSoft: '#0e1626',
  hairline: 'rgba(255,255,255,0.09)',
  hairlineSoft: 'rgba(255,255,255,0.06)',
  cream: '#f3ecdd',
  soft: '#c7cfe0',
  muted: '#8a93ab',
  gold: '#e3b76a',
  goldSoft: '#f0cd8f',
  goldDim: 'rgba(227,183,106,0.14)',
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const goSignup = () => navigate('/auth?mode=signup');
  const goSignin = () => navigate('/auth?mode=signin');

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: COLORS.void,
        color: COLORS.cream,
        fontFamily: "'Inter', -apple-system, sans-serif",
        overflowX: 'hidden',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Noto+Serif+JP:wght@400;500&display=swap');

        * { box-sizing: border-box; }

        @keyframes driftUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes driftDown {
          from { opacity: 0; transform: translateY(-14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pv-anim, .pv-star { animation: none !important; }
        }

        .pv-anim { animation: driftUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        .pv-anim-down { animation: driftDown 0.5s ease both; }

        .pv-link {
          color: ${COLORS.soft};
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s ease;
          cursor: pointer;
        }
        .pv-link:hover { color: ${COLORS.cream}; }
        .pv-link:focus-visible { outline: 1px solid ${COLORS.gold}; outline-offset: 4px; border-radius: 2px; }

        .pv-btn-primary {
          padding: 12px 26px;
          border-radius: 999px;
          background: ${COLORS.gold};
          border: 1px solid ${COLORS.gold};
          color: #1a1306;
          font-weight: 600;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }
        .pv-btn-primary:hover { background: ${COLORS.goldSoft}; box-shadow: 0 0 0 4px ${COLORS.goldDim}; }
        .pv-btn-primary:focus-visible { outline: 2px solid ${COLORS.cream}; outline-offset: 3px; }

        .pv-btn-ghost {
          padding: 11px 20px;
          border-radius: 999px;
          background: transparent;
          border: 1px solid ${COLORS.hairline};
          color: ${COLORS.cream};
          font-weight: 500;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .pv-btn-ghost:hover { border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.03); }
        .pv-btn-ghost:focus-visible { outline: 1px solid ${COLORS.gold}; outline-offset: 3px; }

        .pv-feature-card {
          background: ${COLORS.panelSoft};
          border: 1px solid ${COLORS.hairline};
          border-radius: 16px;
          padding: 26px 22px;
          transition: border-color 0.25s ease, transform 0.25s ease;
        }
        .pv-feature-card:hover { border-color: rgba(227,183,106,0.35); transform: translateY(-3px); }

        .pv-step:not(:last-child) {
          border-bottom: 1px solid ${COLORS.hairlineSoft};
        }

        .pv-nav-links-desktop { display: flex; }
        .pv-mobile-toggle { display: none; }
        .pv-hero-title { font-size: clamp(34px, 6vw, 60px); }

        @media (max-width: 860px) {
          .pv-nav-links-desktop { display: none; }
          .pv-mobile-toggle { display: flex !important; }
          .pv-signin-desktop { display: none; }
          .pv-features-grid { grid-template-columns: 1fr !important; }
          .pv-steps-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* subtle analog grain — sits over everything, blocks nothing */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          pointerEvents: 'none',
          opacity: 0.05,
          mixBlendMode: 'overlay',
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
        }}
      />

      {/* ============ NAV ============ */}
      <header
        className="pv-anim-down"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 32px',
          background: 'rgba(8,11,19,0.92)',
          borderBottom: `1px solid ${COLORS.hairlineSoft}`,
        }}
      >
        <div
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2.5C12 2.5 15.5 6 15.5 10.5C15.5 14.2 12.8 16.8 12 17.5C11.2 16.8 8.5 14.2 8.5 10.5C8.5 6 12 2.5 12 2.5Z"
              fill={COLORS.gold}
              opacity="0.9"
            />
            <path
              d="M8 15L9.6 16.6L13 13.2"
              stroke={COLORS.void}
              strokeWidth="0"
            />
            <circle cx="12" cy="20" r="1.6" fill={COLORS.gold} opacity="0.5" />
          </svg>
          <span
            style={{
              fontSize: 19,
              fontWeight: 600,
              letterSpacing: '-0.3px',
              fontFamily: "'Fraunces', serif",
              color: COLORS.cream,
            }}
          >
            Presently
          </span>
        </div>

        <nav className="pv-nav-links-desktop" style={{ alignItems: 'center', gap: 34 }}>
          <a className="pv-link" onClick={() => scrollTo('overview')}>Overview</a>
          <a className="pv-link" onClick={() => scrollTo('how-it-works')}>How it works</a>
          <a className="pv-link" onClick={() => scrollTo('features')}>Features</a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {session ? (
            <button className="pv-btn-primary" onClick={() => navigate('/')}>
              Dashboard →
            </button>
          ) : (
            <>
              <a className="pv-link pv-signin-desktop" onClick={goSignin} style={{ marginRight: 6 }}>
                Sign in
              </a>
              <button className="pv-btn-primary" onClick={goSignup}>
                Begin Journey
              </button>
            </>
          )}

          <button
            className="pv-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              padding: 8,
              borderRadius: 8,
              background: 'transparent',
              border: `1px solid ${COLORS.hairline}`,
              color: COLORS.cream,
              cursor: 'pointer',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Toggle menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div
          style={{
            position: 'sticky',
            top: 65,
            zIndex: 49,
            background: COLORS.panel,
            borderBottom: `1px solid ${COLORS.hairline}`,
            padding: '20px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <a className="pv-link" onClick={() => scrollTo('overview')}>Overview</a>
          <a className="pv-link" onClick={() => scrollTo('how-it-works')}>How it works</a>
          <a className="pv-link" onClick={() => scrollTo('features')}>Features</a>
          <a className="pv-link" onClick={goSignin}>Sign in</a>
        </div>
      )}

      {/* ============ HERO ============ */}
      <section
        id="overview"
        style={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: 640,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* background illustration */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            backgroundImage: "url('/hero-classroom.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center 38%',
            filter: 'saturate(0.9) brightness(0.9)',
          }}
        />
        {/* warm scrim for legibility, matches the void/gold palette below */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background: `
              linear-gradient(to bottom, rgba(8,11,19,0.35) 0%, rgba(8,11,19,0.55) 45%, rgba(8,11,19,0.94) 100%),
              radial-gradient(circle at 50% 55%, rgba(8,11,19,0.35) 0%, rgba(8,11,19,0.8) 75%)
            `,
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            maxWidth: 720,
            margin: '0 auto',
            padding: '96px 24px 60px',
            width: '100%',
          }}
        >
          <div
            className="pv-anim"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: COLORS.gold,
              marginBottom: 18,
            }}
          >
            Built for CSE · Group 1 &amp; Group 2
          </div>
          <div
            className="pv-anim"
            style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: 13,
              color: 'rgba(243,236,221,0.4)',
              marginBottom: 22,
              animationDelay: '0.04s',
            }}
          >
            静かに、出席を。
          </div>

          <h1
            className="pv-anim pv-hero-title"
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 500,
              lineHeight: 1.08,
              letterSpacing: '-1.2px',
              color: COLORS.cream,
              margin: 0,
              animationDelay: '0.08s',
            }}
          >
            Show up. <em style={{ fontStyle: 'italic', fontWeight: 400, color: COLORS.goldSoft }}>Stay</em> above the line.
          </h1>

          <p
            className="pv-anim"
            style={{
              marginTop: 22,
              fontSize: 16,
              lineHeight: 1.65,
              color: COLORS.muted,
              maxWidth: 520,
              marginLeft: 'auto',
              marginRight: 'auto',
              animationDelay: '0.16s',
            }}
          >
            One tap logs the lecture. Presently does the rest — your live percentage,
            how many classes you can still afford to miss, and a quiet nudge before
            you dip below 75%.
          </p>

          <div
            className="pv-anim"
            style={{ marginTop: 34, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.24s' }}
          >
            <button className="pv-btn-primary" style={{ padding: '13px 30px', fontSize: 15 }} onClick={goSignup}>
              Begin Journey
            </button>
            <button className="pv-btn-ghost" onClick={() => scrollTo('how-it-works')}>
              See how it works
            </button>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" style={{ maxWidth: 980, margin: '0 auto', padding: '90px 24px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: COLORS.gold,
            }}
          >
            Three taps a day
          </span>
          <div
            style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: 12,
              color: 'rgba(243,236,221,0.35)',
              marginTop: 6,
            }}
          >
            集中の時間
          </div>
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 500,
              fontSize: 'clamp(26px, 3.4vw, 36px)',
              color: COLORS.cream,
              margin: '12px 0 0',
              letterSpacing: '-0.5px',
            }}
          >
            From lecture to peace of mind
          </h2>
        </div>

        <div className="pv-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, border: `1px solid ${COLORS.hairline}`, borderRadius: 18, overflow: 'hidden' }}>
          {[
            {
              n: '01',
              title: 'Mark your lecture',
              desc: 'Pick your slot from the Heritage CSE timetable and log present, absent, or cancelled — one tap, no forms.',
            },
            {
              n: '02',
              title: 'Watch the number move',
              desc: 'Your subject-wise and overall percentage recalculates instantly, right alongside your safe bunk margin.',
            },
            {
              n: '03',
              title: 'Get nudged in time',
              desc: 'Presently tells you exactly how many lectures you can skip — or must attend — to stay above 75%.',
            },
          ].map((step) => (
            <div
              key={step.n}
              className="pv-step"
              style={{
                padding: '32px 28px',
                background: COLORS.panelSoft,
                borderRight: `1px solid ${COLORS.hairlineSoft}`,
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  color: COLORS.gold,
                  marginBottom: 14,
                }}
              >
                {step.n}
              </div>
              <h3
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 500,
                  fontSize: 19,
                  color: COLORS.cream,
                  margin: '0 0 10px',
                }}
              >
                {step.title}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: COLORS.muted, margin: 0 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section id="features" style={{ maxWidth: 1120, margin: '0 auto', padding: '90px 24px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: COLORS.gold,
            }}
          >
            Everything the spreadsheet couldn't do
          </span>
          <div
            style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: 12,
              color: 'rgba(243,236,221,0.35)',
              marginTop: 6,
            }}
          >
            習慣を作る
          </div>
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 500,
              fontSize: 'clamp(26px, 3.4vw, 36px)',
              color: COLORS.cream,
              margin: '12px 0 0',
              letterSpacing: '-0.5px',
            }}
          >
            Built around one number: 75%
          </h2>
        </div>

        <div
          className="pv-features-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}
        >
          {[
            {
              icon: '◐',
              title: 'Live margin calculator',
              desc: 'Real-time read on your safe bunk allowance and the catch-up lectures needed to hold your 75% threshold.',
            },
            {
              icon: '▦',
              title: 'Group 1 & 2 timetables',
              desc: 'Pre-loaded Heritage Institute schedules for CSE Group 1 and Group 2, with one-click status logging.',
            },
            {
              icon: '◑',
              title: 'Deep analytics',
              desc: 'Subject-wise progress bars, theory-versus-lab ratios, and trend charts that show where you stand.',
            },
            {
              icon: '☰',
              title: 'Complete audit log',
              desc: 'Every marked lecture, timestamped, with a single-click undo if you tap the wrong one.',
            },
          ].map((feat, idx) => (
            <div key={idx} className="pv-feature-card">
              <div style={{ fontSize: 22, color: COLORS.gold, marginBottom: 16 }}>{feat.icon}</div>
              <h3
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 500,
                  fontSize: 17,
                  color: COLORS.cream,
                  margin: '0 0 8px',
                }}
              >
                {feat.title}
              </h3>
              <p style={{ fontSize: 13.5, color: COLORS.muted, lineHeight: 1.6, margin: 0 }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CLOSING CTA ============ */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px 110px', textAlign: 'center' }}>
        <h2
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 500,
            fontSize: 'clamp(24px, 3vw, 32px)',
            color: COLORS.cream,
            margin: '0 0 14px',
            letterSpacing: '-0.4px',
          }}
        >
          Your next lecture starts the streak.
        </h2>
        <p style={{ color: COLORS.muted, fontSize: 15, margin: '0 0 30px' }}>
          Free for every Heritage CSE student. No spreadsheets, no guesswork.
        </p>
        <button className="pv-btn-primary" style={{ padding: '13px 32px', fontSize: 15 }} onClick={goSignup}>
          Begin Journey
        </button>
      </section>

      {/* ============ FOOTER ============ */}
      <footer
        style={{
          position: 'relative',
          borderTop: `1px solid ${COLORS.hairlineSoft}`,
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 13,
          color: COLORS.muted,
          flexWrap: 'wrap',
          gap: 14,
          overflow: 'hidden',
        }}
      >
        <span
          aria-hidden
          style={{
            position: 'absolute',
            right: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            fontFamily: "'Noto Serif JP', serif",
            fontSize: 64,
            color: 'rgba(243,236,221,0.035)',
            lineHeight: 1,
            pointerEvents: 'none',
          }}
        >
          静
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: "'Fraunces', serif", color: COLORS.soft, fontWeight: 500 }}>Presently</span>
          <span>· © {new Date().getFullYear()}</span>
        </div>
        <div style={{ display: 'flex', gap: 22 }}>
          <a className="pv-link" onClick={goSignin}>Sign in</a>
          <a className="pv-link" onClick={goSignup}>Sign up</a>
        </div>
      </footer>
    </div>
  );
}
