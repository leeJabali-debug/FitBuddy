import { Footprints, Clock, Droplets, Plus, Award, ChevronRight, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile, MainTab } from '../types';
import { MotionStepTrackerWidget } from './MotionStepTrackerWidget';
import { MotionSensitivity } from '../hooks/useDeviceMotionStepCounter';

export interface MotionTrackerProps {
  isActive: boolean;
  isSupported: boolean;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unsupported';
  motionIntensity: number;
  lastMagnitude: number;
  unusualMovementDetected: boolean;
  sensitivity: MotionSensitivity;
  sessionSteps: number;
  isSimulating: boolean;
  isSoundEnabled?: boolean;
  stepsPerShake?: number;
  shakeCount?: number;
  onToggleActive: () => void;
  onSetSensitivity: (s: MotionSensitivity) => void;
  onRequestPermission: () => Promise<boolean>;
  onTriggerSimulatedMovement: () => void;
  onToggleSimulation: () => void;
  onToggleSound?: () => void;
  onSetStepsPerShake?: (count: number) => void;
}

interface HomeDashboardProps {
  user: UserProfile;
  stepsCurrent: number;
  stepsTarget: number;
  activeMinutesCurrent: number;
  activeMinutesTarget: number;
  waterCurrent: number;
  waterTarget: number;
  onNavigateTab: (tab: MainTab) => void;
  onQuickAddWater: () => void;
  onQuickAddSteps: () => void;
  onOpenAddActivity: () => void;
  onOpenProfile: () => void;
  motionTracker?: MotionTrackerProps;
}

export function HomeDashboard({
  user,
  stepsCurrent,
  stepsTarget,
  activeMinutesCurrent,
  activeMinutesTarget,
  waterCurrent,
  waterTarget,
  onNavigateTab,
  onQuickAddWater,
  onQuickAddSteps,
  onOpenAddActivity,
  onOpenProfile,
  motionTracker,
}: HomeDashboardProps) {
  const stepsPercentage = Math.min(100, Math.round((stepsCurrent / stepsTarget) * 100));
  const activePercentage = Math.min(100, Math.round((activeMinutesCurrent / activeMinutesTarget) * 100));
  const waterLiters = (waterCurrent * 0.25).toFixed(2);

  // SVG Circular progress math
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stepsPercentage / 100) * circumference;

  // Streak days dynamically mapped to current week and user streak
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayDayIndex = (new Date().getDay() + 6) % 7; // 0 for Mon, 6 for Sun
  const streakDays = daysOfWeek.map((day, idx) => {
    const isToday = idx === todayDayIndex;
    // Marked completed if within user's streak history
    const completed = idx < todayDayIndex && (user.streakCount || 0) >= (todayDayIndex - idx);
    return { day, completed, isToday };
  });

  const formattedToday = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div id="home-dashboard" className="relative min-h-[85vh] bg-[#FAFBFB] pb-8">
      {/* Background Soft Ambient Gradient Matching Wireframe */}
      <div className="pointer-events-none absolute top-0 left-0 w-80 h-72 bg-gradient-to-br from-emerald-100/40 via-teal-50/20 to-transparent rounded-full blur-2xl" />
      <div className="pointer-events-none absolute top-10 right-0 w-72 h-64 bg-gradient-to-bl from-orange-100/30 via-emerald-50/10 to-transparent rounded-full blur-2xl" />

      {/* Top Header matching wireframe "FitSync" */}
      <div className="relative z-10 px-6 pt-4 pb-4 flex items-start justify-between">
        <div>
          <h1 id="home-app-brand" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            FitBuddy
          </h1>
          <p id="home-greeting" className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Hello, {user.name ? user.name.split(' ')[0] : 'Student'} • {formattedToday}
          </p>
        </div>

        {/* Avatar Circle Button */}
        <button
          id="btn-user-avatar-profile"
          onClick={onOpenProfile}
          className="w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm ring-2 ring-white shadow-xs transition-transform active:scale-95 cursor-pointer"
          title="Account Profile & Settings"
        >
          {user.avatarLetter || 'A'}
        </button>
      </div>

      <div className="relative z-10 px-6 space-y-6 max-w-xl mx-auto">
        {/* Today's Metrics Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 id="section-todays-metrics" className="text-sm font-bold text-slate-800 tracking-tight">
              Today's Metrics
            </h2>
            <button
              id="btn-log-workout-shortcut"
              onClick={onOpenAddActivity}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Workout</span>
            </button>
          </div>

          {/* Metric 1: Steps Card with Circular Progress Ring */}
          <div 
            id="metric-card-steps" 
            className="w-full bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-3 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Circular Gauge */}
                <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      stroke="#f1f5f9"
                      strokeWidth="5"
                      fill="transparent"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      stroke="#0f172a"
                      strokeWidth="5"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <span className="absolute font-extrabold text-sm text-slate-900">
                    {stepsPercentage}%
                  </span>
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-center space-x-1.5">
                    <Footprints className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-500">Steps</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">
                    {stepsCurrent.toLocaleString()}{' '}
                    <span className="text-xs font-medium text-slate-400">
                      / {stepsTarget.toLocaleString()} steps
                    </span>
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                id="btn-quick-add-steps"
                onClick={onQuickAddSteps}
                className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Add 500 steps"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Unusual Movement Step Detection Card */}
          {motionTracker && (
            <div className="mb-3">
              <MotionStepTrackerWidget {...motionTracker} />
            </div>
          )}

          {/* Metric 2: Active Minutes Card with Horizontal Progress Bar */}
          <div 
            id="metric-card-active-minutes" 
            className="w-full bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-3 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700">Active Minutes</span>
              </div>
              <span className="text-xs font-semibold text-slate-600">
                {activeMinutesCurrent} / {activeMinutesTarget} min
              </span>
            </div>

            {/* Horizontal Bar matching wireframe emerald green */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${activePercentage}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
          </div>

          {/* Metric 3: Water Intake Card with Glass Icon */}
          <div 
            id="metric-card-water-intake" 
            className="w-full bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                {/* Glass Icon Box */}
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Water Intake</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {waterCurrent} / {waterTarget} glasses{' '}
                    <span className="text-xs font-medium text-slate-400">({waterLiters}L)</span>
                  </p>
                </div>
              </div>

              <button
                id="btn-quick-log-water-glass"
                onClick={onQuickAddWater}
                className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-sky-50 text-slate-500 hover:text-sky-700 flex items-center justify-center transition-colors cursor-pointer"
                title="Quick Log 1 Glass (250ml)"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 7-Day Streak Section matching wireframe circles */}
        <div id="section-7day-streak" className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">
              7-Day Streak
            </h2>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              {user.streakCount || 0} Day Streak 🔥
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            {streakDays.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  {item.day}
                </span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    item.completed
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : item.isToday
                      ? 'border-2 border-emerald-500 text-emerald-600 bg-emerald-50/50'
                      : 'border border-slate-200 text-transparent'
                  }`}
                >
                  {item.completed ? '✓' : item.isToday ? '•' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campus Community & Quick Exploration Card */}
        <div className="pt-1">
          <div 
            onClick={() => onNavigateTab('buddies')}
            className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/60 border border-emerald-200/70 flex items-center justify-between cursor-pointer hover:shadow-sm transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950">Campus Buddy Compatibility</p>
                <p className="text-[11px] text-emerald-800">Find students matching your workout routine</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
