import { useState } from 'react';
import { ArrowLeft, Star, Droplets, Share2, Flame, Award } from 'lucide-react';
import { AchievementBadge, ActivityItem, UserProfile } from '../types';

interface WeeklySummaryViewProps {
  onBack: () => void;
  onShare: () => void;
  achievements: AchievementBadge[];
  activities: ActivityItem[];
  waterGlasses: number;
  user: UserProfile;
}

export function WeeklySummaryView({
  onBack,
  onShare,
  achievements,
  activities,
  waterGlasses,
  user,
}: WeeklySummaryViewProps) {
  const [copied, setCopied] = useState(false);

  // Derive real statistics from user-provided data
  const totalSteps = activities.reduce((sum, a) => sum + (Number(a.steps) || 0), 0);
  const totalMinutes = activities.reduce((sum, a) => sum + (Number(a.durationMinutes) || 0), 0);
  const avgDailySteps = Math.round(totalSteps / 7);
  const streak = user.streakCount || 0;
  const hydrationScore = user.dailyWaterGoal > 0
    ? Math.min(100, Math.round((waterGlasses / user.dailyWaterGoal) * 100))
    : 0;

  // Real grade calculation based on user data
  let gradeLetter = '–';
  let gradeTitle = 'Awaiting Logs';
  let gradeSubtitle = 'Log your workouts and hydration to generate your performance score.';

  if (totalSteps > 0 || totalMinutes > 0) {
    if (avgDailySteps >= 8000 || totalMinutes >= 150) {
      gradeLetter = 'A';
      gradeTitle = 'Excellent Progress';
      gradeSubtitle = `Strong campus routine with ${totalMinutes} active minutes recorded.`;
    } else if (avgDailySteps >= 4000 || totalMinutes >= 60) {
      gradeLetter = 'B+';
      gradeTitle = 'Good Momentum';
      gradeSubtitle = `Consistent effort with ${totalSteps.toLocaleString()} steps logged this week.`;
    } else {
      gradeLetter = 'B';
      gradeTitle = 'Building Consistency';
      gradeSubtitle = `Keep logging daily workouts to push towards your weekly targets.`;
    }
  }

  // Generate 7-day trend from user's logged activities
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const trendData = daysOfWeek.map((dayName, idx) => {
    // Offset relative to current day
    const d = new Date();
    d.setDate(today.getDate() - (6 - idx));
    const dateStr = d.toISOString().split('T')[0];
    const dayActs = activities.filter((a) => a.dateStr === dateStr);
    const daySteps = dayActs.reduce((sum, a) => sum + (Number(a.steps) || 0), 0);
    const yPercent = Math.min(85, Math.round((daySteps / (user.dailyStepGoal || 10000)) * 80));
    return {
      day: dayName,
      steps: daySteps,
      yPercent: Math.max(10, yPercent),
    };
  });

  const earnedAchievements = achievements.filter((a) => a.earned);

  const handleQuickCopy = () => {
    const summaryText = `FitBuddy Weekly Report\nGrade: ${gradeLetter} (${gradeTitle})\n• Total Steps: ${totalSteps.toLocaleString()}\n• Active Time: ${totalMinutes} mins\n• Hydration: ${waterGlasses} glasses (${hydrationScore}% target)\n• Streak: ${streak} Days`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShare();
  };

  return (
    <div id="weekly-summary-view" className="relative min-h-[85vh] bg-[#FAFBFB] px-6 pt-4 pb-20 max-w-xl mx-auto">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between mb-4">
        <button
          id="btn-back-from-summary"
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Activity Log</span>
        </button>

        <span className="text-xs font-medium text-slate-400">
          Weekly Report
        </span>
      </div>

      {/* Main Heading */}
      <div className="mb-4">
        <h1 id="weekly-summary-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
          Weekly Summary
        </h1>
        <p id="weekly-summary-dates" className="text-xs text-slate-500 font-medium mt-0.5">
          Calculated exclusively from your logged activities
        </p>
      </div>

      {/* Dynamic Grade Card */}
      <div id="summary-grade-card" className="w-full bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-5 flex items-center space-x-4">
        <div className="w-14 h-14 rounded-full border-2 border-slate-900 flex items-center justify-center font-extrabold text-slate-900 text-lg flex-shrink-0">
          {gradeLetter}
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 leading-tight">
            {gradeTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {gradeSubtitle}
          </p>
        </div>
      </div>

      {/* Metrics Breakdown Table */}
      <div id="section-metrics-breakdown" className="mb-6">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 font-mono">
          Metrics Breakdown
        </h2>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          <div className="flex items-center justify-between p-3.5">
            <span className="text-xs font-medium text-slate-500">Avg Daily Steps</span>
            <span className="text-xs font-bold text-slate-900 font-mono">
              {avgDailySteps.toLocaleString()} steps
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5">
            <span className="text-xs font-medium text-slate-500">Total Active Time</span>
            <span className="text-xs font-bold text-slate-900 font-mono">
              {totalMinutes} mins
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5">
            <span className="text-xs font-medium text-slate-500">Hydration Consistency</span>
            <span className="text-xs font-bold text-slate-900 font-mono">
              {hydrationScore}% score
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5">
            <span className="text-xs font-medium text-slate-500">Current Streak</span>
            <span className="text-xs font-bold text-emerald-600 font-mono">
              {streak} {streak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>
      </div>

      {/* DAILY STEPS TREND Dot Plot Chart */}
      <div id="section-steps-trend" className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
            DAILY STEPS TREND
          </h2>
          <span className="text-[11px] text-slate-400">Target: {user.dailyStepGoal.toLocaleString()} steps</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          {/* Chart Canvas Area */}
          <div className="relative h-28 w-full flex items-end justify-between px-2 pt-4 pb-2 border-b border-slate-100">
            {/* Horizontal Guide lines */}
            <div className="absolute top-4 left-0 right-0 border-b border-dashed border-slate-100 pointer-events-none" />
            <div className="absolute top-1/2 left-0 right-0 border-b border-dashed border-slate-100 pointer-events-none" />

            {trendData.map((item, idx) => (
              <div key={idx} className="relative flex flex-col items-center group">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 text-[10px] bg-slate-900 text-white font-mono px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap z-10 pointer-events-none">
                  {item.steps.toLocaleString()} steps
                </div>

                {/* Dot at Y position */}
                <div 
                  className={`w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-125 cursor-pointer ring-2 ring-white ${
                    item.steps > 0 ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                  style={{ marginBottom: `${item.yPercent}px` }}
                />
              </div>
            ))}
          </div>

          {/* X Axis Labels */}
          <div className="flex items-center justify-between px-1 pt-2">
            {trendData.map((item, idx) => (
              <span key={idx} className="text-[10px] text-slate-400 font-medium">
                {item.day}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements Earned */}
      <div id="section-achievements" className="mb-6">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 font-mono">
          Achievements Earned
        </h2>

        {earnedAchievements.length === 0 ? (
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 text-center">
            <p className="text-xs text-slate-500 font-medium">No badges unlocked yet.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Keep logging workouts, steps, and water to earn achievements.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {earnedAchievements.map((badge) => (
              <div key={badge.id} className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-500 border border-amber-200/60 flex items-center justify-center shrink-0">
                  {badge.iconName === 'star' && <Star className="w-5 h-5 fill-amber-400 text-amber-500" />}
                  {badge.iconName === 'droplet' && <Droplets className="w-5 h-5 fill-sky-400 text-sky-500" />}
                  {badge.iconName === 'flame' && <Flame className="w-5 h-5 text-rose-500" />}
                  {badge.iconName === 'award' && <Award className="w-5 h-5 text-emerald-500" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">{badge.title}</p>
                  <p className="text-[11px] text-slate-500">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Button: Share Summary */}
      <button
        id="btn-share-weekly-summary"
        onClick={handleQuickCopy}
        className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
      >
        <Share2 className="w-4 h-4" />
        <span>{copied ? 'Summary Copied to Clipboard!' : 'Share Summary'}</span>
      </button>
    </div>
  );
}
