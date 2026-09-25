import { 
  UserProfile, 
  ActivityItem, 
  DayActivity, 
  WaterLogEntry, 
  DayHydration, 
  GoalItem, 
  SuggestedGoal, 
  AchievementBadge, 
  BuddyProfile 
} from '../types';

export const INITIAL_USER: UserProfile = {
  id: '',
  name: 'Student',
  email: '',
  campus: '',
  major: '',
  year: '',
  avatarLetter: 'S',
  dailyStepGoal: 10000,
  dailyActiveGoal: 45,
  dailyWaterGoal: 8,
  streakCount: 0,
};

export const INITIAL_ACTIVITIES: ActivityItem[] = [];

export function getCurrentWeekCalendarDays(): DayActivity[] {
  const today = new Date();
  const currentDayIndex = today.getDay();
  // Monday of the current week
  const monday = new Date(today);
  const diffToMonday = (currentDayIndex + 6) % 7;
  monday.setDate(today.getDate() - diffToMonday);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const result: DayActivity[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    result.push({
      dayName: dayNames[i],
      dayNum: d.getDate(),
      fullDate: d.toISOString().split('T')[0],
      hasData: false,
    });
  }
  return result;
}

export const CALENDAR_DAYS: DayActivity[] = getCurrentWeekCalendarDays();

export const INITIAL_WATER_LOGS: WaterLogEntry[] = [];

export const INITIAL_WEEKLY_HYDRATION: DayHydration[] = [
  { dayName: 'M', dateStr: 'Mon', glasses: 0, targetGlasses: 8 },
  { dayName: 'T', dateStr: 'Tue', glasses: 0, targetGlasses: 8 },
  { dayName: 'W', dateStr: 'Wed', glasses: 0, targetGlasses: 8 },
  { dayName: 'T', dateStr: 'Thu', glasses: 0, targetGlasses: 8 },
  { dayName: 'F', dateStr: 'Fri', glasses: 0, targetGlasses: 8 },
  { dayName: 'S', dateStr: 'Sat', glasses: 0, targetGlasses: 8 },
  { dayName: 'S', dateStr: 'Sun', glasses: 0, targetGlasses: 8 },
];

export const INITIAL_GOALS: GoalItem[] = [];

export const SUGGESTED_GOALS: SuggestedGoal[] = [
  {
    id: 'sg_1',
    title: 'Daily Walk Streak',
    description: 'Walk 15 mins daily for 5 days',
    target: 5,
    unit: 'days',
    category: 'steps',
  },
  {
    id: 'sg_2',
    title: 'Hydration Champion',
    description: 'Hit 8 glasses water for 3 consecutive days',
    target: 3,
    unit: 'days',
    category: 'water',
  },
  {
    id: 'sg_3',
    title: 'Campus Loop Run',
    description: 'Outdoor jog across campus trail',
    target: 5000,
    unit: 'steps',
    category: 'workout',
  },
];

export const INITIAL_ACHIEVEMENTS: AchievementBadge[] = [
  {
    id: 'ach_1',
    title: 'Daily Streaker',
    description: 'Log workouts 3 days in a row',
    iconName: 'star',
    earned: false,
  },
  {
    id: 'ach_2',
    title: 'Water Champ',
    description: 'Hit daily hydration goal',
    iconName: 'droplet',
    earned: false,
  },
  {
    id: 'ach_3',
    title: 'Campus Climber',
    description: 'Reach 10,000 steps in a day',
    iconName: 'flame',
    earned: false,
  },
  {
    id: 'ach_4',
    title: 'Buddy Networker',
    description: 'Connect with a campus buddy',
    iconName: 'award',
    earned: false,
  },
];

export const INITIAL_BUDDIES: BuddyProfile[] = [];
