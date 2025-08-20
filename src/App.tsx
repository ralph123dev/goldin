import React from 'react';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Admin from './components/Admin';

function App() {
  const { user, login, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-yellow-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={login} />;
  }

  if (user.isAdmin) {
    return <Admin onLogout={logout} />;
  }

  return <Dashboard userName={user.name} onLogout={logout} />;
}

export default App;