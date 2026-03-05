import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Flame, Lock, User, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [error,      setError]       = useState('');
  const [loading,    setLoading]     = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
    const result = await login(identifier, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  } catch (err) {
    setError('Something went wrong. Please try again.');
  }
  setLoading(false);
};

  const fillCredentials = (u, p) => {
    setIdentifier(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#0c0b09] flex items-center justify-center px-4">

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[600px] h-[600px] bg-orange-700 opacity-5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">

        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16
            bg-orange-600 rounded-2xl mb-4 shadow-lg shadow-orange-900/50">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            CHARCOAL MANAGER
          </h1>
          <p className="text-stone-500 text-sm mt-2 tracking-widest uppercase">
            Liberia Business Tracker
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#161410] border border-[#302b22] rounded-2xl p-8 shadow-2xl">
          <h2 className="text-white font-bold text-lg mb-1">Welcome back</h2>
          <p className="text-stone-500 text-sm mb-8">
            Sign in with your username or email address
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username or Email */}
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2
                  w-4 h-4 text-stone-600" />
                <input
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="Username or email address"
                  className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg
                    pl-10 pr-4 py-3 text-white text-sm placeholder-stone-700
                    focus:outline-none focus:border-orange-600 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2
                  w-4 h-4 text-stone-600" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg
                    pl-10 pr-4 py-3 text-white text-sm placeholder-stone-700
                    focus:outline-none focus:border-orange-600 transition-colors"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-950/50
                border border-red-800/50 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50
                disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg
                transition-colors text-sm tracking-wide"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>
        </div>

        {/* Test accounts */}
        <div className="mt-4 bg-[#161410] border border-[#302b22] rounded-xl p-4">
          <p className="text-stone-600 text-xs uppercase tracking-widest mb-3">
            Test Accounts — click to fill
          </p>
          <div className="space-y-1">
            {[
              
              { user: 'viewer',     email: 'viewer@charcoal.com',     pass: 'viewer123',  role: 'Viewer'      },
            ].map(a => (
              <button
                key={a.user}
                type="button"
                onClick={() => fillCredentials(a.user, a.pass)}
                className="w-full flex justify-between items-center text-xs
                  px-3 py-2 rounded-lg hover:bg-[#27231b] transition-colors text-left"
              >
                <span className={`font-medium w-24 ${
                  a.role === 'Super Admin' ? 'text-yellow-400' : 'text-stone-500'
                }`}>
                  {a.role}
                </span>
                <span className="text-stone-600 font-mono text-[10px] flex-1 text-center">
                  {a.email}
                </span>
                <span className="text-stone-400 font-mono">
                  {a.pass}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;