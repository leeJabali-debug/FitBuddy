import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  AppView, 
  MainTab, 
  UserProfile, 
  ActivityItem, 
  GoalItem, 
  SuggestedGoal, 
  WaterLogEntry, 
  DayHydration, 
  BuddyProfile, 
  AchievementBadge 
} from './types';
import { 
  INITIAL_USER, 
  INITIAL_ACTIVITIES, 
  CALENDAR_DAYS, 
  INITIAL_WATER_LOGS, 
  INITIAL_WEEKLY_HYDRATION, 
  INITIAL_GOALS, 
  SUGGESTED_GOALS, 
  INITIAL_ACHIEVEMENTS, 
  INITIAL_BUDDIES 
} from './data/initialData';

// Device Motion Step Counting Hook
import { useDeviceMotionStepCounter } from './hooks/useDeviceMotionStepCounter';

// Firebase Integrations
import { 
  auth, 
  db,
  testFirebaseConnection, 
  logoutUser, 
  saveActivityToFirestore, 
  deleteActivityFromFirestore, 
  saveGoalToFirestore, 
  saveWaterLogToFirestore, 
  saveBuddyConnectionToFirestore, 
  syncUserProfileToFirestore, 
  fetchUserProfileFromFirestore,
  handleFirestoreError,
  OperationType
} from './lib/firebase';
import { authService } from './services/authService';
import { User as FirebaseUser } from 'firebase/auth';
import { collection, onSnapshot, doc } from 'firebase/firestore';

// Components
import { TopStatusBar } from './components/TopStatusBar';
import { Navigation } from './components/Navigation';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SignInScreen } from './components/SignInScreen';
import { HomeDashboard } from './components/HomeDashboard';
import { ActivityLogView } from './components/ActivityLogView';
import { WeeklySummaryView } from './components/WeeklySummaryView';
import { GoalsView } from './components/GoalsView';
import { HydrationView } from './components/HydrationView';
import { BuddyFinderView } from './components/BuddyFinderView';

// Modals
import { AddActivityModal } from './components/modals/AddActivityModal';
import { CreateGoalModal } from './components/modals/CreateGoalModal';
import { CustomWaterModal } from './components/modals/CustomWaterModal';
import { BuddyDetailModal } from './components/modals/BuddyDetailModal';
import { UserProfileModal } from './components/modals/UserProfileModal';

import { Loader2 } from 'lucide-react';

