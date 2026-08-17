import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Dumbbell, CheckCircle, XCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setErrorMsg('Lien de vérification invalide.');
      return;
    }

    authApi.verifyEmail(token)
      .then(({ data }) => {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setStatus('success');
        setTimeout(() => { window.location.href = '/'; }, 2500);
      })
      .catch((err) => {
        setStatus('error');
        setErrorMsg(err.response?.data?.message || 'Lien invalide ou expiré.');
      });
  }, []);

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Dumbbell className="text-gold-500 w-7 h-7" />
          <span className="font-display text-2xl font-bold">Y<span className="text-gold-500">buddy</span></span>
        </div>

        <div className="bg-navy-800 rounded-2xl p-8 border border-navy-600">
          {status === 'loading' && (
            <>
              <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white">Vérification en cours…</h2>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-gold-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Email vérifié !</h2>
              <p className="text-gray-400">Votre compte est activé. Redirection vers votre espace…</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Erreur de vérification</h2>
              <p className="text-gray-400 mb-6">{errorMsg}</p>
              <Link to="/login" className="btn-gold inline-block px-6 py-2 rounded-lg font-semibold">
                Retour à la connexion
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
