import React, { useState } from 'react';
import { X, UserCheck, HeartHandshake, Send, Clock, MapPin, Droplets, Flame, MessageSquare } from 'lucide-react';
import { BuddyProfile } from '../../types';
import confetti from 'canvas-confetti';

interface BuddyDetailModalProps {
  buddy: BuddyProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onConnect: (buddyId: string) => void;
}

export function BuddyDetailModal({ buddy, isOpen, onClose, onConnect }: BuddyDetailModalProps) {
  const [nudged, setNudged] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const [msgSent, setMsgSent] = useState(false);

  if (!isOpen || !buddy) return null;

  const isConnected = buddy.status === 'connected';
  const isRequested = buddy.status === 'requested';

  const handleNudge = () => {
    setNudged(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#3b82f6'],
    });
    setTimeout(() => setNudged(false), 2500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;
    setMsgSent(true);
    setTimeout(() => {
      setMsgSent(false);
      setCustomMsg('');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-base ring-2 ring-emerald-400">
              {buddy.avatarLetter}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display leading-tight">{buddy.name}</h2>
              <p className="text-xs text-slate-500">{buddy.major}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Match score pill & bio */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {buddy.matchScore}% Match Rate
            </span>
            <span className="text-xs font-semibold text-slate-500">
              🔥 {buddy.streak}-Day Streak
            </span>
          </div>

          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed">
            "{buddy.bio}"
          </p>
        </div>

        {/* Schedule & Campus Spot */}
        <div className="mt-4 space-y-2.5">
          <div className="flex items-start space-x-2.5 text-xs text-slate-700">
            <Clock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-900 block">Typical Active Schedule:</span>
              <span className="text-slate-600">{buddy.schedule}</span>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 text-xs text-slate-700">
            <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-900 block">Favorite Campus Spot:</span>
              <span className="text-slate-600">{buddy.preferredSpot}</span>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 text-xs text-slate-700">
            <Droplets className="w-4 h-4 text-sky-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-900 block">Hydration Goal:</span>
              <span className="text-slate-600">{buddy.dailyWater}</span>
            </div>
          </div>
        </div>

        {/* Quick Interaction Buttons */}
        <div className="mt-5 space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onConnect(buddy.id)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isRequested
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              }`}
            >
              {isConnected ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Connected Buddy</span>
                </>
              ) : isRequested ? (
                <span>Request Pending</span>
              ) : (
                <>
                  <HeartHandshake className="w-4 h-4" />
                  <span>Send Buddy Request</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleNudge}
              className="py-2.5 px-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>{nudged ? 'High-Five Sent! 🙌' : 'High-Five ✋'}</span>
            </button>
          </div>

          {/* Quick Chat / Meet invite input */}
          <form onSubmit={handleSendMessage} className="pt-2 border-t border-slate-100">
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Send a workout invite or note
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="e.g. Free for a walk after 3 PM lecture?"
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            {msgSent && (
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                ✓ Message dispatched to {buddy.name.split(' ')[0]}!
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
