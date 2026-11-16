import { motion } from 'motion/react';
import type { StampItem } from '../types/stamp';
import { JellyButton } from './JellyButton';
import { PerforatedStampCard } from './PerforatedStampCard';
import { Reicon } from './Reicon';

interface OnboardingScreenProps {
  featuredStamps: StampItem[];
  onGetStarted: () => void;
}

export function OnboardingScreen({ featuredStamps, onGetStarted }: OnboardingScreenProps) {
  const topStamp = featuredStamps.find((s) => s.id === 'islas-canarias') ?? featuredStamps[0];
  const bottomStamp = featuredStamps.find((s) => s.id === 'sevilla') ?? featuredStamps[1] ?? featuredStamps[0];

  return (
    <div className="flex min-h-screen w-full flex-col justify-between bg-[#F7F7F9] px-6 py-8 sm:px-10 lg:mx-auto lg:max-w-5xl lg:flex-row lg:items-center lg:gap-16 lg:py-16">
      {/* Tilted Stamp Showcase Collage matching Reference Screen 1 */}
      <div className="relative mx-auto flex h-[430px] w-full max-w-[360px] flex-shrink-0 items-center justify-center sm:h-[460px] lg:order-2 lg:mx-0 lg:h-[490px] lg:max-w-[420px]">
        {/* Curved connector arrows between the two stamps */}
        <svg
          viewBox="0 0 360 440"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <path
            d="M 254 92 C 306 126, 308 196, 276 232"
            fill="none"
            stroke="#98D4DC"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <path
            d="M 102 204 C 66 238, 68 308, 108 338"
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
          className="absolute left-5 top-[200px] z-20 flex h-9 w-9 items-center justify-center rounded-full bg-[#FF6B1A] text-white"
        >
          <Reicon name="heart" size={16} weight="Filled" />
        </motion.div>

        {/* Right sky heart emblem */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.32, type: 'spring', stiffness: 360, damping: 24 }}
          className="absolute right-5 top-[210px] z-20 flex h-9 w-9 items-center justify-center rounded-full bg-[#BFE3EA] text-[#0A0A0A]"
        >
          <Reicon name="heart" size={16} weight="Outline" />
        </motion.div>

        {/* Top tilted stamp card + backing pastel card */}
        {topStamp && (
          <motion.div
            initial={{ y: -18, opacity: 0, rotate: -12 }}
            animate={{ y: 0, opacity: 1, rotate: -8 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="absolute left-10 top-0 z-10 w-[152px] sm:left-14 sm:w-[172px]"
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
            initial={{ y: 18, opacity: 0, rotate: 11 }}
            animate={{ y: 0, opacity: 1, rotate: 7 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 24 }}
            className="absolute bottom-0 right-10 z-10 w-[152px] sm:right-14 sm:w-[172px]"
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

      {/* Headline, Subcopy, and Single Primary Black Pill CTA matching Reference Image */}
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 pb-4 lg:order-1 lg:mx-0 lg:max-w-lg">
        <div className="space-y-3">
          <h1 className="font-hero text-[36px] leading-[1.08] tracking-[-0.025em] text-[#0A0A0A] sm:text-[44px] [text-wrap:balance]">
            <span className="block font-bold">Collect Stamps.</span>
            <span className="block font-normal">Unlock Rewards.</span>
          </h1>
          <p className="font-body text-[15px] font-normal leading-relaxed text-neutral-500">
            Collect More, Get More – Stamp Rewards
          </p>
        </div>

        <JellyButton
          type="button"
          jellyIntensity="medium"
          onClick={onGetStarted}
          className="font-control flex h-14 w-full items-center justify-center rounded-full bg-[#0A0A0A] px-8 text-[15px] font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A0A0A]"
        >
          Get Started
        </JellyButton>
      </div>
    </div>
  );
}
