import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { clientsApi, requestsApi, programsApi } from '../services/api';
import { Link } from 'react-router-dom';
import { Clock, Dumbbell, CheckCircle, XCircle, Calendar, User, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const statusBadge = (s: string) => {
  if (s === 'approved') return <span className="badge-green">Approved</span>;
  if (s === 'rejected') return <span className="badge-red">Rejected</span>;
  return <span className="badge-gray flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
};

export default function ClientDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      clientsApi.getProfile().then((r) => setProfile(r.data)).catch(() => null),
      requestsApi.getClientRequests().then((r) => setRequests(r.data)).catch(() => []),
      programsApi.getClientPrograms().then((r) => setPrograms(r.data)).catch(() => []),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gold-500/20 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-gold-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome, {user?.name || 'Athlete'}</h1>
          <p className="text-gray-400 text-sm">Your coaching dashboard</p>
        </div>
      </div>

      {/* No profile yet */}
      {!profile && (
        <div className="card border-gold-500/40 mb-8 text-center py-10">
          <Dumbbell className="w-12 h-12 text-gold-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Complete your profile</h3>
          <p className="text-gray-400 mb-6">Apply to a coach to get started. Visit a coach's unique link to fill your form.</p>
          <p className="text-gold-400 text-sm">e.g. <span className="font-mono bg-navy-700 px-2 py-1 rounded">ybuddy.com/apply/jade-fit</span></p>
        </div>
      )}

      {/* Programs */}
      {programs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gold-500" /> My Programs
          </h2>
          <div className="grid gap-4">
            {programs.map((prog) => (
              <Link to={`/client/program/${prog.id}`} key={prog.id} className="card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">Program by {prog.coach?.name || prog.coach?.email}</p>
                    <p className="text-gray-400 text-sm">{prog.duration} · {prog.days?.length} days</p>
                  </div>
                  <span className="badge-gold">View →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Requests */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gold-500" /> Applications
        </h2>
        {requests.length === 0 ? (
          <div className="card text-center text-gray-400 py-8">No applications yet.</div>
        ) : (
          <div className="grid gap-3">
            {requests.map((r) => (
              <div key={r.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Coach: {r.coach?.name || r.coach?.email}</p>
                  <p className="text-gray-400 text-xs mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {statusBadge(r.status)}
                  {r.status === 'pending' && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 animate-pulse">
                      <Clock className="w-3 h-3" /> Waiting for coach...
                    </p>
                  )}
                  {r.status === 'approved' && programs.length === 0 && (
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Program coming soon
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
