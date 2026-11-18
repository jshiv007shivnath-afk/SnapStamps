import { motion } from 'motion/react';
import type { StampItem, StampPocket } from '../types/stamp';
import { AppLogo } from './AppLogo';
import { JellyButton } from './JellyButton';
import { PerforatedStampCard } from './PerforatedStampCard';
import { Reicon } from './Reicon';

interface StampDetailModalProps {
  stamp: StampItem | null;
  pockets?: StampPocket[];
  onClose: () => void;
  onToggleFavorite: (stampId: string) => void;
  onCollectStamp: (stampId: string) => void;
  onMoveStampToFolder?: (stampId: string, pocketId: string) => void;
  onEditWithGemini: (stamp: StampItem) => void;
  onLocateOnGlobe: (stampId: string) => void;
  onShareToFeed: (stamp: StampItem) => void;
}

export function StampDetailModal({
  stamp,
  pockets = [],
  onClose,
  onToggleFavorite,
  onCollectStamp,
  onMoveStampToFolder,
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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs overscroll-none sm:p-6"
    >
      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="no-scrollbar max-h-[86dvh] w-full max-w-md overflow-y-auto overflow-x-hidden overscroll-none rounded-[24px] border border-black/8 bg-white p-6"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <AppLogo size={20} />
            <span className="truncate text-xs font-semibold uppercase tracking-wider text-neutral-500">
              {stamp.country} · {stamp.rarity}
            </span>
          </div>
          <JellyButton
            type="button"
            onClick={onClose}
            aria-label="Close stamp details"
            className="liquid-glass-btn flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#0A0A0A]"
          >
            <Reicon name="close" size={20} />
          </JellyButton>
        </div>

        <div className="mx-auto mt-4 w-[228px]">
          <PerforatedStampCard
            stamp={stamp}
            showProgress={false}
            onToggleFavorite={onToggleFavorite}
          />
        </div>

        <div className="mt-5 text-center">
          <h2 className="font-display text-2xl font-bold text-[#0A0A0A]">{stamp.title}</h2>
          {stamp.celebrationLabel && (
            <p className="font-title mt-0.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              {stamp.celebrationLabel} · {stamp.sportDiscipline === 'cricket' ? 'Cricket Legend' : 'Football Legend'} #{stamp.jerseyNumber}
            </p>
          )}
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{stamp.description}</p>
          <p className="font-mono-nums mt-2 text-xs text-neutral-500">
            Set Progress {stamp.collectedCount}/{stamp.totalInSet} · {stamp.coordinates.lat.toFixed(2)}°,{' '}
            {stamp.coordinates.lng.toFixed(2)}°
          </p>
        </div>

        {/* Move Between Folders */}
        {pockets.length > 0 && onMoveStampToFolder && (
          <div className="mt-5 rounded-2xl bg-[#F5F5F7] p-3.5">
            <p className="font-title text-xs font-semibold text-neutral-600">
              Folder Location
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {pockets.map((pocket) => {
                const isCurrent = stamp.pocketId === pocket.id;
                return (
                  <JellyButton
                    key={pocket.id}
                    type="button"
                    onClick={() => onMoveStampToFolder(stamp.id, pocket.id)}
                    aria-pressed={isCurrent}
                    className={`flex h-9 items-center gap-1 rounded-full px-3 text-xs font-medium transition-colors ${
                      isCurrent
                        ? 'bg-[#0A0A0A] text-white'
                        : 'bg-white text-[#0A0A0A] hover:bg-neutral-100'
                    }`}
                  >
                    <Reicon name="folder" size={12} />
                    <span>{pocket.title}</span>
                  </JellyButton>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {!stamp.isUnlocked ? (
            <JellyButton
              type="button"
              jellyIntensity="medium"
              onClick={() => onCollectStamp(stamp.id)}
              className="col-span-2 flex h-12 items-center justify-center gap-2 rounded-full bg-[#0A0A0A] text-sm font-semibold text-white hover:bg-neutral-800"
            >
              <Reicon name="check" size={16} />
              <span>Collect Stamp</span>
            </JellyButton>
          ) : (
            <JellyButton
              type="button"
              jellyIntensity="medium"
              onClick={() => onShareToFeed(stamp)}
              className="col-span-2 flex h-12 items-center justify-center gap-2 rounded-full bg-[#0A0A0A] text-sm font-semibold text-white hover:bg-neutral-800"
            >
              <Reicon name="share" size={16} />
              <span>Share Rare Find</span>
            </JellyButton>
          )}

          <JellyButton
            type="button"
            onClick={() => onEditWithGemini(stamp)}
            className="liquid-glass-btn flex h-11 items-center justify-center gap-1.5 rounded-full text-xs font-semibold text-[#0A0A0A]"
          >
            <Reicon name="wand" size={15} />
            <span>Remix Art</span>
          </JellyButton>

          <JellyButton
            type="button"
            onClick={() => onLocateOnGlobe(stamp.id)}
            className="liquid-glass-btn flex h-11 items-center justify-center gap-1.5 rounded-full text-xs font-semibold text-[#0A0A0A]"
          >
            <Reicon name="globe" size={15} />
            <span>View on Globe</span>
          </JellyButton>
        </div>
      </motion.div>
    </div>
  );
}