export default function App() {
  // Navigation & View State: default to 'welcome', redirect immediately to 'home' when active session exists
  const [currentView, setCurrentView] = useState<AppView>('welcome');
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [cloudSynced, setCloudSynced] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'signup'>('signin');

  // Core Data States with localStorage persistence fallback and legacy dummy data purging
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('fitbuddy_user');
    if (!saved) return INITIAL_USER;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.id === 'user_alex') return INITIAL_USER;
      return parsed;
    } catch {
      return INITIAL_USER;
    }
  });

  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem('fitbuddy_activities');
    if (!saved) return [];
    try {
      const parsed: ActivityItem[] = JSON.parse(saved);
      return parsed.filter((a) => a.id !== 'act_1' && a.id !== 'act_2' && a.id !== 'act_3');
    } catch {
      return [];
    }
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [waterLogs, setWaterLogs] = useState<WaterLogEntry[]>(() => {
    const saved = localStorage.getItem('fitbuddy_water_logs');
    if (!saved) return [];
    try {
      const parsed: WaterLogEntry[] = JSON.parse(saved);
      return parsed.filter((w) => !['w1', 'w2', 'w3', 'w4', 'w5'].includes(w.id));
    } catch {
      return [];
    }
  });

  const [waterGlasses, setWaterGlasses] = useState<number>(() => {
    const saved = localStorage.getItem('fitbuddy_water_logs');
    if (!saved) return 0;
    try {
      const parsed: WaterLogEntry[] = JSON.parse(saved);
      const clean = parsed.filter((w) => !['w1', 'w2', 'w3', 'w4', 'w5'].includes(w.id));
      return clean.reduce((sum, w) => sum + (w.glasses || 0), 0);
    } catch {
      return 0;
    }
  });

  const [weeklyHydration, setWeeklyHydration] = useState<DayHydration[]>(INITIAL_WEEKLY_HYDRATION);

  const [goals, setGoals] = useState<GoalItem[]>(() => {
    const saved = localStorage.getItem('fitbuddy_goals');
    if (!saved) return [];
    try {
      const parsed: GoalItem[] = JSON.parse(saved);
      return parsed.filter((g) => !['g_1', 'g_2', 'g_3'].includes(g.id));
    } catch {
      return [];
    }
  });

  const [suggestedGoals, setSuggestedGoals] = useState<SuggestedGoal[]>(SUGGESTED_GOALS);
  const [achievements, setAchievements] = useState<AchievementBadge[]>(INITIAL_ACHIEVEMENTS);
  const [buddies, setBuddies] = useState<BuddyProfile[]>(() => {
    const saved = localStorage.getItem('fitbuddy_buddies');
    if (!saved) return [];
    try {
      const parsed: BuddyProfile[] = JSON.parse(saved);
      return parsed.filter((b) => !['bud_1', 'bud_2', 'bud_3', 'bud_4'].includes(b.id));
    } catch {
      return [];
    }
  });

  // Modal Visibility States
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalItem | null>(null);
  const [isCustomWaterOpen, setIsCustomWaterOpen] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState<BuddyProfile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Boot: Test connection and attach Firebase Auth listener
  useEffect(() => {
    testFirebaseConnection();

    // Fallback in case auth initialization takes over 1.2 seconds
    const fallbackTimer = setTimeout(() => {
      setIsAuthChecking(false);
    }, 1200);

    const unsubscribe = authService.subscribeToAuthState(async (fbUser) => {
      clearTimeout(fallbackTimer);
      setFirebaseUser(fbUser);
      if (fbUser) {
        setCloudSynced(true);
        try {
          const profile = await authService.getOrCreateUserProfile(fbUser);
          setUser(profile);
        } catch (profileErr) {
          console.error('Error syncing profile for authenticated user:', profileErr);
        }
        // REDIRECT AUTHENTICATED USERS WITH AN ACTIVE SESSION TO THE DASHBOARD
        setCurrentView('home');
        setActiveTab('home');
      } else {
        setCloudSynced(false);
      }
      setIsAuthChecking(false);
    });

    return () => {
      clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, []);

  // Continuous Session Guard: Redirect authenticated users with an active session to the Dashboard
  useEffect(() => {
    if (firebaseUser && (currentView === 'welcome' || currentView === 'signin')) {
      setCurrentView('home');
      setActiveTab('home');
    }
  }, [firebaseUser, currentView]);

  // Real-time Firestore synchronization for authenticated user
  useEffect(() => {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;

    // 1. Subscribe to Activities
    const actColRef = collection(db, 'users', uid, 'activities');
    const unsubActivities = onSnapshot(actColRef, (snapshot) => {
      const loadedActivities: ActivityItem[] = [];
      snapshot.forEach((docSnap) => {
        loadedActivities.push(docSnap.data() as ActivityItem);
      });
      setActivities(loadedActivities);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${uid}/activities`);
    });

    // 2. Subscribe to Goals
    const goalsColRef = collection(db, 'users', uid, 'goals');
    const unsubGoals = onSnapshot(goalsColRef, (snapshot) => {
      const loadedGoals: GoalItem[] = [];
      snapshot.forEach((docSnap) => {
        loadedGoals.push(docSnap.data() as GoalItem);
      });
      setGoals(loadedGoals);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${uid}/goals`);
    });

    // 3. Subscribe to Water Logs
    const waterColRef = collection(db, 'users', uid, 'waterLogs');
    const unsubWater = onSnapshot(waterColRef, (snapshot) => {
      const loadedWater: WaterLogEntry[] = [];
      let totalGlasses = 0;
      snapshot.forEach((docSnap) => {
        const item = docSnap.data() as WaterLogEntry;
        loadedWater.push(item);
        totalGlasses += item.glasses || 0;
      });
      setWaterLogs(loadedWater);
      setWaterGlasses(Math.round(totalGlasses * 10) / 10);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${uid}/waterLogs`);
    });

    // 4. Subscribe to Buddy Connections
    const buddiesColRef = collection(db, 'users', uid, 'buddyConnections');
    const unsubBuddies = onSnapshot(buddiesColRef, (snapshot) => {
      if (!snapshot.empty) {
        const statusMap: Record<string, string> = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.buddyId && data.status) {
            statusMap[data.buddyId] = data.status;
          }
        });
        setBuddies((prev) =>
          prev.map((b) => (statusMap[b.id] ? { ...b, status: statusMap[b.id] as any } : b))
        );
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${uid}/buddyConnections`);
    });

    return () => {
      unsubActivities();
      unsubGoals();
      unsubWater();
      unsubBuddies();
    };
  }, [firebaseUser]);

  // Sync to LocalStorage as fast offline fallback
  useEffect(() => {
    localStorage.setItem('fitbuddy_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('fitbuddy_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('fitbuddy_water_glasses', JSON.stringify(waterGlasses));
  }, [waterGlasses]);

  useEffect(() => {
    localStorage.setItem('fitbuddy_water_logs', JSON.stringify(waterLogs));
  }, [waterLogs]);

  useEffect(() => {
    localStorage.setItem('fitbuddy_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('fitbuddy_buddies', JSON.stringify(buddies));
  }, [buddies]);

  // Real-time uncommitted motion steps detected by device accelerometer
  const [uncommittedMotionSteps, setUncommittedMotionSteps] = useState<number>(0);
  const motionBufferRef = useRef<number>(0);
  const motionFlushTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMotionStepCounted = useCallback((stepsCount: number, magnitude: number, movementType: string) => {
    // 1. Immediately reflect in real-time step counter and goal meters
    setUncommittedMotionSteps((prev) => prev + stepsCount);
    motionBufferRef.current += stepsCount;

    // 2. Debounce flushing to activities list and Firestore so activity items stay clean
    if (motionFlushTimerRef.current) {
      clearTimeout(motionFlushTimerRef.current);
    }

    motionFlushTimerRef.current = setTimeout(async () => {
      const buffered = motionBufferRef.current;
      if (buffered <= 0) return;
      motionBufferRef.current = 0;

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const newAct: ActivityItem = {
        id: 'act_motion_' + Date.now(),
        title: `Shake Sensor (${buffered} steps)`,
        type: 'walk',
        durationMinutes: Math.max(1, Math.round(buffered / 100)),
        steps: buffered,
        calories: Math.max(1, Math.round(buffered * 0.04)),
        timeStr,
        dateStr: selectedDate,
      };

      setActivities((prev) => [newAct, ...prev]);
      setUncommittedMotionSteps((prev) => Math.max(0, prev - buffered));

      if (firebaseUser) {
        await saveActivityToFirestore(firebaseUser.uid, newAct);
      }
    }, 2000);
  }, [selectedDate, firebaseUser]);

  const motionTracker = useDeviceMotionStepCounter({
    onStepCounted: handleMotionStepCounted,
    defaultActive: true,
  });

  // Derived Steps & Active Minutes from activities on selected day + live motion steps
  const dayActivities = activities.filter((a) => a.dateStr === selectedDate);
  const derivedSteps = dayActivities.reduce((sum, a) => sum + (Number(a.steps) || 0), 0) + uncommittedMotionSteps;
  const derivedActiveMinutes = dayActivities.reduce((sum, a) => sum + (Number(a.durationMinutes) || 0), 0);

  // Sync steps and water with active goals
  useEffect(() => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.category === 'steps') return { ...g, current: derivedSteps };
        if (g.category === 'water') return { ...g, current: waterGlasses };
        return g;
      })
    );
  }, [derivedSteps, waterGlasses]);

  // Handlers
  const handleTabChange = (tab: MainTab) => {
    setActiveTab(tab);
    setCurrentView(tab);
  };

  const handleQuickAddWater = async (addedGlasses = 1, ml = 250) => {
    const newCount = Math.round((waterGlasses + addedGlasses) * 10) / 10;
    setWaterGlasses(newCount);

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newEntry: WaterLogEntry = {
      id: 'w_' + Date.now(),
      timeStr: timeStr,
      glasses: addedGlasses,
      ml: ml,
    };

    setWaterLogs((prev) => [...prev, newEntry]);

    // Update today's hydration in weekly comparison
    const todayIndex = (new Date().getDay() + 6) % 7;
    setWeeklyHydration((prev) =>
      prev.map((d, i) => (i === todayIndex ? { ...d, glasses: Math.min(10, d.glasses + addedGlasses) } : d))
    );

    // Persist to Cloud Firestore if user authenticated
    if (firebaseUser) {
      await saveWaterLogToFirestore(firebaseUser.uid, newEntry);
    }
  };

  const handleRemoveWater = () => {
    if (waterGlasses <= 0) return;
    setWaterGlasses((prev) => Math.max(0, Math.round((prev - 1) * 10) / 10));
    setWaterLogs((prev) => prev.slice(0, -1));
  };

  const handleQuickAddSteps = async () => {
    // Add 500 steps as a mini walk
    const newAct: ActivityItem = {
      id: 'act_' + Date.now(),
      title: 'Quick Campus Steps',
      type: 'walk',
      durationMinutes: 6,
      steps: 500,
      calories: 25,
      timeStr: 'Just now',
      dateStr: selectedDate,
    };
    setActivities((prev) => [newAct, ...prev]);

    if (firebaseUser) {
      await saveActivityToFirestore(firebaseUser.uid, newAct);
    }
  };

  const handleSaveActivity = async (newActData: Omit<ActivityItem, 'id'>) => {
    const newAct: ActivityItem = {
      ...newActData,
      id: 'act_' + Date.now(),
    };
    setActivities((prev) => [newAct, ...prev]);

    if (firebaseUser) {
      await saveActivityToFirestore(firebaseUser.uid, newAct);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    if (firebaseUser) {
      await deleteActivityFromFirestore(firebaseUser.uid, id);
    }
  };

  const handleSaveGoal = async (goalData: Omit<GoalItem, 'id'>, editId?: string) => {
    let savedGoal: GoalItem;
    if (editId) {
      savedGoal = { ...goalData, id: editId };
      setGoals((prev) =>
        prev.map((g) => (g.id === editId ? savedGoal : g))
      );
    } else {
      savedGoal = {
        ...goalData,
        id: 'g_' + Date.now(),
      };
      setGoals((prev) => [...prev, savedGoal]);
    }
    setEditingGoal(null);

    if (firebaseUser) {
      await saveGoalToFirestore(firebaseUser.uid, savedGoal);
    }
  };

  const handleAddSuggestedGoal = async (sug: SuggestedGoal) => {
    const newGoal: GoalItem = {
      id: 'g_' + Date.now(),
      title: sug.title,
      current: 0,
      target: sug.target,
      unit: sug.unit,
      category: sug.category,
      custom: true,
    };
    setGoals((prev) => [...prev, newGoal]);

    if (firebaseUser) {
      await saveGoalToFirestore(firebaseUser.uid, newGoal);
    }
  };

  const handleConnectBuddy = async (buddyId: string) => {
    const targetBuddy = buddies.find((b) => b.id === buddyId);
    const nextStatus = targetBuddy?.status === 'none' ? 'connected' : 'none';

    setBuddies((prev) =>
      prev.map((b) => {
        if (b.id !== buddyId) return b;
        return { ...b, status: nextStatus };
      })
    );

    if (selectedBuddy && selectedBuddy.id === buddyId) {
      setSelectedBuddy((prev) => prev ? { ...prev, status: nextStatus } : null);
    }

    if (firebaseUser) {
      await saveBuddyConnectionToFirestore(firebaseUser.uid, buddyId, nextStatus);
    }
  };

  const handleUpdateProfileGoals = async (steps: number, active: number, water: number) => {
    const updatedProfile: UserProfile = {
      ...user,
      dailyStepGoal: steps,
      dailyActiveGoal: active,
      dailyWaterGoal: water,
    };
    setUser(updatedProfile);
    setGoals((prev) =>
      prev.map((g) => {
        if (g.category === 'steps') return { ...g, target: steps };
        if (g.category === 'active') return { ...g, target: active };
        if (g.category === 'water') return { ...g, target: water };
        return g;
      })
    );

    if (firebaseUser) {
      await syncUserProfileToFirestore(firebaseUser.uid, updatedProfile);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOutUser();
    } catch (err) {
      console.error('Sign-out error:', err);
    }
    setFirebaseUser(null);
    setCloudSynced(false);
    setCurrentView('welcome');
  };

  const handleSignInSuccess = (userData?: Partial<UserProfile>) => {
    if (userData) {
      setUser((prev) => ({ ...prev, ...userData }));
    }
    setCurrentView('home');
    setActiveTab('home');
  };

  if (isAuthChecking) {
    return (
      <div id="auth-checking-screen" className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3.5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 animate-pulse">
            <span className="text-white text-xl font-black font-display">FB</span>
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight font-display">FitBuddy</h1>
            <p className="text-xs text-slate-500 font-medium">Campus Fitness & Buddy Network</p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-2xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            <span>Verifying campus session...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center justify-start antialiased selection:bg-emerald-500 selection:text-white">
      {/* Main App Container */}
      <main className="w-full flex-1 flex justify-center items-start p-0 sm:py-6">
        <div className="w-full bg-white transition-all duration-300 flex flex-col justify-between overflow-hidden max-w-md sm:rounded-3xl sm:shadow-lg sm:border sm:border-slate-200/80 min-h-[90vh]">
          {/* Top Mobile Status Bar */}
          {currentView !== 'welcome' && currentView !== 'signin' && (
            <TopStatusBar
              onSignOut={handleSignOut}
              showProfileMenu={true}
            />
          )}

          {/* Dynamic View Router */}
          <div className="flex-1 flex flex-col">
            {currentView === 'welcome' && (
              <WelcomeScreen
                onGetStarted={() => {
                  setAuthInitialMode('signup');
                  setCurrentView('signin');
                }}
                onSignIn={() => {
                  setAuthInitialMode('signin');
                  setCurrentView('signin');
                }}
              />
            )}

            {currentView === 'signin' && (
              <SignInScreen
                initialMode={authInitialMode}
                onSuccess={handleSignInSuccess}
                onBack={() => setCurrentView('welcome')}
              />
            )}

            {currentView === 'home' && (
              <HomeDashboard
                user={user}
                stepsCurrent={derivedSteps}
                stepsTarget={user.dailyStepGoal}
                activeMinutesCurrent={derivedActiveMinutes}
                activeMinutesTarget={user.dailyActiveGoal}
                waterCurrent={waterGlasses}
                waterTarget={user.dailyWaterGoal}
                onNavigateTab={handleTabChange}
                onQuickAddWater={() => handleQuickAddWater(1, 250)}
                onQuickAddSteps={handleQuickAddSteps}
                onOpenAddActivity={() => setIsAddActivityOpen(true)}
                onOpenProfile={() => setIsProfileOpen(true)}
                motionTracker={motionTracker}
              />
            )}

            {currentView === 'activity' && (
              <ActivityLogView
                activities={activities}
                calendarDays={CALENDAR_DAYS}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onOpenAddModal={() => setIsAddActivityOpen(true)}
                onViewWeeklySummary={() => setCurrentView('weekly-summary')}
                onDeleteActivity={handleDeleteActivity}
              />
            )}

            {currentView === 'weekly-summary' && (
              <WeeklySummaryView
                onBack={() => setCurrentView('activity')}
                onShare={() => {}}
                achievements={achievements}
                activities={activities}
                waterGlasses={waterGlasses}
                user={user}
              />
            )}

            {currentView === 'goals' && (
              <GoalsView
                goals={goals}
                suggestedGoals={suggestedGoals}
                onAddSuggestedGoal={handleAddSuggestedGoal}
                onOpenCreateGoal={() => {
                  setEditingGoal(null);
                  setIsCreateGoalOpen(true);
                }}
                onEditGoal={(goal) => {
                  setEditingGoal(goal);
                  setIsCreateGoalOpen(true);
                }}
              />
            )}

            {currentView === 'hydration' && (
              <HydrationView
                currentGlasses={waterGlasses}
                goalGlasses={user.dailyWaterGoal}
                logs={waterLogs}
                weeklyData={weeklyHydration}
                onAddWater={handleQuickAddWater}
                onRemoveWater={handleRemoveWater}
                onOpenCustomModal={() => setIsCustomWaterOpen(true)}
                onResetToday={() => {
                  setWaterGlasses(0);
                  setWaterLogs([]);
                }}
              />
            )}

            {currentView === 'buddies' && (
              <BuddyFinderView
                buddies={buddies}
                onConnectBuddy={handleConnectBuddy}
                onSelectBuddy={(buddy) => setSelectedBuddy(buddy)}
              />
            )}
          </div>

          {/* Bottom Tab Bar (Visible when not in Welcome or Sign In screens) */}
          {currentView !== 'welcome' && currentView !== 'signin' && (
            <Navigation
              activeTab={activeTab}
              onTabChange={handleTabChange}
              unreadBuddiesCount={buddies.filter((b) => b.status === 'requested').length}
            />
          )}
        </div>
      </main>

      {/* Modals & Dialogs */}
      <AddActivityModal
        isOpen={isAddActivityOpen}
        onClose={() => setIsAddActivityOpen(false)}
        onSave={handleSaveActivity}
        selectedDate={selectedDate}
      />

      <CreateGoalModal
        isOpen={isCreateGoalOpen}
        onClose={() => {
          setIsCreateGoalOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        editingGoal={editingGoal}
      />

      <CustomWaterModal
        isOpen={isCustomWaterOpen}
        onClose={() => setIsCustomWaterOpen(false)}
        onAddCustomWater={(glasses, ml) => handleQuickAddWater(glasses, ml)}
      />

      <BuddyDetailModal
        buddy={selectedBuddy}
        isOpen={!!selectedBuddy}
        onClose={() => setSelectedBuddy(null)}
        onConnect={handleConnectBuddy}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        achievements={achievements}
        onUpdateGoals={handleUpdateProfileGoals}
        onSignOut={handleSignOut}
      />
    </div>
  );
}

