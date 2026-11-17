import { useState } from 'react';
import { motion } from 'motion/react';
import type {
  SportDisciplineFilter,
  StampItem,
  StoreSectionFilter,
} from '../types/stamp';
import { STORE_CATALOG } from '../data/storeCatalog';
import { filterStoreStamps } from '../utils/stampLogic';
import { BackButton } from './BackButton';
import { DiamondBalanceBadge } from './DiamondBalanceBadge';
import { DiamondIcon } from './DiamondIcon';
import { JellyButton } from './JellyButton';
import { JellyRadio } from './JellyRadio';
import { PerforatedStampCard } from './PerforatedStampCard';
import { Reicon } from './Reicon';

interface StoreViewProps {
  stamps: StampItem[];
  diamondBalance: number;
  onBack: () => void;
  onBuyStamp: (stamp: StampItem) => { success: boolean; reason?: string };
  onSelectStamp: (stamp: StampItem) => void;
}

const SECTION_TABS: Array<{ value: StoreSectionFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'country', label: 'Country' },
  { value: 'sports', label: 'Sports' },
];

const SPORT_TABS: Array<{ value: SportDisciplineFilter; label: string }> = [
  { value: 'all', label: 'All Sports' },
  { value: 'cricket', label: 'Cricket' },
  { value: 'football', label: 'Football' },
];

