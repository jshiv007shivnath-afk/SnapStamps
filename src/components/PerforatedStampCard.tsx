import { useState } from 'react';
import { motion } from 'motion/react';
import type { StampItem, StampRarity } from '../types/stamp';
import { JellyButton } from './JellyButton';
import { Reicon, type ReiconName } from './Reicon';

interface PerforatedStampCardProps {
  stamp: StampItem;
  onSelect?: (stamp: StampItem) => void;
  onToggleFavorite?: (stampId: string) => void;
  compact?: boolean;
  showProgress?: boolean;
  showUncollectedBadge?: boolean;
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
  switzerland: 'CH',
  india: 'IN',
  brazil: 'BR',
  morocco: 'MA',
  argentina: 'AR',
  portugal: 'PT',
};

const RARITY_STYLES: Record<
  StampRarity,
  {
    label: string;
    icon: ReiconName;
    bg: string;
    text: string;
    border: string;
    glow: string;
  }
> = {
  common: {
    label: 'Common',
    icon: 'award',
    bg: 'rgba(255, 253, 247, 0.94)',
    text: '#3F3F46',
    border: 'rgba(10, 10, 10, 0.14)',
    glow: '0 0 8px rgba(148, 163, 184, 0.35)',
  },
  rare: {
    label: 'Rare',
    icon: 'sparkles',
    bg: 'rgba(239, 246, 255, 0.95)',
    text: '#1D4ED8',
    border: 'rgba(37, 99, 235, 0.42)',
    glow: '0 0 11px rgba(37, 99, 235, 0.42)',
  },
  legendary: {
    label: 'Legendary',
    icon: 'crown',
    bg: 'rgba(254, 243, 199, 0.96)',
    text: '#B45309',
    border: 'rgba(245, 158, 11, 0.55)',
    glow: '0 0 13px rgba(245, 158, 11, 0.52)',
  },
};

export function PerforatedStampCard({
  stamp,
  onSelect,
  onToggleFavorite,
  compact = false,
  showProgress = true,
  showUncollectedBadge = true,
  condensedLabel,
  className = '',
}: PerforatedStampCardProps) {
  const [imgError, setImgError] = useState(false);

  const isSports = stamp.category === 'sports';
  const isoCode =
    COUNTRY_ISO[stamp.country.toLowerCase()] || stamp.country.slice(0, 2).toUpperCase();
  const rarityStyle = RARITY_STYLES[stamp.rarity ?? 'common'];

  const eyebrowLabel = isSports
    ? `${stamp.sportDiscipline === 'cricket' ? 'CRICKET' : 'FOOTBALL'}${
        stamp.jerseyNumber ? ` · #${stamp.jerseyNumber}` : ''
      }`
    : `${isoCode} · ${stamp.city}`;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className={`group flex flex-col snap-no-shadow ${className}`}
    >
      <div className="relative">
        {/* Star Favorite indicator (offset outside top-right so it never overlaps Rarity Badge) */}
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
            <div className="stamp-perforated-y relative w-full overflow-hidden bg-[#FFFDF7] p-[5.5px] sm:p-[6.5px]">
              {/* Inner Colored Archival Stamp Mat with Delicate Hairline Register */}
              <div
                className="relative w-full overflow-hidden rounded-[4px] p-[4px] sm:p-[5px] ring-1 ring-inset ring-black/8"
                style={{ backgroundColor: stamp.accentColor || '#F3D2B3' }}
              >
                {/* Artwork Window with Crisp Archival Frame */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[3px] bg-[#FAF6EE] ring-1 ring-inset ring-black/15">
                  {!imgError && stamp.imageUrl ? (
                    <img
                      src={stamp.imageUrl}
                      alt={
                        stamp.celebrationLabel
                          ? `${stamp.title} — ${stamp.celebrationLabel} collector stamp`
                          : `${stamp.title}, ${stamp.country} travel stamp`
                      }
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                      className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${
                        showUncollectedBadge && !stamp.isUnlocked ? 'grayscale-[45%] opacity-85' : ''
                      }`}
                    />
                  ) : (
                    <div
                      className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center"
                      style={{
                        background: `linear-gradient(155deg, ${stamp.accentColor}44 0%, #FFFDF7 100%)`,
                      }}
                    >
                      <Reicon name={isSports ? 'trophy' : 'map-point'} size={24} color={stamp.bannerColor} />
                      <span className="text-xs font-medium text-neutral-600">{stamp.city}</span>
                    </div>
                  )}

                  {/* Delicate Postal Cancellation Ink Seal Watermark */}
                  {!compact && (
                    <svg
                      viewBox="0 0 64 64"
                      aria-hidden="true"
                      className="pointer-events-none absolute right-1.5 top-1.5 h-10 w-10 text-[#0A0A0A]/22"
                    >
                      <circle
                        cx="32"
                        cy="32"
                        r="17"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.15"
                        strokeDasharray="3 2"
                      />
                      <circle cx="32" cy="32" r="11" fill="none" stroke="currentColor" strokeWidth="0.9" />
                      <path
                        d="M4 25 Q14 21 24 25 T44 25 M4 31 Q14 27 24 31 T44 31"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.85"
                        opacity="0.7"
                      />
                    </svg>
                  )}

                  {/* Top-left Visual Rarity Badge with Subtle Ambient Glow */}
                  <div
                    data-testid={`rarity-badge-${stamp.rarity}`}
                    className={`absolute left-1.5 top-1.5 z-10 inline-flex max-w-[calc(100%-12px)] items-center gap-1 rounded-full backdrop-blur-xs ${
                      compact ? 'px-1.5 py-[1.5px]' : 'px-2 py-0.5'
                    }`}
                    style={{
                      backgroundColor: rarityStyle.bg,
                      color: rarityStyle.text,
                      border: `1px solid ${rarityStyle.border}`,
                      boxShadow: rarityStyle.glow,
                    }}
                  >
                    <Reicon
                      name={rarityStyle.icon}
                      size={compact ? 8 : 10}
                      weight="Filled"
                      color={rarityStyle.text}
                      className="shrink-0"
                    />
                    <span
                      className={`font-stamp-condensed truncate font-bold leading-none tracking-[0.05em] ${
                        compact ? 'text-[7.5px]' : 'text-[9.5px]'
                      }`}
                    >
                      {condensedLabel ? `${rarityStyle.label} · ${condensedLabel}` : rarityStyle.label}
                    </span>
                  </div>

                  {/* Subtle Status Tag when Locked */}
                  {showUncollectedBadge && !stamp.isUnlocked && (
                    <div className="absolute inset-x-0 top-8 flex justify-center">
                      <span className="font-control rounded-full bg-[#FFFDF7]/95 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-neutral-800 ring-1 ring-black/10">
                        Uncollected
                      </span>
                    </div>
                  )}

                  {/* Archival Typographic Title Cartouche */}
                  <div className="absolute inset-x-1.5 bottom-1.5 overflow-hidden rounded-[3px] bg-[#FFFDF7]/96 px-1.5 py-1 text-center ring-1 ring-black/10 backdrop-blur-xs">
                    <p className="font-stamp-condensed truncate text-[8.5px] font-bold tracking-[0.08em] text-neutral-600">
                      {stamp.celebrationLabel ? stamp.celebrationLabel : eyebrowLabel}
                    </p>
                    <p
                      className={`font-stamp-title truncate font-bold tracking-[0.04em] ${
                        compact ? 'text-[10px]' : 'text-[11px] sm:text-[12px]'
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
