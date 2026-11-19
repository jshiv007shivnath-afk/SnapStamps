import { useState } from 'react';
import { motion } from 'motion/react';
import type { StampItem } from '../types/stamp';
import { JellyButton } from './JellyButton';
import { Reicon } from './Reicon';

interface PerforatedStampCardProps {
  stamp: StampItem;
  onSelect?: (stamp: StampItem) => void;
  onToggleFavorite?: (stampId: string) => void;
  compact?: boolean;
  showProgress?: boolean;
  showUncollectedBadge?: boolean;
  className?: string;
}

function getArtworkScaleClass(imageUrl: string): string {
  if (imageUrl.includes('stamp_japan_fuji_')) {
    return 'scale-[1.24] group-hover:scale-[1.28]';
  }
  if (imageUrl.includes('stamp_italy_rome_')) {
    return 'scale-[1.18] group-hover:scale-[1.22]';
  }
  return 'group-hover:scale-[1.03]';
}

export function PerforatedStampCard({
  stamp,
  onSelect,
  onToggleFavorite,
  compact = false,
  showProgress = true,
  showUncollectedBadge = true,
  className = '',
}: PerforatedStampCardProps) {
  const [imgError, setImgError] = useState(false);

  const isSports = stamp.category === 'sports';
  const artworkScaleClass = getArtworkScaleClass(stamp.imageUrl || '');

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className={`group flex flex-col snap-no-shadow ${className}`}
    >
      <div className="relative">
        {/* Star Favorite indicator */}
        {onToggleFavorite && (
          <JellyButton
            type="button"
            jellyIntensity="medium"
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
                  : 'bg-[#FFFDF7]/95 text-neutral-400 opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
              }`}
            >
              <Reicon name="star" size={14} weight={stamp.isFavorite ? 'Filled' : 'Outline'} />
            </span>
          </JellyButton>
        )}

        <JellyButton
          type="button"
          onClick={() => onSelect?.(stamp)}
          aria-label={`Inspect ${stamp.title} stamp`}
          className="block w-full rounded-2xl text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900"
        >
          {/* Outer Perforated Postage Stamp Paper Stock */}
          <div className="stamp-perforated-x w-full">
            <div className="stamp-perforated-y relative w-full overflow-hidden bg-[#FFFDF7] p-[5.5px] sm:p-[6.5px]">
              {/* Inner Colored Archival Stamp Mat */}
              <div
                className="relative w-full overflow-hidden rounded-[4px] p-[4px] sm:p-[5px] ring-1 ring-inset ring-black/8"
                style={{ backgroundColor: stamp.accentColor || '#F3D2B3' }}
              >
                {/* Artwork Window */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[4px] bg-[#FAF6EE] ring-1 ring-inset ring-black/15">
                  {!imgError && stamp.imageUrl ? (
                      <img
                        src={stamp.imageUrl}
                        alt={
                          stamp.celebrationLabel
                            ? `${stamp.title} — ${stamp.celebrationLabel} collector stamp`
                            : `${stamp.title}, ${stamp.country} travel stamp`
                        }
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={() => setImgError(true)}
                        className={`h-full w-full object-cover transition-transform duration-300 ${artworkScaleClass} ${
                          showUncollectedBadge && !stamp.isUnlocked ? 'grayscale-[45%] opacity-85' : ''
                        }`}
                      />
                  ) : (
                    <div
                      className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center"
                      style={{
                        backgroundColor: '#FAF6EE',
                      }}
                    >
                      <Reicon name={isSports ? 'trophy' : 'map-point'} size={24} color={stamp.bannerColor} />
                      <span className="text-xs font-medium text-neutral-600">{stamp.city}</span>
                    </div>
                  )}

                  {/* Clean Minimal Title Banner only on full-size cards (never truncated on compact thumbnails) */}
                  {!compact && (
                    <div className="absolute inset-x-1.5 bottom-1.5 overflow-hidden rounded-[4px] bg-[#FFFDF7]/96 px-1.5 py-1 text-center ring-1 ring-black/10">
                      <p
                        className="font-stamp-title truncate text-[11px] font-bold tracking-[0.04em] sm:text-[12px]"
                        style={{ color: stamp.bannerColor || '#D64527' }}
                      >
                        {stamp.title}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </JellyButton>
      </div>

      {/* Clean unboxed caption + tabular progress footer */}
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
