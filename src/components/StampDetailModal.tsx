import { motion } from 'motion/react';
import type { StampItem } from '../types/stamp';
import { PerforatedStampCard } from './PerforatedStampCard';
import { Reicon } from './Reicon';

interface StampDetailModalProps {
  stamp: StampItem | null;
  onClose: () => void;
  onToggleFavorite: (stampId: string) => void;
  onCollectStamp: (stampId: string) => void;
  onEditWithGemini: (stamp: StampItem) => void;
  onLocateOnGlobe: (stampId: string) => void;
  onShareToFeed: (stamp: StampItem) => void;
}

export function StampDetailModal({
  stamp,
  onClose,
  onToggleFavorite,
  onCollectStamp,
  onEditWithGemini,
  onLocateOnGlobe,
  onShareToFeed,
}: StampDetailModalProps) {
  if (!stamp) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${stamp.title} stamp details`}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-xs sm:items-center sm:p-6"
    >
      <motion.div
        initial={{ y: 28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="w-full max-w-md rounded-t-[28px] bg-[#F7F7F9] p-6 sm:rounded-[28px]"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            {stamp.country} · {stamp.rarity}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close stamp details"
            className="liquid-glass-btn flex h-11 w-11 items-center justify-center rounded-full text-[#0A0A0A]"
          >
            <Reicon name="close" size={20} />
          </button>
        </div>

        <div className="mx-auto mt-4 w-[190px]">
          <PerforatedStampCard
            stamp={stamp}
            showProgress={false}
            onToggleFavorite={onToggleFavorite}
          />
        </div>

        <div className="mt-5 text-center">
          <h2 className="font-display text-2xl font-bold text-[#0A0A0A]">{stamp.title}</h2>
          <p className="mt-1 text-sm text-neutral-600">{stamp.description}</p>
          <p className="font-mono-nums mt-2 text-xs text-neutral-500">
            Set Progress {stamp.collectedCount}/{stamp.totalInSet} · {stamp.coordinates.lat.toFixed(2)}°,{' '}
            {stamp.coordinates.lng.toFixed(2)}°
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2.5">
          {!stamp.isUnlocked ? (
            <button
              type="button"
              onClick={() => onCollectStamp(stamp.id)}
              className="col-span-2 flex h-12 items-center justify-center gap-2 rounded-full bg-[#0A0A0A] text-sm font-semibold text-white hover:bg-neutral-800"
            >
              <Reicon name="check" size={16} />
              <span>Collect Stamp</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onShareToFeed(stamp)}
              className="col-span-2 flex h-12 items-center justify-center gap-2 rounded-full bg-[#0A0A0A] text-sm font-semibold text-white hover:bg-neutral-800"
            >
              <Reicon name="share" size={16} />
              <span>Share Rare Find</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onEditWithGemini(stamp)}
            className="liquid-glass-btn flex h-11 items-center justify-center gap-1.5 rounded-full text-xs font-semibold text-[#0A0A0A]"
          >
            <Reicon name="wand" size={15} />
            <span>Remix Art</span>
          </button>

          <button
            type="button"
            onClick={() => onLocateOnGlobe(stamp.id)}
            className="liquid-glass-btn flex h-11 items-center justify-center gap-1.5 rounded-full text-xs font-semibold text-[#0A0A0A]"
          >
            <Reicon name="globe" size={15} />
            <span>View on Globe</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
