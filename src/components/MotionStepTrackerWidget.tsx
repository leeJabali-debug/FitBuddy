import { useState } from 'react';
import { 
  Zap, 
  Play, 
  Square, 
  Settings2, 
  Smartphone, 
  Volume2, 
  VolumeX, 
  Vibrate, 
  Sparkles,
  MousePointer2,
  Keyboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MotionSensitivity } from '../hooks/useDeviceMotionStepCounter';

export interface MotionStepTrackerWidgetProps {
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

export function MotionStepTrackerWidget({
  isActive,
  isSupported,
  permissionStatus,
  motionIntensity,
  lastMagnitude,
  unusualMovementDetected,
  sensitivity,
  sessionSteps,
  isSimulating,
  isSoundEnabled = true,
  stepsPerShake = 1,
  shakeCount = 0,
  onToggleActive,
  onSetSensitivity,
  onRequestPermission,
  onTriggerSimulatedMovement,
  onToggleSimulation,
  onToggleSound,
  onSetStepsPerShake,
}: MotionStepTrackerWidgetProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div 
      id="motion-step-detector-card"
      className={`w-full rounded-2xl border transition-all duration-300 overflow-hidden ${
        unusualMovementDetected
          ? 'bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border-emerald-500 shadow-md ring-2 ring-emerald-400/40'
          : 'bg-white border-slate-200/90 shadow-2xs hover:shadow-xs'
      }`}
    >
      {/* Header bar */}
      <div className="p-4 pb-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            unusualMovementDetected 
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105' 
              : isActive 
                ? 'bg-emerald-50 text-emerald-600' 
                : 'bg-slate-100 text-slate-400'
          }`}>
            <Vibrate className={`w-5 h-5 ${unusualMovementDetected ? 'animate-bounce' : isActive ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight font-display">
                Shake Machine Sensor
              </h3>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                isActive 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {isActive ? 'LISTENING' : 'PAUSED'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Shake machine or device to count steps automatically
            </p>
          </div>
        </div>

        {/* Header Action Icons */}
        <div className="flex items-center space-x-1">
          {onToggleSound && (
            <button
              type="button"
              id="btn-toggle-shake-sound"
              onClick={onToggleSound}
              className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer ${
                isSoundEnabled ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400'
              }`}
              title={isSoundEnabled ? 'Sound chime enabled' : 'Sound chime muted'}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}

          <button
            type="button"
            id="btn-toggle-motion-settings"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer ${
              showSettings ? 'bg-slate-100 text-slate-900' : ''
            }`}
            title="Sensor & Sensitivity Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="btn-toggle-motion-active"
            onClick={onToggleActive}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
              isActive 
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isActive ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Real-time Shake Meter & Indicator */}
      <div className="px-4 pb-3">
        {/* Dynamic Movement Status Badge */}
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <div className="flex items-center space-x-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${
              unusualMovementDetected 
                ? 'bg-emerald-500 ring-4 ring-emerald-300 animate-ping' 
                : isActive 
                  ? 'bg-emerald-500' 
                  : 'bg-slate-300'
            }`} />
            <span className={`font-semibold ${
              unusualMovementDetected ? 'text-emerald-700 font-bold' : 'text-slate-700'
            }`}>
              {unusualMovementDetected 
                ? '⚡ SHAKE DETECTED! Step counted' 
                : isActive 
                  ? 'Sensor Active • Shake machine to log steps' 
                  : 'Sensor paused'}
            </span>
          </div>
          <span className="font-mono text-slate-500 font-bold text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
            {lastMagnitude > 0 ? `${lastMagnitude.toFixed(1)} m/s²` : 'Sensor Ready'}
          </span>
        </div>

        {/* Real-time Acceleration Intensity Meter */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden relative shadow-inner">
          <motion.div
            className={`h-full transition-all duration-100 ${
              unusualMovementDetected
                ? 'bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600'
                : 'bg-emerald-500'
            }`}
            animate={{ width: `${Math.max(6, motionIntensity)}%` }}
            transition={{ ease: 'easeOut', duration: 0.08 }}
          />
        </div>
      </div>

      {/* Metrics Row: Steps Counted via Shake & Quick Test Controls */}
      <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">
              Shake Steps Logged
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                +{sessionSteps}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">steps today</span>
            </div>

            {/* Micro Floating Animation on Shake */}
            <AnimatePresence>
              {unusualMovementDetected && (
                <motion.span
                  initial={{ opacity: 0, y: 0, scale: 0.8 }}
                  animate={{ opacity: 1, y: -16, scale: 1.15 }}
                  exit={{ opacity: 0, y: -26 }}
                  className="absolute -top-1.5 right-0 text-xs font-black text-white bg-emerald-600 px-1.5 py-0.5 rounded-full shadow-xs pointer-events-none"
                >
                  +{stepsPerShake}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Test Movement & Simulation Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            id="btn-simulate-motion-shake"
            onClick={onTriggerSimulatedMovement}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
            title="Simulate sudden device movement / shake"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Shake Machine</span>
          </button>

          <button
            type="button"
            id="btn-toggle-auto-walk"
            onClick={onToggleSimulation}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95 ${
              isSimulating
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            title={isSimulating ? 'Stop auto-shake test' : 'Auto-shake machine repeatedly'}
          >
            {isSimulating ? (
              <>
                <Square className="w-3 h-3 fill-current" />
                <span>Stop Auto</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Auto Shake</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Desktop / Laptop Shaking Hint */}
      <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center space-x-1.5">
          <MousePointer2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Shake mouse/trackpad rapidly across screen</span>
        </div>
        <div className="flex items-center space-x-1 text-slate-400 font-mono text-[10px]">
          <Keyboard className="w-3 h-3" />
          <span>or tap Spacebar</span>
        </div>
      </div>

      {/* Permission Prompt Banner for iOS Safari */}
      {permissionStatus === 'prompt' && (
        <div className="px-4 py-2.5 bg-amber-50 border-t border-amber-200/80 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-[11px] font-medium">Allow iOS accelerometer motion sensor access</span>
          </div>
          <button
            type="button"
            onClick={onRequestPermission}
            className="px-3 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold cursor-pointer"
          >
            Enable Sensor
          </button>
        </div>
      )}

      {/* Collapsible Sensitivity & Configuration Options */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3 bg-slate-50 border-t border-slate-200/80 space-y-3 overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700">Shake Trigger Sensitivity</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {sensitivity === 'high' ? 'High (Light Shakes)' : sensitivity === 'medium' ? 'Balanced (Standard Shakes)' : 'Low (Hard Shakes)'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['high', 'medium', 'low'] as MotionSensitivity[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onSetSensitivity(level)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold capitalize border transition-all cursor-pointer ${
                      sensitivity === level
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {level === 'high' ? 'High Sensitivity' : level === 'medium' ? 'Standard' : 'Heavy Force'}
                  </button>
                ))}
              </div>
            </div>

            {onSetStepsPerShake && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700">Steps Added Per Shake</span>
                  <span className="text-[10px] text-slate-500 font-mono">+{stepsPerShake} step(s)</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 5].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => onSetStepsPerShake(count)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        stepsPerShake === count
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      +{count} {count === 1 ? 'Step' : 'Steps'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
