import React, { useState } from 'react';
import { X, Footprints, Dumbbell, Bike, Flame, Plus } from 'lucide-react';
import { ActivityItem, ActivityType } from '../../types';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Omit<ActivityItem, 'id'>) => void;
  selectedDate: string;
}

export function AddActivityModal({ isOpen, onClose, onSave, selectedDate }: AddActivityModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ActivityType>('walk');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [steps, setSteps] = useState<number | undefined>(3000);
  const [calories, setCalories] = useState<number | undefined>(150);
  const [timeStr, setTimeStr] = useState('08:30 AM');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      type,
      durationMinutes: Number(durationMinutes) || 15,
      steps: steps ? Number(steps) : undefined,
      calories: calories ? Number(calories) : undefined,
      timeStr,
      dateStr: selectedDate,
      notes: notes.trim() || undefined,
    });

    // Reset & close
    setTitle('');
    onClose();
  };

  const handleTypeSelect = (selected: ActivityType, defaultTitle: string, defaultSteps?: number) => {
    setType(selected);
    if (!title || title === 'Morning Walk' || title === 'Gym Session' || title === 'Cycling') {
      setTitle(defaultTitle);
    }
    if (defaultSteps !== undefined) {
      setSteps(defaultSteps);
    } else {
      setSteps(undefined);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">Log Workout / Activity</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Quick Category Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Activity Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeSelect('walk', 'Morning Walk', 3200)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === 'walk'
                    ? 'border-amber-500 bg-amber-50 text-amber-900'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Footprints className="w-4 h-4 text-amber-600" />
                <span>Walk / Run</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeSelect('gym', 'Gym Session', undefined)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === 'gym'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Dumbbell className="w-4 h-4 text-emerald-600" />
                <span>Gym / Lift</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeSelect('cycling', 'Cycling', undefined)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === 'cycling'
                    ? 'border-sky-500 bg-sky-50 text-sky-900'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Bike className="w-4 h-4 text-sky-600" />
                <span>Cycling</span>
              </button>
            </div>
          </div>

          {/* Activity Title */}
          <div>
            <label htmlFor="input-act-title" className="text-xs font-bold text-slate-700 block mb-1">
              Title
            </label>
            <input
              id="input-act-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Morning Walk, Rec Center Workout"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              required
            />
          </div>

          {/* Duration & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="input-act-duration" className="text-xs font-bold text-slate-700 block mb-1">
                Duration (min)
              </label>
              <input
                id="input-act-duration"
                type="number"
                min="1"
                max="600"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-mono"
                required
              />
            </div>

            <div>
              <label htmlFor="input-act-time" className="text-xs font-bold text-slate-700 block mb-1">
                Time of Day
              </label>
              <input
                id="input-act-time"
                type="text"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                placeholder="08:30 AM"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-mono"
              />
            </div>
          </div>

          {/* Steps (Optional) & Calories (Optional) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="input-act-steps" className="text-xs font-bold text-slate-700 block mb-1">
                Steps (optional)
              </label>
              <input
                id="input-act-steps"
                type="number"
                min="0"
                value={steps ?? ''}
                onChange={(e) => setSteps(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 3200"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-mono"
              />
            </div>

            <div>
              <label htmlFor="input-act-calories" className="text-xs font-bold text-slate-700 block mb-1">
                Est. Calories
              </label>
              <input
                id="input-act-calories"
                type="number"
                min="0"
                value={calories ?? ''}
                onChange={(e) => setCalories(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 150"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-mono"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="input-act-notes" className="text-xs font-bold text-slate-700 block mb-1">
              Notes (optional)
            </label>
            <input
              id="input-act-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Campus route, pace, buddies involved..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Save Activity Log</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
