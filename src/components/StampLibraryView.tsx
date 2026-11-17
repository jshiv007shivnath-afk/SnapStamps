import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { PocketTint, StampItem, StampPocket, UserProfile } from '../types/stamp';
import { getPocketStampCount, getPocketStamps } from '../utils/stampLogic';
import { AppLogo } from './AppLogo';
import { Folder } from './Folder';
import { JellyButton } from './JellyButton';
import { Reicon } from './Reicon';

interface StampLibraryViewProps {
  pockets: StampPocket[];
  stamps: StampItem[];
  userProfile: UserProfile;
  unreadNotificationsCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenPocket: (pocketId: string) => void;
  onQuickAddToPocket: (pocketId: string) => void;
  onOpenCreateFolder: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onSelectStamp: (stamp: StampItem) => void;
  onOpenProfile: () => void;
}

const POCKET_COLOR_HEX: Record<PocketTint, string> = {
  amber: '#F5CD42',
  sage: '#74B87A',
  coral: '#EE7D68',
  sky: '#72ADE8',
};

function RealPocketStampCard({ stamp }: { stamp: StampItem }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="h-full w-full select-none">
      <div className="stamp-perforated-x h-full w-full">
        <div className="stamp-perforated-y h-full w-full bg-[#FFFDF7] p-[4.5px] sm:p-[5.5px]">
          <div
            className="relative h-full w-full overflow-hidden rounded-[2px] ring-1 ring-inset ring-black/12"
            style={{ backgroundColor: stamp.accentColor || '#E5E7EB' }}
          >
            {!imgError && stamp.imageUrl ? (
              <img
                src={stamp.imageUrl}
                alt={stamp.title}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#FAF6EE]">
                <Reicon name={stamp.category === 'sports' ? 'trophy' : 'map-point'} size={18} color="#0A0A0A" />
              </div>
            )}
            <div className="absolute inset-x-1 bottom-1 rounded-[2px] bg-[#FFFDF7]/94 px-1 py-0.5 text-center ring-1 ring-black/10">
              <span className="font-stamp-condensed block truncate text-[9px] font-bold leading-none tracking-[0.04em] text-[#0A0A0A]">
                {stamp.title}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyPocketCard({ label }: { label: string }) {
  return (
    <div className="h-full w-full select-none">
      <div className="stamp-perforated-x h-full w-full">
        <div className="stamp-perforated-y h-full w-full bg-[#FFFDF7]/90 p-[4.5px] sm:p-[5.5px]">
          <div className="flex h-full w-full flex-col items-center justify-center rounded-[2px] border border-dashed border-black/15 bg-[#F4F4F6] px-1.5 text-center">
            <Reicon name="folder-open" size={14} color="#9CA3AF" />
            <span className="font-stamp-condensed mt-1 block truncate text-[8.5px] font-bold tracking-[0.06em] text-neutral-400">
              {label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PocketFolderCard({
  pocket,
  pocketStamps,
  unlockedCount,
  onOpenPocket,
  onQuickAddToPocket,
  onSelectStamp,
}: {
  pocket: StampPocket;
  pocketStamps: StampItem[];
  unlockedCount: number;
  onOpenPocket: (pocketId: string) => void;
  onQuickAddToPocket: (pocketId: string) => void;
  onSelectStamp: (stamp: StampItem) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [pocketWidth, setPocketWidth] = useState(335);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;
    let rafId = 0;
    const updateWidth = () => {
      const next = Math.round(node.getBoundingClientRect().width);
      if (next > 100) {
        setPocketWidth((prev) => (prev === next ? prev : next));
      }
    };
    const scheduleUpdate = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateWidth);
    };
    updateWidth();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(scheduleUpdate);
    ro.observe(node);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  const displayedStamps = pocketStamps.filter((s) => s.isUnlocked).slice(0, 4);

  const folderItems =
    displayedStamps.length > 0
      ? displayedStamps.map((stamp) => ({
          id: stamp.id,
          title: stamp.title,
          content: <RealPocketStampCard stamp={stamp} />,
        }))
      : [
          {
            id: `${pocket.id}-empty-1`,
            title: pocket.title,
            content: <EmptyPocketCard label="EMPTY" />,
          },
          {
            id: `${pocket.id}-empty-2`,
            title: 'Tap + to add',
            content: <EmptyPocketCard label="TAP +" />,
          },
        ];

  return (
    <section className="flex flex-col items-center">
      {/* Preserves exact pocket size: w-full max-w-[390px] and 48px peek + 136px pocket front = 184px */}
      <div ref={wrapperRef} className="relative flex w-full max-w-[390px] justify-center">
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
            const matched = displayedStamps[idx];
            if (matched) {
              onSelectStamp(matched);
            } else {
              onOpenPocket(pocket.id);
            }
          }}
          frontOverlay={
            <div className="pointer-events-none flex h-full w-full items-center justify-end px-5">
              <JellyButton
                type="button"
                jellyIntensity="medium"
                data-folder-overlay-action="true"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAddToPocket(pocket.id);
                }}
                aria-label={`Add stamp to ${pocket.title}`}
                className="liquid-glass-btn pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#0A0A0A] focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
              >
                <Reicon name="plus" size={20} />
              </JellyButton>
            </div>
          }
        />
      </div>

      {/* Clean Centered Title & Count Below Pocket */}
      <JellyButton
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
      </JellyButton>
    </section>
  );
}

