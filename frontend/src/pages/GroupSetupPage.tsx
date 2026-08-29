import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { createProfile } from '../api/client';

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
};

const GROUPS = [
  {
    number: 1,
    title: 'Group 1',
    badge: 'Gr. 1',
    accentColor: '#e3b76a',
    accentDim: 'rgba(227,183,106,0.14)',
    highlights: [
      'ECE Lab · Mon (ICT502)',
      'Manufacturing Lab · Wed (CME 214)',
      'Mechanics Lab · Thu (CME B06)',
      'Physics Lab · Fri (CB106A)',
    ],
  },
  {
    number: 2,
    title: 'Group 2',
    badge: 'Gr. 2',
    accentColor: '#5bbf8a',
    accentDim: 'rgba(91,191,138,0.12)',
    highlights: [
      'ECE Lab · Mon (ICT401)',
      'Mechanics Lab · Wed (CME B12)',
      'Manufacturing Lab · Thu (CME I18)',
      'Physics Lab · Fri (CB106B)',
    ],
  },
];

export default function GroupSetupPage() {
  const { refreshProfile } = useAuth();
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await createProfile(selected);
      toast.success(`Group ${selected} selected! Loading your timetable…`);
      await refreshProfile();
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to set group';
      if (err.message === 'Network Error' || (err.name === 'TypeError' && err.message === 'Failed to fetch')) {
        toast.error('Cannot reach backend server. Please check VITE_API_URL or backend health.');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

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
      `}</style>

      <div
        style={{
          width: '100%',
          maxWidth: 600,
          position: 'relative',
          zIndex: 1,
          animation: 'driftUp 0.7s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2.5C12 2.5 15.5 6 15.5 10.5C15.5 14.2 12.8 16.8 12 17.5C11.2 16.8 8.5 14.2 8.5 10.5C8.5 6 12 2.5 12 2.5Z"
                fill={C.gold} opacity="0.9"
              />
              <circle cx="12" cy="20" r="1.6" fill={C.gold} opacity="0.5" />
            </svg>
          </div>
          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 500,
              fontSize: 'clamp(26px,3.5vw,34px)',
              color: C.cream,
              letterSpacing: '-0.6px',
              marginBottom: 10,
            }}
          >
            Select Your Group
          </h1>
          <p
            style={{
              fontSize: 14,
              color: C.muted,
              lineHeight: 1.65,
              maxWidth: 380,
              margin: '0 auto',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Pick your assigned lab group to initialize your personalized weekly timetable.
          </p>
        </div>

        {/* Group Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 18,
            marginBottom: 28,
          }}
        >
          {GROUPS.map(g => {
            const isSelected = selected === g.number;
            return (
              <button
                key={g.number}
                id={`btn-group-${g.number}`}
                onClick={() => setSelected(g.number)}
                style={{
                  background: isSelected ? g.accentDim : C.panelSoft,
                  border: `${isSelected ? 2 : 1}px solid ${isSelected ? g.accentColor : C.hairline}`,
                  borderRadius: 16,
                  padding: '28px 24px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.25s ease',
                  boxShadow: isSelected
                    ? `0 8px 32px rgba(0,0,0,0.25), 0 0 20px ${g.accentColor}20`
                    : '0 2px 12px rgba(0,0,0,0.15)',
                  transform: isSelected ? 'translateY(-4px)' : 'none',
                  fontFamily: "'Inter', sans-serif",
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 12px',
                    borderRadius: 999,
                    background: isSelected ? g.accentColor : 'rgba(255,255,255,0.06)',
                    color: isSelected ? '#1a1306' : C.muted,
                    fontSize: 11,
                    fontWeight: 700,
                    marginBottom: 14,
                    letterSpacing: '0.5px',
                    transition: 'all 0.25s ease',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {g.badge}
                </div>

                <div
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: 20,
                    fontWeight: 500,
                    color: C.cream,
                    marginBottom: 16,
                    letterSpacing: '-0.3px',
                  }}
                >
                  {g.title}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {g.highlights.map(h => (
                    <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: isSelected ? g.accentColor : C.muted,
                          flexShrink: 0,
                          transition: 'background 0.25s',
                        }}
                      />
                      <span style={{ fontSize: 13, color: C.soft, lineHeight: 1.4 }}>
                        {h}
                      </span>
                    </div>
                  ))}
                </div>

                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 18,
                      right: 18,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: g.accentColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1a1306',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Confirm Button */}
        <button
          id="btn-confirm-group"
          onClick={confirm}
          disabled={!selected || loading}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            border: 'none',
            background: !selected
              ? C.panel
              : selected === 1
              ? C.gold
              : '#5bbf8a',
            color: !selected ? C.muted : '#1a1306',
            fontSize: 15,
            fontWeight: 700,
            fontFamily: "'Inter', sans-serif",
            cursor: selected && !loading ? 'pointer' : 'not-allowed',
            transition: 'all 0.25s ease',
            boxShadow: selected
              ? selected === 1
                ? '0 8px 28px rgba(227,183,106,0.28)'
                : '0 8px 28px rgba(91,191,138,0.25)'
              : 'none',
          }}
          onMouseEnter={e => {
            if (selected && !loading) {
              e.currentTarget.style.background = selected === 1 ? C.goldSoft : '#7dd9a8';
            }
          }}
          onMouseLeave={e => {
            if (selected && !loading) {
              e.currentTarget.style.background = selected === 1 ? C.gold : '#5bbf8a';
            }
          }}
        >
          {loading ? 'Saving…' : selected ? `Confirm Group ${selected}` : 'Select a group to continue'}
        </button>
      </div>
    </div>
  );
}
