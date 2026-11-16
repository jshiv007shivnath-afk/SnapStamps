import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { PocketTint, StampItem, StampPocket, UserProfile } from '../types/stamp';
import { getPocketStampCount, getPocketStamps } from '../utils/stampLogic';
import { Folder } from './Folder';
import { Reicon } from './Reicon';

interface StampLibraryViewProps {
  pockets: StampPocket[];
  stamps: StampItem[];
  userProfile: UserProfile;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenPocket: (pocketId: string) => void;
  onQuickAddToPocket: (pocketId: string) => void;
  onSelectStamp: (stamp: StampItem) => void;
  onOpenSwiftUIExport: () => void;
  onOpenProfile: () => void;
}

interface FanStampCardSpec {
  id: string;
  label: string;
  postage?: string;
  skyColor: string;
  silhouetteColor: string;
  silhouettePath: string;
  linkedStampId?: string;
}

const POCKET_COLOR_HEX: Record<PocketTint, string> = {
  amber: '#F5CD42',
  sage: '#74B87A',
  coral: '#EE7D68',
  sky: '#72ADE8',
};

const POCKET_FAN_PRESETS: Record<string, FanStampCardSpec[]> = {
  countries: [
    {
      id: 'fan-za',
      label: 'SOU\nAFR',
      skyColor: '#EE7948',
      silhouetteColor: '#9E7B2F',
      silhouettePath: 'M0 58 L14 38 L32 34 L54 34 L72 42 L90 54 L90 74 L0 74 Z',
      linkedStampId: 'islas-canarias',
    },
    {
      id: 'fan-usa',
      label: 'USA',
      skyColor: '#75C9AC',
      silhouetteColor: '#D4B65E',
      silhouettePath:
        'M6 52 H84 V74 H6 Z M16 40 H74 V52 H16 Z M36 28 Q45 18 54 28 V40 H36 Z M20 55 H25 V70 H20 Z M32 55 H37 V70 H32 Z M44 55 H49 V70 H44 Z M56 55 H61 V70 H56 Z M68 55 H73 V70 H68 Z',
      linkedStampId: 'new-york',
    },
    {
      id: 'fan-eg',
      label: 'EG',
      skyColor: '#F4CB59',
      silhouetteColor: '#C98A1B',
      silhouettePath: 'M0 64 L36 30 L74 64 L90 64 L90 74 L0 74 Z M54 64 L74 44 L90 64 Z',
      linkedStampId: 'cairo',
    },
    {
      id: 'fan-italy',
      label: 'ITALY',
      postage: '€0,65',
      skyColor: '#5288C8',
      silhouetteColor: '#C98F3B',
      silhouettePath:
        'M6 44 L48 34 L82 40 V74 H6 Z M14 48 H22 V56 H14 Z M28 46 H36 V56 H28 Z M42 44 H50 V56 H42 Z M56 45 H64 V56 H56 Z M14 60 H22 V70 H14 Z M28 60 H36 V70 H28 Z M42 60 H50 V70 H42 Z M56 60 H64 V70 H56 Z',
      linkedStampId: 'paris',
    },
  ],
  cities: [
    {
      id: 'fan-madrid',
      label: 'MADRID',
      skyColor: '#E88B68',
      silhouetteColor: '#A94F2A',
      silhouettePath:
        'M6 50 H84 V74 H6 Z M14 38 H76 V50 H14 Z M38 26 H52 V38 H38 Z M18 54 H26 V68 H18 Z M34 54 H42 V68 H34 Z M50 54 H58 V68 H50 Z M66 54 H74 V68 H66 Z',
      linkedStampId: 'madrid',
    },
    {
      id: 'fan-ibiza',
      label: 'IBIZA',
      skyColor: '#76C2D4',
      silhouetteColor: '#2B7A8B',
      silhouettePath:
        'M0 56 Q24 48 48 56 T90 54 V74 H0 Z M12 36 H34 V56 H12 Z M38 42 H58 V56 H38 Z M22 28 L34 36 H12 Z',
      linkedStampId: 'ibiza',
    },
    {
      id: 'fan-sevilla',
      label: 'SEVILLA',
      skyColor: '#F2AE52',
      silhouetteColor: '#9F4D1E',
      silhouettePath:
        'M0 58 H90 V74 H0 Z M36 22 H54 V58 H36 Z M40 14 L45 8 L50 14 V22 H40 Z M14 40 H30 V58 H14 Z M60 44 H78 V58 H60 Z',
      linkedStampId: 'sevilla',
    },
    {
      id: 'fan-paris',
      label: 'PARIS',
      postage: '€0,80',
      skyColor: '#6D9DC5',
      silhouetteColor: '#274C77',
      silhouettePath:
        'M0 62 H90 V74 H0 Z M41 12 H49 L56 46 L68 62 H54 L49 50 H41 L36 62 H22 L34 46 Z',
      linkedStampId: 'paris',
    },
  ],
  landmarks: [
    {
      id: 'fan-barcelona',
      label: 'BARCELONA',
      skyColor: '#EA8D52',
      silhouetteColor: '#9E3E1D',
      silhouettePath:
        'M0 62 H90 V74 H0 Z M18 32 L24 14 L30 32 V62 H18 Z M38 24 L45 8 L52 24 V62 H38 Z M60 32 L66 14 L72 32 V62 H60 Z',
      linkedStampId: 'barcelona',
    },
    {
      id: 'fan-santorini',
      label: 'GREECE',
      skyColor: '#81BFE0',
      silhouetteColor: '#1E5F8A',
      silhouettePath:
        'M0 56 Q22 48 45 56 T90 54 V74 H0 Z M18 40 H42 V56 H18 Z M46 36 A14 14 0 0 1 74 36 V56 H46 Z',
      linkedStampId: 'santorini',
    },
    {
      id: 'fan-giza',
      label: 'GIZA',
      skyColor: '#F3CB65',
      silhouetteColor: '#B5741D',
      silhouettePath: 'M0 64 L32 28 L66 64 L90 64 V74 H0 Z M50 64 L72 40 L90 64 Z',
      linkedStampId: 'cairo',
    },
    {
      id: 'fan-rome',
      label: 'ROME',
      postage: '€0,65',
      skyColor: '#6B99C9',
      silhouetteColor: '#B46A34',
      silhouettePath:
        'M8 42 L50 32 L82 38 V74 H8 Z M16 48 H24 V66 H16 Z M30 46 H38 V66 H30 Z M44 44 H52 V66 H44 Z M58 45 H66 V66 H58 Z',
      linkedStampId: 'madrid',
    },
  ],
  rare: [
    {
      id: 'fan-kyoto',
      label: 'JAPAN',
      skyColor: '#6BB89D',
      silhouetteColor: '#1E4A45',
      silhouettePath:
        'M0 62 L24 44 L52 54 L90 40 V74 H0 Z M24 26 H66 V32 H24 Z M32 32 V62 H38 V32 Z M52 32 V62 H58 V32 Z',
      linkedStampId: 'kyoto',
    },
    {
      id: 'fan-canarias',
      label: 'CANARIAS',
      skyColor: '#76BFD3',
      silhouetteColor: '#255D6E',
      silhouettePath:
        'M0 58 Q30 48 60 56 T90 52 V74 H0 Z M32 56 L54 24 L78 56 Z',
      linkedStampId: 'islas-canarias',
    },
    {
      id: 'fan-nyc',
      label: 'NYC',
      skyColor: '#8CAED1',
      silhouetteColor: '#2E4764',
      silhouettePath:
        'M0 64 H90 V74 H0 Z M12 42 H24 V64 H12 Z M28 28 H40 V64 H28 Z M44 14 H56 V64 H44 Z M60 32 H74 V64 H60 Z',
      linkedStampId: 'new-york',
    },
    {
      id: 'fan-fjord',
      label: 'NORWAY',
      postage: 'kr 21',
      skyColor: '#E8926B',
      silhouetteColor: '#6D3F2E',
      silhouettePath: 'M0 44 L28 24 L52 46 L76 28 L90 42 V74 H0 Z',
      linkedStampId: 'kyoto',
    },
  ],
};

