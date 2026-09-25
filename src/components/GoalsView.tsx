import React from 'react';
import { GoalItem, SuggestedGoal } from '../types';
import { Plus, Edit2, Check, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface GoalsViewProps {
  goals: GoalItem[];
  suggestedGoals: SuggestedGoal[];
  onAddSuggestedGoal: (goal: SuggestedGoal) => void;
  onOpenCreateGoal: () => void;
  onEditGoal: (goal: GoalItem) => void;
}

export function GoalsView({
  goals,
  suggestedGoals,
  onAddSuggestedGoal,
  onOpenCreateGoal,
  onEditGoal,
}: GoalsViewProps) {
  return (
    <div id="goals-view" className="relative min-h-[85vh] bg-[#FAFBFB] px-6 pt-4 pb-20 max-w-xl mx-auto">
      {/* Header matching wireframe */}
      <div className="mb-5">
        <h1 id="goals-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
          My Goals
        </h1>
        <p id="goals-subtitle" className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          Set and modify your personal milestones
        </p>
      </div>

      {/* Active Goals Section */}
      <div id="section-active-goals" className="mb-6">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight mb-3">
          Active Goals
        </h2>

        <div className="space-y-3">
          {goals.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-slate-200">
              <p className="text-xs text-slate-600 font-medium">No active goals yet.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Select a suggested campus goal below or create your custom goal.</p>
            </div>
          ) : (
            goals.map((goal) => {
              const percentage = Math.min(100, Math.round((goal.current / goal.target) * 100));
              return (
                <div
                  key={goal.id}
                  id={`goal-item-${goal.id}`}
                  className="w-full bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">
                      {goal.title}
                    </h3>
                    <button
                      onClick={() => onEditGoal(goal)}
                      className="text-slate-400 hover:text-slate-700 p-1 -mr-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit goal target"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Progress bar matching wireframe dark gray bar on light gray track */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden my-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full bg-slate-700 rounded-full"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs mt-1 font-mono">
                    <span className="text-slate-400 font-medium">
                      {goal.current.toLocaleString()} / {goal.target.toLocaleString()}{' '}
                      {goal.unit !== 'steps' && goal.unit !== 'min' ? goal.unit : ''}
                    </span>
                    <span className="font-bold text-slate-900">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Suggested Goals Section matching wireframe */}
      <div id="section-suggested-goals" className="mb-6">
        <div className="flex items-center space-x-1.5 mb-3">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Suggested Goals
          </h2>
        </div>

        <div className="space-y-3">
          {suggestedGoals.map((sug) => {
            const isAlreadyActive = goals.some((g) => g.title === sug.title);
            return (
              <div
                key={sug.id}
                id={`suggested-goal-${sug.id}`}
                className="w-full bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">
                    {sug.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {sug.description}
                  </p>
                </div>

                <button
                  onClick={() => onAddSuggestedGoal(sug)}
                  disabled={isAlreadyActive}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    isAlreadyActive
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'border border-slate-300 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  {isAlreadyActive ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Bottom Action: + Create Custom Goal matching wireframe */}
      <div className="pt-2">
        <button
          id="btn-create-custom-goal"
          onClick={onOpenCreateGoal}
          className="w-full py-3.5 px-6 rounded-2xl border border-slate-300 hover:bg-slate-50 active:scale-[0.99] text-slate-900 font-bold text-sm shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Custom Goal</span>
        </button>
      </div>
    </div>
  );
}
