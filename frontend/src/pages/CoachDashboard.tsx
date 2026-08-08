import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { requestsApi, programsApi } from '../services/api';
import { Link } from 'react-router-dom';
import { Users, Plus, Check, X, Clock, Calendar, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CoachDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<number | null>(null);

  const load = () => Promise.all([
    requestsApi.getCoachRequests().then((r) => setRequests(r.data)),
    programsApi.getCoachPrograms().then((r) => setPrograms(r.data)),
  ]).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleStatus = async (id: number, status: string) => {
    try {
      await requestsApi.updateStatus(id, status);
      toast.success(`Request ${status}`);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update request');
    }
  };

  const createProgram = async (clientId: number) => {
    setCreating(clientId);
    try {
      const { data } = await programsApi.create({ clientId, duration: '4 weeks', days: 7 });
      toast.success('Program created!');
      window.location.href = `/coach/program/${data.id}`;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create program');
    } finally {
      setCreating(null);
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/apply/${user?.slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied!');
  };

  if (loading) return <div className="flex justify-center pt-20"><div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>;

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const approvedRequests = requests.filter((r) => r.status === 'approved');

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Coach Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome, {user?.name || user?.email}</p>
        </div>
        {user?.slug && (
          <button onClick={copyLink} className="flex items-center gap-2 btn-outline text-sm">
            <Copy className="w-4 h-4" />
            Copy my link
          </button>
        )}
      </div>

      {user?.slug && (
        <div className="card border-gold-500/30 mb-6">
          <p className="text-sm text-gray-400 mb-1">Your unique application link:</p>
          <p className="text-gold-400 font-mono text-sm">{window.location.origin}/apply/{user.slug}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Pending', value: pendingRequests.length, icon: Clock, color: 'text-yellow-400' },
          { label: 'Clients', value: approvedRequests.length, icon: Users, color: 'text-green-400' },
          { label: 'Programs', value: programs.length, icon: Calendar, color: 'text-gold-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card text-center">
            <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-gray-400 text-sm">{label}</p>
          </div>
        ))}
      </div>

      {/* Pending requests */}
      {pendingRequests.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" /> New Applications
          </h2>
          <div className="space-y-3">
            {pendingRequests.map((r) => (
              <div key={r.id} className="card border-yellow-500/20">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-white">{r.client?.name}</p>
                    <p className="text-gray-400 text-sm">{r.client?.user?.email}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {r.client?.goal && <span className="badge-gold">{r.client.goal}</span>}
                      {r.client?.activityLevel && <span className="badge-gray">{r.client.activityLevel}</span>}
                      {r.client?.workoutFrequency && <span className="badge-gray">{r.client.workoutFrequency}x/week</span>}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {r.client?.height && `${r.client.height}cm`} {r.client?.weight && `· ${r.client.weight}kg`}
                      {r.client?.diet && ` · ${r.client.diet}`}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => handleStatus(r.id, 'approved')} className="flex items-center gap-1 bg-green-500/20 hover:bg-green-500/40 text-green-400 px-3 py-1.5 rounded-lg text-sm transition-all">
                      <Check className="w-4 h-4" /> Accept
                    </button>
                    <button onClick={() => handleStatus(r.id, 'rejected')} className="flex items-center gap-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-1.5 rounded-lg text-sm transition-all">
                      <X className="w-4 h-4" /> Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Approved clients / programs */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-gold-500" /> My Clients
        </h2>
        {approvedRequests.length === 0 ? (
          <div className="card text-center text-gray-400 py-8">No clients yet. Share your link to get started.</div>
        ) : (
          <div className="space-y-3">
            {approvedRequests.map((r) => {
              const clientProgram = programs.find((p) => p.client?.id === r.client?.id);
              return (
                <div key={r.id} className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{r.client?.name}</p>
                      <p className="text-gray-400 text-sm">{r.client?.goal} · {r.client?.workoutFrequency}x/week</p>
                    </div>
                    <div className="flex gap-2">
                      {clientProgram ? (
                        <Link to={`/coach/program/${clientProgram.id}`} className="btn-outline text-sm">
                          Edit Program
                        </Link>
                      ) : (
                        <button
                          onClick={() => createProgram(r.client.id)}
                          disabled={creating === r.client.id}
                          className="btn-gold text-sm flex items-center gap-1"
                        >
                          {creating === r.client.id ? <div className="w-4 h-4 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" /> : <><Plus className="w-4 h-4" /> Create Program</>}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
