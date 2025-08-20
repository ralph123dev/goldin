import { useState, useEffect } from 'react';

interface AuthUser {
  name: string;
  isAdmin: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('goldConnectUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (name: string) => {
    const isAdmin = name === 'admin1234';
    const userData = { name, isAdmin };
    setUser(userData);
    localStorage.setItem('goldConnectUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('goldConnectUser');
  };

  return { user, login, logout, loading };
};