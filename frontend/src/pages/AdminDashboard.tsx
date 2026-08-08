import { useEffect, useState } from 'react';
import { adminApi, exercisesApi } from '../services/api';
import { Users, Dumbbell, Calendar, UserCheck, Shield, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const MUSCLE_GROUPS = ['chest', 'back', 'shoulders', 'arms', 'legs', 'glutes', 'core', 'cardio', 'full_body'];

const ROLE_BADGE: Record<string, string> = {
  ADMIN: 'badge-gold',
  COACH: 'bg-blue-500/20 text-blue-400 border border-blue-500/30 badge',
  CLIENT: 'badge-gray',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [tab, setTab] = useState<'stats' | 'exercises' | 'users'>('stats');
  const [newEx, setNewEx] = useState({ name: '', muscleGroup: MUSCLE_GROUPS[0], gifUrl: '', description: '' });
  const [editingEx, setEditingEx] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [filterMuscle, setFilterMuscle] = useState('all');

  const load = async () => {
    const [s, u, e] = await Promise.all([
      adminApi.getStats(),
      adminApi.getUsers(),
      exercisesApi.getAll(),
    ]);
    setStats(s.data);
    setUsers(u.data);
    setExercises(e.data);
  };

  useEffect(() => { load(); }, []);

  const createExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await exercisesApi.create(newEx);
      toast.success('Exercise added!');
      setNewEx({ name: '', muscleGroup: MUSCLE_GROUPS[0], gifUrl: '', description: '' });
      await load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to create exercise'); }
    finally { setSaving(false); }
  };

  const saveEdit = async () => {
    if (!editingEx) return;
    setSaving(true);
    try {
      await exercisesApi.update(editingEx.id, editingEx);
      toast.success('Updated!');
      setEditingEx(null);
      await load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to update exercise'); }
    finally { setSaving(false); }
  };

  const deleteExercise = async (id: number) => {
    if (!confirm('Delete this exercise?')) return;
    try {
      await exercisesApi.delete(id);
      toast.success('Deleted');
      await load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to delete exercise'); }
  };

  const filteredEx = filterMuscle === 'all' ? exercises : exercises.filter((e) => e.muscleGroup === filterMuscle);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-gold-500" />
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 text-sm">Ybuddy management console</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-navy-700 pb-0">
        {(['stats', 'exercises', 'users'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${
              tab === t ? 'border-gold-500 text-gold-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Stats tab */}
      {tab === 'stats' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
            { label: 'Coaches', value: stats.totalCoaches, icon: UserCheck, color: 'text-gold-400' },
            { label: 'Clients', value: stats.totalClients, icon: Users, color: 'text-green-400' },
            { label: 'Programs', value: stats.totalPrograms, icon: Calendar, color: 'text-purple-400' },
            { label: 'Exercises', value: exercises.length, icon: Dumbbell, color: 'text-red-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card text-center">
              <Icon className={`w-7 h-7 ${color} mx-auto mb-3`} />
              <p className="text-4xl font-bold text-white">{value}</p>
              <p className="text-gray-400 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Exercises tab */}
      {tab === 'exercises' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add form */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Add Exercise</h2>
            <form onSubmit={createExercise} className="card space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input className="input-field" placeholder="Bench Press" value={newEx.name} onChange={(e) => setNewEx((p) => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Muscle Group</label>
                <select className="input-field" value={newEx.muscleGroup} onChange={(e) => setNewEx((p) => ({ ...p, muscleGroup: e.target.value }))}>
                  {MUSCLE_GROUPS.map((g) => <option key={g} value={g} className="capitalize">{g.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">GIF URL (optional)</label>
                <input className="input-field" placeholder="https://..." value={newEx.gifUrl} onChange={(e) => setNewEx((p) => ({ ...p, gifUrl: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <input className="input-field" placeholder="Brief description" value={newEx.description} onChange={(e) => setNewEx((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <button type="submit" disabled={saving} className="btn-gold w-full flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" /> : <><Plus className="w-4 h-4" /> Add Exercise</>}
              </button>
            </form>
          </div>

          {/* Exercise list */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Catalogue ({exercises.length})</h2>
              <select className="input-field w-auto text-sm py-1.5" value={filterMuscle} onChange={(e) => setFilterMuscle(e.target.value)}>
                <option value="all">All muscles</option>
                {MUSCLE_GROUPS.map((g) => <option key={g} value={g} className="capitalize">{g.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredEx.map((ex: any) => (
                <div key={ex.id} className="card py-3">
                  {editingEx?.id === ex.id ? (
                    <div className="space-y-2">
                      <input className="input-field text-sm py-2" value={editingEx.name} onChange={(e) => setEditingEx((p: any) => ({ ...p, name: e.target.value }))} />
                      <input className="input-field text-sm py-2" placeholder="GIF URL" value={editingEx.gifUrl || ''} onChange={(e) => setEditingEx((p: any) => ({ ...p, gifUrl: e.target.value }))} />
                      <div className="flex gap-2">
                        <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1 bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm hover:bg-green-500/40">
                          <Check className="w-3 h-3" /> Save
                        </button>
                        <button onClick={() => setEditingEx(null)} className="flex items-center gap-1 bg-red-500/10 text-red-400 px-3 py-1 rounded text-sm hover:bg-red-500/20">
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {ex.gifUrl ? <img src={ex.gifUrl} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 bg-navy-700 rounded-lg flex items-center justify-center"><Dumbbell className="w-4 h-4 text-gold-500/50" /></div>}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{ex.name}</p>
                        <p className="text-xs text-gold-400 capitalize">{ex.muscleGroup?.replace('_', ' ')}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingEx(ex)} className="text-gray-400 hover:text-gold-400 transition-colors p-1"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteExercise(ex.id)} className="text-gray-400 hover:text-red-400 transition-colors p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {filteredEx.length === 0 && <p className="text-center text-gray-500 py-8">No exercises found.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">All Users ({users.length})</h2>
          <div className="card overflow-hidden p-0">
            <table className="w-full">
              <thead className="bg-navy-700">
                <tr>
                  {['ID', 'Name', 'Email', 'Role', 'Slug', 'Joined'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-navy-700/40 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-sm">#{u.id}</td>
                    <td className="px-4 py-3 text-white text-sm font-medium">{u.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={ROLE_BADGE[u.role] || 'badge-gray'}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm font-mono">{u.slug || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
