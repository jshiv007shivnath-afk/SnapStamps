import { useState } from 'react';
import { motion } from 'motion/react';
import type { CollectionFilter, StampItem, StampPocket } from '../types/stamp';
import { filterStamps } from '../utils/stampLogic';
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
}

const FILTER_TABS: Array<{ id: CollectionFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'national', label: 'National' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'rare', label: 'Rare' },
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
}: MyStampsViewProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  const filteredStamps = filterStamps(stamps, activeFilter, searchQuery, activePocketId);
  const activePocket = activePocketId ? pockets.find((p) => p.id === activePocketId) : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-36 pt-4 sm:px-8">
      {/* Top Bar matching Reference Screen 3 */}
      <header className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to Stamp Library"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0A0A0A] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]"
        >
          <Reicon name="arrow-left" size={18} />
        </button>

        <h1 className="font-title text-[17px] font-medium text-[#0A0A0A]">My Stamps</h1>

        <button
          type="button"
          onClick={() => setSearchOpen((prev) => !prev)}
          aria-label="Search my stamps"
          aria-expanded={searchOpen}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0A0A0A] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]"
        >
          <Reicon name="search" size={18} />
        </button>
      </header>

      {/* Expandable Search Input */}
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16 }}
          className="mt-4"
        >
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
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear stamps search"
                className="flex h-11 w-11 items-center justify-center text-neutral-400 hover:text-neutral-700"
              >
                <Reicon name="close" size={18} />
              </button>
            )}
          </div>
        </motion.div>
      )}

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
          <button
            type="button"
            onClick={onClearPocketFilter}
            className="liquid-glass-btn flex h-11 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium text-[#0A0A0A]"
          >
            <span>All pockets</span>
            <Reicon name="close" size={14} />
          </button>
        )}
      </div>

      {/* Interactive Filter Tabs on one clean horizontal line matching Image 4 */}
      <div
        role="tablist"
        aria-label="Filter stamp collections"
        className="mt-4 flex flex-nowrap items-center gap-2 overflow-x-auto"
      >
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onFilterChange(tab.id)}
              className={`font-control flex h-10 shrink-0 items-center justify-center rounded-full px-4 text-[13px] font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A] ${
                isActive
                  ? 'bg-[#0A0A0A] text-white'
                  : 'liquid-glass-btn text-[#0A0A0A]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Stamp Grid (2 columns mobile matching Reference Screen 3, 3-4 columns desktop) */}
      {filteredStamps.length === 0 ? (
        <div className="mt-8 rounded-[28px] bg-white p-10 text-center">
          <p className="font-title text-base font-semibold text-[#0A0A0A]">No stamps match this filter</p>
          <p className="font-body mt-1 text-sm text-neutral-500">
            Unlock stamps from the Globe Map or craft a custom stamp in the studio.
          </p>
          <button
            type="button"
            onClick={onOpenStudio}
            className="font-control mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[#0A0A0A] px-6 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Create Stamp
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-8">
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
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-6 pb-safe-dock pt-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={onOpenStudio}
          className="font-control pointer-events-auto flex h-14 min-w-[210px] items-center justify-center rounded-full bg-[#0A0A0A] px-10 text-[15px] font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]"
        >
          <span>Add Stamps</span>
        </motion.button>
      </div>
    </div>
  );
}
