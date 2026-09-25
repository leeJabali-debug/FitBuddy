import { MainTab } from '../types';
import { Home, Activity, Target, Droplets, Users } from 'lucide-react';

interface NavigationProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  unreadBuddiesCount?: number;
}

export function Navigation({ activeTab, onTabChange, unreadBuddiesCount }: NavigationProps) {
  const navItems: { id: MainTab; label: string; icon: typeof Home }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'hydration', label: 'Hydration', icon: Droplets },
    { id: 'buddies', label: 'Buddies', icon: Users },
  ];

  return (
    <nav 
      id="bottom-navigation" 
      aria-label="Bottom Navigation"
      className="sticky bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 min-w-[58px] rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'text-slate-900 font-bold' 
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div className="relative">
                <div 
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-400'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.7]'}`} />
                </div>
                {item.id === 'buddies' && unreadBuddiesCount && unreadBuddiesCount > 0 ? (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                ) : null}
              </div>
              <span className={`text-[11px] mt-0.5 tracking-tight ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
