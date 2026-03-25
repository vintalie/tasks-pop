import { lazy, Suspense } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { A11yProvider } from './contexts/A11yContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { A11yToggle } from './components/A11yToggle';
import { ReloadPrompt } from './components/ReloadPrompt';
import { VoiceAssistantWidget } from './components/VoiceAssistantWidget';
import { Checklist } from './pages/Checklist';
import './App.css';

const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));
const TaskManage = lazy(() => import('./pages/TaskManage').then((m) => ({ default: m.TaskManage })));

function VoiceAssistantWidgetWrapper() {
  const { user } = useAuth();
  return user ? <VoiceAssistantWidget /> : null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="app-layout">
      <nav>
        <Link to="/">Checklist</Link>
        {user?.role === 'manager' && (
          <>
            <Link to="/dashboard">Painel</Link>
            <Link to="/tasks">Tarefas</Link>
            <Link to="/settings">Configurações</Link>
          </>
        )}
        <span className="nav-user">{user?.name}</span>
        <button type="button" onClick={logout} className="btn-logout">Sair</button>
      </nav>
      <main>
        <Suspense fallback={<div className="loading">Carregando...</div>}>
          <Routes>
            <Route path="/" element={<Checklist />} />
            <Route path="/dashboard" element={user?.role === 'manager' ? <Dashboard /> : <Navigate to="/" replace />} />
            <Route path="/tasks" element={user?.role === 'manager' ? <TaskManage /> : <Navigate to="/" replace />} />
            <Route path="/settings" element={user?.role === 'manager' ? <Settings /> : <Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <A11yProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
          <Suspense fallback={<div className="loading-screen">Carregando...</div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
            </Routes>
          </Suspense>
          <div className="a11y-float">
            <A11yToggle />
          </div>
          <ReloadPrompt />
          <VoiceAssistantWidgetWrapper />
        </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </A11yProvider>
  );
}
