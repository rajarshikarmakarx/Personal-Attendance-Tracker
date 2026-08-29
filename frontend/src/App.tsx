import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Today from './pages/Today';
import History from './pages/History';
import Statistics from './pages/Statistics';
import SubjectDetail from './pages/SubjectDetail';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import GroupSetupPage from './pages/GroupSetupPage';

const toastStyles = {
  style: {
    background: 'rgba(255, 255, 255, 0.06)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255,255,255,0.05)',
    padding: '12px 16px',
  },
  success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
  error: { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
};

function LoadingScreen() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: 20,
      }}
    >
      {/* Animated logo */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: 'var(--accent-gradient)',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 3s ease infinite',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          fontWeight: 800,
          color: '#fff',
          fontFamily: "'Outfit', sans-serif",
          boxShadow: '0 8px 32px var(--glow-purple)',
        }}
      >
        A
      </div>
      {/* Shimmer bar */}
      <div
        style={{
          width: 120,
          height: 3,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.06)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent, var(--accent-light), transparent)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s linear infinite',
          }}
        />
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>
        Loading…
      </div>
    </div>
  );
}

function AppRoutes() {
  const { session, profile, profileLoading } = useAuth();

  // Still loading session / profile — show animated loading
  if (profileLoading && session) {
    return <LoadingScreen />;
  }

  // Not logged in → Landing Page by default, or Auth page on /auth
  if (!session) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Logged in but no group set → Group setup
  if (!profile) {
    return (
      <Routes>
        <Route path="/setup" element={<GroupSetupPage />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    );
  }

  // Fully authenticated with profile → Main app
  return (
    <Routes>
      <Route path="/landing" element={<LandingPage />} />
      <Route
        path="*"
        element={
          <>
            <Navbar />
            <main style={{ animation: 'fadeInUp 0.5s var(--ease-out-expo) both' }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/today" element={<Today />} />
                <Route path="/history" element={<History />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/subjects/:subjectId" element={<SubjectDetail />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="bottom-right" toastOptions={toastStyles} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
