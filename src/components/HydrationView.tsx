import { WaterLogEntry, DayHydration } from '../types';
import { Droplets, Plus, Minus, CheckCircle, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

interface HydrationViewProps {
  currentGlasses: number;
  goalGlasses: number;
  logs: WaterLogEntry[];
  weeklyData: DayHydration[];
  onAddWater: (amountGlasses: number, ml: number) => void;
  onRemoveWater: () => void;
  onOpenCustomModal: () => void;
  onResetToday: () => void;
}

export function HydrationView({
  currentGlasses,
  goalGlasses,
  logs,
  weeklyData,
  onAddWater,
  onRemoveWater,
  onOpenCustomModal,
  onResetToday,
}: HydrationViewProps) {
  const percentage = Math.min(100, Math.round((currentGlasses / goalGlasses) * 100));
  const liters = (currentGlasses * 0.25).toFixed(1);
  const goalLiters = (goalGlasses * 0.25).toFixed(1);

  const handleAdd = (glasses: number, ml: number) => {
    onAddWater(glasses, ml);
    if (currentGlasses + glasses >= goalGlasses && currentGlasses < goalGlasses) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#0284c7', '#0ea5e9', '#10b981'],
      });
    }
  };

  return (
    <div id="hydration-view" className="relative min-h-[85vh] bg-[#FAFBFB] px-6 pt-4 pb-20 max-w-xl mx-auto">
      {/* Header matching wireframe */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 id="hydration-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Hydration
          </h1>
          <p id="hydration-subtitle" className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Log water intake to reach your daily goal
          </p>
        </div>

        <button
          onClick={onResetToday}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          title="Reset today's water"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Glass Visual & Stats Card */}
      <div className="flex flex-col items-center justify-center my-4">
        {/* Stylized Glass Container matching wireframe */}
        <div className="relative w-28 h-36 bg-slate-100/90 rounded-2xl p-1.5 border-2 border-slate-200 shadow-inner overflow-hidden flex flex-col justify-end">
          {/* Water fill animation */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full bg-gradient-to-t from-sky-400 via-sky-300 to-sky-200/90 rounded-xl relative overflow-hidden"
          >
            {/* Subtle animated water wave bubble */}
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </motion.div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs font-bold text-slate-700 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-2xs border border-slate-200/50">
              {percentage >= 100 ? 'Filled 🎉' : `${percentage}% Filled`}
            </span>
          </div>
        </div>

        {/* Central Counter Display matching wireframe */}
        <div className="text-center mt-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            {currentGlasses} / {goalGlasses} glasses
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Goal: {goalLiters} Liters ({percentage}% complete)
          </p>
        </div>
      </div>

      {/* Quick Action Buttons matching wireframe: +1 Glass, +0.5 Glass, Custom */}
      <div className="grid grid-cols-3 gap-2.5 my-6">
        <button
          id="btn-add-1-glass"
          onClick={() => handleAdd(1, 250)}
          className="py-3 px-2 bg-white hover:bg-sky-50/50 border border-slate-200 hover:border-sky-300 active:scale-95 rounded-2xl text-center shadow-xs transition-all cursor-pointer group"
        >
          <span className="block text-xs font-bold text-slate-900 group-hover:text-sky-700 leading-tight">
            +1 Glass
          </span>
          <span className="block text-[11px] text-slate-400 mt-0.5 font-mono">
            (250ml)
          </span>
        </button>

        <button
          id="btn-add-half-glass"
          onClick={() => handleAdd(0.5, 125)}
          className="py-3 px-2 bg-white hover:bg-sky-50/50 border border-slate-200 hover:border-sky-300 active:scale-95 rounded-2xl text-center shadow-xs transition-all cursor-pointer group"
        >
          <span className="block text-xs font-bold text-slate-900 group-hover:text-sky-700 leading-tight">
            +0.5 Glass
          </span>
          <span className="block text-[11px] text-slate-400 mt-0.5 font-mono">
            (125ml)
          </span>
        </button>

        <button
          id="btn-custom-water"
          onClick={onOpenCustomModal}
          className="py-3 px-2 bg-white hover:bg-slate-50 border border-slate-200 active:scale-95 rounded-2xl text-center shadow-xs transition-all cursor-pointer group flex flex-col items-center justify-center"
        >
          <span className="block text-xs font-bold text-slate-900 leading-tight">
            Custom
          </span>
          <span className="block text-[11px] text-slate-400 mt-0.5">
            Set amount
          </span>
        </button>
      </div>

      {/* Undo water button if logged */}
      {currentGlasses > 0 && (
        <div className="flex justify-center -mt-2 mb-6">
          <button
            onClick={onRemoveWater}
            className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Minus className="w-3 h-3" />
            <span>Undo last glass (-250ml)</span>
          </button>
        </div>
      )}

      {/* TODAY'S LOGS Timeline matching wireframe */}
      <div id="section-todays-water-logs" className="mb-6">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 font-mono">
          TODAY'S LOGS
        </h2>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          {logs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-2">No water logged yet today.</p>
          ) : (
            <div className="relative pt-2 pb-4">
              {/* Horizontal line */}
              <div className="absolute top-5 left-4 right-4 h-0.5 bg-slate-200 pointer-events-none" />

              {/* Dots along timeline */}
              <div className="relative flex items-center justify-between px-1">
                {logs.map((log) => (
                  <div key={log.id} className="flex flex-col items-center group relative cursor-pointer">
                    <div className="w-3 h-3 rounded-full bg-slate-900 border-2 border-white ring-2 ring-slate-100 z-10 transition-transform group-hover:scale-125" />
                    <span className="text-[10px] text-slate-500 font-mono mt-2 font-medium">
                      {log.timeStr}
                    </span>
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 text-[10px] bg-slate-900 text-white font-mono px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap pointer-events-none">
                      +{log.ml}ml
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* WEEKLY COMPARISON Bar Chart matching wireframe */}
      <div id="section-weekly-water-comparison">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
            WEEKLY COMPARISON
          </h2>
          <span className="text-[11px] text-slate-400">8 glasses goal</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="relative h-24 flex items-end justify-between px-2 pt-2 pb-1 border-b border-slate-100">
            {/* Target line */}
            <div className="absolute top-6 left-0 right-0 border-b border-dashed border-sky-300 pointer-events-none" />

            {weeklyData.map((d, idx) => {
              const currentDayIdx = (new Date().getDay() + 6) % 7;
              const isToday = idx === currentDayIdx;
              const effectiveGlasses = isToday ? Math.max(d.glasses, currentGlasses) : d.glasses;
              const barHeight = Math.min(100, Math.round((effectiveGlasses / Math.max(1, goalGlasses)) * 90));
              const isMet = effectiveGlasses >= goalGlasses;

              return (
                <div key={idx} className="flex flex-col items-center group relative w-7">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 text-[10px] bg-slate-900 text-white font-mono px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap pointer-events-none z-10">
                    {effectiveGlasses} glasses
                  </div>

                  <div 
                    className={`w-3.5 rounded-t-md transition-all ${
                      isMet 
                        ? 'bg-emerald-600' 
                        : isToday 
                        ? 'bg-sky-400' 
                        : 'bg-slate-200'
                    }`}
                    style={{ height: `${Math.max(4, barHeight)}%` }}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between px-2 pt-2">
            {weeklyData.map((d, idx) => (
              <span key={idx} className="text-[10px] font-semibold text-slate-400 w-7 text-center">
                {d.dayName}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
