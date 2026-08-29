import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

type Tab = 'signin' | 'signup';

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
    if (mode === 'signup' || mode === 'signin') {
      setTab(mode);
    }
    if (mail) {
      setEmail(mail);
    }
  }, [searchParams]);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'signin') {
        await signIn(email, password);
        toast.success('Welcome back!');
      } else {
        await signUp(email, password, name);
        toast.success('Account created! Please pick your group.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string) => ({
    width: '100%',
    padding: '13px 16px',
    borderRadius: 'var(--radius-sm)',
    border: `1px solid ${focusedField === field ? 'rgba(124, 58, 237, 0.5)' : 'var(--border)'}`,
    background: 'var(--bg-input)',
    color: 'var(--text-primary)',
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'all 0.3s var(--ease-smooth)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    boxShadow: focusedField === field
      ? '0 0 0 3px rgba(124, 58, 237, 0.12), 0 4px 16px rgba(0, 0, 0, 0.2)'
      : '0 2px 8px rgba(0, 0, 0, 0.1)',
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
            top: '-10%',
            left: '10%',
            filter: 'blur(60px)',
            animation: 'orbFloat 15s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
            bottom: '5%',
            right: '5%',
            filter: 'blur(50px)',
            animation: 'orbFloat 18s ease-in-out infinite reverse',
          }}
        />
      </div>

      {/* Auth card */}
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '44px 40px',
          position: 'relative',
          zIndex: 1,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 32px 100px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
          animation: 'fadeInScale 0.6s var(--ease-spring) both',
        }}
      >
        {/* Inner glow accent */}
        <div
          style={{
            position: 'absolute',
            top: -1,
            left: '20%',
            right: '20%',
            height: 1,
            background: 'var(--accent-gradient)',
            borderRadius: '0 0 50% 50%',
            filter: 'blur(1px)',
            opacity: 0.6,
          }}
        />

        {/* Back to Home link */}
        <button
          onClick={() => navigate('/landing')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 20,
            padding: 0,
            fontFamily: "'Inter', sans-serif",
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Home
        </button>

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 36,
            animation: 'fadeInUp 0.6s var(--ease-out-expo) 0.1s both',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'var(--accent-gradient)',
              backgroundSize: '200% 200%',
              animation: 'gradientShift 4s ease infinite',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 800,
              color: '#fff',
              boxShadow: '0 8px 28px var(--glow-purple)',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            A
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Outfit', 'Inter', sans-serif",
                fontWeight: 800,
                fontSize: 19,
                color: 'var(--text-primary)',
                letterSpacing: '-0.5px',
              }}
            >
              Attendance Tracker
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Heritage Institute of Technology
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-sm)',
            padding: 4,
            marginBottom: 32,
            border: '1px solid var(--border-subtle)',
            animation: 'fadeInUp 0.6s var(--ease-out-expo) 0.15s both',
          }}
        >
          {(['signin', 'signup'] as Tab[]).map(t => (
            <button
              key={t}
              id={`tab-${t}`}
              onClick={() => setTab(t)}
              style={{
                padding: '10px 0',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
                fontFamily: "'Inter', sans-serif",
                transition: 'all 0.3s var(--ease-smooth)',
                background: tab === t ? 'var(--accent-gradient)' : 'transparent',
                backgroundSize: tab === t ? '200% 200%' : 'auto',
                animation: tab === t ? 'gradientShift 4s ease infinite' : 'none',
                color: tab === t ? '#fff' : 'var(--text-muted)',
                boxShadow: tab === t
                  ? '0 4px 16px var(--glow-purple), inset 0 1px 0 rgba(255,255,255,0.15)'
                  : 'none',
              }}
            >
              {t === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {tab === 'signup' && (
            <div style={{ animation: 'fadeInUp 0.4s var(--ease-out-expo) both' }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
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

          <div style={{ animation: 'fadeInUp 0.4s var(--ease-out-expo) 0.05s both' }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
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

          <div style={{ animation: 'fadeInUp 0.4s var(--ease-out-expo) 0.1s both' }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
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
              marginTop: 8,
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: loading ? 'var(--bg-elevated)' : 'var(--accent-gradient)',
              backgroundSize: '200% 200%',
              animation: loading ? 'none' : 'gradientShift 4s ease infinite',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s var(--ease-smooth)',
              boxShadow: loading
                ? 'none'
                : '0 8px 28px var(--glow-purple), inset 0 1px 0 rgba(255,255,255,0.15)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <span style={{ position: 'relative', zIndex: 1 }}>
              {loading ? 'Please wait…' : tab === 'signin' ? 'Sign In' : 'Create Account'}
            </span>
          </button>
        </form>

        {tab === 'signup' && (
          <p
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              textAlign: 'center',
              marginTop: 20,
              lineHeight: 1.6,
            }}
          >
            After signing up, you'll choose your group (Gr. 1 or Gr. 2) to see your personalized timetable.
          </p>
        )}
      </div>
    </div>
  );
}
