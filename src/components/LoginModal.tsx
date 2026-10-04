import React, { useState } from 'react';
import { api } from '../services/api';
import { Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@marketing.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ email, password });
      localStorage.setItem('mca_admin_jwt_token', res.token);
      onLoginSuccess(res.user, res.token);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl space-y-6 border border-slate-200">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-xl shadow-md">
            Δ
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Admin System Authentication</h2>
          <p className="text-xs text-slate-500">
            Sign in to access the Digital Marketing Analytics and Campaign Optimization Engine
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Administrator Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Security Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Quick Demo Credentials Box */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Pre-Seeded MCA Admin Account
            </span>
            <div className="text-[11px] text-slate-600 font-mono space-y-0.5">
              <div>Email: <strong>admin@marketing.com</strong></div>
              <div>Password: <strong>admin123</strong> (bcrypt hashed)</div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In as System Admin'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-4">
          MCA Academic Project · JWT Secure Access Control
        </div>
      </div>
    </div>
  );
};
