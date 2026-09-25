import React, { useState } from 'react';
import { ActivityItem, DayActivity } from '../types';
import { Footprints, Dumbbell, Bike, Plus, Trash2, ChevronRight, Calendar } from 'lucide-react';

interface ActivityLogViewProps {
  activities: ActivityItem[];
  calendarDays: DayActivity[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenAddModal: () => void;
  onViewWeeklySummary: () => void;
  onDeleteActivity: (id: string) => void;
}

export function ActivityLogView({
  activities,
  calendarDays,
  selectedDate,
  onSelectDate,
  onOpenAddModal,
  onViewWeeklySummary,
  onDeleteActivity,
}: ActivityLogViewProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'walk' | 'gym' | 'cycling'>('all');

  // Filter activities for selected date
  const dayActivities = activities.filter((a) => a.dateStr === selectedDate);
  const displayedActivities = activeFilter === 'all' 
    ? dayActivities 
    : dayActivities.filter((a) => a.type === activeFilter);

  // Calculate totals
  const totalActiveTime = dayActivities.reduce((acc, a) => acc + a.durationMinutes, 0);
  const totalSteps = dayActivities.reduce((acc, a) => acc + (a.steps || 0), 0);
  const totalWorkouts = dayActivities.length;

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'walk':
      case 'running':
        return <Footprints className="w-5 h-5 text-amber-600" />;
      case 'gym':
        return <Dumbbell className="w-5 h-5 text-emerald-600" />;
      case 'cycling':
        return <Bike className="w-5 h-5 text-sky-600" />;
      default:
        return <Footprints className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div id="activity-log-view" className="relative min-h-[85vh] bg-[#FAFBFB] px-6 pt-4 pb-24 max-w-xl mx-auto">
      {/* View Title */}
      <div className="flex items-center justify-between mb-4">
        <h1 id="activity-log-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
          Activity Log
        </h1>
        <button
          onClick={onOpenAddModal}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200/60 flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Log</span>
        </button>
      </div>

      {/* TODAY'S TOTALS Card matching wireframe */}
      <div id="card-todays-totals" className="w-full bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-6">
        <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-2 font-mono">
          TODAY'S TOTALS
        </p>

        <div className="grid grid-cols-3 divide-x divide-slate-100 text-left">
          {/* Active Time */}
          <div className="pr-3">
            <p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {totalActiveTime} min
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Active Time</p>
          </div>

          {/* Total Steps */}
          <div className="px-3">
            <p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {totalSteps.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Total Steps</p>
          </div>

          {/* Workouts */}
          <div className="pl-3">
            <p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {totalWorkouts}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Workouts</p>
          </div>
        </div>
      </div>

      {/* Today's Log List Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 id="heading-todays-log" className="text-sm font-bold text-slate-800 tracking-tight">
          Today's Log
        </h2>
        <div className="flex items-center space-x-1 text-xs">
          {(['all', 'walk', 'gym', 'cycling'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-2 py-0.5 rounded-full capitalize text-[11px] font-medium transition-colors cursor-pointer ${
                activeFilter === cat 
                  ? 'bg-slate-900 text-white font-semibold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List of Workouts */}
      <div className="space-y-2.5 mb-6">
        {displayedActivities.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-slate-200">
            <p className="text-xs text-slate-500">No workout records found for this day.</p>
            <button
              onClick={onOpenAddModal}
              className="mt-2 text-xs font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log first workout</span>
            </button>
          </div>
        ) : (
          displayedActivities.map((act) => (
            <div
              key={act.id}
              id={`activity-item-${act.id}`}
              className="w-full bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-slate-300 transition-all group"
            >
              <div className="flex items-center space-x-3">
                {/* Icon box wireframe style with dashed or clean frame */}
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center flex-shrink-0">
                  {getActivityIcon(act.type)}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {act.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {act.durationMinutes} min
                    {act.steps ? ` • ${act.steps.toLocaleString()} steps` : ' • --'}
                    {act.calories ? ` • ${act.calories} kcal` : ''}
                  </p>
                  {act.notes && (
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{act.notes}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <span className="text-xs font-medium text-slate-400 font-mono">
                  {act.timeStr}
                </span>
                <button
                  onClick={() => onDeleteActivity(act.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-600 p-1 transition-opacity cursor-pointer"
                  title="Delete log"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Calendar Week Strip matching wireframe Mon 20 to Sun 26 */}
      <div id="calendar-week-strip" className="mb-6 pt-2">
        <div className="flex items-center justify-between px-1">
          {calendarDays.map((day) => {
            const isSelected = day.fullDate === selectedDate;
            return (
              <button
                key={day.fullDate}
                id={`calendar-day-${day.dayNum}`}
                onClick={() => onSelectDate(day.fullDate)}
                className={`flex flex-col items-center py-2 px-2.5 rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className={`text-[10px] font-medium tracking-tight uppercase ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  {day.dayName}
                </span>
                <span className="text-sm font-bold mt-0.5">
                  {day.dayNum}
                </span>
                {(day.hasData || activities.some((a) => a.dateStr === day.fullDate)) && !isSelected && (
                  <span className="w-1 h-1 bg-emerald-500 rounded-full mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Action: View Weekly Summary Button */}
      <button
        id="btn-view-weekly-summary"
        onClick={onViewWeeklySummary}
        className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
      >
        <span>View Weekly Summary</span>
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Floating Action Button (+) matching wireframe */}
      <button
        id="fab-add-activity"
        onClick={onOpenAddModal}
        className="fixed bottom-20 right-6 sm:right-auto sm:left-1/2 sm:translate-x-44 z-30 w-12 h-12 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-lg shadow-slate-900/30 transition-transform active:scale-95 cursor-pointer"
        title="Add Activity / Workout"
        aria-label="Add Activity"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>
    </div>
  );
}
