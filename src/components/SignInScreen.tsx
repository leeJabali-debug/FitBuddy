import React, { useState } from 'react';
import { Sparkles, Eye, EyeOff, ArrowLeft, Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { authService } from '../services/authService';

interface SignInScreenProps {
  onSuccess: (user?: Partial<UserProfile>) => void;
  onBack: () => void;
  initialMode?: 'signin' | 'signup';
}

export function SignInScreen({ onSuccess, onBack, initialMode = 'signin' }: SignInScreenProps) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [major, setMajor] = useState('');
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password flow
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');
  const [resetError, setResetError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your campus email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (isSignUp && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (isSignUp && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (isSignUp) {
        const fbUser = await authService.signUpWithEmail(email, password, name, {
          major: major.trim(),
        });
        if (fbUser) {
          const profile = await authService.getOrCreateUserProfile(fbUser, {
            name: name.trim(),
            major: major.trim(),
          });
          onSuccess(profile);
        }
      } else {
        const fbUser = await authService.signInWithEmail(email, password);
        if (fbUser) {
          const profile = await authService.getOrCreateUserProfile(fbUser);
          onSuccess(profile);
        }
      }
    } catch (err: unknown) {
      setError(authService.formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      const fbUser = await authService.signInWithGoogle();
      if (fbUser) {
        const profile = await authService.getOrCreateUserProfile(fbUser);
        onSuccess(profile);
      }
    } catch (err: unknown) {
      setError(authService.formatAuthError(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSendResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetError('Please enter your registered email address.');
      return;
    }
    setResetLoading(true);
    setResetError('');
    setResetSuccessMessage('');

    try {
      await authService.sendPasswordReset(resetEmail);
      setResetSuccessMessage(`Password reset link dispatched to ${resetEmail.trim()}. Please check your email inbox.`);
    } catch (err: unknown) {
      setResetError(authService.formatAuthError(err));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div id="auth-screen" className="relative min-h-[90vh] flex flex-col justify-between bg-white px-6 py-6 sm:px-10">
      {/* Top bar */}
      <div className="max-w-md mx-auto w-full flex items-center justify-start">
        <button
          id="btn-auth-back"
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      <div className="max-w-md mx-auto w-full my-auto py-6">
        {/* Wireframe Logo Box */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 border-2 border-dashed border-emerald-300 rounded-2xl flex items-center justify-center bg-emerald-50 text-emerald-600 mb-3 shadow-2xs">
            <Sparkles className="w-7 h-7 text-emerald-600" />
          </div>
          <h1 id="auth-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            {isSignUp ? 'Create Campus Account' : 'Welcome Back'}
          </h1>
          <p id="auth-subtitle" className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            {isSignUp 
              ? 'Sign up with campus email or Google to track goals & find workout buddies'
              : 'Sign in with your email & password or Google account'}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2.5"
          >
            <span className="font-bold text-rose-500 mt-0.5">!</span>
            <span className="leading-relaxed">{error}</span>
          </motion.div>
        )}

        {/* Primary OAuth Option: Google Authentication */}
        <div className="mb-5">
          <button
            type="button"
            id="btn-firebase-google-auth"
            onClick={handleGoogleAuth}
            disabled={isGoogleLoading || isSubmitting}
            className="w-full h-11 px-4 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 border border-[#dadce0] text-[#3c4043] font-medium text-sm transition-all shadow-2xs flex items-center justify-center space-x-3 cursor-pointer disabled:opacity-60"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                <span className="text-slate-600">Connecting to Google...</span>
              </>
            ) : (
              <>
                {/* Official Google 'G' Logo */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="font-medium tracking-normal text-slate-700">Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* OR Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-400 font-bold font-mono">OR EMAIL & PASSWORD</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="auth-name" className="text-xs font-bold text-slate-700">Full Name</label>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">INPUT</span>
                </div>
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  required={isSignUp}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="auth-major" className="text-xs font-bold text-slate-700">Campus Major & Focus</label>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">INPUT</span>
                </div>
                <input
                  id="auth-major"
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="e.g. Kinesiology Junior"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  required={isSignUp}
                />
              </div>
            </motion.div>
          )}

          {/* Campus Email Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="auth-email" className="text-xs font-bold text-slate-700">
                Email Address
              </label>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">INPUT</span>
            </div>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors bg-white font-mono text-slate-800"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="auth-password" className="text-xs font-bold text-slate-700">
                Password
              </label>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                {isSignUp ? 'MIN 6 CHARS' : 'INPUT'}
              </span>
            </div>
            <div className="relative">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 pr-14 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors bg-white font-mono"
                required
              />
              <button
                type="button"
                id="btn-auth-toggle-show"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-500 hover:text-slate-900 tracking-wider flex items-center gap-1 uppercase cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'HIDE' : 'SHOW'}</span>
              </button>
            </div>
          </div>

          {/* Forgot Password Toggle */}
          {!isSignUp && (
            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                id="btn-forgot-password-toggle"
                onClick={() => {
                  setShowForgotPassword(!showForgotPassword);
                  setResetEmail(email);
                  setResetError('');
                  setResetSuccessMessage('');
                }}
                className="text-xs font-semibold text-slate-500 hover:text-emerald-700 flex items-center space-x-1 cursor-pointer"
              >
                <span>Forgot password?</span>
              </button>
            </div>
          )}

          {/* Forgot Password Accordion */}
          <AnimatePresence>
            {showForgotPassword && !isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 overflow-hidden"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Send Password Reset Email</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Enter your registered campus email to receive a password reset link from Firebase:
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    onClick={handleSendResetPassword}
                    disabled={resetLoading}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    {resetLoading ? 'Sending...' : 'Send'}
                  </button>
                </div>
                {resetError && (
                  <p className="text-[11px] text-rose-600 font-medium">{resetError}</p>
                )}
                {resetSuccessMessage && (
                  <div className="flex items-start gap-1.5 text-[11px] text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{resetSuccessMessage}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Primary CTA */}
          <button
            type="submit"
            id="btn-auth-submit"
            disabled={isSubmitting || isGoogleLoading}
            className="w-full py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isSignUp ? 'Creating Campus Account...' : 'Signing In...'}</span>
              </>
            ) : (
              <span>{isSignUp ? 'Create Campus Account' : 'Sign In with Email & Password'}</span>
            )}
          </button>
        </form>

        {/* Toggle sign in / sign up */}
        <div className="text-center mt-4 text-xs text-slate-600">
          <span>{isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}</span>
          <button
            type="button"
            id="btn-auth-toggle-mode"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setShowForgotPassword(false);
            }}
            className="font-bold text-slate-900 underline hover:text-emerald-700 cursor-pointer ml-1 inline-flex items-center space-x-1"
          >
            <span>{isSignUp ? 'Sign In' : 'Sign Up'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

