import React, { useState } from 'react';
import { X, User, Settings, LogOut, Check, Award, Flame, Droplets, Footprints } from 'lucide-react';
import { UserProfile, AchievementBadge } from '../../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  achievements: AchievementBadge[];
  onUpdateGoals: (stepGoal: number, activeGoal: number, waterGoal: number) => void;
  onSignOut: () => void;
  onViewWelcome?: () => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  user,
  achievements,
  onUpdateGoals,
  onSignOut,
}: UserProfileModalProps) {
  const [stepGoal, setStepGoal] = useState(user.dailyStepGoal);
  const [activeGoal, setActiveGoal] = useState(user.dailyActiveGoal);
  const [waterGoal, setWaterGoal] = useState(user.dailyWaterGoal);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGoals(stepGoal, activeGoal, waterGoal);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">Campus Fitness Profile</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="mt-4 flex items-center space-x-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
          <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-black ring-2 ring-emerald-400">
            {user.avatarLetter}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 truncate">{user.name || 'Student'}</h3>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
            {(user.major || user.campus) && (
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5 truncate">
                {[user.major, user.campus].filter(Boolean).join(' • ')}
              </p>
            )}
          </div>
        </div>

        {/* Cloud Sync Status */}
        <div className="mt-2.5 px-3 py-2 bg-emerald-50/70 border border-emerald-200/70 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-emerald-900">Cloud Firestore Synced</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
            Live Database
          </span>
        </div>

        {/* Badges preview */}
        <div className="mt-4">
          <label className="text-xs font-bold text-slate-700 block mb-2">Earned Badges</label>
          <div className="grid grid-cols-2 gap-2">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-2.5 rounded-xl border text-xs flex items-center space-x-2 ${
                  ach.earned
                    ? 'border-emerald-200 bg-emerald-50/60 text-emerald-950'
                    : 'border-slate-200 bg-slate-50 text-slate-400 opacity-60'
                }`}
              >
                <Award className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <div className="truncate">
                  <span className="font-bold block truncate">{ach.title}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{ach.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Target Preferences */}
        <form onSubmit={handleSave} className="mt-5 space-y-3 pt-3 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-800 block">Personal Target Thresholds</label>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[11px] text-slate-500 block mb-1 font-medium">Daily Steps</span>
              <input
                type="number"
                step="500"
                value={stepGoal}
                onChange={(e) => setStepGoal(Number(e.target.value))}
                className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg outline-none font-mono"
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block mb-1 font-medium">Active Min</span>
              <input
                type="number"
                step="5"
                value={activeGoal}
                onChange={(e) => setActiveGoal(Number(e.target.value))}
                className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg outline-none font-mono"
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block mb-1 font-medium">Water (Glasses)</span>
              <input
                type="number"
                step="1"
                value={waterGoal}
                onChange={(e) => setWaterGoal(Number(e.target.value))}
                className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg outline-none font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{saved ? 'Targets Updated!' : 'Save Target Settings'}</span>
          </button>
        </form>

        {/* Account Session Info & Logout */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
            <span className="text-slate-400 block text-[9px] uppercase font-mono">Signed in as</span>
            <span className="font-semibold text-slate-700 truncate">{user.email || user.name}</span>
          </div>

          <button
            type="button"
            id="btn-modal-signout"
            onClick={() => {
              onClose();
              onSignOut();
            }}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
