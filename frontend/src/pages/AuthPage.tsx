import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

type Tab = 'signin' | 'signup';

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

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const initialEmail = searchParams.get('email') || '';

  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState<Tab>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const mode = searchParams.get('mode');
    const mail = searchParams.get('email');
    if (mode === 'signup' || mode === 'signin') setTab(mode);
    if (mail) setEmail(mail);
  }, [searchParams]);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'signin') {
        await signIn(email, password);
        toast.success('Welcome back!');
      } else {
        const res = await signUp(email, password, name);
        if (res?.session) {
          toast.success('Account created! Loading group setup…');
        } else {
          toast.success('Confirmation email sent! Please check your email and click the confirmation link to continue.', { duration: 7000 });
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string) => ({
    width: '100%',
    padding: '12px 15px',
    borderRadius: 10,
    border: `1px solid ${focusedField === field ? 'rgba(227,183,106,0.5)' : C.hairline}`,
    background: C.void,
    color: C.cream,
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(227,183,106,0.1)' : 'none',
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: C.void,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes driftUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes driftDown {
          from { opacity:0; transform:translateY(-14px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      {/* Auth card */}
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: C.panelSoft,
          border: `1px solid ${C.hairline}`,
          borderRadius: 20,
          padding: '40px 36px',
          position: 'relative',
          zIndex: 1,
          animation: 'driftUp 0.7s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {/* Gold top hairline */}
        <div
          style={{
            position: 'absolute',
            top: -1,
            left: '25%',
            right: '25%',
            height: 1,
            background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
            opacity: 0.7,
          }}
        />

        {/* Back to Home */}
        <button
          onClick={() => navigate('/landing')}
          style={{
            background: 'none',
            border: 'none',
            color: C.muted,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 24,
            padding: 0,
            fontFamily: "'Inter', sans-serif",
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = C.soft)}
          onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Home
        </button>

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 32,
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2.5C12 2.5 15.5 6 15.5 10.5C15.5 14.2 12.8 16.8 12 17.5C11.2 16.8 8.5 14.2 8.5 10.5C8.5 6 12 2.5 12 2.5Z"
              fill={C.gold} opacity="0.9"
            />
            <circle cx="12" cy="20" r="1.6" fill={C.gold} opacity="0.5" />
          </svg>
          <div>
            <div
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 600,
                fontSize: 20,
                color: C.cream,
                letterSpacing: '-0.3px',
              }}
            >
              Presently
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 1, fontFamily: "'Inter', sans-serif" }}>
              Heritage Institute of Technology
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: C.void,
            borderRadius: 10,
            padding: 3,
            marginBottom: 28,
            border: `1px solid ${C.hairlineSoft}`,
          }}
        >
          {(['signin', 'signup'] as Tab[]).map(t => (
            <button
              key={t}
              id={`tab-${t}`}
              onClick={() => setTab(t)}
              style={{
                padding: '9px 0',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
                fontFamily: "'Inter', sans-serif",
                transition: 'all 0.25s ease',
                background: tab === t ? C.gold : 'transparent',
                color: tab === t ? '#1a1306' : C.muted,
                boxShadow: tab === t ? `0 4px 14px rgba(227,183,106,0.3)` : 'none',
              }}
            >
              {t === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {tab === 'signup' && (
            <div style={{ animation: 'driftUp 0.4s var(--ease-out-expo) both' }}>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.muted,
                  display: 'block',
                  marginBottom: 7,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                Full Name
              </label>
              <input
                id="input-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                required={tab === 'signup'}
                style={inputStyle('name')}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          )}

          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.muted,
                display: 'block',
                marginBottom: 7,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              Email ID
            </label>
            <input
              id="input-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={inputStyle('email')}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.muted,
                display: 'block',
                marginBottom: 7,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              Password
            </label>
            <input
              id="input-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={inputStyle('password')}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
          </div>

          <button
            id="btn-auth-submit"
            type="submit"
            disabled={loading}
            style={{
              marginTop: 6,
              padding: '13px',
              borderRadius: 10,
              border: 'none',
              background: loading ? C.panel : C.gold,
              color: loading ? C.muted : '#1a1306',
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: loading ? 'none' : '0 6px 22px rgba(227,183,106,0.28)',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = C.goldSoft; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = C.gold; }}
          >
            {loading ? 'Please wait…' : tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {tab === 'signup' && (
          <p
            style={{
              fontSize: 12,
              color: C.muted,
              textAlign: 'center',
              marginTop: 18,
              lineHeight: 1.6,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            After signing up, you'll choose your group (Gr. 1 or Gr. 2) to see your personalized timetable.
          </p>
        )}
      </div>
    </div>
  );
}