export function StampLibraryView({
  pockets,
  stamps,
  userProfile,
  unreadNotificationsCount,
  searchQuery,
  onSearchChange,
  onOpenPocket,
  onQuickAddToPocket,
  onOpenCreateFolder,
  onOpenNotifications,
  onOpenSettings,
  onSelectStamp,
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

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-32 pt-4 sm:px-8">
      {/* Top User Row: Profile + Dark Pill Island [Search | Notification | Settings | +] */}
      <header className="flex items-center justify-between gap-2">
        <JellyButton
          type="button"
          onClick={onOpenProfile}
          aria-label="Open traveler profile"
          className="flex min-w-0 items-center gap-2.5 rounded-full pr-1 text-left transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E9DEC9] text-[13px] font-bold text-[#0A0A0A]">
            {userProfile.initials}
          </div>
          <div className="min-w-0 leading-tight">
            <p className="font-body text-[12px] font-normal text-neutral-500">Hello,</p>
            <p className="font-title truncate text-[15px] font-medium text-[#0A0A0A]">
              {userProfile.name}
            </p>
          </div>
        </JellyButton>

        {/* Signature Dark Capsule keeping Search + Notification + Settings + Plus */}
        <div className="flex h-11 shrink-0 items-center rounded-full bg-[#0A0A0A] px-1 text-white">
          <JellyButton
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label="Search stamp library"
            aria-expanded={searchOpen}
            className="flex h-11 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-white"
          >
            <Reicon name="search" size={18} />
          </JellyButton>

          <JellyButton
            type="button"
            onClick={onOpenNotifications}
            aria-label="Open notifications"
            data-testid="home-notifications-btn"
            className="relative flex h-11 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-white"
          >
            <Reicon name="notification" size={18} />
            {unreadNotificationsCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute right-2 top-2.5 h-2 w-2 rounded-full bg-[#2563EB] ring-1 ring-[#0A0A0A]"
              />
            )}
          </JellyButton>

          <JellyButton
            type="button"
            onClick={onOpenSettings}
            aria-label="Open settings"
            data-testid="home-settings-btn"
            className="flex h-11 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-white"
          >
            <Reicon name="settings" size={18} />
          </JellyButton>

          <JellyButton
            type="button"
            jellyIntensity="medium"
            onClick={onOpenCreateFolder}
            aria-label="Create new stamp folder"
            data-testid="home-create-folder-btn"
            className="flex h-11 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-white"
          >
            <Reicon name="plus" size={19} />
          </JellyButton>
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
              placeholder="Search folders, countries, or stamps..."
              className="font-body w-full bg-transparent text-sm text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-none"
            />
            {searchQuery && (
              <JellyButton
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear library search"
                className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600"
              >
                <Reicon name="close" size={16} />
              </JellyButton>
            )}
          </div>
        </motion.div>
      )}

      {/* Clean Welcome Heading with SnapStamps Scalloped Seal Logo */}
      <div className="mt-6">
        <div className="flex items-center gap-2">
          <AppLogo size={20} />
          <p className="font-title text-[19px] font-normal leading-snug text-neutral-800">Welcome</p>
        </div>
        <h1 className="font-title text-[26px] font-medium tracking-[-0.02em] text-[#0A0A0A] sm:text-[30px]">
          Your Stamp Library
        </h1>
      </div>

      {/* Animated Folder Stamp Pockets Grid */}
      {visiblePockets.length === 0 ? (
        <div className="liquid-glass-btn-soft mt-10 rounded-[28px] p-10 text-center">
          <p className="font-title text-base font-semibold text-[#0A0A0A]">
            No matching stamp folders
          </p>
          <p className="font-body mt-1 text-sm text-neutral-500">
            Clear your search or tap + in the top bar to create a new folder.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
          {visiblePockets.map((pocket) => {
            const pocketStamps = getPocketStamps(stamps, pocket.id);
            return (
              <PocketFolderCard
                key={pocket.id}
                pocket={pocket}
                pocketStamps={pocketStamps}
                unlockedCount={getPocketStampCount(stamps, pocket.id)}
                onOpenPocket={onOpenPocket}
                onQuickAddToPocket={onQuickAddToPocket}
                onSelectStamp={onSelectStamp}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
