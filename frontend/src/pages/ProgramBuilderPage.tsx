import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { programsApi, exercisesApi } from '../services/api';
import { ArrowLeft, Dumbbell, BedDouble, Plus, Trash2, Send, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const MUSCLE_GROUPS = ['all', 'chest', 'back', 'shoulders', 'arms', 'legs', 'glutes', 'core', 'cardio', 'full_body'];

export default function ProgramBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const [program, setProgram] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [activeDay, setActiveDay] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [addingEx, setAddingEx] = useState<number | null>(null);

  const load = async () => {
    const [prog, exs] = await Promise.all([
      programsApi.getById(+id!),
      exercisesApi.getAll(),
    ]);
    setProgram(prog.data);
    setExercises(exs.data);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, [id]);

  const toggleDayType = async (day: any) => {
    const newType = day.type === 'rest' ? 'workout' : 'rest';
    try {
      await programsApi.setDayType(day.id, newType);
      await load();
    } catch { toast.error('Failed to update day'); }
  };

  const addExercise = async (exerciseId: number) => {
    if (!sortedDays[activeDay]) return;
    const day = sortedDays[activeDay];
    if (day.type === 'rest') { toast.error('Toggle to workout first'); return; }
    setAddingEx(exerciseId);
    try {
      await programsApi.addExercise(day.id, { exerciseId, sets: 3, reps: 10 });
      await load();
      toast.success('Exercise added');
    } catch { toast.error('Failed to add exercise'); }
    finally { setAddingEx(null); }
  };

  const removeExercise = async (peId: number) => {
    try {
      await programsApi.removeExercise(peId);
      await load();
    } catch { toast.error('Failed to remove'); }
  };

  const sendProgram = async () => {
    setSending(true);
    try {
      await programsApi.send(+id!);
      toast.success('Program sent to client!');
      await load();
    } catch { toast.error('Failed to send'); }
    finally { setSending(false); }
  };

  if (loading) return <div className="flex justify-center pt-20"><div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!program) return <div className="text-center text-gray-400 pt-20">Program not found.</div>;

  const sortedDays = [...(program.days || [])].sort((a: any, b: any) => a.dayNumber - b.dayNumber);
  const currentDay = sortedDays[activeDay];
  const filteredExercises = filter === 'all' ? exercises : exercises.filter((e) => e.muscleGroup === filter);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/coach" className="text-gray-400 hover:text-gold-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Program Builder</h1>
            <p className="text-gray-400 text-sm">Client: {program.client?.name} · {program.duration}</p>
          </div>
        </div>
        {!program.sent ? (
          <button onClick={sendProgram} disabled={sending} className="btn-gold flex items-center gap-2">
            {sending ? <div className="w-4 h-4 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Send to Client</>}
          </button>
        ) : (
          <span className="badge-green text-sm px-4 py-2">✓ Sent to Client</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Day calendar */}
        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Training Days</h2>
          <div className="space-y-2">
            {sortedDays.map((day: any, idx: number) => (
              <div
                key={day.id}
                className={`rounded-xl border p-3 cursor-pointer transition-all ${
                  activeDay === idx
                    ? 'border-gold-500 bg-gold-500/10'
                    : 'border-navy-700 bg-navy-800 hover:border-navy-500'
                }`}
                onClick={() => setActiveDay(idx)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {day.type === 'rest'
                      ? <BedDouble className="w-4 h-4 text-blue-400" />
                      : <Dumbbell className="w-4 h-4 text-gold-500" />}
                    <span className="text-sm font-medium text-white">Day {day.dayNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${day.type === 'rest' ? 'text-blue-400' : 'text-gold-400'}`}>
                      {day.type === 'rest' ? 'Rest' : `${day.exercises?.length || 0} ex`}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleDayType(day); }}
                      className={`text-xs px-2 py-0.5 rounded transition-all ${day.type === 'rest' ? 'bg-gold-500/20 text-gold-400 hover:bg-gold-500/40' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/40'}`}
                    >
                      {day.type === 'rest' ? 'Workout' : 'Rest'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle: Current day exercises */}
        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Day {currentDay?.dayNumber} Exercises
          </h2>
          {currentDay?.type === 'rest' ? (
            <div className="card text-center py-10 text-gray-400">
              <BedDouble className="w-10 h-10 mx-auto mb-3 text-blue-400" />
              <p>Rest day — no exercises</p>
              <button onClick={() => toggleDayType(currentDay)} className="btn-outline mt-4 text-sm">Switch to Workout</button>
            </div>
          ) : (
            <div className="space-y-2">
              {currentDay?.exercises?.length === 0 && (
                <div className="card text-center text-gray-400 py-6">Add exercises from the catalogue →</div>
              )}
              {currentDay?.exercises?.map((pe: any) => (
                <div key={pe.id} className="card flex items-center gap-3">
                  {pe.exercise.gifUrl ? (
                    <img src={pe.exercise.gifUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-navy-700 rounded-lg flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-gold-500/50" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{pe.exercise.name}</p>
                    <p className="text-xs text-gold-400">{pe.sets}×{pe.reps}</p>
                  </div>
                  <button onClick={() => removeExercise(pe.id)} className="text-red-400/60 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Exercise catalogue */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Catalogue
            </h2>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {MUSCLE_GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => setFilter(g)}
                className={`text-xs px-2.5 py-1 rounded-full transition-all capitalize ${
                  filter === g ? 'bg-gold-500 text-navy-900 font-semibold' : 'bg-navy-700 text-gray-400 hover:bg-navy-600'
                }`}
              >
                {g.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filteredExercises.length === 0 && (
              <p className="text-center text-gray-500 py-6 text-sm">No exercises found.</p>
            )}
            {filteredExercises.map((ex: any) => (
              <div key={ex.id} className="card flex items-center gap-3 py-3">
                {ex.gifUrl ? (
                  <img src={ex.gifUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 bg-navy-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-4 h-4 text-gold-500/50" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{ex.name}</p>
                  <p className="text-xs text-gold-400 capitalize">{ex.muscleGroup?.replace('_', ' ')}</p>
                </div>
                <button
                  onClick={() => addExercise(ex.id)}
                  disabled={addingEx === ex.id}
                  className="text-gold-400 hover:text-gold-300 transition-colors flex-shrink-0"
                >
                  {addingEx === ex.id ? <div className="w-4 h-4 border border-gold-500 border-t-transparent rounded-full animate-spin" /> : <Plus className="w-5 h-5" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
