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
  condensedLabel?: string;
  className?: string;
}

const COUNTRY_ISO: Record<string, string> = {
  spain: 'ES',
  japan: 'JP',
  france: 'FR',
  egypt: 'EG',
  greece: 'GR',
  'united states': 'US',
};

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

  const isoCode = COUNTRY_ISO[stamp.country.toLowerCase()] || stamp.country.slice(0, 2).toUpperCase();
  const rarityLabel = stamp.rarity === 'legendary' ? '01 ★' : stamp.rarity === 'rare' ? 'RARE' : `${stamp.collectedCount}`;

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
          className="block w-full rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900"
        >
          {/* Outer Perforated Postage Stamp Paper Stock */}
          <div className="stamp-perforated-x w-full">
            <div className="stamp-perforated-y relative w-full overflow-hidden bg-[#FFFDF7] p-[5px] sm:p-[6px]">
              {/* Inner Colored Archival Stamp Mat */}
              <div
                className="relative w-full overflow-hidden rounded-[4px] p-[3.5px] sm:p-[4.5px]"
                style={{ backgroundColor: stamp.accentColor || '#F3D2B3' }}
              >
                {/* Artwork Window with Crisp Inset Frame */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[3px] bg-[#FAF6EE] ring-1 ring-inset ring-black/10">
                  {!imgError && stamp.imageUrl ? (
                    <img
                      src={stamp.imageUrl}
                      alt={`${stamp.title}, ${stamp.country} travel stamp`}
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                      className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${
                        !stamp.isUnlocked ? 'grayscale-[50%] opacity-85' : ''
                      }`}
                    />
                  ) : (
                    <div
                      className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center"
                      style={{
                        background: `linear-gradient(155deg, ${stamp.accentColor}44 0%, #FFFDF7 100%)`,
                      }}
                    >
                      <Reicon name="map-point" size={24} color={stamp.bannerColor} />
                      <span className="text-xs font-medium text-neutral-600">{stamp.city}</span>
                    </div>
                  )}

                  {/* Delicate Postal Cancellation Ink Seal Watermark on Unlocked Stamps */}
                  {stamp.isUnlocked && !compact && (
                    <svg
                      viewBox="0 0 64 64"
                      aria-hidden="true"
                      className="pointer-events-none absolute right-1.5 top-1.5 h-10 w-10 text-[#0A0A0A]/25"
                    >
                      <circle cx="32" cy="32" r="17" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2" />
                      <circle cx="32" cy="32" r="11" fill="none" stroke="currentColor" strokeWidth="0.9" />
                      <path
                        d="M4 25 Q14 21 24 25 T44 25 M4 31 Q14 27 24 31 T44 31"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.9"
                        opacity="0.7"
                      />
                    </svg>
                  )}

                  {/* Vintage Condensed Country/Value Stamp Tag */}
                  {condensedLabel ? (
                    <div className="absolute left-1.5 top-1.5 rounded-[3px] bg-[#FFFDF7]/92 px-1.5 py-0.5 ring-1 ring-black/10">
                      <span className="font-stamp-condensed block text-[11px] font-bold leading-none tracking-[0.04em] text-[#0A0A0A]">
                        {condensedLabel}
                      </span>
                    </div>
                  ) : !compact ? (
                    <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-[3px] bg-[#FFFDF7]/92 px-1.5 py-0.5 ring-1 ring-black/8">
                      <span className="font-stamp-condensed text-[10px] font-bold leading-none tracking-[0.05em] text-[#0A0A0A]">
                        {isoCode}
                      </span>
                      <span className="h-2 w-px bg-black/15" />
                      <span className="font-mono-nums text-[8.5px] font-semibold leading-none tracking-tight text-neutral-600">
                        {stamp.rarity === 'common' ? 'STD' : rarityLabel.replace(' ★', '')}
                      </span>
                    </div>
                  ) : null}

                  {/* Subtle Status Tag when Locked */}
                  {!stamp.isUnlocked && (
                    <div className="absolute inset-x-0 top-7 flex justify-center">
                      <span className="font-control rounded-full bg-[#FFFDF7]/95 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-neutral-800 ring-1 ring-black/10">
                        Uncollected
                      </span>
                    </div>
                  )}

                  {/* Archival Typographic Title Cartouche */}
                  <div className="absolute inset-x-1.5 bottom-1.5 overflow-hidden rounded-[3px] bg-[#FFFDF7]/96 px-1.5 py-1 text-center ring-1 ring-black/8 backdrop-blur-xs">
                    <div
                      className="mx-auto mb-0.5 h-[1.5px] w-7 rounded-full opacity-55"
                      style={{ backgroundColor: stamp.bannerColor || '#D64527' }}
                    />
                    <p
                      className={`font-stamp-title truncate font-bold tracking-[0.05em] ${
                        compact ? 'text-[10px]' : 'text-[11.5px] sm:text-[12.5px]'
                      }`}
                      style={{ color: stamp.bannerColor || '#D64527' }}
                    >
                      {stamp.title}
                    </p>
                  </div>
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