export function StoreView({
  stamps,
  diamondBalance,
  onBack,
  onBuyStamp,
  onSelectStamp,
}: StoreViewProps) {
  const [section, setSection] = useState<StoreSectionFilter>('all');
  const [sportDiscipline, setSportDiscipline] = useState<SportDisciplineFilter>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: 'success' | 'warn';
  } | null>(null);

  const ownedStampMap = new Map(
    stamps.filter((s) => s.isUnlocked).map((s) => [s.id, s])
  );

  const visibleItems = filterStoreStamps(
    STORE_CATALOG,
    section,
    sportDiscipline,
    searchQuery
  );

  const countryItems = visibleItems.filter((item) => item.category === 'country');
  const cricketItems = visibleItems.filter(
    (item) => item.category === 'sports' && item.sportDiscipline === 'cricket'
  );
  const footballItems = visibleItems.filter(
    (item) => item.category === 'sports' && item.sportDiscipline === 'football'
  );

  const handlePurchaseClick = (item: StampItem) => {
    const owned = ownedStampMap.get(item.id);
    if (owned) {
      onSelectStamp(owned);
      return;
    }

    const res = onBuyStamp(item);
    if (res.success) {
      setFeedback({
        tone: 'success',
        message: `${item.title} unlocked. Choose a folder to file your new edition.`,
      });
    } else if (res.reason === 'insufficient_diamonds') {
      setFeedback({
        tone: 'warn',
        message: `Need ${item.priceDiamonds?.toLocaleString() ?? 0} Diamonds to unlock ${item.title}.`,
      });
    }
  };

  const renderStoreCard = (item: StampItem) => {
    const ownedStamp = ownedStampMap.get(item.id);
    const isOwned = Boolean(ownedStamp);
    const price = item.priceDiamonds ?? 0;

    return (
      <div
        key={item.id}
        className="liquid-glass-btn-soft flex flex-col justify-between rounded-[24px] p-3 sm:p-3.5"
      >
        <div>
          <PerforatedStampCard
            stamp={ownedStamp ?? { ...item, isUnlocked: true }}
            showProgress={false}
            showUncollectedBadge={false}
            onSelect={() => handlePurchaseClick(item)}
          />

          <div className="mt-2.5 px-0.5 text-left">
            <p className="font-title truncate text-[14px] font-semibold text-[#0A0A0A]">
              {item.title}
            </p>
            <p className="font-body truncate text-[11.5px] font-normal text-neutral-500">
              {item.celebrationLabel
                ? `${item.celebrationLabel} · ${item.sportDiscipline === 'cricket' ? 'Cricket' : 'Football'}`
                : `${item.city} · ${item.country}`}
            </p>
          </div>
        </div>

        <div className="mt-3">
          <JellyButton
            type="button"
            jellyIntensity="medium"
            onClick={() => handlePurchaseClick(item)}
            aria-label={
              isOwned
                ? `${item.title} owned in collection`
                : `Buy ${item.title} for ${price} diamonds`
            }
            className={`font-control flex h-11 w-full items-center justify-center gap-1.5 rounded-full px-3 text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#0A0A0A] ${
              isOwned
                ? 'liquid-glass-btn-soft text-[#0A0A0A]'
                : 'liquid-glass-btn text-[#0A0A0A]'
            }`}
          >
            {isOwned ? (
              <>
                <Reicon name="check" size={15} color="#0A0A0A" />
                <span>Owned</span>
              </>
            ) : (
              <>
                <DiamondIcon size={16} />
                <span className="font-mono-nums text-[#0A0A0A]">
                  {price.toLocaleString()}
                </span>
              </>
            )}
          </JellyButton>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-36 pt-4 sm:px-8">
      {/* Top Bar: Black Circular BackButton + Title + Golden Diamond Balance Pill + Search */}
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BackButton onClick={onBack} ariaLabel="Back to Stamp Library" />
          <div>
            <p className="font-body text-[12px] font-normal text-neutral-500">
              SnapStamps Edition
            </p>
            <h1 className="font-title text-[24px] font-medium tracking-[-0.02em] text-[#0A0A0A] sm:text-[26px]">
              Store
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DiamondBalanceBadge balance={diamondBalance} testId="diamond-balance" />

          <JellyButton
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label="Search Stamp Store"
            aria-expanded={searchOpen}
            className="liquid-glass-btn flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#0A0A0A] focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
          >
            <Reicon name="search" size={18} />
          </JellyButton>
        </div>
      </header>

      {/* Expandable Liquid-Glass Search Input */}
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16 }}
          className="mt-4"
        >
          <label htmlFor="store-search" className="sr-only">
            Search store stamps
          </label>
          <div className="liquid-glass-btn flex h-12 items-center gap-2 rounded-2xl px-4">
            <Reicon name="search" size={18} color="#6B7280" />
            <input
              id="store-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search countries, Kohli, Dhoni, Messi, Ronaldo..."
              className="font-body w-full bg-transparent text-sm text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-none"
            />
            {searchQuery && (
              <JellyButton
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear store search"
                className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500"
              >
                <Reicon name="close" size={16} />
              </JellyButton>
            )}
          </div>
        </motion.div>
      )}

      {/* Single-Line Section Filter Pills */}
      <div className="no-scrollbar mt-5 -mx-1 overflow-x-auto px-1">
        <JellyRadio
          items={SECTION_TABS}
          value={section}
          onChange={(val) => {
            setSection(val as StoreSectionFilter);
            setFeedback(null);
          }}
          chipColor="rgba(255, 255, 255, 0.52)"
          activeColor="#0A0A0A"
          textColor="#0A0A0A"
          activeTextColor="#FFFFFF"
          size="md"
          gap={8}
          radius={9999}
          swell={0.07}
          barge={2}
          shrink={0.03}
          jelly={0.9}
          bounce={0.34}
          stagger={22}
          stiffness={620}
          ariaLabel="Store sections"
        />
      </div>

      {/* Sports Sub-Section Discipline Filter */}
      {section === 'sports' && (
        <div className="no-scrollbar mt-3 -mx-1 overflow-x-auto px-1">
          <JellyRadio
            items={SPORT_TABS}
            value={sportDiscipline}
            onChange={(val) => setSportDiscipline(val as SportDisciplineFilter)}
            chipColor="rgba(255, 255, 255, 0.44)"
            activeColor="#0A0A0A"
            textColor="#0A0A0A"
            activeTextColor="#FFFFFF"
            size="sm"
            gap={6}
            radius={9999}
            swell={0.06}
            barge={2}
            shrink={0.02}
            jelly={0.85}
            bounce={0.32}
            stagger={18}
            stiffness={600}
            ariaLabel="Sports discipline filter"
          />
        </div>
      )}

      {/* Inline Liquid-Glass Purchase Feedback Banner */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass-btn mt-4 flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5"
        >
          <div className="flex items-center gap-2">
            {feedback.tone === 'success' ? (
              <Reicon name="check" size={16} color="#0A0A0A" />
            ) : (
              <DiamondIcon size={16} />
            )}
            <p className="font-body text-[13px] font-medium text-[#0A0A0A]">
              {feedback.message}
            </p>
          </div>
          <JellyButton
            type="button"
            onClick={() => setFeedback(null)}
            aria-label="Dismiss store notice"
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500"
          >
            <Reicon name="close" size={15} />
          </JellyButton>
        </motion.div>
      )}

      {/* Store Catalog */}
      {visibleItems.length === 0 ? (
        <div className="liquid-glass-btn-soft mt-8 rounded-[28px] p-10 text-center">
          <p className="font-title text-base font-semibold text-[#0A0A0A]">
            No matching stamps in store
          </p>
          <p className="font-body mt-1 text-sm text-neutral-500">
            Try clearing your search or switch between Country and Sports sections.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {countryItems.length > 0 && (
            <section aria-label="Country Stamps Section">
              <div className="liquid-glass-btn-soft mb-4 flex items-center justify-between rounded-[22px] px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/60 text-[#0A0A0A]">
                    <Reicon name="globe" size={17} />
                  </span>
                  <div>
                    <h2 className="font-title text-[16px] font-semibold text-[#0A0A0A]">
                      Country Editions
                    </h2>
                    <p className="font-body text-[12px] text-neutral-500">
                      Unlock national stamps and save them into your folders
                    </p>
                  </div>
                </div>
                <span className="font-mono-nums text-xs font-medium text-neutral-500">
                  {countryItems.length}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
                {countryItems.map(renderStoreCard)}
              </div>
            </section>
          )}

          {cricketItems.length > 0 && (
            <section aria-label="Cricket Legends Section">
              <div className="liquid-glass-btn-soft mb-4 flex items-center justify-between rounded-[22px] px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/60 text-[#0A0A0A]">
                    <Reicon name="trophy" size={17} />
                  </span>
                  <div>
                    <h2 className="font-title text-[16px] font-semibold text-[#0A0A0A]">
                      Cricket Legends · Celebrations
                    </h2>
                    <p className="font-body text-[12px] text-neutral-500">
                      Signature century roars, salutes, and match-winning finishes
                    </p>
                  </div>
                </div>
                <span className="font-mono-nums text-xs font-medium text-neutral-500">
                  {cricketItems.length}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
                {cricketItems.map(renderStoreCard)}
              </div>
            </section>
          )}

          {footballItems.length > 0 && (
            <section aria-label="Football Legends Section">
              <div className="liquid-glass-btn-soft mb-4 flex items-center justify-between rounded-[22px] px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/60 text-[#0A0A0A]">
                    <Reicon name="football" size={17} />
                  </span>
                  <div>
                    <h2 className="font-title text-[16px] font-semibold text-[#0A0A0A]">
                      Football Legends · Celebrations
                    </h2>
                    <p className="font-body text-[12px] text-neutral-500">
                      Iconic stadium leaps, tributes, and trophy moments
                    </p>
                  </div>
                </div>
                <span className="font-mono-nums text-xs font-medium text-neutral-500">
                  {footballItems.length}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
                {footballItems.map(renderStoreCard)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
