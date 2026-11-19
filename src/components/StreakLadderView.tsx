import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { StampItem, StreakState } from '../types/stamp';
import {
  getActiveCycleDay,
  getStreakDaySteps,
  getStreakMilestones,
  hasCheckedInToday,
  MAX_STREAK_SHIELDS,
  STREAK_SHIELD_COST,
} from '../utils/stampLogic';
import { BackButton } from './BackButton';
import { DiamondBalanceBadge } from './DiamondBalanceBadge';
import { DiamondIcon } from './DiamondIcon';
import { JellyButton } from './JellyButton';
import { PerforatedStampCard } from './PerforatedStampCard';
import { Reicon } from './Reicon';

interface StreakLadderViewProps {
  streakState: StreakState;
  todayKey: string;
  diamondBalance: number;
  onBack: () => void;
  onOpenStore: () => void;
  onClaimDailyCheckIn: () => {
    claimed: boolean;
    addedDiamonds: number;
    claimedDay: number;
    rewardedStamp?: StampItem;
  };
  onClaimMilestone: (milestoneId: string) => {
    claimed: boolean;
    addedDiamonds: number;
  };
  onBuyShield: () => {
    success: boolean;
    reason?: 'max_shields' | 'insufficient_diamonds';
  };
  onSelectStamp: (stamp: StampItem) => void;
}

