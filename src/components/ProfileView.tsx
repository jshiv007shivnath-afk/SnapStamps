import { motion } from 'motion/react';
import type { DailyTaskStatus, StampItem, UserProfile } from '../types/stamp';
import { getCollectionSummary } from '../utils/stampLogic';
import { AppLogo } from './AppLogo';
import { BackButton } from './BackButton';
import { DiamondBalanceBadge } from './DiamondBalanceBadge';
import { DiamondIcon } from './DiamondIcon';
import { JellyButton } from './JellyButton';
import { PerforatedStampCard } from './PerforatedStampCard';
import { Reicon } from './Reicon';

interface ProfileViewProps {
  profile: UserProfile;
  stamps: StampItem[];
  postsCount: number;
  diamondBalance: number;
  dailyChallenges: DailyTaskStatus[];
  onBack: () => void;
  onSelectStamp: (stamp: StampItem) => void;
  onClaimChallenge: (challenge: DailyTaskStatus) => void;
  onOpenGlobe: () => void;
  onOpenStore: () => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
}

export function ProfileView({
  profile,
  stamps,
  postsCount,
  diamondBalance,
  dailyChallenges,
  onBack,
  onSelectStamp,
  onClaimChallenge,
  onOpenGlobe,
  onOpenStore,
  onOpenSettings,
  onSignOut,
}: ProfileViewProps) {
  const summary = getCollectionSummary(stamps);
  const rareCount = stamps.filter((s) => s.isUnlocked && s.rarity !== 'common').length;
  const favoriteStamps = stamps.filter((s) => s.isFavorite).slice(0, 6);

  const countryProgress = Array.from(
    stamps.reduce((map, stamp) => {
      const current = map.get(stamp.country) ?? { unlocked: 0, total: 0 };
      current.total += 1;
      if (stamp.isUnlocked) current.unlocked += 1;
      map.set(stamp.country, current);
      return map;
    }, new Map<string, { unlocked: number; total: number }>())
  ).slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-32 pt-4 sm:px-8">
      {/* Structured Single-Line Header with BackButton, Title, Diamond Balance, Settings */}
      <header className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <BackButton onClick={onBack} ariaLabel="Back to Stamp Library" />
          <h1 className="font-title shrink-0 text-[22px] font-medium tracking-[-0.02em] text-[#0A0A0A] sm:text-[26px]">
            Profile
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <DiamondBalanceBadge
            balance={diamondBalance}
            onClick={onOpenStore}
            testId="profile-diamond-balance"
            ariaLabel={`SnapStamps Store · ${diamondBalance.toLocaleString()} Diamonds`}
          />

          <JellyButton
            type="button"
            onClick={onOpenSettings}
            aria-label="Open Settings"
            data-testid="profile-settings-btn"
            className="liquid-glass-btn flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#0A0A0A] focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
          >
            <Reicon name="settings" size={19} />
          </JellyButton>
        </div>
      </header>

      {/* Clean Collector Identity Card: Name and Email only */}
      <section className="liquid-glass-btn-soft mt-6 rounded-[24px] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#E9DEC9] text-[18px] font-bold text-[#0A0A0A]">
              {profile.initials}
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#F7F7F9]">
                <AppLogo size={20} />
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="font-title truncate text-[20px] font-semibold text-[#0A0A0A]">
                {profile.name}
              </h2>
              <p className="font-body mt-0.5 truncate text-[13.5px] text-neutral-500">
                {profile.email}
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
      </section>

      {/* Tabular Collection Stats Row */}
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

      {/* Daily Challenges Module with Liquid-Glass Progress Bars & Balanced Diamond Rewards */}
      <section aria-label="Daily Challenges" className="liquid-glass-btn-soft mt-5 rounded-[24px] p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FEF3C7] text-[#92400E]">
              <Reicon name="flame" size={18} />
            </span>
            <div className="min-w-0">
              <h2 className="font-title text-[17px] font-semibold text-[#0A0A0A]">
                Daily Challenges
              </h2>
              <p className="font-body text-[12px] text-neutral-500">
                Complete simple tasks to earn golden-yellow Diamonds
              </p>
            </div>
          </div>

          <span className="font-mono-nums shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0A0A0A]">
            {dailyChallenges.filter((c) => c.isClaimed).length}/{dailyChallenges.length}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {dailyChallenges.map((challenge) => {
            const pct = Math.min(100, Math.round((challenge.progress / challenge.target) * 100));
            const canClaim = challenge.isComplete && !challenge.isClaimed;
            return (
              <div
                key={challenge.id}
                className="liquid-glass-btn rounded-[24px] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-title text-[14.5px] font-semibold text-[#0A0A0A]">
                        {challenge.title}
                      </p>
                      <span className="font-mono-nums inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-[11px] font-semibold text-[#92400E]">
                        <DiamondIcon size={12} />+{challenge.rewardDiamonds}
                      </span>
                    </div>
                    <p className="font-body mt-0.5 text-[12px] text-neutral-500">
                      {challenge.description}
                    </p>
                  </div>

                  <JellyButton
                    type="button"
                    jellyIntensity={canClaim ? 'medium' : 'soft'}
                    disabled={!canClaim}
                    onClick={() => onClaimChallenge(challenge)}
                    aria-label={
                      challenge.isClaimed
                        ? `${challenge.title} claimed`
                        : canClaim
                          ? `Claim ${challenge.rewardDiamonds} diamonds for ${challenge.title}`
                          : `${challenge.title} in progress`
                    }
                    className={`font-control flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-[12px] font-semibold transition-colors ${
                      challenge.isClaimed
                        ? 'liquid-glass-btn-soft text-neutral-500 cursor-default'
                        : canClaim
                          ? 'bg-[#0A0A0A] text-white hover:bg-neutral-800'
                          : 'liquid-glass-btn-soft text-neutral-500 cursor-default'
                    }`}
                  >
                    {challenge.isClaimed ? (
                      <>
                        <Reicon name="check" size={14} />
                        <span>Claimed</span>
                      </>
                    ) : canClaim ? (
                      <span>Claim Reward</span>
                    ) : (
                      <span>In Progress</span>
                    )}
                  </JellyButton>
                </div>

                {/* Liquid-Glass Progress Bar */}
                <div className="mt-3 flex items-center gap-3">
                  <div
                    role="progressbar"
                    aria-valuenow={challenge.progress}
                    aria-valuemin={0}
                    aria-valuemax={challenge.target}
                    aria-label={`${challenge.title} progress`}
                    className="liquid-glass-btn-soft relative h-3 flex-1 overflow-hidden rounded-full p-[1.5px]"
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                      className="h-full rounded-full"
                      style={{
                        background:
                          pct >= 100
                            ? 'linear-gradient(90deg, #FACC15 0%, #F59E0B 100%)'
                            : 'linear-gradient(90deg, #FDE047 0%, #FACC15 100%)',
                      }}
                    />
                  </div>
                  <span className="font-mono-nums shrink-0 text-[11px] font-semibold text-neutral-600">
                    {challenge.progress}/{challenge.target}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Actions: World Atlas, Stamp Store & Preferences/Settings */}
      <section className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <JellyButton
          type="button"
          onClick={onOpenGlobe}
          className="liquid-glass-btn flex h-16 items-center justify-between rounded-[24px] px-5 text-left focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0A0A0A] text-white">
              <Reicon name="globe" size={18} />
            </span>
            <div className="min-w-0">
              <p className="font-title truncate text-[15px] font-medium text-[#0A0A0A]">
                World Atlas
              </p>
              <p className="font-body truncate text-[12px] text-neutral-500">
                Travel routes &amp; pins
              </p>
            </div>
          </div>
          <Reicon name="map-point" size={18} color="#0A0A0A" />
        </JellyButton>

        <JellyButton
          type="button"
          onClick={onOpenStore}
          className="liquid-glass-btn flex h-16 items-center justify-between rounded-[24px] px-5 text-left focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFFDF7] text-[#0A0A0A]">
              <Reicon name="store" size={18} />
            </span>
            <div className="min-w-0">
              <p className="font-title truncate text-[15px] font-medium text-[#0A0A0A]">
                Stamp Store
              </p>
              <p className="font-body truncate text-[12px] text-neutral-500">
                Country &amp; Sports sets
              </p>
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-1 font-mono-nums text-[13px] font-semibold text-[#0A0A0A]">
            <DiamondIcon size={15} />
            {diamondBalance.toLocaleString()}
          </span>
        </JellyButton>

        <JellyButton
          type="button"
          onClick={onOpenSettings}
          className="liquid-glass-btn flex h-16 items-center justify-between rounded-[24px] px-5 text-left focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F5F5F7] text-[#0A0A0A]">
              <Reicon name="settings" size={18} />
            </span>
            <div className="min-w-0">
              <p className="font-title truncate text-[15px] font-medium text-[#0A0A0A]">
                Preferences &amp; Alerts
              </p>
              <p className="font-body truncate text-[12px] text-neutral-500">
                Notifications &amp; haptics
              </p>
            </div>
          </div>
          <Reicon name="arrow-left" size={16} className="shrink-0 rotate-180 text-neutral-400" />
        </JellyButton>
      </section>

      {/* Country Milestones */}
      <section className="liquid-glass-btn-soft mt-5 rounded-[24px] p-5">
        <h2 className="font-title text-[17px] font-semibold text-[#0A0A0A]">
          Country Milestones
        </h2>
        {countryProgress.length === 0 ? (
          <p className="font-body mt-2 text-xs text-neutral-500">
            Unlock stamps from the Store to track country completion milestones here.
          </p>
        ) : (
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
        )}
      </section>

      {/* Enlarged Saved Favorites Strip */}
      {favoriteStamps.length > 0 && (
        <section className="mt-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-title text-[17px] font-semibold text-[#0A0A0A]">
              Saved Favorites
            </h2>
            <span className="font-mono-nums text-xs text-neutral-500">
              {favoriteStamps.length} Saved
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
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
