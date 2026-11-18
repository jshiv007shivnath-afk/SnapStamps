import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import type { CollectionFilter, StampItem, StampPocket } from '../types/stamp';
import { filterStamps } from '../utils/stampLogic';
import { BackButton } from './BackButton';
import { JellyButton } from './JellyButton';
import { JellyRadio } from './JellyRadio';
import { PerforatedStampCard } from './PerforatedStampCard';
import { Reicon } from './Reicon';

interface MyStampsViewProps {
  stamps: StampItem[];
  pockets: StampPocket[];
  activeFilter: CollectionFilter;
  activePocketId: string | null;
  searchQuery: string;
  onFilterChange: (filter: CollectionFilter) => void;
  onClearPocketFilter: () => void;
  onSearchChange: (q: string) => void;
  onBack: () => void;
  onSelectStamp: (stamp: StampItem) => void;
  onToggleFavorite: (stampId: string) => void;
  onOpenStudio: () => void;
  onOpenStore?: () => void;
}

const FILTER_TABS: Array<{ value: CollectionFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'national', label: 'National' },
  { value: 'favorites', label: 'Favorites' },
  { value: 'rare', label: 'Rare' },
];

export function MyStampsView({
  stamps,
  pockets,
  activeFilter,
  activePocketId,
  searchQuery,
  onFilterChange,
  onClearPocketFilter,
  onSearchChange,
  onBack,
  onSelectStamp,
  onToggleFavorite,
  onOpenStudio,
  onOpenStore,
}: MyStampsViewProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  const filteredStamps = filterStamps(stamps, activeFilter, searchQuery, activePocketId);
  const activePocket = activePocketId ? pockets.find((p) => p.id === activePocketId) : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-36 pt-4 sm:px-8">
      {/* Top Bar matching Reference Screen 3 */}
      <header className="flex items-center justify-between gap-4">
        <BackButton onClick={onBack} ariaLabel="Back to Stamp Library" />

        <h1 className="font-title text-[17px] font-medium text-[#0A0A0A]">My Stamps</h1>

        <JellyButton
          type="button"
          onClick={() => setSearchOpen((prev) => !prev)}
          aria-label="Search my stamps"
          aria-expanded={searchOpen}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0A0A0A] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]"
        >
          <Reicon name="search" size={18} />
        </JellyButton>
      </header>

      {/* Smooth 1-Second Expandable Search Input */}
      <AnimatePresence initial={false}>
        {searchOpen && (
          <motion.div
            key="my-stamps-search-bar"
            initial={{ opacity: 0, height: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, height: 'auto', y: 0, scale: 1 }}
            exit={{ opacity: 0, height: 0, y: -14, scale: 0.96 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              <label htmlFor="my-stamps-search" className="sr-only">
                Search collected stamps
              </label>
              <div className="flex h-12 items-center gap-2 rounded-2xl bg-white px-4">
                <Reicon name="search" size={18} color="#6B7280" />
                <input
                  id="my-stamps-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Filter by city, country, or rarity..."
                  className="w-full bg-transparent text-sm text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-none"
                />
                {searchQuery && (
                  <JellyButton
                    type="button"
                    onClick={() => onSearchChange('')}
                    aria-label="Clear stamps search"
                    className="flex h-11 w-11 items-center justify-center text-neutral-400 hover:text-neutral-700"
                  >
                    <Reicon name="close" size={18} />
                  </JellyButton>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collections Section Title matching Reference Screen 3 */}
      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-title text-[20px] font-semibold text-[#0A0A0A]">
            {activePocket ? activePocket.title : 'Collections'}
          </h2>
          <p className="font-body mt-0.5 text-[13px] font-normal text-neutral-500">
            Collect all stamps in a Country to unlock achievement
          </p>
        </div>

        {activePocket && (
          <JellyButton
            type="button"
            onClick={onClearPocketFilter}
            className="liquid-glass-btn flex h-11 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium text-[#0A0A0A]"
          >
            <span>All pockets</span>
            <Reicon name="close" size={14} />
          </JellyButton>
        )}
      </div>

      {/* Single-line JellyRadio Filter Tabs with liquid-glass idle pills & soft spring ripple */}
      <div className="mt-3 -mx-1 overflow-x-auto overscroll-none px-1">
        <JellyRadio
          items={FILTER_TABS}
          value={activeFilter}
          onChange={(val) => onFilterChange(val as CollectionFilter)}
          chipColor="rgba(255, 255, 255, 0.84)"
          activeColor="#0A0A0A"
          textColor="#0A0A0A"
          activeTextColor="#FFFFFF"
          size="md"
          gap={6}
          radius={9999}
          swell={0.08}
          barge={2}
          shrink={0.03}
          jelly={0.9}
          bounce={0.34}
          stagger={22}
          stiffness={620}
          ariaLabel="Filter stamp collections"
        />
      </div>

      {/* Stamp Grid (2 columns mobile matching Reference Screen 3, 3-4 columns desktop) */}
      {filteredStamps.length === 0 ? (
        <div className="liquid-glass-btn-soft mt-8 rounded-[24px] p-10 text-center">
          <p className="font-title text-base font-semibold text-[#0A0A0A]">
            {stamps.length === 0 ? 'Your stamp vault is ready' : 'No stamps match this filter'}
          </p>
          <p className="font-body mt-1 text-sm text-neutral-500">
            Unlock Country or Sports Legend editions from the Store or craft a custom stamp.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {onOpenStore && (
              <JellyButton
                type="button"
                jellyIntensity="medium"
                onClick={onOpenStore}
                className="liquid-glass-btn font-control inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-6 text-sm font-medium text-[#0A0A0A]"
              >
                <Reicon name="store" size={16} />
                <span>Browse Store</span>
              </JellyButton>
            )}
            <JellyButton
              type="button"
              jellyIntensity="medium"
              onClick={onOpenStudio}
              className="font-control inline-flex h-11 items-center justify-center rounded-full bg-[#0A0A0A] px-6 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Create Stamp
            </JellyButton>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:gap-x-6 lg:gap-y-8">
          {filteredStamps.map((stamp) => (
            <PerforatedStampCard
              key={stamp.id}
              stamp={stamp}
              onSelect={onSelectStamp}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Standalone Enlarged 'Add Stamps' Black Pill at Bottom Center (No Bottom Nav Bar on My Stamps) */}
      {(() => {
        const cta = (
          <div className="fixed-bottom-dock fixed inset-x-0 bottom-0 z-50 touch-none pointer-events-none flex justify-center px-6 pb-safe-dock pt-3">
            <JellyButton
              type="button"
              jellyIntensity="medium"
              onClick={onOpenStudio}
              className="font-control pointer-events-auto flex h-14 min-w-[210px] items-center justify-center rounded-full bg-[#0A0A0A] px-10 text-[15px] font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]"
            >
              <span>Add Stamps</span>
            </JellyButton>
          </div>
        );
        return typeof document === 'undefined' ? cta : createPortal(cta, document.body);
      })()}
    </div>
  );
}
