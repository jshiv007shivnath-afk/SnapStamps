import { useState } from 'react';
import { motion } from 'motion/react';
import type { StampItem } from '../types/stamp';
import { Reicon } from './Reicon';

interface PerforatedStampCardProps {
  stamp: StampItem;
  onSelect?: (stamp: StampItem) => void;
  onToggleFavorite?: (stampId: string) => void;
  compact?: boolean;
  showProgress?: boolean;
  condensedLabel?: string;
  className?: string;
}

export function PerforatedStampCard({
  stamp,
  onSelect,
  onToggleFavorite,
  compact = false,
  showProgress = true,
  condensedLabel,
  className = '',
}: PerforatedStampCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className={`group flex flex-col snap-no-shadow ${className}`}
    >
      <div className="relative">
        {/* Star Favorite indicator matching Reference Screen 3 top-left / top-right corner */}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(stamp.id);
            }}
            aria-label={stamp.isFavorite ? `Remove ${stamp.title} from favorites` : `Favorite ${stamp.title}`}
            className="absolute -right-1.5 -top-1.5 z-20 flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                stamp.isFavorite
                  ? 'bg-[#FF6B1A] text-white'
                  : 'bg-white/90 text-neutral-400 opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
              }`}
            >
              <Reicon name="star" size={14} weight={stamp.isFavorite ? 'Filled' : 'Outline'} />
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onSelect?.(stamp)}
          aria-label={`Inspect ${stamp.title} stamp`}
          className="block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900 rounded-xl"
        >
          {/* Outer Perforated Postage Stamp Mat */}
          <div className="stamp-perforated-x w-full">
            <div
              className="stamp-perforated-y relative w-full overflow-hidden p-[7px] sm:p-[9px]"
              style={{ backgroundColor: stamp.accentColor || '#F3D2B3' }}
            >
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[6px] bg-white">
              {!imgError && stamp.imageUrl ? (
                <img
                  src={stamp.imageUrl}
                  alt={`${stamp.title}, ${stamp.country} travel stamp`}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${
                    !stamp.isUnlocked ? 'grayscale-[45%] opacity-85' : ''
                  }`}
                />
              ) : (
                <div
                  className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center"
                  style={{
                    background: `linear-gradient(155deg, ${stamp.accentColor}44 0%, #FFFFFF 100%)`,
                  }}
                >
                  <Reicon name="map-point" size={24} color={stamp.bannerColor} />
                  <span className="text-xs font-medium text-neutral-600">{stamp.city}</span>
                </div>
              )}

              {/* Vintage Condensed Country/Code Label for stacked pocket stamps */}
              {condensedLabel && (
                <div className="absolute left-1.5 top-1.5 rounded-[3px] bg-white/90 px-1.5 py-0.5">
                  <span className="font-stamp-condensed block text-[11px] font-bold leading-none tracking-[0.04em] text-[#0A0A0A]">
                    {condensedLabel}
                  </span>
                </div>
              )}

              {/* Warm sun seal accent when locked */}
              {!stamp.isUnlocked && (
                <div className={`absolute inset-x-0 flex justify-center ${condensedLabel ? 'top-6' : 'top-2'}`}>
                  <span className="font-control rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-neutral-800">
                    Uncollected
                  </span>
                </div>
              )}

              {/* Bottom Destination Label Band matching Reference Screen 3 */}
              <div className="absolute inset-x-1.5 bottom-1.5 rounded-[4px] bg-white/95 px-1.5 py-1 text-center backdrop-blur-xs">
                <p
                  className={`font-stamp-title truncate font-bold tracking-[0.05em] ${
                    compact ? 'text-[10px]' : 'text-[12px] sm:text-[13px]'
                  }`}
                  style={{ color: stamp.bannerColor || '#D64527' }}
                >
                  {stamp.title}
                </p>
              </div>
            </div>
            </div>
          </div>
        </button>
      </div>

      {/* Clean unboxed caption + tabular progress footer matching Reference Screen 3 */}
      {showProgress && (
        <div className="mt-2 flex items-baseline justify-between gap-2 px-0.5">
          <span className="font-title truncate text-[13px] font-medium text-neutral-900">{stamp.title}</span>
          <span className="font-mono-nums shrink-0 text-[12px] font-normal text-neutral-500">
            {stamp.collectedCount}/{stamp.totalInSet}
          </span>
        </div>
      )}
    </motion.div>
  );
}
