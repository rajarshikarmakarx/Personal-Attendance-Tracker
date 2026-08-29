import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { createProfile } from '../api/client';

const GROUPS = [
  {
    number: 1,
    title: 'Group 1',
    badge: 'Gr. 1',
    color: '#7c3aed',
    glow: 'rgba(124, 58, 237, 0.4)',
    gradient: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(99, 102, 241, 0.05))',
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
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.05))',
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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div
          style={{
            position: 'absolute',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 70%)',
            top: '-20%',
            left: '20%',
            filter: 'blur(70px)',
            animation: 'orbFloat 20s ease-in-out infinite',
          }}
        />
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: 620,
          position: 'relative',
          zIndex: 1,
          animation: 'fadeInScale 0.6s var(--ease-spring) both',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              margin: '0 auto 20px',
              background: 'var(--accent-gradient)',
              backgroundSize: '200% 200%',
              animation: 'gradientShift 4s ease infinite',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 800,
              color: '#fff',
              boxShadow: '0 8px 32px var(--glow-purple)',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            A
          </div>
          <h1
            style={{
              fontFamily: "'Outfit', 'Inter', sans-serif",
              fontSize: 32,
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-1px',
              marginBottom: 10,
            }}
          >
            Select Your Group
          </h1>
          <p
            style={{
              fontSize: 14,
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              maxWidth: 400,
              margin: '0 auto',
            }}
          >
            Pick your assigned lab group to initialize your personalized weekly timetable.
          </p>
        </div>

        {/* Group Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: 20,
            marginBottom: 32,
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
                  background: isSelected ? g.gradient : 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: `2px solid ${isSelected ? g.color : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '32px 28px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s var(--ease-smooth)',
                  boxShadow: isSelected
                    ? `0 16px 48px rgba(0,0,0,0.3), 0 0 30px ${g.glow}`
                    : '0 4px 16px rgba(0,0,0,0.15)',
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
                    padding: '5px 14px',
                    borderRadius: 'var(--radius-full)',
                    background: isSelected ? g.color : 'rgba(255, 255, 255, 0.06)',
                    color: isSelected ? '#fff' : 'var(--text-muted)',
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 16,
                    letterSpacing: '0.5px',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {g.badge}
                </div>

                <div
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 22,
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    marginBottom: 18,
                    letterSpacing: '-0.5px',
                  }}
                >
                  {g.title}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {g.highlights.map(h => (
                    <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: isSelected ? g.color : 'var(--text-muted)',
                          flexShrink: 0,
                          transition: 'background 0.3s',
                          boxShadow: isSelected ? `0 0 8px ${g.color}` : 'none',
                        }}
                      />
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {h}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: g.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      boxShadow: `0 0 16px ${g.color}`,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: selected
              ? selected === 1
                ? 'var(--accent-gradient)'
                : 'linear-gradient(135deg, #059669, #10b981)'
              : 'rgba(255, 255, 255, 0.05)',
            backgroundSize: '200% 200%',
            animation: selected && !loading ? 'gradientShift 4s ease infinite' : 'none',
            color: selected ? '#fff' : 'var(--text-muted)',
            fontSize: 15,
            fontWeight: 700,
            fontFamily: "'Outfit', 'Inter', sans-serif",
            cursor: selected && !loading ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s var(--ease-smooth)',
            boxShadow: selected
              ? `0 12px 36px ${selected === 1 ? 'var(--glow-purple)' : 'var(--green-glow)'}`
              : 'none',
          }}
        >
          {loading ? 'Saving…' : selected ? `Confirm Group ${selected}` : 'Select a group to continue'}
        </button>
      </div>
    </div>
  );
}
