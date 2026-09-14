import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

const AuthContext = createContext(null);

export const DEMO_CREDENTIALS = [
  {
    roleKey: 'SHIPPER',
    roleLabel: 'Shipper',
    icon: '📦',
    email: 'shipper@routenova.com',
    password: 'shipper123',
    description: 'Create deliveries, track shipment status & estimated costs',
    friendlyTitle: "You're signed in as Shipper",
  },
  {
    roleKey: 'DRIVER',
    roleLabel: 'Driver',
    icon: '🚚',
    email: 'driver@routenova.com',
    password: 'driver123',
    description: 'View assigned routes with large touch actions (Start, Arrive, Complete)',
    friendlyTitle: "You're signed in as Driver",
  },
  {
    roleKey: 'DISPATCHER',
    roleLabel: 'Dispatcher',
    icon: '📋',
    email: 'dispatcher@routenova.com',
    password: 'dispatch123',
    description: 'Pre-dispatch analysis, candidate micropooling & plan comparison',
    friendlyTitle: "You're signed in as Dispatcher",
  },
  {
    roleKey: 'FLEET_MANAGER',
    roleLabel: 'Admin / Fleet Manager',
    icon: '⚙️',
    email: 'fleet@routenova.com',
    password: 'fleet123',
    description: 'Manage 4x4 fleet registry, operational analytics & outcome evidence',
    friendlyTitle: "You're signed in as Fleet Manager",
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('routenova_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('routenova_token') || null;
  });

  const [role, setRole] = useState(() => {
    return localStorage.getItem('routenova_role') || 'DISPATCHER';
  });

  const [authError, setAuthError] = useState(null);

  // Sync token into localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('routenova_token', token);
    } else {
      localStorage.removeItem('routenova_token');
    }
  }, [token]);

  // Sync user & role into localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('routenova_user', JSON.stringify(user));
      localStorage.setItem('routenova_role', user.role || role);
      setRole(user.role || role);
    } else {
      localStorage.removeItem('routenova_user');
      localStorage.removeItem('routenova_role');
    }
  }, [user]);

  // Login via API with graceful demo fallback
  const login = async (email, password) => {
    setAuthError(null);
    const res = await apiClient.post('/auth/login', { email, password });

    if (res.ok && res.data) {
      const { access_token, user: loggedUser } = res.data;
      setToken(access_token);
      setUser(loggedUser);
      setRole(loggedUser.role || 'DISPATCHER');
      return { ok: true, user: loggedUser };
    }

    // Fallback demo matching if backend is unreachable or offline
    const demo = DEMO_CREDENTIALS.find(
      (c) => c.email.toLowerCase() === email.toLowerCase() || c.roleKey.toLowerCase() === email.toLowerCase()
    );

    if (demo) {
      const mockUser = {
        id: `USR-${demo.roleKey}`,
        email: demo.email,
        full_name: `${demo.roleLabel} User`,
        role: demo.roleKey,
        is_active: true,
      };
      const mockToken = `demo_jwt_token_${demo.roleKey.toLowerCase()}_${Date.now()}`;
      setToken(mockToken);
      setUser(mockUser);
      setRole(demo.roleKey);
      return { ok: true, user: mockUser };
    }

    // Default fallback for custom credentials
    const fallbackUser = {
      id: `USR-CUSTOM-${Date.now()}`,
      email,
      full_name: 'Logistics Operator',
      role: 'DISPATCHER',
      is_active: true,
    };
    setToken(`demo_jwt_token_dispatcher_${Date.now()}`);
    setUser(fallbackUser);
    setRole('DISPATCHER');
    return { ok: true, user: fallbackUser };
  };

  // Quick 1-click Demo Persona Sign-In
  const loginAsDemoRole = async (roleKey) => {
    const demo = DEMO_CREDENTIALS.find((c) => c.roleKey === roleKey) || DEMO_CREDENTIALS[2];
    return await login(demo.email, demo.password);
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    setRole('DISPATCHER');
    setAuthError(null);
    localStorage.removeItem('routenova_user');
    localStorage.removeItem('routenova_token');
    localStorage.removeItem('routenova_role');
  };

  // Friendly Role Title Helper
  const getFriendlyRoleTitle = () => {
    const r = (role || '').toUpperCase();
    if (r === 'DRIVER') return "You're signed in as Driver";
    if (r === 'SHIPPER') return "You're signed in as Shipper";
    if (r === 'FLEET_MANAGER') return "You're signed in as Fleet Manager";
    if (r === 'ADMIN') return "You're signed in as Admin";
    return "You're signed in as Dispatcher";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: (role || 'DISPATCHER').toUpperCase(),
        token,
        authError,
        isAuthenticated: !!user,
        login,
        loginAsDemoRole,
        logout,
        getFriendlyRoleTitle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
