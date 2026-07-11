import { useEffect } from 'react';
import { X, Dumbbell } from 'lucide-react';

interface Exercise {
  name: string;
  muscleGroup?: string;
  videoUrl?: string;
  gifUrl?: string;
  description?: string;
  instructions?: string;
}

interface Props {
  exercise: Exercise | null;
  onClose: () => void;
}

export default function ExerciseModal({ exercise, onClose }: Props) {
  useEffect(() => {
    if (!exercise) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [exercise, onClose]);

  if (!exercise) return null;

  const steps = exercise.instructions
    ? exercise.instructions.split('\n').filter(Boolean)
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-navy-900 border border-navy-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-navy-800">
          <div>
            <h2 className="text-lg font-bold text-white">{exercise.name}</h2>
            {exercise.muscleGroup && (
              <span className="text-xs text-gold-400 capitalize">
                {exercise.muscleGroup.replace('_', ' ')}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors ml-4"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video or image */}
        <div className="bg-black aspect-video flex items-center justify-center">
          {exercise.videoUrl ? (
            <video
              key={exercise.videoUrl}
              src={exercise.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              controls
              className="w-full h-full object-contain"
            />
          ) : exercise.gifUrl ? (
            <img
              src={exercise.gifUrl}
              alt={exercise.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-600">
              <Dumbbell className="w-10 h-10" />
              <span className="text-sm">Pas de vidéo disponible</span>
            </div>
          )}
        </div>

        {/* Description */}
        {exercise.description && (
          <div className="px-5 pt-4">
            <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">
              {exercise.description}
            </p>
          </div>
        )}

        {/* Instructions */}
        {steps.length > 0 && (
          <div className="px-5 py-4">
            <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-3">
              Instructions
            </h3>
            <ol className="space-y-2">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-300">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span>{step.replace(/^\d+\.\s*/, '')}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