function VintagePocketStamp({ spec }: { spec: FanStampCardSpec }) {
  const isLongSingleWord = !spec.label.includes('\n') && spec.label.length >= 8;

  return (
    <div className="h-full w-full select-none">
      <div className="stamp-perforated-x h-full w-full">
        <div className="stamp-perforated-y h-full w-full bg-white p-[4.5px] sm:p-[5.5px]">
          <div
            className="relative h-full w-full overflow-hidden"
            style={{ backgroundColor: spec.skyColor }}
          >
            {/* Vintage Condensed Stamp Label (Oswald / Barlow Condensed) */}
            <div className="relative z-10 flex items-start justify-between gap-1 px-1.5 pt-1">
              <span
                className={`font-stamp-condensed whitespace-pre-line font-bold leading-[0.95] tracking-[0.02em] text-[#0A0A0A] ${
                  isLongSingleWord ? 'text-[11px] sm:text-[12.5px]' : 'text-[13px] sm:text-[15px]'
                }`}
              >
                {spec.label}
              </span>
              {spec.postage && (
                <span className="font-body shrink-0 text-[8px] font-semibold tracking-tight text-[#0A0A0A]/85 sm:text-[9px]">
                  {spec.postage}
                </span>
              )}
            </div>

            {/* Layered Monument / Landscape Silhouette */}
            <svg
              viewBox="0 0 90 74"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[76%] w-full"
              aria-hidden="true"
            >
              <path d={spec.silhouettePath} fill={spec.silhouetteColor} />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function PocketFolderCard({
  pocket,
  stamps,
  unlockedCount,
  fanSpecs,
  onOpenPocket,
  onQuickAddToPocket,
  onSelectStamp,
}: {
  pocket: StampPocket;
  stamps: StampItem[];
  unlockedCount: number;
  fanSpecs: FanStampCardSpec[];
  onOpenPocket: (pocketId: string) => void;
  onQuickAddToPocket: (pocketId: string) => void;
  onSelectStamp: (stamp: StampItem) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [pocketWidth, setPocketWidth] = useState(335);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;
    const updateWidth = () => {
      const next = Math.round(node.getBoundingClientRect().width);
      if (next > 100) setPocketWidth(next);
    };
    updateWidth();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(updateWidth);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const folderItems = fanSpecs.map((spec) => ({
    id: spec.id,
    title: spec.label.replace('\n', ' '),
    content: <VintagePocketStamp spec={spec} />,
  }));

  return (
    <section className="flex flex-col items-center">
      {/* Preserves exact pocket size: w-full max-w-[390px] and 48px peek + 136px pocket front = 184px */}
      <div ref={wrapperRef} className="relative w-full max-w-[390px] flex justify-center">
        <Folder
          variant="glass"
          color={POCKET_COLOR_HEX[pocket.tint]}
          width={pocketWidth}
          frontHeight={136}
          peekHeight={48}
          borderRadius={28}
          hideTab
          openOn="click"
          draggable
          zoomOnClick={false}
          peek
          intro
          tilt={0.45}
          bounce={0.42}
          frost={0.35}
          theme="light"
          ariaLabel={`Open ${pocket.title} animated stamp folder`}
          items={folderItems}
          onItemClick={(_item, idx) => {
            const spec = fanSpecs[idx];
            const linked = spec?.linkedStampId
              ? stamps.find((s) => s.id === spec.linkedStampId)
              : undefined;
            if (linked) {
              onSelectStamp(linked);
            } else {
              onOpenPocket(pocket.id);
            }
          }}
          frontOverlay={
            <div className="pointer-events-none flex h-full w-full items-center justify-end px-5">
              {/* Liquid Glass '+' Trigger on Right Edge matching Reference Pockets */}
              <motion.button
                type="button"
                data-folder-overlay-action="true"
                whileTap={{ scale: 0.92 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAddToPocket(pocket.id);
                }}
                aria-label={`Add stamp to ${pocket.title}`}
                className="liquid-glass-btn pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#0A0A0A] focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
              >
                <Reicon name="plus" size={20} />
              </motion.button>
            </div>
          }
        />
      </div>

      {/* Clean Centered Title & Count Below Pocket (tap to open full pocket grid) */}
      <button
        type="button"
        onClick={() => onOpenPocket(pocket.id)}
        className="mt-3 flex min-h-[44px] flex-col items-center justify-center rounded-xl px-4 text-center transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
      >
        <span className="font-title text-[17px] font-medium text-[#0A0A0A]">
          {pocket.title}
        </span>
        <span className="font-mono-nums text-[12px] font-normal text-neutral-500">
          {unlockedCount} {unlockedCount === 1 ? 'Stamp' : 'Stamps'}
        </span>
      </button>
    </section>
  );
}

export function StampLibraryView({
  pockets,
  stamps,
  userProfile,
  searchQuery,
  onSearchChange,
  onOpenPocket,
  onQuickAddToPocket,
  onSelectStamp,
  onOpenSwiftUIExport,
  onOpenProfile,
}: StampLibraryViewProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  const visiblePockets = pockets.filter((pocket) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesPocket =
      pocket.title.toLowerCase().includes(q) || pocket.subtitle.toLowerCase().includes(q);
    const pocketStamps = getPocketStamps(stamps, pocket.id);
    const matchesStamp = pocketStamps.some(
      (s) => s.title.toLowerCase().includes(q) || s.country.toLowerCase().includes(q)
    );
    return matchesPocket || matchesStamp;
  });

  const getFanSpecsForPocket = (pocket: StampPocket): FanStampCardSpec[] => {
    const preset = POCKET_FAN_PRESETS[pocket.id] ?? POCKET_FAN_PRESETS.countries;
    const pocketStamps = getPocketStamps(stamps, pocket.id);
    const customStamps = pocketStamps.filter((s) => s.isCustomGenerated);

    if (customStamps.length === 0) {
      return preset;
    }

    const customSpecs: FanStampCardSpec[] = customStamps.slice(0, 2).map((cs) => ({
      id: `fan-${cs.id}`,
      label: cs.title.slice(0, 8).toUpperCase(),
      skyColor: cs.accentColor || '#EE7948',
      silhouetteColor: cs.bannerColor || '#9E3E1D',
      silhouettePath: 'M0 58 L28 34 L58 48 L90 32 V74 H0 Z',
      linkedStampId: cs.id,
    }));

    return [...customSpecs, ...preset].slice(0, 4);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-32 pt-4 sm:px-8">
      {/* Top User Row matching Reference Screen 2 & Image 3 */}
      <header className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onOpenProfile}
          aria-label="Open traveler profile"
          className="flex items-center gap-3 rounded-full pr-2 text-left transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E9DEC9] text-[13px] font-bold text-[#0A0A0A]">
            {userProfile.initials}
          </div>
          <div className="leading-tight">
            <p className="font-body text-[12px] font-normal text-neutral-500">Hello,</p>
            <p className="font-title text-[15px] font-medium text-[#0A0A0A]">{userProfile.name}</p>
          </div>
        </button>

        {/* Dark Pill Icon Island matching Reference Screen 2 */}
        <div className="flex h-11 items-center rounded-full bg-[#0A0A0A] px-1.5 text-white">
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label="Search stamp library"
            aria-expanded={searchOpen}
            className="flex h-11 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-white"
          >
            <Reicon name="search" size={18} />
          </button>
          <button
            type="button"
            onClick={onOpenSwiftUIExport}
            aria-label="Notifications and SwiftUI export"
            className="flex h-11 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-white"
          >
            <Reicon name="bell" size={18} />
          </button>
        </div>
      </header>

      {/* Expandable Inline Search */}
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16 }}
          className="mt-4"
        >
          <label htmlFor="library-search" className="sr-only">
            Search stamp library
          </label>
          <div className="liquid-glass-btn flex h-12 items-center gap-2 rounded-2xl px-4">
            <Reicon name="search" size={18} color="#6B7280" />
            <input
              id="library-search"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search countries, cities, or pockets..."
              className="font-body w-full bg-transparent text-sm text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear library search"
                className="liquid-glass-btn flex h-9 w-9 items-center justify-center rounded-full text-neutral-600"
              >
                <Reicon name="close" size={16} />
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Clean Welcome Heading matching Image 3 */}
      <div className="mt-6">
        <p className="font-title text-[19px] font-normal leading-snug text-neutral-800">Welcome</p>
        <h1 className="font-title text-[26px] font-medium tracking-[-0.02em] text-[#0A0A0A] sm:text-[30px]">
          Your Stamp Library
        </h1>
      </div>

      {/* Animated React Bits Folder Stamp Pockets Grid (Preserving exact card sizes) */}
      {visiblePockets.length === 0 ? (
        <div className="liquid-glass-btn mt-10 rounded-[28px] p-10 text-center">
          <p className="font-title text-base font-semibold text-[#0A0A0A]">
            No matching stamp pockets
          </p>
          <p className="font-body mt-1 text-sm text-neutral-500">
            Try clearing your search or create a custom stamp with the plus button below.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
          {visiblePockets.map((pocket) => (
            <PocketFolderCard
              key={pocket.id}
              pocket={pocket}
              stamps={stamps}
              unlockedCount={getPocketStampCount(stamps, pocket.id)}
              fanSpecs={getFanSpecsForPocket(pocket)}
              onOpenPocket={onOpenPocket}
              onQuickAddToPocket={onQuickAddToPocket}
              onSelectStamp={onSelectStamp}
            />
          ))}
        </div>
      )}
    </div>
  );
}
