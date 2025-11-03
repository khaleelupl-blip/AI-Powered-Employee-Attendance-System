import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('john.doe'); // Default to a valid employee for easier testing
  const [password, setPassword] = useState('123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      // The redirect will be handled by the App component
    } catch (err) {
      setError('Invalid username or password. Try one of the quick login options.');
    } finally {
      setLoading(false);
    }
  };

  const setCredentials = (user: string) => {
    setUsername(user);
    setPassword('123');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-white">
          <div className="text-center mb-8">
            <i className="fas fa-building text-4xl mb-3"></i>
            <h1 className="text-3xl font-bold">Attendance System</h1>
            <p className="text-indigo-200">Please sign in to continue</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-indigo-200 text-sm font-bold mb-2" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 focus:bg-white/30 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                placeholder="e.g., john.doe"
              />
            </div>
            <div className="mb-6">
              <label className="block text-indigo-200 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 focus:bg-white/30 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-300 text-center mb-4">{error}</p>}
            <div className="mb-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-indigo-600 font-bold py-3 px-4 rounded-lg hover:bg-indigo-100 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 transition transform hover:scale-105"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
             <div className="text-center text-sm text-indigo-200 mb-4">
                Quick Login As:
              </div>
            <div className="flex justify-center space-x-2">
             
              <button type="button" onClick={() => setCredentials('john.doe')} className="text-xs bg-indigo-500/50 hover:bg-indigo-500/80 px-3 py-1 rounded-full transition">Employee</button>
              <button type="button" onClick={() => setCredentials('jane.smith')} className="text-xs bg-purple-500/50 hover:bg-purple-500/80 px-3 py-1 rounded-full transition">Manager</button>
              <button type="button" onClick={() => setCredentials('admin')} className="text-xs bg-pink-500/50 hover:bg-pink-500/80 px-3 py-1 rounded-full transition">Admin</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;