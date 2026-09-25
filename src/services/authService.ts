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
  onAuthStateChanged,
  Unsubscribe
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

// Configure Google OAuth provider
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account'
});

export interface SignUpExtraData {
  campus?: string;
  major?: string;
  year?: string;
  name?: string;
}

/**
 * Authentication Service using Firebase Authentication
 * Supports:
 * - Email / Password sign-in & registration
 * - Google OAuth sign-in via popup
 * - Active session listener & user resolution
 * - Password reset via email
 * - Sign out / Session termination
 * - Automated user profile creation & Firestore synchronization
 */
export const authService = {
  /**
   * Get the current active Firebase Auth user
   */
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },

  /**
   * Check if there is an active session
   */
  isAuthenticated(): boolean {
    return !!auth.currentUser;
  },

  /**
   * Subscribe to Firebase Authentication state changes
   * Calls callback whenever user signs in, signs out, or token refreshes
   */
  subscribeToAuthState(callback: (user: FirebaseUser | null) => void): Unsubscribe {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Sign in with Email and Password
   */
  async signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      return credential.user;
    } catch (error) {
      console.error('authService: Email sign-in failed', error);
      throw error;
    }
  },

  /**
   * Register with Email and Password
   */
  async signUpWithEmail(
    email: string, 
    password: string, 
    displayName?: string, 
    extra?: SignUpExtraData
  ): Promise<FirebaseUser> {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = credential.user;

      if (displayName?.trim()) {
        try {
          await updateProfile(user, { displayName: displayName.trim() });
        } catch (profileErr) {
          console.warn('authService: Failed to update displayName in auth profile', profileErr);
        }
      }

      // Initialize Firestore profile document for the newly registered student
      const initialProfile: UserProfile = {
        id: user.uid,
        name: displayName?.trim() || email.split('@')[0],
        email: email.trim(),
        campus: extra?.campus || 'Nova Pioneer Campus',
        major: extra?.major || '',
        year: extra?.year || 'Freshman',
        avatarLetter: (displayName?.trim() || email.trim()).charAt(0).toUpperCase(),
        dailyStepGoal: 10000,
        dailyActiveGoal: 45,
        dailyWaterGoal: 8,
        streakCount: 0,
      };

      await setDoc(doc(db, 'users', user.uid), {
        ...initialProfile,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      return user;
    } catch (error) {
      console.error('authService: Email registration failed', error);
      throw error;
    }
  },

  /**
   * Sign in with Google OAuth using popup
   */
  async signInWithGoogle(): Promise<FirebaseUser> {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;

      // Ensure Firestore user document exists or initialize defaults
      await this.getOrCreateUserProfile(user);

      return user;
    } catch (error) {
      console.error('authService: Google OAuth sign-in failed', error);
      throw error;
    }
  },

  /**
   * Send Password Reset Email
   */
  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error) {
      console.error('authService: Password reset email failed', error);
      throw error;
    }
  },

  /**
   * Sign out current user and end active session
   */
  async signOutUser(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('authService: Sign out failed', error);
      throw error;
    }
  },

  /**
   * Get existing UserProfile from Firestore or initialize a default one for active user
   */
  async getOrCreateUserProfile(user: FirebaseUser, extra?: SignUpExtraData): Promise<UserProfile> {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: user.uid,
          name: data.name || user.displayName || user.email?.split('@')[0] || 'Student',
          email: data.email || user.email || '',
          campus: data.campus || 'Nova Pioneer Campus',
          major: data.major || extra?.major || '',
          year: data.year || extra?.year || 'Sophomore',
          avatarLetter: (data.name || user.displayName || user.email || 'S').charAt(0).toUpperCase(),
          dailyStepGoal: Number(data.dailyStepGoal) || 10000,
          dailyActiveGoal: Number(data.dailyActiveGoal) || 45,
          dailyWaterGoal: Number(data.dailyWaterGoal) || 8,
          streakCount: Number(data.streakCount) || 0,
        };
      }

      // Document does not exist: create default profile
      const newProfile: UserProfile = {
        id: user.uid,
        name: extra?.name || user.displayName || user.email?.split('@')[0] || 'Student',
        email: user.email || '',
        campus: extra?.campus || 'Nova Pioneer Campus',
        major: extra?.major || '',
        year: extra?.year || 'Sophomore',
        avatarLetter: (user.displayName || user.email || 'S').charAt(0).toUpperCase(),
        dailyStepGoal: 10000,
        dailyActiveGoal: 45,
        dailyWaterGoal: 8,
        streakCount: 0,
      };

      await setDoc(userDocRef, {
        ...newProfile,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      return newProfile;
    } catch (err) {
      console.warn('authService: Error fetching/creating user profile from Firestore:', err);
      // Fallback local representation
      return {
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Student',
        email: user.email || '',
        campus: 'Nova Pioneer Campus',
        major: extra?.major || '',
        year: 'Sophomore',
        avatarLetter: (user.displayName || user.email || 'S').charAt(0).toUpperCase(),
        dailyStepGoal: 10000,
        dailyActiveGoal: 45,
        dailyWaterGoal: 8,
        streakCount: 0,
      };
    }
  },

  /**
   * Human-friendly error translation for Firebase Authentication errors
   */
  formatAuthError(err: unknown): string {
    if (!(err instanceof Error)) {
      return 'An unexpected authentication error occurred.';
    }
    const message = err.message || '';

    if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password')) {
      return 'Incorrect email or password. Please verify your credentials and try again.';
    }
    if (message.includes('auth/user-not-found')) {
      return 'No account found for this email address. Switch to "Sign Up" to create one.';
    }
    if (message.includes('auth/email-already-in-use')) {
      return 'An account with this email address already exists. Please sign in instead.';
    }
    if (message.includes('auth/weak-password')) {
      return 'Password is too weak. Please choose a password with at least 6 characters.';
    }
    if (message.includes('auth/invalid-email')) {
      return 'Please enter a valid email address.';
    }
    if (message.includes('auth/operation-not-allowed')) {
      return 'Email/Password sign-in is not enabled. Please enable it in Firebase Console or use Google Sign-In.';
    }
    if (message.includes('auth/popup-closed-by-user')) {
      return 'Sign-in window closed before completing authentication. Please try again.';
    }
    if (message.includes('auth/popup-blocked')) {
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    }
    if (message.includes('auth/network-request-failed')) {
      return 'Network connection issue. Please check your internet connectivity.';
    }
    if (message.includes('auth/too-many-requests')) {
      return 'Too many unsuccessful attempts. Access has been temporarily paused. Try again later or reset password.';
    }

    return message.replace(/^Firebase:\s*/, '');
  }
};
