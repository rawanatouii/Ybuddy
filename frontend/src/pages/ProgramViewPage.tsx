import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { programsApi } from '../services/api';
import { ArrowLeft, Dumbbell, BedDouble, ChevronDown, ChevronUp } from 'lucide-react';

export default function ProgramViewPage() {
  const { id } = useParams<{ id: string }>();
  const [program, setProgram] = useState<any>(null);
  const [openDay, setOpenDay] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    programsApi.getById(+id!).then((r) => setProgram(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center pt-20"><div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!program) return <div className="text-center text-gray-400 pt-20">Program not found.</div>;

  const sortedDays = [...(program.days || [])].sort((a: any, b: any) => a.dayNumber - b.dayNumber);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link to="/client" className="flex items-center gap-2 text-gray-400 hover:text-gold-400 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="card border-gold-500/30 mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Your Training Program</h1>
        <p className="text-gray-400 text-sm">By {program.coach?.name || program.coach?.email} · {program.duration}</p>
      </div>

      <div className="space-y-3">
        {sortedDays.map((day: any, idx: number) => (
          <div key={day.id} className={`rounded-xl border overflow-hidden transition-all ${day.type === 'rest' ? 'border-navy-600' : 'border-navy-600 hover:border-gold-500/50'}`}>
            <button
              className="w-full flex items-center justify-between px-5 py-4 bg-navy-800"
              onClick={() => setOpenDay(openDay === idx ? null : idx)}
            >
              <div className="flex items-center gap-3">
                {day.type === 'rest'
                  ? <BedDouble className="w-5 h-5 text-blue-400" />
                  : <Dumbbell className="w-5 h-5 text-gold-500" />}
                <span className="font-semibold text-white">Day {day.dayNumber}</span>
                <span className={`badge ${day.type === 'rest' ? 'badge-gray' : 'badge-gold'}`}>
                  {day.type === 'rest' ? 'Rest Day' : `${day.exercises?.length || 0} exercises`}
                </span>
              </div>
              {day.type !== 'rest' && (
                openDay === idx ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {openDay === idx && day.type === 'workout' && (
              <div className="bg-navy-900 divide-y divide-navy-800">
                {day.exercises?.length === 0 && (
                  <p className="text-center text-gray-500 py-6 text-sm">No exercises yet.</p>
                )}
                {day.exercises?.map((pe: any) => (
                  <div key={pe.id} className="flex items-center gap-4 px-5 py-4">
                    {pe.exercise.gifUrl ? (
                      <img src={pe.exercise.gifUrl} alt={pe.exercise.name} className="w-16 h-16 rounded-lg object-cover bg-navy-800" />
                    ) : (
                      <div className="w-16 h-16 bg-navy-800 rounded-lg flex items-center justify-center">
                        <Dumbbell className="w-6 h-6 text-gold-500/50" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-white">{pe.exercise.name}</p>
                      <p className="text-xs text-gold-400 capitalize mt-0.5">{pe.exercise.muscleGroup?.replace('_', ' ')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{pe.sets} sets</p>
                      <p className="text-gold-400 text-sm">{pe.reps} reps</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
