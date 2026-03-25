import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, type User } from '../services/api';
import { isOnline } from '../lib/offline';
import { registerPushSubscription } from '../lib/webPush';

const USER_CACHE_KEY = 'tasks-pop-user';

function getCachedUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function setCachedUser(u: User | null): void {
  if (u) localStorage.setItem(USER_CACHE_KEY, JSON.stringify(u));
  else localStorage.removeItem(USER_CACHE_KEY);
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.auth
      .me()
      .then((u) => {
        setUser(u);
        setCachedUser(u);
        registerPushSubscription().catch(() => {});
      })
      .catch(() => {
        if (isOnline()) {
          localStorage.removeItem('token');
          setCachedUser(null);
        } else {
          const cached = getCachedUser();
          if (cached) setUser(cached);
          else localStorage.removeItem('token');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { access_token, user: u } = await api.auth.login(email, password);
    localStorage.setItem('token', access_token);
    setCachedUser(u);
    setUser(u);
    registerPushSubscription().catch(() => {});
  };

  const logout = async () => {
    try {
      if (isOnline()) await api.auth.logout();
    } finally {
      localStorage.removeItem('token');
      setCachedUser(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
