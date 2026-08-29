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
    background: '#111a2c',
    color: '#f3ecdd',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 12,
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
    padding: '12px 16px',
  },
  success: { iconTheme: { primary: '#5bbf8a', secondary: '#111a2c' } },
  error: { iconTheme: { primary: '#d95f6a', secondary: '#111a2c' } },
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
        gap: 18,
        background: '#080b13',
      }}
    >
      {/* Logo mark */}
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2.5C12 2.5 15.5 6 15.5 10.5C15.5 14.2 12.8 16.8 12 17.5C11.2 16.8 8.5 14.2 8.5 10.5C8.5 6 12 2.5 12 2.5Z"
          fill="#e3b76a" opacity="0.9"
        />
        <circle cx="12" cy="20" r="1.6" fill="#e3b76a" opacity="0.5" />
      </svg>
      {/* App name */}
      <div
        style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 500,
          fontSize: 22,
          color: '#f3ecdd',
          letterSpacing: '-0.3px',
        }}
      >
        Presently
      </div>
      {/* Loading indicator */}
      <div style={{ color: '#8a93ab', fontSize: 12, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '1px' }}>
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
