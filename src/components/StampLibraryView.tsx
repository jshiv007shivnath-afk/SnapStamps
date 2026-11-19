import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { PocketTint, StampItem, StampPocket, UserProfile } from '../types/stamp';
import { getPocketStampCount, getPocketStamps } from '../utils/stampLogic';
import { AppLogo } from './AppLogo';
import { Folder, type FolderInputItem, type FolderItemEntry } from './Folder';
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
  onMoveStampToPocket: (stampId: string, targetPocketId: string) => void;
  onOpenCreateFolder: () => void;
  onOpenNotifications: () => void;
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
        <div className="stamp-perforated-y h-full w-full bg-[#FFFDF7] p-[5px] sm:p-[6px]">
          <div
            className="relative h-full w-full overflow-hidden rounded-[4px] ring-1 ring-inset ring-black/12"
            style={{ backgroundColor: stamp.accentColor || '#E5E7EB' }}
          >
            {!imgError && stamp.imageUrl ? (
              <img
                src={stamp.imageUrl}
                alt={stamp.title}
                draggable={false}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="pointer-events-none h-full w-full select-none object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#FAF6EE]">
                <Reicon
                  name={stamp.category === 'sports' ? 'trophy' : 'map-point'}
                  size={20}
                  color="#0A0A0A"
                />
              </div>
            )}
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
        <div className="stamp-perforated-y h-full w-full bg-[#FFFDF7]/90 p-[5px] sm:p-[6px]">
          <div className="flex h-full w-full flex-col items-center justify-center rounded-[4px] border border-dashed border-black/15 bg-[#F4F4F6] px-1.5 text-center">
            <Reicon name="folder-open" size={16} color="#666666" />
            <span className="font-stamp-condensed mt-1 block truncate text-[9px] font-bold tracking-[0.06em] text-neutral-400">
              {label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function findDropPocketId(
  clientX: number,
  clientY: number,
  sourcePocketId: string
): string | null {
  if (typeof document === 'undefined') return null;
  const zones = document.querySelectorAll<HTMLElement>('[data-pocket-dropzone]');
  for (const zone of zones) {
    const targetId = zone.getAttribute('data-pocket-dropzone');
    if (!targetId || targetId === sourcePocketId) continue;
    const rect = zone.getBoundingClientRect();
    if (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    ) {
      return targetId;
    }
  }
  return null;
}

function PocketFolderCard({
  pocket,
  pocketStamps,
  unlockedCount,
  isDropTarget,
  isDragSource,
  onOpenPocket,
  onSelectStamp,
  onDragMove,
  onDragEnd,
  onDropAtPoint,
}: {
  pocket: StampPocket;
  pocketStamps: StampItem[];
  unlockedCount: number;
  isDropTarget: boolean;
  isDragSource: boolean;
  onOpenPocket: (pocketId: string) => void;
  onSelectStamp: (stamp: StampItem) => void;
  onDragMove: (stampId: string, sourcePocketId: string, clientX: number, clientY: number) => void;
  onDragEnd: () => void;
  onDropAtPoint: (
    stampId: string,
    sourcePocketId: string,
    clientX: number,
    clientY: number
  ) => boolean;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [pocketWidth, setPocketWidth] = useState(356);

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

  const folderItems: FolderInputItem[] =
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
            title: 'Open folder',
            content: <EmptyPocketCard label="OPEN" />,
          },
        ];

  const resolveStampId = (item: FolderInputItem, idx: number): string | null => {
    if (displayedStamps[idx]) return displayedStamps[idx].id;
    if (item && typeof item === 'object' && 'id' in item) {
      const id = (item as FolderItemEntry).id;
      if (id && !id.includes('-empty-')) return id;
    }
    return null;
  };

  return (
    <section
      data-pocket-dropzone={pocket.id}
      className={`relative flex flex-col items-center rounded-[28px] transition-colors ${
        isDragSource ? 'z-40' : 'z-10'
      } ${
        isDropTarget
          ? 'ring-2 ring-[#2563EB] bg-[#EFF6FF]/65 p-2 -m-2'
          : ''
      }`}
    >
      {/* Enlarged Folder Dimensions: max-w-[440px] and 64px peek + 154px pocket front */}
      <div ref={wrapperRef} className="relative flex w-full max-w-[440px] justify-center">
        <Folder
          variant="glass"
          color={POCKET_COLOR_HEX[pocket.tint]}
          width={pocketWidth}
          frontHeight={154}
          peekHeight={64}
          borderRadius={24}
          hideTab
          openOn="click"
          draggable={displayedStamps.length > 0}
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
          onItemDragMove={(item, idx, clientX, clientY) => {
            const stampId = resolveStampId(item, idx);
            if (!stampId) return;
            onDragMove(stampId, pocket.id, clientX, clientY);
          }}
          onItemDragCancel={onDragEnd}
          onItemDropAtPoint={(item, idx, clientX, clientY) => {
            const stampId = resolveStampId(item, idx);
            if (!stampId) {
              onDragEnd();
              return false;
            }
            return onDropAtPoint(stampId, pocket.id, clientX, clientY);
          }}
          onItemDrop={() => onDragEnd()}
          frontOverlay={
            <div className="pointer-events-none flex h-full w-full items-center justify-end px-5">
              <JellyButton
                type="button"
                jellyIntensity="medium"
                data-folder-overlay-action="true"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenPocket(pocket.id);
                }}
                aria-label={`Open ${pocket.title} stamps`}
                className="liquid-glass-btn pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#0A0A0A] focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
              >
                <Reicon name="frame" size={20} />
              </JellyButton>
            </div>
          }
        />
      </div>

      {/* Clean Centered Title & Count Below Pocket */}
      <JellyButton
        type="button"
        onClick={() => onOpenPocket(pocket.id)}
        className="mt-3 flex min-h-[44px] flex-col items-center justify-center rounded-full px-5 text-center transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
      >
        <span className="font-title text-[18px] font-medium text-[#0A0A0A]">
          {pocket.title}
        </span>
        <span className="font-mono-nums text-[12px] font-normal text-neutral-500">
          {unlockedCount} {unlockedCount === 1 ? 'Stamp' : 'Stamps'}
          {isDropTarget ? ' · Drop to move' : ''}
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
  onMoveStampToPocket,
  onOpenCreateFolder,
  onOpenNotifications,
  onSelectStamp,
  onOpenProfile,
}: StampLibraryViewProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [dragSourcePocketId, setDragSourcePocketId] = useState<string | null>(null);
  const [hoverTargetPocketId, setHoverTargetPocketId] = useState<string | null>(null);
  const [moveNotice, setMoveNotice] = useState<{
    stampId: string;
    stampTitle: string;
    fromPocketId: string;
    toPocketTitle: string;
  } | null>(null);

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

  const handleDragMove = (
    _stampId: string,
    sourcePocketId: string,
    clientX: number,
    clientY: number
  ) => {
    setDragSourcePocketId(sourcePocketId);
    const targetId = findDropPocketId(clientX, clientY, sourcePocketId);
    setHoverTargetPocketId(targetId);
  };

  const handleDragEnd = () => {
    setDragSourcePocketId(null);
    setHoverTargetPocketId(null);
  };

  const handleDropAtPoint = (
    stampId: string,
    sourcePocketId: string,
    clientX: number,
    clientY: number
  ): boolean => {
    const targetId = findDropPocketId(clientX, clientY, sourcePocketId);
    handleDragEnd();
    if (!targetId || targetId === sourcePocketId) return false;
    const movedStamp = stamps.find((s) => s.id === stampId);
    const targetPocket = pockets.find((p) => p.id === targetId);
    onMoveStampToPocket(stampId, targetId);
    if (movedStamp && targetPocket) {
      setMoveNotice({
        stampId,
        stampTitle: movedStamp.title,
        fromPocketId: sourcePocketId,
        toPocketTitle: targetPocket.title,
      });
    }
    return true;
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-32 pt-4 sm:px-8">
      {/* Top User Row: Profile + Dark Pill Island [Search | Notification | +] */}
      <header className="flex items-center justify-between gap-2">
        <JellyButton
          type="button"
          onClick={onOpenProfile}
          aria-label="Open collector profile"
          className="flex min-w-0 items-center gap-2.5 rounded-full pr-1 text-left transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E9DEC9] text-[13px] font-bold text-[#0A0A0A]">
            {userProfile.initials}
          </div>
          <div className="min-w-0 leading-tight">
            <p className="font-body whitespace-nowrap text-[12px] font-normal text-neutral-500">
              Hello,
            </p>
            <p className="font-title truncate text-[15px] font-medium text-[#0A0A0A]">
              {userProfile.name}
            </p>
          </div>
        </JellyButton>

        {/* Clean Dark Capsule: Search + Notification + Plus */}
        <div className="flex h-11 shrink-0 items-center rounded-full bg-[#0A0A0A] px-1 text-white">
          <JellyButton
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label="Search stamp library"
            aria-expanded={searchOpen}
            data-testid="home-search-btn"
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

      {/* Smooth 1-Second Expandable Inline Search */}
      <AnimatePresence initial={false}>
        {searchOpen && (
          <motion.div
            key="library-search-bar"
            initial={{ opacity: 0, height: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, height: 'auto', y: 0, scale: 1 }}
            exit={{ opacity: 0, height: 0, y: -14, scale: 0.96 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              <label htmlFor="library-search" className="sr-only">
                Search stamp library
              </label>
              <div className="liquid-glass-btn flex h-12 items-center gap-2 rounded-2xl px-4">
                <Reicon name="search" size={18} color="#6B7280" />
                <input
                  id="library-search"
                  data-testid="home-search-input"
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clean Welcome Heading with SnapStamps Scalloped Seal Logo */}
      <div className="mt-6">
        <div className="flex items-center gap-2">
          <AppLogo size={22} />
          <p className="font-title whitespace-nowrap text-[18px] font-normal leading-snug text-neutral-800">
            Welcome
          </p>
        </div>
        <h1 className="font-title text-[26px] font-medium tracking-[-0.02em] text-[#0A0A0A] sm:text-[30px]">
          Your Stamp Library
        </h1>
      </div>

      {/* Undoable Drag-and-Drop Move Feedback */}
      <AnimatePresence>
        {moveNotice && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="liquid-glass-btn mt-4 flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2">
              <Reicon name="folder-check" size={17} color="#2563EB" />
              <p className="font-body truncate text-[13px] font-medium text-[#0A0A0A]">
                Moved {moveNotice.stampTitle} to {moveNotice.toPocketTitle}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <JellyButton
                type="button"
                onClick={() => {
                  onMoveStampToPocket(moveNotice.stampId, moveNotice.fromPocketId);
                  setMoveNotice(null);
                }}
                className="font-control rounded-full bg-[#0A0A0A] px-3 py-1 text-[11.5px] font-medium text-white"
              >
                Undo
              </JellyButton>
              <JellyButton
                type="button"
                onClick={() => setMoveNotice(null)}
                aria-label="Dismiss move notice"
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500"
              >
                <Reicon name="close" size={15} />
              </JellyButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Folder Stamp Pockets Grid */}
      {visiblePockets.length === 0 ? (
        <div className="liquid-glass-btn-soft mt-10 rounded-[24px] p-10 text-center">
          <p className="font-title text-base font-semibold text-[#0A0A0A]">
            No matching stamp folders
          </p>
          <p className="font-body mt-1 text-sm text-neutral-500">
            Clear your search or tap + in the top bar to create a new folder.
          </p>
        </div>
      ) : (
        <div className="mt-7 grid grid-cols-1 gap-9 md:grid-cols-2">
          {visiblePockets.map((pocket) => {
            const pocketStamps = getPocketStamps(stamps, pocket.id);
            return (
              <PocketFolderCard
                key={pocket.id}
                pocket={pocket}
                pocketStamps={pocketStamps}
                unlockedCount={getPocketStampCount(stamps, pocket.id)}
                isDropTarget={hoverTargetPocketId === pocket.id}
                isDragSource={dragSourcePocketId === pocket.id}
                onOpenPocket={onOpenPocket}
                onSelectStamp={onSelectStamp}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                onDropAtPoint={handleDropAtPoint}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
