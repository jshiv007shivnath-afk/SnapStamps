import { useState } from 'react';
import { motion } from 'motion/react';
import type { StampItem, UserProfile } from '../types/stamp';
import { PerforatedStampCard } from './PerforatedStampCard';
import { Reicon } from './Reicon';

interface LoginViewProps {
  featuredStamps: StampItem[];
  defaultProfile: UserProfile;
  onAuthenticated: (profile: UserProfile) => void;
  onContinueGuest: () => void;
  onBackToOnboarding: () => void;
}

export function LoginView({
  featuredStamps,
  defaultProfile,
  onAuthenticated,
  onContinueGuest,
  onBackToOnboarding,
}: LoginViewProps) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState(defaultProfile.name);
  const [email, setEmail] = useState(defaultProfile.email);
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const topStamp = featuredStamps.find((s) => s.id === 'madrid') ?? featuredStamps[0];
  const bottomStamp = featuredStamps.find((s) => s.id === 'barcelona') ?? featuredStamps[1] ?? featuredStamps[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'signup' && !name.trim()) {
      setErrorMsg('Please enter your traveler name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Enter a valid email address.');
      return;
    }
    if (passcode.trim().length < 4) {
      setErrorMsg('Passcode must be at least 4 characters.');
      return;
    }

    const finalName = authMode === 'signup' ? name.trim() : defaultProfile.name;
    const initials =
      finalName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('') || 'LC';
    const handleSlug = finalName.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '');

    onAuthenticated({
      ...defaultProfile,
      name: finalName,
      email: email.trim(),
      initials,
      handle: `@${handleSlug || 'traveler'}.passport`,
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col justify-between bg-[#F7F7F9] px-6 py-8 sm:px-10 lg:mx-auto lg:max-w-5xl lg:flex-row lg:items-center lg:gap-16 lg:py-16">
      {/* Tilted Stamp Showcase Collage matching OnboardingScreen DNA */}
      <div className="relative mx-auto flex h-[320px] w-full max-w-[340px] flex-shrink-0 items-center justify-center sm:h-[380px] lg:order-2 lg:mx-0 lg:h-[460px] lg:max-w-[400px]">
        <svg
          viewBox="0 0 360 420"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <path
            d="M 272 115 C 318 148, 316 232, 266 266"
            fill="none"
            stroke="#98D4DC"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <path
            d="M 88 158 C 46 196, 48 272, 96 304"
            fill="none"
            stroke="#F38D31"
            strokeWidth="1.5"
          />
        </svg>

        {topStamp && (
          <motion.div
            initial={{ y: -14, opacity: 0, rotate: -12 }}
            animate={{ y: 0, opacity: 1, rotate: -9 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="absolute left-10 top-4 z-10 w-[144px] sm:left-14 sm:w-[168px]"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-5 translate-y-2 rotate-12 rounded-[18px]"
              style={{ backgroundColor: '#BDE3EB' }}
            />
            <div className="relative z-10">
              <PerforatedStampCard stamp={topStamp} showProgress={false} />
            </div>
          </motion.div>
        )}

        {bottomStamp && (
          <motion.div
            initial={{ y: 14, opacity: 0, rotate: 11 }}
            animate={{ y: 0, opacity: 1, rotate: 7 }}
            transition={{ delay: 0.08, type: 'spring', stiffness: 280, damping: 24 }}
            className="absolute bottom-3 right-10 z-10 w-[144px] sm:right-14 sm:w-[168px]"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-4 -translate-y-1 rotate-12 rounded-[18px]"
              style={{ backgroundColor: '#F7C2A8' }}
            />
            <div className="relative z-10">
              <PerforatedStampCard stamp={bottomStamp} showProgress={false} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Clean Swiss-Minimalist Sign-In Card */}
      <div className="mx-auto flex w-full max-w-md flex-col gap-5 pb-4 lg:order-1 lg:mx-0 lg:max-w-lg">
        <div className="flex items-center justify-between gap-3">
          <span className="font-body text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            SnapStamps Passport
          </span>
          <button
            type="button"
            onClick={onBackToOnboarding}
            className="liquid-glass-btn font-control flex h-10 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium text-[#0A0A0A]"
          >
            <Reicon name="arrow-left" size={14} />
            <span>Back</span>
          </button>
        </div>

        <div className="space-y-2">
          <h1 className="font-hero text-[34px] leading-[1.08] tracking-[-0.025em] text-[#0A0A0A] sm:text-[40px]">
            <span className="block font-bold">
              {authMode === 'signin' ? 'Welcome Back.' : 'Claim Passport.'}
            </span>
            <span className="block font-normal">Open Your Atlas.</span>
          </h1>
          <p className="font-body text-[14px] leading-relaxed text-neutral-500">
            Sign in to access your travel stamp pockets, rare finds feed, and collector milestones.
          </p>
        </div>

        {/* Liquid Glass Segmented Toggle */}
        <div className="liquid-glass-btn-soft flex gap-1.5 rounded-full p-1">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setErrorMsg('');
            }}
            className={`font-control flex h-10 flex-1 items-center justify-center rounded-full text-xs font-medium transition-colors ${
              authMode === 'signin'
                ? 'bg-[#0A0A0A] text-white'
                : 'liquid-glass-btn text-[#0A0A0A]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setErrorMsg('');
            }}
            className={`font-control flex h-10 flex-1 items-center justify-center rounded-full text-xs font-medium transition-colors ${
              authMode === 'signup'
                ? 'bg-[#0A0A0A] text-white'
                : 'liquid-glass-btn text-[#0A0A0A]'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {authMode === 'signup' && (
            <div>
              <label htmlFor="login-name" className="block text-xs font-medium text-neutral-500">
                Traveler Name
              </label>
              <input
                id="login-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Leni Coper"
                className="mt-1 h-12 w-full rounded-2xl bg-white/75 px-4 text-sm text-[#0A0A0A] backdrop-blur-md focus:outline-2 focus:outline-[#0A0A0A]"
              />
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="block text-xs font-medium text-neutral-500">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="leni@snapstamps.app"
              className="mt-1 h-12 w-full rounded-2xl bg-white/75 px-4 text-sm text-[#0A0A0A] backdrop-blur-md focus:outline-2 focus:outline-[#0A0A0A]"
            />
          </div>

          <div>
            <label htmlFor="login-passcode" className="block text-xs font-medium text-neutral-500">
              Passcode
            </label>
            <input
              id="login-passcode"
              type="password"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Enter 4+ character passcode"
              className="mt-1 h-12 w-full rounded-2xl bg-white/75 px-4 text-sm text-[#0A0A0A] backdrop-blur-md focus:outline-2 focus:outline-[#0A0A0A]"
            />
          </div>

          {errorMsg && <p className="text-xs font-medium text-[#D64527]">{errorMsg}</p>}

          <div className="flex flex-col gap-2.5 pt-2">
            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              className="font-control flex h-14 w-full items-center justify-center rounded-full bg-[#0A0A0A] px-8 text-[15px] font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A0A0A]"
            >
              {authMode === 'signin' ? 'Sign In' : 'Create Passport'}
            </motion.button>

            <motion.button
              type="button"
              onClick={onContinueGuest}
              whileTap={{ scale: 0.98 }}
              className="liquid-glass-btn font-control flex h-12 w-full items-center justify-center rounded-full px-6 text-[13px] font-medium text-[#0A0A0A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]"
            >
              Continue as {defaultProfile.name}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