export function StreakLadderView({
  streakState,
  todayKey,
  diamondBalance,
  onBack,
  onOpenStore,
  onClaimDailyCheckIn,
  onClaimMilestone,
  onBuyShield,
  onSelectStamp,
}: StreakLadderViewProps) {
  const [recentReward, setRecentReward] = useState<{
    headline: string;
    addedDiamonds: number;
    stamp?: StampItem;
  } | null>(null);
  const [shieldNotice, setShieldNotice] = useState<string | null>(null);

  const checkedInToday = hasCheckedInToday(streakState, todayKey);
  const daySteps = getStreakDaySteps(streakState, todayKey);
  const milestones = getStreakMilestones(streakState);
  const activeDay = getActiveCycleDay(streakState, todayKey);
  const currentStep = daySteps[activeDay - 1] ?? daySteps[0];

  const completedInWeek = daySteps.filter((s) => s.status === 'claimed').length;
  const weekPct = Math.round((completedInWeek / 7) * 100);
  const daysUntilGrand = Math.max(0, 7 - completedInWeek);

  const handleCheckIn = () => {
    const res = onClaimDailyCheckIn();
    if (!res.claimed) return;
    setShieldNotice(null);
    setRecentReward({
      headline: `Day ${res.claimedDay} Streak Claimed`,
      addedDiamonds: res.addedDiamonds,
      stamp: res.rewardedStamp,
    });
  };

  const handleMilestoneClick = (milestoneId: string, title: string) => {
    const res = onClaimMilestone(milestoneId);
    if (!res.claimed) return;
    setShieldNotice(null);
    setRecentReward({
      headline: `${title} Unlocked`,
      addedDiamonds: res.addedDiamonds,
    });
  };

  const handleShieldPurchase = () => {
    const res = onBuyShield();
    if (res.success) {
      setShieldNotice('Streak Shield added. Your climb is protected if you miss a day.');
    } else if (res.reason === 'max_shields') {
      setShieldNotice(`You already hold the maximum ${MAX_STREAK_SHIELDS} Streak Shields.`);
    } else {
      setShieldNotice(`You need ${STREAK_SHIELD_COST} Diamonds to add a Streak Shield.`);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-36 pt-4 sm:px-8">
      {/* Structured Single-Line Header */}
      <header className="flex items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <BackButton onClick={onBack} ariaLabel="Back to Stamp Library" />
          <div className="min-w-0">
            <p className="font-body whitespace-nowrap text-[12px] font-normal text-neutral-500">
              Daily Habit Rewards
            </p>
            <h1 className="font-title truncate text-[22px] font-medium tracking-[-0.02em] text-[#0A0A0A] sm:text-[26px]">
              Streak Ladder
            </h1>
          </div>
        </div>

        <div className="shrink-0">
          <DiamondBalanceBadge
            balance={diamondBalance}
            onClick={onOpenStore}
            testId="streaks-diamond-balance"
            ariaLabel={`SnapStamps Store · ${diamondBalance.toLocaleString()} Diamonds`}
          />
        </div>
      </header>

      {/* Hero Streak Status & Daily Check-In Bento Card */}
      <section
        aria-label="Current Streak Summary"
        className="liquid-glass-btn-soft mt-5 rounded-[24px] p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <motion.div
              key={`flame-${streakState.currentStreak}`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 20 }}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FEF3C7] text-[#B45309]"
            >
              <Reicon name="flame" size={26} weight="Filled" />
            </motion.div>

            <div>
              <div className="flex items-baseline gap-2">
                <span
                  data-testid="streak-count-value"
                  className="font-hero font-mono-nums text-[32px] font-bold leading-none tracking-[-0.03em] text-[#0A0A0A]"
                >
                  {streakState.currentStreak}
                </span>
                <span className="font-title text-[16px] font-medium text-neutral-700">
                  {streakState.currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
                </span>
              </div>
              <p className="font-body mt-1 text-[12.5px] text-neutral-500">
                {checkedInToday
                  ? daysUntilGrand === 0
                    ? 'Full 7-day cycle completed. Come back tomorrow to climb again.'
                    : `${daysUntilGrand} more ${daysUntilGrand === 1 ? 'day' : 'days'} to unlock the Day 7 Sports Legend`
                  : `Day ${activeDay} reward is ready to claim today`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="liquid-glass-btn font-mono-nums inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-semibold text-[#0A0A0A]">
              <Reicon name="trophy" size={14} color="#B45309" />
              <span>Best {streakState.bestStreak}d</span>
            </span>
            <span className="liquid-glass-btn font-mono-nums inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-semibold text-[#0A0A0A]">
              <Reicon name="award" size={14} color="#2563EB" />
              <span data-testid="streak-shields-value">
                {streakState.shields}/{MAX_STREAK_SHIELDS}
              </span>
            </span>
          </div>
        </div>

        {/* Liquid-Glass 7-Day Cycle Progress Bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-title font-medium text-[#0A0A0A]">Weekly Climb Progress</span>
            <span className="font-mono-nums font-semibold text-neutral-600">
              {completedInWeek}/7 Days
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={completedInWeek}
            aria-valuemin={0}
            aria-valuemax={7}
            aria-label="Weekly streak progress"
            className="liquid-glass-btn mt-2 h-3.5 w-full overflow-hidden rounded-full p-[2px]"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(8, weekPct)}%` }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #FDE047 0%, #FACC15 55%, #F59E0B 100%)',
              }}
            />
          </div>
        </div>

        {/* Primary Tactile Daily Check-In Action */}
        <div className="mt-5">
          <JellyButton
            type="button"
            jellyIntensity={checkedInToday ? 'soft' : 'medium'}
            disabled={checkedInToday}
            onClick={handleCheckIn}
            data-testid="streak-checkin-btn"
            className={`font-control flex h-12 w-full items-center justify-between gap-2 rounded-full px-4 text-[13.5px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#0A0A0A] sm:px-5 sm:text-[14px] ${
              checkedInToday
                ? 'liquid-glass-btn cursor-default text-neutral-600'
                : 'bg-[#0A0A0A] text-white hover:bg-neutral-800'
            }`}
          >
            <span className="flex min-w-0 items-center gap-2 whitespace-nowrap">
              <Reicon
                name={checkedInToday ? 'check' : 'flame'}
                size={18}
                weight={checkedInToday ? 'Outline' : 'Filled'}
                color={checkedInToday ? '#0A0A0A' : '#FACC15'}
              />
              <span>
                {checkedInToday
                  ? 'Checked In Today'
                  : `Claim Day ${currentStep.day}`}
              </span>
            </span>

            {checkedInToday ? (
              <span className="font-mono-nums shrink-0 whitespace-nowrap text-[12px] font-medium text-neutral-500">
                Next tomorrow
              </span>
            ) : (
              <span className="font-mono-nums inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-white/15 px-3 py-1 text-[11.5px] font-bold text-[#FDE047]">
                <DiamondIcon size={13} />
                <span>
                  +{currentStep.rewardDiamonds}
                  {currentStep.grantsStampSection ? ' + Stamp' : ''}
                </span>
              </span>
            )}
          </JellyButton>
        </div>
      </section>

      {/* Instant Dopamine Reward Reveal Card */}
      <AnimatePresence>
        {recentReward && (
          <motion.section
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
            aria-label="Claimed Streak Reward"
            data-testid="streak-reward-reveal"
            className="mt-4 rounded-[24px] border border-[#F59E0B]/35 bg-[#FFFBEB]/95 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FEF3C7] text-[#B45309]">
                  <Reicon name="sparkles" size={20} weight="Filled" />
                </span>
                <div>
                  <p className="font-title text-[16px] font-semibold text-[#0A0A0A]">
                    {recentReward.headline}
                  </p>
                  <p className="font-mono-nums mt-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-[#92400E]">
                    <DiamondIcon size={14} />
                    <span>+{recentReward.addedDiamonds} Diamonds added to your balance</span>
                  </p>
                </div>
              </div>

              <JellyButton
                type="button"
                onClick={() => setRecentReward(null)}
                aria-label="Dismiss reward banner"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-neutral-500"
              >
                <Reicon name="close" size={16} />
              </JellyButton>
            </div>

            {recentReward.stamp && (
              <div className="mt-4 flex items-center gap-4 rounded-[18px] bg-white/90 p-3.5">
                <div className="w-[84px] shrink-0">
                  <PerforatedStampCard
                    stamp={recentReward.stamp}
                    compact
                    showProgress={false}
                    showUncollectedBadge={false}
                    onSelect={onSelectStamp}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-[10.5px] font-semibold text-[#92400E]">
                    <Reicon name="gift" size={11} />
                    <span>Mystery Bonus Stamp</span>
                  </span>
                  <p className="font-title mt-1 truncate text-[15px] font-semibold text-[#0A0A0A]">
                    {recentReward.stamp.title}
                  </p>
                  <p className="font-body mt-0.5 text-[12px] text-neutral-500">
                    Saved to{' '}
                    {recentReward.stamp.category === 'sports' ? 'Sports Vault' : 'Countries'} folder
                  </p>
                  <JellyButton
                    type="button"
                    onClick={() => onSelectStamp(recentReward.stamp!)}
                    className="font-control mt-2 inline-flex h-8 items-center rounded-full bg-[#0A0A0A] px-3.5 text-[11.5px] font-medium text-white"
                  >
                    Inspect Stamp
                  </JellyButton>
                </div>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* 7-Day Visual Streak Ladder */}
      <section
        aria-label="7-Day Reward Ladder"
        className="mt-5 rounded-[24px] border border-black/6 bg-white p-5"
      >
        <div className="flex items-center justify-between gap-2 pb-4">
          <div>
            <h2 className="font-title text-[17px] font-semibold text-[#0A0A0A]">
              7-Day Reward Ladder
            </h2>
            <p className="font-body text-[12px] text-neutral-500">
              Climb one rung each day for bigger Diamonds and surprise editions
            </p>
          </div>
          <span className="font-mono-nums shrink-0 rounded-full bg-[#F5F5F7] px-3 py-1 text-[11.5px] font-semibold text-[#0A0A0A]">
            Cycle {Math.floor(streakState.currentStreak / 7) + 1}
          </span>
        </div>

        <div className="relative space-y-2.5">
          {/* Subtle Vertical Spine Connecting Ladder Rungs */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-7 left-[21px] top-7 w-[2px] rounded-full bg-black/[0.06]"
          />

          {daySteps.map((step) => {
            const isClaimed = step.status === 'claimed';
            const isAvailable = step.status === 'available';
            const isGrand = Boolean(step.isGrandReward);

            return (
              <div
                key={step.day}
                data-testid={`streak-day-${step.day}`}
                className={`relative flex items-center justify-between gap-3 rounded-[20px] p-3 transition-colors ${
                  isAvailable
                    ? 'bg-[#FFFBEB] ring-1 ring-[#F59E0B]/55'
                    : isGrand
                      ? 'liquid-glass-btn-soft ring-1 ring-[#FACC15]/45'
                      : isClaimed
                        ? 'bg-[#F7F7F9]/85'
                        : 'bg-[#F7F7F9]/55'
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  {/* Ladder Node Circle */}
                  <div
                    className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono-nums text-[12.5px] font-bold ${
                      isClaimed
                        ? 'bg-[#0A0A0A] text-white'
                        : isAvailable
                          ? 'bg-[#FACC15] text-[#0A0A0A]'
                          : isGrand
                            ? 'bg-[#FEF3C7] text-[#92400E]'
                            : 'bg-white text-neutral-500 ring-1 ring-black/8'
                    }`}
                  >
                    {isClaimed ? (
                      <Reicon name="check" size={16} />
                    ) : isAvailable ? (
                      <Reicon name="flame" size={16} weight="Filled" />
                    ) : isGrand ? (
                      <Reicon name="crown" size={16} weight="Filled" />
                    ) : (
                      step.day
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p
                        className={`font-title text-[14.5px] font-semibold ${
                          isClaimed ? 'text-neutral-500' : 'text-[#0A0A0A]'
                        }`}
                      >
                        {step.title}
                      </p>
                      {isAvailable && (
                        <span className="rounded-full bg-[#0A0A0A] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-white">
                          Today
                        </span>
                      )}
                      {step.grantsStampSection && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10.5px] font-semibold text-[#92400E]">
                          <Reicon
                            name={step.grantsStampSection === 'sports' ? 'trophy' : 'gift'}
                            size={11}
                          />
                          <span>
                            {step.grantsStampSection === 'sports'
                              ? 'Sports Legend'
                              : 'Mystery Stamp'}
                          </span>
                        </span>
                      )}
                    </div>
                    <p className="font-body truncate text-[12px] text-neutral-500">
                      {step.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right Reward / Claim Action */}
                <div className="shrink-0">
                  {isClaimed ? (
                    <span className="font-control inline-flex h-9 items-center gap-1 rounded-full bg-white px-3 text-[11.5px] font-semibold text-neutral-500">
                      <Reicon name="check" size={13} />
                      <span>Claimed</span>
                    </span>
                  ) : isAvailable ? (
                    <JellyButton
                      type="button"
                      jellyIntensity="medium"
                      onClick={handleCheckIn}
                      aria-label={`Claim Day ${step.day} reward`}
                      className="font-control flex h-9 items-center gap-1.5 rounded-full bg-[#0A0A0A] px-3.5 text-[12px] font-semibold text-white hover:bg-neutral-800"
                    >
                      <DiamondIcon size={13} />
                      <span>+{step.rewardDiamonds}</span>
                    </JellyButton>
                  ) : (
                    <span className="font-mono-nums inline-flex h-9 items-center gap-1 rounded-full bg-white px-3 text-[12px] font-semibold text-[#0A0A0A]">
                      <DiamondIcon size={13} />
                      <span>+{step.rewardDiamonds}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 30-Day Habit Milestones Bento Grid */}
      <section aria-label="30-Day Habit Milestones" className="mt-5">
        <div className="flex items-baseline justify-between px-0.5">
          <h2 className="font-title text-[17px] font-semibold text-[#0A0A0A]">
            30-Day Milestones
          </h2>
          <span className="font-mono-nums text-[12px] text-neutral-500">
            {milestones.filter((m) => m.isClaimed).length}/{milestones.length} Claimed
          </span>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {milestones.map((m) => {
            const pct = Math.min(100, Math.round((m.progress / m.targetDays) * 100));
            const canClaim = m.isUnlocked && !m.isClaimed;
            return (
              <div
                key={m.id}
                className="liquid-glass-btn-soft flex flex-col justify-between rounded-[24px] p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-title text-[15px] font-semibold text-[#0A0A0A]">
                        {m.title}
                      </p>
                      <span className="font-mono-nums inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-[11px] font-semibold text-[#92400E]">
                        <DiamondIcon size={12} />+{m.rewardDiamonds}
                      </span>
                    </div>
                    <p className="font-body mt-0.5 text-[12px] text-neutral-500">
                      {m.subtitle}
                    </p>
                  </div>

                  {m.isClaimed ? (
                    <span className="font-control inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-white px-3 text-[11.5px] font-semibold text-neutral-500">
                      <Reicon name="check" size={13} />
                      <span>Done</span>
                    </span>
                  ) : canClaim ? (
                    <JellyButton
                      type="button"
                      jellyIntensity="medium"
                      onClick={() => handleMilestoneClick(m.id, m.title)}
                      className="font-control flex h-9 shrink-0 items-center rounded-full bg-[#0A0A0A] px-3.5 text-[12px] font-semibold text-white hover:bg-neutral-800"
                    >
                      Claim
                    </JellyButton>
                  ) : (
                    <span className="font-mono-nums shrink-0 text-[12px] font-semibold text-neutral-500">
                      {m.progress}/{m.targetDays}d
                    </span>
                  )}
                </div>

                <div className="mt-3.5 h-2.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        pct >= 100
                          ? 'linear-gradient(90deg, #FACC15 0%, #F59E0B 100%)'
                          : '#0A0A0A',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Streak Freeze Shield Protection Card */}
      <section
        aria-label="Streak Freeze Protection"
        className="mt-5 rounded-[24px] border border-black/6 bg-white p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
              <Reicon name="award" size={20} />
            </span>
            <div className="min-w-0">
              <p className="font-title text-[15px] font-semibold text-[#0A0A0A]">
                Streak Freeze Shield
              </p>
              <p className="font-body text-[12px] text-neutral-500">
                Auto-protects your streak if you miss a day ({streakState.shields}/{MAX_STREAK_SHIELDS}{' '}
                active)
              </p>
            </div>
          </div>

          <JellyButton
            type="button"
            jellyIntensity="medium"
            disabled={streakState.shields >= MAX_STREAK_SHIELDS}
            onClick={handleShieldPurchase}
            data-testid="buy-streak-shield-btn"
            className={`font-control flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-[12.5px] font-semibold transition-colors ${
              streakState.shields >= MAX_STREAK_SHIELDS
                ? 'liquid-glass-btn-soft cursor-default text-neutral-400'
                : 'liquid-glass-btn text-[#0A0A0A]'
            }`}
          >
            {streakState.shields >= MAX_STREAK_SHIELDS ? (
              <span>Max Active</span>
            ) : (
              <>
                <Reicon name="plus" size={14} />
                <span>Shield</span>
                <span className="font-mono-nums ml-1 inline-flex items-center gap-1">
                  <DiamondIcon size={13} />
                  {STREAK_SHIELD_COST}
                </span>
              </>
            )}
          </JellyButton>
        </div>

        {shieldNotice && (
          <p className="font-body mt-3 rounded-2xl bg-[#F7F7F9] px-3.5 py-2 text-[12px] font-medium text-[#0A0A0A]">
            {shieldNotice}
          </p>
        )}
      </section>
    </div>
  );
}
