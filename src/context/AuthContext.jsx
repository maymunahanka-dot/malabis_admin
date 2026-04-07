import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => sessionStorage.getItem('auth_user'));
  const [token, setToken] = useState(() => sessionStorage.getItem('auth_token'));

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Invalid credentials');
    }

    sessionStorage.setItem('auth_user', email);
    sessionStorage.setItem('auth_token', data.token);
    setUser(email);
    setToken(data.token);
  };

  const logout = () => {
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
