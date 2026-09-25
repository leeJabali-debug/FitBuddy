import React, { useState } from 'react';
import { X, Droplets, Plus } from 'lucide-react';

interface CustomWaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomWater: (glasses: number, ml: number) => void;
}

export function CustomWaterModal({ isOpen, onClose, onAddCustomWater }: CustomWaterModalProps) {
  const [mlAmount, setMlAmount] = useState<number>(350);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mlAmount || mlAmount <= 0) return;

    // Convert ml to glasses (approx 250ml per glass)
    const glasses = Math.round((mlAmount / 250) * 10) / 10;
    onAddCustomWater(glasses, mlAmount);
    onClose();
  };

  const presets = [
    { label: 'Small Cup (200ml)', ml: 200 },
    { label: 'Standard Mug (300ml)', ml: 300 },
    { label: 'Campus Bottle (500ml)', ml: 500 },
    { label: 'Hydro Flask (750ml)', ml: 750 },
    { label: 'Large Tumbler (1000ml)', ml: 1000 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 font-display">Log Custom Water</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets */}
        <div className="mt-4">
          <label className="text-xs font-bold text-slate-700 block mb-2">Campus Bottle Presets</label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.ml}
                type="button"
                onClick={() => setMlAmount(preset.ml)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  mlAmount === preset.ml
                    ? 'border-sky-500 bg-sky-50 text-sky-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="input-water-ml" className="text-xs font-bold text-slate-700 block mb-1">
              Custom Amount (in Milliliters)
            </label>
            <div className="relative">
              <input
                id="input-water-ml"
                type="number"
                min="50"
                max="3000"
                step="25"
                value={mlAmount}
                onChange={(e) => setMlAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none font-mono"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                ml (~{(mlAmount / 250).toFixed(1)} glasses)
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log {mlAmount}ml</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
