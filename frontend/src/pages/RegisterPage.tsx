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

        {/* RGAA 4.1 — Critère 11.1 : rôle du groupe via fieldset/legend */}
        <fieldset className="mb-8">
          <legend className="sr-only">Je suis</legend>
          <div className="flex gap-3" role="group" aria-label="Type de compte">
            {(['CLIENT', 'COACH'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                aria-pressed={role === r}
                className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all border ${
                  role === r
                    ? 'bg-gold-500 text-navy-900 border-gold-500'
                    : 'bg-navy-800 text-gray-400 border-navy-600 hover:border-gold-500/50'
                }`}
              >
                {r === 'CLIENT' ? '🏃 Je suis Client' : '🏋️ Je suis Coach'}
              </button>
            ))}
          </div>
        </fieldset>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-label="Formulaire d'inscription">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-gray-300 mb-2">
                Nom complet <span aria-hidden="true" className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
                <input
                  id="reg-name"
                  className="input-field pl-10"
                  placeholder="Jean Dupont"
                  value={form.name}
                  onChange={set('name')}
                  required
                  aria-required="true"
                  autoComplete="name"
                />
              </div>
            </div>
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-gray-300 mb-2">
                Adresse email <span aria-hidden="true" className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
                <input
                  id="reg-email"
                  type="email"
                  className="input-field pl-10"
                  placeholder="vous@exemple.com"
                  value={form.email}
                  onChange={set('email')}
                  required
                  aria-required="true"
                  autoComplete="email"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-gray-300 mb-2">
              Mot de passe <span aria-hidden="true" className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
              <input
                id="reg-password"
                type={showPass ? 'text' : 'password'}
                className="input-field pl-10 pr-10"
                placeholder="6 caractères minimum"
                value={form.password}
                onChange={set('password')}
                minLength={6}
                required
                aria-required="true"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                aria-label={showPass ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                aria-pressed={showPass}
              >
                {showPass ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
          </div>

          {role === 'COACH' && (
            <div className="space-y-4 p-4 bg-navy-800/50 rounded-lg border border-navy-600">
              <p className="text-gold-400 text-sm font-medium" aria-live="polite">Paramètres du profil Coach</p>
              <div>
                <label htmlFor="reg-slug" className="block text-sm font-medium text-gray-300 mb-2">
                  Slug (URL unique)
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
                  <input
                    id="reg-slug"
                    className="input-field pl-10"
                    placeholder="jade-fit"
                    value={form.slug}
                    onChange={set('slug')}
                    pattern="[a-z0-9-]+"
                    aria-describedby="reg-slug-hint"
                    title="Lettres minuscules, chiffres et tirets uniquement"
                  />
                </div>
                <p id="reg-slug-hint" className="text-xs text-gray-500 mt-1">
                  ybuddy.com/apply/{form.slug || 'votre-slug'}
                </p>
              </div>
              <div>
                <label htmlFor="reg-headline" className="block text-sm font-medium text-gray-300 mb-2">
                  Accroche du profil
                </label>
                <input
                  id="reg-headline"
                  className="input-field"
                  placeholder="Entraînez-vous avec Jade"
                  value={form.publicProfileName}
                  onChange={set('publicProfileName')}
                  autoComplete="off"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full flex items-center justify-center gap-2 py-3 mt-2"
            aria-busy={loading}
          >
            {loading
              ? <><div className="w-5 h-5 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" aria-hidden="true" /><span className="sr-only">Création du compte en cours…</span></>
              : 'Créer mon compte'}
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
