import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi } from '../api/client';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isLoading: true,
  });

  // On mount, rehydrate from localStorage and verify token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }
    authApi
      .getMe()
      .then((res) => {
        setState({ user: res.data.user, token, isLoading: false });
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setState({ user: null, token: null, isLoading: false });
      });
  }, []);

  const login = useCallback((token: string, user: User) => {
    localStorage.setItem('token', token);
    setState({ user, token, isLoading: false });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setState({ user: null, token: null, isLoading: false });
  }, []);

  const updateUser = useCallback((user: User) => {
    setState((s) => ({ ...s, user }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateUser,
        isAuthenticated: !!state.user,
        isAdmin: state.user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook — throws if used outside provider
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
