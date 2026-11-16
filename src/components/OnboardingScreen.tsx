import { motion } from 'motion/react';
import type { StampItem } from '../types/stamp';
import { PerforatedStampCard } from './PerforatedStampCard';
import { Reicon } from './Reicon';

interface OnboardingScreenProps {
  featuredStamps: StampItem[];
  onGetStarted: () => void;
  onOpenLogin: () => void;
}

export function OnboardingScreen({ featuredStamps, onGetStarted, onOpenLogin }: OnboardingScreenProps) {
  const topStamp = featuredStamps.find((s) => s.id === 'islas-canarias') ?? featuredStamps[0];
  const bottomStamp = featuredStamps.find((s) => s.id === 'sevilla') ?? featuredStamps[1] ?? featuredStamps[0];

  return (
    <div className="flex min-h-screen w-full flex-col justify-between bg-[#F7F7F9] px-6 py-8 sm:px-10 lg:mx-auto lg:max-w-5xl lg:flex-row lg:items-center lg:gap-16 lg:py-16">
      {/* Tilted Stamp Showcase Collage matching Reference Screen 1 */}
      <div className="relative mx-auto flex h-[390px] w-full max-w-[360px] flex-shrink-0 items-center justify-center sm:h-[440px] lg:order-2 lg:mx-0 lg:h-[480px] lg:max-w-[420px]">
        {/* Curved connector arrows between the two stamps */}
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

        {/* Left orange heart emblem */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 360, damping: 24 }}
          className="absolute left-6 top-[186px] z-20 flex h-9 w-9 items-center justify-center rounded-full bg-[#FF6B1A] text-white"
        >
          <Reicon name="heart" size={16} weight="Filled" />
        </motion.div>

        {/* Right sky heart emblem */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.32, type: 'spring', stiffness: 360, damping: 24 }}
          className="absolute right-6 top-[198px] z-20 flex h-9 w-9 items-center justify-center rounded-full bg-[#BFE3EA] text-[#0A0A0A]"
        >
          <Reicon name="heart" size={16} weight="Outline" />
        </motion.div>

        {/* Top tilted stamp card + backing pastel card */}
        {topStamp && (
          <motion.div
            initial={{ y: -18, opacity: 0, rotate: -14 }}
            animate={{ y: 0, opacity: 1, rotate: -10 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="absolute left-12 top-4 z-10 w-[166px] sm:left-16 sm:w-[184px]"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-6 translate-y-2 rotate-12 rounded-[18px]"
              style={{ backgroundColor: '#BDE3EB' }}
            />
            <div className="relative z-10">
              <PerforatedStampCard stamp={topStamp} showProgress={false} />
            </div>
          </motion.div>
        )}

        {/* Bottom tilted stamp card + backing peach card */}
        {bottomStamp && (
          <motion.div
            initial={{ y: 18, opacity: 0, rotate: 12 }}
            animate={{ y: 0, opacity: 1, rotate: 7 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 24 }}
            className="absolute bottom-3 right-12 z-10 w-[166px] sm:right-16 sm:w-[184px]"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-5 -translate-y-1 rotate-12 rounded-[18px]"
              style={{ backgroundColor: '#F7C2A8' }}
            />
            <div className="relative z-10">
              <PerforatedStampCard stamp={bottomStamp} showProgress={false} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Headline, Subcopy, and Primary Black Pill CTA */}
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 pb-4 lg:order-1 lg:mx-0 lg:max-w-lg">
        <div className="space-y-3">
          <span className="font-body inline-block text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            SnapStamps Passport
          </span>
          <h1 className="font-hero text-[36px] leading-[1.08] tracking-[-0.025em] text-[#0A0A0A] sm:text-[44px] [text-wrap:balance]">
            <span className="block font-bold">Collect Stamps.</span>
            <span className="block font-normal">Unlock Rewards.</span>
          </h1>
          <p className="font-body text-[15px] font-normal leading-relaxed text-neutral-500">
            Collect More, Get More — Stamp Rewards across countries, cities, and landmarks on an interactive 3D globe.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <motion.button
            type="button"
            onClick={onGetStarted}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="font-control flex h-14 w-full items-center justify-center rounded-full bg-[#0A0A0A] px-8 text-[15px] font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A0A0A]"
          >
            Get Started
          </motion.button>

          <motion.button
            type="button"
            onClick={onOpenLogin}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="liquid-glass-btn font-control flex h-12 w-full items-center justify-center rounded-full px-8 text-[14px] font-medium text-[#0A0A0A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]"
          >
            Sign In to Passport
          </motion.button>
        </div>
      </div>
    </div>
  );
}
