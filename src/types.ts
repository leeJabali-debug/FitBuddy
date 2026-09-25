export type AppView = 
  | 'welcome' 
  | 'signin' 
  | 'home' 
  | 'activity' 
  | 'weekly-summary' 
  | 'goals' 
  | 'hydration' 
  | 'buddies';

export type MainTab = 'home' | 'activity' | 'goals' | 'hydration' | 'buddies';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  campus: string;
  major: string;
  year: string;
  avatarLetter: string;
  dailyStepGoal: number;
  dailyActiveGoal: number;
  dailyWaterGoal: number;
  streakCount: number;
}

export type ActivityType = 'walk' | 'gym' | 'cycling' | 'running' | 'swim' | 'sports';

export interface ActivityItem {
  id: string;
  title: string;
  type: ActivityType;
  durationMinutes: number;
  steps?: number;
  calories?: number;
  timeStr: string;
  dateStr: string; // e.g., '2026-10-24'
  notes?: string;
}

export interface DayActivity {
  dayName: string; // 'Mon', 'Tue', etc.
  dayNum: number;  // 20, 21, etc.
  fullDate: string; // '2026-10-24'
  hasData: boolean;
}

export interface WaterLogEntry {
  id: string;
  timeStr: string;
  glasses: number;
  ml: number;
}

export interface DayHydration {
  dayName: string;
  dateStr: string;
  glasses: number;
  targetGlasses: number;
}

export interface GoalItem {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  category: 'steps' | 'active' | 'water' | 'streak' | 'workout';
  custom?: boolean;
}

export interface SuggestedGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  unit: string;
  category: 'steps' | 'active' | 'water' | 'streak' | 'workout';
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  iconName: 'star' | 'droplet' | 'flame' | 'award' | 'zap';
  earned: boolean;
  dateEarned?: string;
}

export type BuddyConnectStatus = 'none' | 'requested' | 'connected';

export interface BuddyProfile {
  id: string;
  name: string;
  matchScore: number;
  major: string;
  tags: { label: string; type: 'steps' | 'cycling' | 'hydration' | 'gym' | 'running' | 'general' }[];
  bio: string;
  status: BuddyConnectStatus;
  statusText?: string;
  avatarLetter: string;
  schedule: string;
  preferredSpot: string;
  dailyWater: string;
  streak: number;
}
