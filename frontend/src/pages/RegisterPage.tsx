import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Dumbbell, Mail, Lock, User, Briefcase, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'CLIENT' | 'COACH'>('CLIENT');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', name: '', slug: '', publicProfileName: '',
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...form, role });
      toast.success('Account created!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-8">
          <Dumbbell className="text-gold-500 w-7 h-7" />
          <span className="font-display text-2xl font-bold">Y<span className="text-gold-500">buddy</span></span>
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">Create your account</h2>
        <p className="text-gray-400 mb-8">Join Ybuddy and start your fitness journey</p>

        {/* Role toggle */}
        <div className="flex gap-3 mb-8">
          {(['CLIENT', 'COACH'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all border ${
                role === r
                  ? 'bg-gold-500 text-navy-900 border-gold-500'
                  : 'bg-navy-800 text-gray-400 border-navy-600 hover:border-gold-500/50'
              }`}
            >
              {r === 'CLIENT' ? '🏃 I am a Client' : '🏋️ I am a Coach'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input className="input-field pl-10" placeholder="John Doe" value={form.name} onChange={set('name')} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="email" className="input-field pl-10" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showPass ? 'text' : 'password'}
                className="input-field pl-10 pr-10"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={set('password')}
                minLength={6}
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {role === 'COACH' && (
            <div className="space-y-4 p-4 bg-navy-800/50 rounded-lg border border-navy-600">
              <p className="text-gold-400 text-sm font-medium">Coach profile settings</p>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Slug (unique URL)</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    className="input-field pl-10"
                    placeholder="jade-fit"
                    value={form.slug}
                    onChange={set('slug')}
                    pattern="[a-z0-9-]+"
                    title="Lowercase letters, numbers, and hyphens only"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">ybuddy.com/apply/{form.slug || 'your-slug'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Profile Headline</label>
                <input className="input-field" placeholder="Train with Jade" value={form.publicProfileName} onChange={set('publicProfileName')} />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2 py-3 mt-2">
            {loading ? <div className="w-5 h-5 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-gold-400 hover:text-gold-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
