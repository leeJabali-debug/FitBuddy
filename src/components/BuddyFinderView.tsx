import React, { useState } from 'react';
import { BuddyProfile } from '../types';
import { Search, UserCheck, MessageSquare, Sparkles, Filter, Footprints, Dumbbell, Bike, Droplets, HeartHandshake } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BuddyFinderViewProps {
  buddies: BuddyProfile[];
  onConnectBuddy: (buddyId: string) => void;
  onSelectBuddy: (buddy: BuddyProfile) => void;
}

export function BuddyFinderView({ buddies, onConnectBuddy, onSelectBuddy }: BuddyFinderViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filterTabs = ['All', 'Similar Goals', 'Same Schedule', 'Nearby', 'Challenge Partners'];

  const filteredBuddies = buddies.filter((b) => {
    // Search filter
    const matchesSearch = 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.major.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags.some((t) => t.label.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Chip filter
    if (activeFilter === 'Similar Goals') {
      return b.tags.some((t) => t.type === 'steps' || t.type === 'hydration');
    }
    if (activeFilter === 'Same Schedule') {
      return b.schedule.includes('Morning') || b.schedule.includes('M/W/F');
    }
    if (activeFilter === 'Nearby') {
      return b.statusText?.includes('now') || b.matchScore > 85;
    }
    if (activeFilter === 'Challenge Partners') {
      return b.streak >= 4;
    }
    return true;
  });

  const handleConnectClick = (e: React.MouseEvent, buddy: BuddyProfile) => {
    e.stopPropagation();
    onConnectBuddy(buddy.id);
    if (buddy.status === 'none') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#059669', '#34d399', '#3b82f6'],
      });
    }
  };

  const renderTagIcon = (type: string) => {
    switch (type) {
      case 'steps':
        return <Footprints className="w-3 h-3 text-amber-600" />;
      case 'gym':
        return <Dumbbell className="w-3 h-3 text-emerald-600" />;
      case 'cycling':
        return <Bike className="w-3 h-3 text-sky-600" />;
      case 'hydration':
        return <Droplets className="w-3 h-3 text-blue-500" />;
      default:
        return <Sparkles className="w-3 h-3 text-teal-600" />;
    }
  };

  return (
    <div id="buddy-finder-view" className="relative min-h-[85vh] bg-[#FAFBFB] px-6 pt-4 pb-20 max-w-xl mx-auto">
      {/* Header matching wireframe */}
      <div className="mb-4">
        <h1 id="buddy-finder-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
          Find a Buddy
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          Connect with peers matching your fitness goals & schedule
        </p>
      </div>

      {/* Search Input matching wireframe */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          id="input-buddy-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by major, goal, schedule..."
          className="w-full pl-9 pr-4 py-2.5 bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors shadow-2xs placeholder:text-slate-400"
        />
      </div>

      {/* Filter Chips matching wireframe */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-none mb-4 -mx-1 px-1">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab;
          return (
            <button
              key={tab}
              id={`filter-chip-${tab.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Compatibility Matches List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
            Compatibility Matches
          </h2>
          <span className="text-[11px] text-slate-400">
            {filteredBuddies.length} found
          </span>
        </div>

        {buddies.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200">
            <HeartHandshake className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-700 font-semibold">No campus buddies yet.</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
              When peers from your campus join and share workouts, their profiles will appear here for buddy requests.
            </p>
          </div>
        ) : filteredBuddies.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80">
            <p className="text-xs text-slate-500">No students matched "{searchQuery}".</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveFilter('All'); }}
              className="mt-2 text-xs font-bold text-emerald-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBuddies.map((buddy) => {
              const isConnected = buddy.status === 'connected';
              const isRequested = buddy.status === 'requested';

              return (
                <div
                  key={buddy.id}
                  id={`buddy-card-${buddy.id}`}
                  onClick={() => onSelectBuddy(buddy)}
                  className="w-full bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {/* Avatar initial */}
                      <div className="relative">
                        <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm ring-2 ring-emerald-400 shadow-xs">
                          {buddy.avatarLetter}
                        </div>
                        {buddy.statusText?.includes('now') && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">
                            {buddy.name}
                          </h3>
                        </div>

                        <p className="text-xs text-slate-500 mt-0.5">
                          {buddy.major}
                        </p>

                        {/* Tag badges */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {buddy.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-700"
                            >
                              {renderTagIcon(tag.type)}
                              <span>{tag.label}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right column: Match % & Connect CTA */}
                    <div className="flex flex-col items-end space-y-2">
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 font-mono">
                        {buddy.matchScore}% Match
                      </span>

                      <button
                        onClick={(e) => handleConnectClick(e, buddy)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isConnected
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isRequested
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'border border-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-900 text-slate-800'
                        }`}
                      >
                        {isConnected ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Connected</span>
                          </>
                        ) : isRequested ? (
                          <>
                            <span>Requested</span>
                          </>
                        ) : (
                          <>
                            <HeartHandshake className="w-3.5 h-3.5" />
                            <span>Connect</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
