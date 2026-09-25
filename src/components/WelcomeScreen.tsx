import { motion } from 'motion/react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function WelcomeScreen({ onGetStarted, onSignIn }: WelcomeScreenProps) {
  return (
    <div id="welcome-screen" className="relative min-h-[90vh] flex flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-50/40 via-white to-orange-50/30 px-6 py-10 sm:px-10">
      {/* Organic background abstract shapes */}
      <div className="pointer-events-none absolute -top-24 -left-20 w-80 h-80 bg-emerald-100/50 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-72 h-72 bg-amber-100/40 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/4 w-80 h-80 bg-teal-100/30 rounded-full blur-3xl" />

      {/* Main Content */}
      <div className="relative z-10 max-w-md mx-auto w-full pt-10 sm:pt-14 flex flex-col items-center text-center">
        {/* Brand Titles */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <h1 id="welcome-title" className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            FitBuddy
          </h1>
          <p id="welcome-tagline" className="mt-2 text-base font-medium text-slate-600">
            The student fitness & buddy-finder network
          </p>
        </motion.div>

        {/* Narrative */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-10 sm:mt-14"
        >
          <h2 id="welcome-heading" className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">
            Your wellness journey starts here
          </h2>
          <p id="welcome-description" className="mt-3 text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            Track steps, monitor hydration, build great habits, and connect with like-minded campus fitness buddies.
          </p>
        </motion.div>
      </div>

      {/* Bottom Actions */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="relative z-10 max-w-md mx-auto w-full pt-6 pb-2 space-y-3"
      >
        <button
          id="btn-welcome-get-started"
          onClick={onGetStarted}
          className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Get Started for Free</span>
        </button>

        <button
          id="btn-welcome-signin"
          onClick={onSignIn}
          className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 active:scale-[0.99] text-slate-800 font-semibold text-sm sm:text-base transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>I have an account • Sign In</span>
        </button>

        <p className="text-[11px] text-center text-slate-500 pt-2">
          By starting, you agree to our{' '}
          <a href="#" onClick={(e) => e.preventDefault()} className="underline text-slate-700 hover:text-emerald-700">Terms of Service</a> &{' '}
          <a href="#" onClick={(e) => e.preventDefault()} className="underline text-slate-700 hover:text-emerald-700">Privacy Policy</a>
        </p>
      </motion.div>
    </div>
  );
}
