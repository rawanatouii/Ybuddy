import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { coachesApi, clientsApi, requestsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Dumbbell, User, ChevronRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const GOALS = ['Prise de masse', 'Sèche', 'Perte de poids', 'Maintien', 'Performance', 'Remise en forme'];
const ACTIVITY = ['Sedentary', 'Lightly active', 'Moderately active', 'Very active', 'Extra active'];
const DIETS = ['Normal', 'Vegetarian', 'Vegan', 'Junk food', 'Keto', 'Mediterranean'];
const DISEASES = ['None', 'Diabetes', 'Hypertension', 'Asthma', 'Heart condition', 'Other'];
const INJURIES = ['None', 'Knee injury', 'Back pain', 'Shoulder injury', 'Ankle injury', 'Other'];
const FREQ = [3, 4, 5];

export default function ApplyPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coach, setCoach] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', age: '', height: '', weight: '', work: '', goal: GOALS[0],
    diseases: DISEASES[0], injuries: INJURIES[0], activityLevel: ACTIVITY[0],
    diet: DIETS[0], workoutFrequency: 3,
  });

  useEffect(() => {
    coachesApi.getBySlug(slug!).then((r) => setCoach(r.data)).catch(() => toast.error('Coach not found'));
  }, [slug]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate(`/register?redirect=/apply/${slug}`); return; }
    setLoading(true);
    try {
      await clientsApi.saveProfile({
        ...form,
        age: +form.age, height: +form.height, weight: +form.weight,
      });
      await requestsApi.create(slug!);
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-white mb-3">Form Sent!</h2>
        <p className="text-gray-400 mb-6">Your form has been sent to <span className="text-gold-400">{coach?.publicProfileName || coach?.name}</span>. You'll receive an email when your program is ready.</p>
        <div className="card border-gold-500/30 mb-6">
          <p className="text-gold-400 font-medium animate-pulse">⏳ Waiting for coach response...</p>
        </div>
        <Link to="/client" className="btn-gold">Go to Dashboard</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Header */}
      <div className="bg-navy-800 border-b border-navy-700 px-6 py-4 flex items-center gap-3">
        <Dumbbell className="text-gold-500 w-7 h-7" />
        <span className="font-display text-2xl font-bold">Y<span className="text-gold-500">buddy</span></span>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {coach && (
          <div className="card border-gold-500/30 mb-8 flex items-center gap-4">
            <div className="w-14 h-14 bg-gold-500/20 rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-gold-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">You're applying to train with</p>
              <h2 className="text-xl font-bold text-white">{coach.publicProfileName || coach.name}</h2>
              <p className="text-gold-400 text-sm">@{coach.slug}</p>
            </div>
          </div>
        )}

        {!user && (
          <div className="card border-yellow-500/30 mb-6 text-center">
            <p className="text-yellow-400 mb-3">You need an account to apply.</p>
            <div className="flex gap-3 justify-center">
              <Link to={`/register`} className="btn-gold text-sm">Create Account</Link>
              <Link to={`/login`} className="btn-outline text-sm">Sign In</Link>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? 'bg-gold-500' : 'bg-navy-700'}`} />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Personal Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                  <input className="input-field" placeholder="John Doe" value={form.name} onChange={set('name')} required />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Age</label>
                  <input type="number" className="input-field" placeholder="25" value={form.age} onChange={set('age')} min={10} max={100} required />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Occupation</label>
                  <input className="input-field" placeholder="Software Engineer" value={form.work} onChange={set('work')} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Height (cm)</label>
                  <input type="number" className="input-field" placeholder="175" value={form.height} onChange={set('height')} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Weight (kg)</label>
                  <input type="number" className="input-field" placeholder="70" value={form.weight} onChange={set('weight')} />
                </div>
              </div>
              <button type="button" onClick={() => setStep(2)} className="btn-gold w-full flex items-center justify-center gap-2">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Health & Fitness</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Primary Goal</label>
                  <select className="input-field" value={form.goal} onChange={set('goal')}>
                    {GOALS.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Activity Level</label>
                  <select className="input-field" value={form.activityLevel} onChange={set('activityLevel')}>
                    {ACTIVITY.map((a) => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Medical Conditions</label>
                  <select className="input-field" value={form.diseases} onChange={set('diseases')}>
                    {DISEASES.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Injuries</label>
                  <select className="input-field" value={form.injuries} onChange={set('injuries')}>
                    {INJURIES.map((i) => <option key={i}>{i}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1">Back</button>
                <button type="button" onClick={() => setStep(3)} className="btn-gold flex-1 flex items-center justify-center gap-2">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Lifestyle</h3>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Diet Type</label>
                <select className="input-field" value={form.diet} onChange={set('diet')}>
                  {DIETS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-3">Workout Frequency per Week</label>
                <div className="flex gap-3">
                  {FREQ.map((f) => (
                    <button
                      key={f} type="button"
                      onClick={() => setForm((prev) => ({ ...prev, workoutFrequency: f }))}
                      className={`flex-1 py-3 rounded-lg font-bold text-lg transition-all border ${
                        form.workoutFrequency === f
                          ? 'bg-gold-500 text-navy-900 border-gold-500'
                          : 'bg-navy-800 text-gray-400 border-navy-600'
                      }`}
                    >
                      {f}x
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">days per week</p>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setStep(2)} className="btn-outline flex-1">Back</button>
                <button type="submit" disabled={loading || !user} className="btn-gold flex-1 flex items-center justify-center gap-2">
                  {loading ? <div className="w-5 h-5 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" /> : 'Submit Application'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
