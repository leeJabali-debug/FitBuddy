import React, { useState, useEffect } from 'react';
import { X, Target, Plus, Check } from 'lucide-react';
import { GoalItem } from '../../types';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<GoalItem, 'id'>, editId?: string) => void;
  editingGoal?: GoalItem | null;
}

export function CreateGoalModal({ isOpen, onClose, onSave, editingGoal }: CreateGoalModalProps) {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState<number>(10000);
  const [unit, setUnit] = useState('steps');
  const [category, setCategory] = useState<GoalItem['category']>('steps');

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setTarget(editingGoal.target);
      setUnit(editingGoal.unit);
      setCategory(editingGoal.category);
    } else {
      setTitle('');
      setTarget(10000);
      setUnit('steps');
      setCategory('steps');
    }
  }, [editingGoal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !target) return;

    onSave(
      {
        title: title.trim(),
        current: editingGoal ? editingGoal.current : 0,
        target: Number(target),
        unit,
        category,
        custom: true,
      },
      editingGoal ? editingGoal.id : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">
            {editingGoal ? 'Edit Goal Target' : 'Create Custom Goal'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="goal-modal-title" className="text-xs font-bold text-slate-700 block mb-1">
              Goal Name
            </label>
            <input
              id="goal-modal-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 10,000 steps/day, 45 min workout"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="goal-modal-target" className="text-xs font-bold text-slate-700 block mb-1">
                Target Value
              </label>
              <input
                id="goal-modal-target"
                type="number"
                min="1"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-mono"
                required
              />
            </div>

            <div>
              <label htmlFor="goal-modal-unit" className="text-xs font-bold text-slate-700 block mb-1">
                Unit
              </label>
              <select
                id="goal-modal-unit"
                value={unit}
                onChange={(e) => {
                  setUnit(e.target.value);
                  if (e.target.value === 'steps') setCategory('steps');
                  else if (e.target.value === 'min') setCategory('active');
                  else if (e.target.value === 'glasses') setCategory('water');
                  else setCategory('workout');
                }}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white"
              >
                <option value="steps">steps/day</option>
                <option value="min">min active/day</option>
                <option value="glasses">glasses water/day</option>
                <option value="workouts">workouts/week</option>
                <option value="km">km/week</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editingGoal ? 'Update Goal Target' : 'Save Goal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
