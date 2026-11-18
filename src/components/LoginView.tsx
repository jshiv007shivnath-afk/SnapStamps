import { useState } from 'react';
import { motion } from 'motion/react';
import type { UserProfile } from '../types/stamp';
import { AppLogo } from './AppLogo';
import { JellyButton } from './JellyButton';
import { JellyRadio } from './JellyRadio';

interface LoginViewProps {
  defaultProfile: UserProfile;
  onAuthenticated: (profile: UserProfile) => void;
  onContinueGoogle: () => void;
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3.01h3.89c2.28-2.1 3.53-5.2 3.53-8.88Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.89-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.95H1.27v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.38-2.28V6.62H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.38l4.01-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.43-3.43C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.27 6.62l4.01 3.1c.95-2.84 3.6-4.95 6.72-4.95Z"
      />
    </svg>
  );
}

export function LoginView({
  defaultProfile,
  onAuthenticated,
  onContinueGoogle,
}: LoginViewProps) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState(defaultProfile.name);
  const [email, setEmail] = useState(defaultProfile.email);
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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
    const handleSlug = finalName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '.')
      .replace(/^\.+|\.+$/g, '');

    onAuthenticated({
      ...defaultProfile,
      name: finalName,
      email: email.trim(),
      initials,
      handle: `@${handleSlug || 'collector'}`,
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col justify-center bg-[#F7F7F9] px-6 py-10 sm:px-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        className="mx-auto flex w-full max-w-[400px] flex-col gap-6"
      >
        {/* SnapStamps Scalloped Seal Logo Lockup */}
        <div className="flex items-center gap-3.5">
          <AppLogo size={52} />
          <div className="min-w-0 leading-tight">
            <p className="font-title text-[17px] font-semibold tracking-[-0.01em] text-[#0A0A0A]">
              SnapStamps
            </p>
            <p className="font-body whitespace-nowrap text-[12px] font-normal text-neutral-500">
              Collector Stamp Vault
            </p>
          </div>
        </div>

        {/* Clean Typographic Hero Lockup */}
        <div className="space-y-2">
          <h1 className="font-hero text-[34px] leading-[1.08] tracking-[-0.025em] text-[#0A0A0A] sm:text-[40px]">
            <span className="block font-bold">
              {authMode === 'signin' ? 'Sign in.' : 'Create account.'}
            </span>
            <span className="block font-normal">Start collecting.</span>
          </h1>
          <p className="font-body text-[14px] leading-relaxed text-neutral-500">
            Save your stamp folders, rare editions, and visited countries across every trip.
          </p>
        </div>

        {/* JellyRadio Mode Toggle */}
        <div className="flex justify-start">
          <JellyRadio
            items={[
              { value: 'signin', label: 'Sign In' },
              { value: 'signup', label: 'Create Account' },
            ]}
            value={authMode}
            onChange={(next) => {
              setAuthMode(next as 'signin' | 'signup');
              setErrorMsg('');
            }}
            chipColor="rgba(255, 255, 255, 0.5)"
            activeColor="#0A0A0A"
            textColor="#0A0A0A"
            activeTextColor="#FFFFFF"
            size="md"
            gap={8}
            radius={20}
            swell={0.07}
            barge={3}
            shrink={0.03}
            jelly={0.9}
            bounce={0.34}
            ariaLabel="Authentication mode"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
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
                className="mt-1 h-12 w-full rounded-2xl bg-white/85 px-4 text-sm text-[#0A0A0A] placeholder:text-neutral-400 backdrop-blur-md focus:outline-2 focus:outline-[#0A0A0A]"
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
              className="mt-1 h-12 w-full rounded-2xl bg-white/85 px-4 text-sm text-[#0A0A0A] placeholder:text-neutral-400 backdrop-blur-md focus:outline-2 focus:outline-[#0A0A0A]"
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
              className="mt-1 h-12 w-full rounded-2xl bg-white/85 px-4 text-sm text-[#0A0A0A] placeholder:text-neutral-400 backdrop-blur-md focus:outline-2 focus:outline-[#0A0A0A]"
            />
          </div>

          {errorMsg && <p className="text-xs font-medium text-[#D64527]">{errorMsg}</p>}

          <div className="flex flex-col gap-3 pt-2">
            <JellyButton
              type="submit"
              jellyIntensity="medium"
              className="font-control flex h-14 w-full items-center justify-center rounded-full bg-[#0A0A0A] px-8 text-[15px] font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A0A0A]"
            >
              {authMode === 'signin' ? 'Sign In' : 'Create Account'}
            </JellyButton>

            <div className="flex items-center gap-3 px-2 py-0.5">
              <span className="h-px flex-1 bg-black/[0.06]" />
              <span className="font-body text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                or
              </span>
              <span className="h-px flex-1 bg-black/[0.06]" />
            </div>

            <JellyButton
              type="button"
              jellyIntensity="medium"
              onClick={onContinueGoogle}
              className="liquid-glass-btn font-control flex h-13 w-full items-center justify-center gap-2.5 rounded-full px-6 text-[14px] font-medium text-[#0A0A0A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]"
            >
              <GoogleMark />
              <span>Continue with Google</span>
            </JellyButton>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
