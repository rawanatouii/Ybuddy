import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Dumbbell, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('reason') === 'session-expired') {
      toast.error('Votre session a expiré. Veuillez vous reconnecter.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex">
      {/* Left visual */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-navy-800 border-r border-navy-700 relative overflow-hidden p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gold-500/5 blur-3xl" />
        <Dumbbell className="w-20 h-20 text-gold-500 mb-8 relative z-10" />
        <h1 className="font-display text-5xl font-bold text-white tracking-wide relative z-10">
          Y<span className="text-gold-500">buddy</span>
        </h1>
        <p className="text-gray-400 mt-4 text-center max-w-sm relative z-10">
          Your personal coaching platform. Connect with elite coaches and transform your fitness journey.
        </p>
        <div className="mt-12 grid grid-cols-3 gap-4 w-full max-w-xs relative z-10">
          {['Strength', 'Nutrition', 'Recovery', 'Cardio', 'Mobility', 'Mindset'].map((t) => (
            <div key={t} className="bg-navy-700/60 rounded-lg px-3 py-2 text-center text-xs text-gold-400 border border-navy-600">
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Dumbbell className="text-gold-500 w-7 h-7" />
            <span className="font-display text-2xl font-bold">Y<span className="text-gold-500">buddy</span></span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-gray-400 mb-8">Sign in to your account</p>

          {/* RGAA 4.1 — Critère 11.1 : chaque champ a un label associé via htmlFor/id */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate aria-label="Formulaire de connexion">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-300 mb-2">
                Adresse email <span aria-hidden="true" className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  className="input-field pl-10"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-required="true"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe <span aria-hidden="true" className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-required="true"
                  autoComplete="current-password"
                />
                {/* RGAA 4.1 — Critère 11.9 : bouton avec aria-label explicite */}
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  aria-label={showPass ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  aria-pressed={showPass}
                >
                  {showPass ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full flex items-center justify-center gap-2 py-3"
              aria-busy={loading}
            >
              {loading
                ? <><div className="w-5 h-5 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" aria-hidden="true" /><span className="sr-only">Connexion en cours…</span></>
                : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold-400 hover:text-gold-300 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
