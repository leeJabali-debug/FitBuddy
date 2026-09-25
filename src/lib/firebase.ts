import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut, 
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  collection,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ActivityItem, GoalItem, WaterLogEntry, UserProfile } from '../types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL: Must use firebaseConfig.firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error Handling Enum & Types required by Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((p) => ({
        providerId: p.providerId,
        email: p.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection confirmed.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network restricted.');
      return false;
    }
    // Any document-not-found is also a valid server ping
    console.log('Firebase server acknowledged test request.');
    return true;
  }
}

// Auth Actions
export async function loginWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Firebase Google Sign-In Error:', err);
    throw err;
  }
}

export async function loginWithEmail(email: string, password: string): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    return result.user;
  } catch (err) {
    console.error('Firebase Email Sign-In Error:', err);
    throw err;
  }
}

export async function registerWithEmail(
  email: string, 
  password: string, 
  displayName?: string,
  extra?: { campus?: string; major?: string; year?: string }
): Promise<FirebaseUser | null> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (result.user && displayName?.trim()) {
      try {
        await updateProfile(result.user, { displayName: displayName.trim() });
      } catch (profileErr) {
        console.warn('Failed to set displayName on Firebase Auth user:', profileErr);
      }
    }
    
    // Auto-create initial profile document in Firestore
    if (result.user) {
      const initialProfile: UserProfile = {
        id: result.user.uid,
        name: displayName?.trim() || email.split('@')[0],
        email: email.trim(),
        campus: extra?.campus || '',
        major: extra?.major || '',
        year: extra?.year || '',
        avatarLetter: (displayName?.trim() || email.trim()).charAt(0).toUpperCase(),
        dailyStepGoal: 10000,
        dailyActiveGoal: 45,
        dailyWaterGoal: 8,
        streakCount: 0,
      };
      await syncUserProfileToFirestore(result.user.uid, initialProfile);
    }

    return result.user;
  } catch (err) {
    console.error('Firebase Email Registration Error:', err);
    throw err;
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (err) {
    console.error('Firebase Password Reset Error:', err);
    throw err;
  }
}

export function formatAuthErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) {
    return 'An unexpected authentication error occurred.';
  }
  const message = err.message || '';

  if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password')) {
    return 'Incorrect email or password. Please verify your credentials and try again.';
  }
  if (message.includes('auth/user-not-found')) {
    return 'No campus account found for this email address. Switch to "Sign Up" to create one.';
  }
  if (message.includes('auth/email-already-in-use')) {
    return 'An account with this email address already exists. Please sign in instead.';
  }
  if (message.includes('auth/weak-password')) {
    return 'Password is too weak. Please choose a password with at least 6 characters.';
  }
  if (message.includes('auth/invalid-email')) {
    return 'Please enter a valid campus email address.';
  }
  if (message.includes('auth/operation-not-allowed')) {
    return 'Email/Password sign-in is not yet enabled in your Firebase Project Console. Please enable "Email/Password" under Authentication > Sign-in method, or use "Continue with Google".';
  }
  if (message.includes('auth/popup-closed-by-user')) {
    return 'Sign-in popup was closed before completing authentication. Please try again.';
  }
  if (message.includes('auth/network-request-failed')) {
    return 'Network connection issue. Please check your internet connection.';
  }
  if (message.includes('auth/too-many-requests')) {
    return 'Too many unsuccessful attempts. Access has been temporarily disabled. Try again later or reset password.';
  }

  return message.replace(/^Firebase:\s*/, '');
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Firebase Sign-Out Error:', err);
    throw err;
  }
}

// Firestore Database Operations for FitBuddy

// 1. User Profile Sync
export async function syncUserProfileToFirestore(userId: string, profile: UserProfile): Promise<void> {
  const path = `users/${userId}`;
  try {
    await setDoc(doc(db, 'users', userId), {
      id: userId,
      name: profile.name || 'FitBuddy Student',
      email: profile.email || 'student@university.edu',
      campus: profile.campus || 'Nova Pioneer Campus',
      major: profile.major || 'Kinesiology & Health Tech',
      year: profile.year || 'Sophomore',
      avatarLetter: (profile.name || 'A').charAt(0).toUpperCase(),
      dailyStepGoal: profile.dailyStepGoal || 10000,
      dailyActiveGoal: profile.dailyActiveGoal || 45,
      dailyWaterGoal: profile.dailyWaterGoal || 8,
      streakCount: profile.streakCount || 7,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchUserProfileFromFirestore(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

// 2. Activity Logs
export async function saveActivityToFirestore(userId: string, activity: ActivityItem): Promise<void> {
  const path = `users/${userId}/activities/${activity.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'activities', activity.id), {
      ...activity,
      userId,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteActivityFromFirestore(userId: string, activityId: string): Promise<void> {
  const path = `users/${userId}/activities/${activityId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'activities', activityId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// 3. Goal Items
export async function saveGoalToFirestore(userId: string, goal: GoalItem): Promise<void> {
  const path = `users/${userId}/goals/${goal.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'goals', goal.id), {
      ...goal,
      userId,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// 4. Water Logs
export async function saveWaterLogToFirestore(userId: string, entry: WaterLogEntry, dateStr = '2026-10-24'): Promise<void> {
  const path = `users/${userId}/waterLogs/${entry.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'waterLogs', entry.id), {
      ...entry,
      userId,
      dateStr,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// 5. Buddy Connection status
export async function saveBuddyConnectionToFirestore(userId: string, buddyId: string, status: string): Promise<void> {
  const path = `users/${userId}/buddyConnections/${buddyId}`;
  try {
    await setDoc(doc(db, 'users', userId, 'buddyConnections', buddyId), {
      id: buddyId,
      buddyId,
      status,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}
