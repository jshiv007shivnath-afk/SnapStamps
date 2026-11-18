import { useState } from 'react';
import { motion } from 'motion/react';
import type { UserProfile } from '../types/stamp';
import { AppLogo } from './AppLogo';
import { BackButton } from './BackButton';
import { JellyButton } from './JellyButton';
import { Reicon } from './Reicon';

interface EditProfileViewProps {
  profile: UserProfile;
  onBack: () => void;
  onUpdateProfile: (next: UserProfile) => void;
}

export function EditProfileView({
  profile,
  onBack,
  onUpdateProfile,
}: EditProfileViewProps) {
  const [nameInput, setNameInput] = useState(profile.name);
  const [emailInput, setEmailInput] = useState(profile.email);
  const [errorMsg, setErrorMsg] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  const previewInitials =
    nameInput
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || profile.initials;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = nameInput.trim();
    const trimmedEmail = emailInput.trim();

    if (!trimmedName) {
      setErrorMsg('Please enter your name.');
      setSavedNotice(false);
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      setSavedNotice(false);
      return;
    }

    onUpdateProfile({
      ...profile,
      name: trimmedName,
      email: trimmedEmail,
      initials: previewInitials,
    });
    setErrorMsg('');
    setSavedNotice(true);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-32 pt-4 sm:px-8">
      <header className="flex items-center gap-3">
        <BackButton onClick={onBack} ariaLabel="Back to Settings" />
        <div className="min-w-0">
          <p className="font-body whitespace-nowrap text-[12px] font-normal text-neutral-500">
            Account Details
          </p>
          <h1 className="font-title truncate text-[24px] font-medium tracking-[-0.02em] text-[#0A0A0A] sm:text-[26px]">
            Edit Profile
          </h1>
        </div>
      </header>

      <section className="liquid-glass-btn-soft mt-6 rounded-[24px] p-6">
        <div className="flex items-center gap-4 border-b border-black/6 pb-5">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#E9DEC9] text-[18px] font-bold text-[#0A0A0A]">
            {previewInitials}
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#F7F7F9]">
              <AppLogo size={20} />
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="font-title truncate text-[18px] font-semibold text-[#0A0A0A]">
              {nameInput.trim() || profile.name}
            </h2>
            <p className="font-body truncate text-[13px] text-neutral-500">
              {emailInput.trim() || profile.email}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="settings-edit-name"
              className="font-title block text-xs font-medium text-neutral-600"
            >
              Full Name
            </label>
            <input
              id="settings-edit-name"
              type="text"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                if (errorMsg) setErrorMsg('');
                if (savedNotice) setSavedNotice(false);
              }}
              placeholder="Your name"
              className="mt-1.5 h-12 w-full rounded-2xl border border-black/6 bg-white/90 px-4 text-sm text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-2 focus:outline-[#0A0A0A]"
            />
          </div>

          <div>
            <label
              htmlFor="settings-edit-email"
              className="font-title block text-xs font-medium text-neutral-600"
            >
              Email Address
            </label>
            <input
              id="settings-edit-email"
              type="email"
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                if (errorMsg) setErrorMsg('');
                if (savedNotice) setSavedNotice(false);
              }}
              placeholder="name@example.com"
              className="mt-1.5 h-12 w-full rounded-2xl border border-black/6 bg-white/90 px-4 text-sm text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-2 focus:outline-[#0A0A0A]"
            />
          </div>

          {errorMsg && (
            <p className="text-xs font-medium text-[#D64527]" role="alert">
              {errorMsg}
            </p>
          )}

          {savedNotice && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-2xl bg-white/90 px-3.5 py-2.5 text-xs font-medium text-[#0A0A0A]"
            >
              <Reicon name="check" size={15} color="#2563EB" />
              <span>Profile updated</span>
            </motion.div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <JellyButton
              type="button"
              onClick={onBack}
              className="liquid-glass-btn font-control flex h-11 items-center justify-center rounded-full px-5 text-[13px] font-medium text-[#0A0A0A]"
            >
              Cancel
            </JellyButton>

            <JellyButton
              type="submit"
              jellyIntensity="medium"
              className="font-control flex h-11 items-center justify-center rounded-full bg-[#0A0A0A] px-6 text-[13px] font-medium text-white hover:bg-neutral-800"
            >
              Save Changes
            </JellyButton>
          </div>
        </form>
      </section>
    </div>
  );
}
