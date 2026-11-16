import { useState } from 'react';
import { motion } from 'motion/react';
import type { StampItem, UserProfile } from '../types/stamp';
import { getCollectionSummary } from '../utils/stampLogic';
import { AppLogo } from './AppLogo';
import { BackButton } from './BackButton';
import { JellyButton } from './JellyButton';
import { PerforatedStampCard } from './PerforatedStampCard';
import { Reicon } from './Reicon';

interface ProfileViewProps {
  profile: UserProfile;
  stamps: StampItem[];
  postsCount: number;
  onBack: () => void;
  onUpdateProfile: (next: UserProfile) => void;
  onSelectStamp: (stamp: StampItem) => void;
  onOpenGlobe: () => void;
  onOpenSwiftUIExport: () => void;
  onSignOut: () => void;
}

export function ProfileView({
  profile,
  stamps,
  postsCount,
  onBack,
  onUpdateProfile,
  onSelectStamp,
  onOpenGlobe,
  onOpenSwiftUIExport,
  onSignOut,
}: ProfileViewProps) {
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [handleInput, setHandleInput] = useState(profile.handle);
  const [emailInput, setEmailInput] = useState(profile.email);
  const [errorMsg, setErrorMsg] = useState('');

  const summary = getCollectionSummary(stamps);
  const rareCount = stamps.filter((s) => s.isUnlocked && s.rarity !== 'common').length;
  const favoriteStamps = stamps.filter((s) => s.isFavorite).slice(0, 4);

  const countryProgress = Array.from(
    stamps.reduce((map, stamp) => {
      const current = map.get(stamp.country) ?? { unlocked: 0, total: 0 };
      current.total += 1;
      if (stamp.isUnlocked) current.unlocked += 1;
      map.set(stamp.country, current);
      return map;
    }, new Map<string, { unlocked: number; total: number }>())
  ).slice(0, 4);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = nameInput.trim();
    if (!trimmedName) {
      setErrorMsg('Please enter your traveler name.');
      return;
    }
    const initials = trimmedName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'LC';

    const cleanHandle = handleInput.trim().startsWith('@')
      ? handleInput.trim()
      : `@${handleInput.trim() || 'traveler'}`;

    onUpdateProfile({
      ...profile,
      name: trimmedName,
      handle: cleanHandle,
      email: emailInput.trim() || profile.email,
      initials,
    });
    setErrorMsg('');
    setEditing(false);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-32 pt-4 sm:px-8">
      {/* Top Bar with black circular BackButton + Title */}
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BackButton onClick={onBack} ariaLabel="Back to Stamp Library" />
          <div>
            <p className="font-body text-[12px] font-normal text-neutral-500">Passport Account</p>
            <h1 className="font-title text-[24px] font-medium tracking-[-0.02em] text-[#0A0A0A] sm:text-[26px]">
              Profile
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <JellyButton
            type="button"
            onClick={() => {
              setNameInput(profile.name);
              setHandleInput(profile.handle);
              setEmailInput(profile.email);
              setEditing((prev) => !prev);
            }}
            className="liquid-glass-btn font-control flex h-11 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium text-[#0A0A0A] focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
          >
            <Reicon name={editing ? 'close' : 'user'} size={16} />
            <span>{editing ? 'Cancel' : 'Edit'}</span>
          </JellyButton>

          <JellyButton
            type="button"
            onClick={onOpenSwiftUIExport}
            aria-label="Open SwiftUI and data utilities"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0A0A0A] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
          >
            <Reicon name="code" size={18} />
          </JellyButton>
        </div>
      </header>

      {/* Traveler Identity Bento Card */}
      <section className="liquid-glass-btn-soft mt-6 rounded-[28px] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#E9DEC9] text-[18px] font-bold text-[#0A0A0A]">
              {profile.initials}
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#F7F7F9]">
                <AppLogo size={20} />
              </span>
            </div>
            <div>
              <h2 className="font-title text-[20px] font-semibold text-[#0A0A0A]">
                {profile.name}
              </h2>
              <p className="font-body text-[13px] text-neutral-500">
                {profile.handle} · {profile.email}
              </p>
              <p className="font-mono-nums mt-1 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                Passport {profile.passportCode} · Since {profile.memberSince}
              </p>
            </div>
          </div>

          <JellyButton
            type="button"
            jellyIntensity="medium"
            onClick={onSignOut}
            className="liquid-glass-btn font-control flex h-11 items-center gap-2 rounded-full px-5 text-[13px] font-medium text-[#0A0A0A] focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
          >
            <span>Sign Out</span>
          </JellyButton>
        </div>

        {/* Inline Edit Profile Form */}
        {editing && (
          <motion.form
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSaveProfile}
            className="mt-5 grid grid-cols-1 gap-3 pt-4 sm:grid-cols-3"
          >
            <div>
              <label htmlFor="profile-name" className="block text-xs font-medium text-neutral-500">
                Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="mt-1 h-11 w-full rounded-2xl bg-white/75 px-3.5 text-sm text-[#0A0A0A] focus:outline-2 focus:outline-[#0A0A0A]"
              />
            </div>

            <div>
              <label htmlFor="profile-handle" className="block text-xs font-medium text-neutral-500">
                Handle
              </label>
              <input
                id="profile-handle"
                type="text"
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                className="mt-1 h-11 w-full rounded-2xl bg-white/75 px-3.5 text-sm text-[#0A0A0A] focus:outline-2 focus:outline-[#0A0A0A]"
              />
            </div>

            <div>
              <label htmlFor="profile-email" className="block text-xs font-medium text-neutral-500">
                Email
              </label>
              <input
                id="profile-email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="mt-1 h-11 w-full rounded-2xl bg-white/75 px-3.5 text-sm text-[#0A0A0A] focus:outline-2 focus:outline-[#0A0A0A]"
              />
            </div>

            {errorMsg && <p className="text-xs font-medium text-[#D64527] sm:col-span-3">{errorMsg}</p>}

            <div className="flex justify-end sm:col-span-3">
              <JellyButton
                type="submit"
                jellyIntensity="medium"
                className="font-control flex h-11 items-center justify-center rounded-full bg-[#0A0A0A] px-6 text-[13px] font-medium text-white hover:bg-neutral-800"
              >
                Save Passport Details
              </JellyButton>
            </div>
          </motion.form>
        )}
      </section>

      {/* Passport Tabular Stats Row */}
      <section className="mt-4 grid grid-cols-3 gap-3">
        <div className="liquid-glass-btn-soft rounded-[24px] p-4 text-center">
          <p className="font-mono-nums text-[24px] font-semibold text-[#0A0A0A]">
            {summary.unlockedCount}
            <span className="text-[14px] font-normal text-neutral-400">/{summary.totalStamps}</span>
          </p>
          <p className="font-body mt-0.5 text-[12px] text-neutral-500">Stamps</p>
        </div>
        <div className="liquid-glass-btn-soft rounded-[24px] p-4 text-center">
          <p className="font-mono-nums text-[24px] font-semibold text-[#0A0A0A]">
            {summary.countriesCount}
          </p>
          <p className="font-body mt-0.5 text-[12px] text-neutral-500">Countries</p>
        </div>
        <div className="liquid-glass-btn-soft rounded-[24px] p-4 text-center">
          <p className="font-mono-nums text-[24px] font-semibold text-[#0A0A0A]">
            {rareCount + postsCount}
          </p>
          <p className="font-body mt-0.5 text-[12px] text-neutral-500">Rare &amp; Shared</p>
        </div>
      </section>

      {/* Quick Actions: Atlas Map & SwiftUI Export */}
      <section className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <JellyButton
          type="button"
          onClick={onOpenGlobe}
          className="liquid-glass-btn flex h-14 items-center justify-between rounded-[24px] px-5 text-left focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A0A0A] text-white">
              <Reicon name="globe" size={18} />
            </span>
            <div>
              <p className="font-title text-[15px] font-medium text-[#0A0A0A]">
                Passport Globe Atlas
              </p>
              <p className="font-body text-[12px] text-neutral-500">
                View travel routes &amp; country pins
              </p>
            </div>
          </div>
          <Reicon name="map-point" size={18} color="#0A0A0A" />
        </JellyButton>

        <JellyButton
          type="button"
          onClick={onOpenSwiftUIExport}
          className="liquid-glass-btn flex h-14 items-center justify-between rounded-[24px] px-5 text-left focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E9DEC9] text-[#0A0A0A]">
              <Reicon name="code" size={18} />
            </span>
            <div>
              <p className="font-title text-[15px] font-medium text-[#0A0A0A]">
                SwiftUI Code &amp; Demo Controls
              </p>
              <p className="font-body text-[12px] text-neutral-500">
                Export views or clear seed data
              </p>
            </div>
          </div>
          <Reicon name="download" size={18} color="#0A0A0A" />
        </JellyButton>
      </section>

      {/* Country Milestones */}
      <section className="liquid-glass-btn-soft mt-5 rounded-[28px] p-5">
        <h2 className="font-title text-[17px] font-semibold text-[#0A0A0A]">
          Country Milestones
        </h2>
        <div className="mt-4 space-y-3.5">
          {countryProgress.map(([countryName, counts]) => {
            const pct = counts.total > 0 ? Math.round((counts.unlocked / counts.total) * 100) : 0;
            return (
              <div key={countryName}>
                <div className="flex items-baseline justify-between text-[13px]">
                  <span className="font-title font-medium text-[#0A0A0A]">{countryName}</span>
                  <span className="font-mono-nums text-xs text-neutral-500">
                    {counts.unlocked}/{counts.total}
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-black/5">
                  <div
                    className="h-full rounded-full bg-[#0A0A0A] transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Favorite Stamps Strip */}
      {favoriteStamps.length > 0 && (
        <section className="mt-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-title text-[17px] font-semibold text-[#0A0A0A]">
              Pinned Passport Favorites
            </h2>
            <span className="font-mono-nums text-xs text-neutral-500">
              {favoriteStamps.length} Saved
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {favoriteStamps.map((stamp) => (
              <PerforatedStampCard
                key={stamp.id}
                stamp={stamp}
                compact
                onSelect={onSelectStamp}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
