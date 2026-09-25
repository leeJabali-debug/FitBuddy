import { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface TopStatusBarProps {
  onSignOut?: () => void;
  showProfileMenu?: boolean;
}

export function TopStatusBar({ onSignOut, showProfileMenu }: TopStatusBarProps) {
  const [time, setTime] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const hStr = hours.toString();
      const mStr = minutes < 10 ? `0${minutes}` : minutes.toString();
      setTime(`${hStr}:${mStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="status-bar" className="w-full flex items-center justify-between px-6 pt-3 pb-2 text-xs font-semibold text-slate-700 select-none z-30">
      <span id="status-time" className="tracking-tight text-slate-800 text-[13px] font-medium">{time}</span>
      <div id="status-icons" className="flex items-center space-x-2 text-slate-800">
        <Signal className="w-3.5 h-3.5" />
        <Wifi className="w-3.5 h-3.5" />
        <BatteryMedium className="w-4 h-4" />
        {showProfileMenu && onSignOut && (
          <button
            id="status-quick-signout"
            onClick={onSignOut}
            className="ml-2 px-1.5 py-0.5 text-[10px] text-slate-500 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors"
            title="Sign Out"
          >
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}
