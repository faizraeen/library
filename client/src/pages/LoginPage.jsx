import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Shield, User, Loader2, ArrowRight } from 'lucide-react';

const LoginPage = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-forest-900 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            LibraChain
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Decentralized Library Management System • Ethereum Sepolia
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-7 shadow-card">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Sign In to Your Account
          </h2>
          <p className="text-xs text-gray-500 mb-5">
            Enter your academic email and password to access library services.
          </p>

          {error && (
            <div className="p-3 mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Academic Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="e.g. student@librachain.edu"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-800 text-sm"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-800 text-sm font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-forest-900 hover:bg-forest-950 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider mb-2 text-center">
              One-Click Demo Credentials
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleFillDemo('admin@librachain.edu', 'Admin@123456')}
                className="p-2 rounded-lg border border-forest-200 bg-forest-50/60 hover:bg-forest-100/70 text-forest-900 flex flex-col items-center justify-center text-center transition-colors"
              >
                <Shield className="w-3.5 h-3.5 mb-1 text-forest-700" />
                <span className="font-bold text-[11px]">Librarian Admin</span>
                <span className="text-[10px] text-forest-700 font-mono">admin@librachain.edu</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('student@librachain.edu', 'Student@123456')}
                className="p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800 flex flex-col items-center justify-center text-center transition-colors"
              >
                <User className="w-3.5 h-3.5 mb-1 text-gray-600" />
                <span className="font-bold text-[11px]">Alex Mercer</span>
                <span className="text-[10px] text-gray-500 font-mono">student@librachain.edu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-5 text-xs text-gray-500">
          Need a new account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-forest-800 font-semibold hover:underline"
          >
            Register Student Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
