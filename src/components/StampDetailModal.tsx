import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { StampItem, StampPocket } from '../types/stamp';
import {
  buildDefaultShareCaption,
  formatStampCategoryLabel,
  formatStampLocationLabel,
  formatStampRarityLabel,
} from '../utils/stampLogic';
import { getStampTags } from '../utils/stampTagging';
import { AppLogo } from './AppLogo';
import { JellyButton } from './JellyButton';
import { PerforatedStampCard } from './PerforatedStampCard';
import { Reicon } from './Reicon';
import { ThemeTagPill } from './ThemeTagPill';

interface StampDetailModalProps {
  stamp: StampItem | null;
  pockets?: StampPocket[];
  onClose: () => void;
  onToggleFavorite: (stampId: string) => void;
  onCollectStamp: (stampId: string) => void;
  onMoveStampToFolder?: (stampId: string, pocketId: string) => void;
  onEditWithGemini: (stamp: StampItem) => void;
  onLocateOnGlobe: (stampId: string) => void;
  onShareToFeed: (stamp: StampItem, caption: string) => void;
}

export function StampDetailModal({
  stamp,
  pockets = [],
  onClose,
  onToggleFavorite,
  onCollectStamp,
  onMoveStampToFolder,
  onEditWithGemini,
  onLocateOnGlobe,
  onShareToFeed,
}: StampDetailModalProps) {
  const [shareComposerOpen, setShareComposerOpen] = useState(false);
  const [shareCaption, setShareCaption] = useState('');

  const currentPocket = stamp
    ? pockets.find((p) => p.id === stamp.pocketId)
    : undefined;
  const folderTitle = stamp
    ? currentPocket?.title ?? formatStampCategoryLabel(stamp.category)
    : '';
  const locationLabel = stamp ? formatStampLocationLabel(stamp) : '';
  const rarityLabel = stamp ? formatStampRarityLabel(stamp.rarity) : '';
  const stampTags = stamp ? getStampTags(stamp) : [];
  const defaultCaption = stamp
    ? buildDefaultShareCaption(stamp, folderTitle)
    : '';

  useEffect(() => {
    setShareComposerOpen(false);
    setShareCaption(defaultCaption);
  }, [stamp?.id]);

  if (!stamp) return null;

  const quickCaptionPresets = [
    { id: 'default', label: 'Default', text: defaultCaption },
    {
      id: 'new-find',
      label: 'New find',
      text: `Just added ${stamp.title} from ${locationLabel}.`,
    },
    {
      id: 'favorite',
      label: 'Favorite',
      text: `One of my favorite stamps from ${locationLabel}.`,
    },
  ];

  const handleOpenComposer = () => {
    setShareComposerOpen((prev) => {
      const next = !prev;
      if (next && !shareCaption.trim()) {
        setShareCaption(defaultCaption);
      }
      return next;
    });
  };

  const handleSubmitShare = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCaption = shareCaption.trim() || defaultCaption;
    onShareToFeed(stamp, finalCaption);
    setShareComposerOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${stamp.title} stamp details`}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs overscroll-none sm:p-6"
    >
      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="no-scrollbar max-h-[86dvh] w-full max-w-md overflow-y-auto overflow-x-hidden overscroll-none rounded-[24px] border border-white/90 bg-white/94 backdrop-blur-2xl ring-1 ring-black/[0.06]"
      >
        <div className="sticky top-0 z-20 flex items-center justify-between gap-2 bg-white/92 px-6 pb-3 pt-5 backdrop-blur-xl">
          <div className="flex min-w-0 items-center gap-2">
            <AppLogo size={20} />
            <span className="truncate text-xs font-semibold uppercase tracking-wider text-neutral-500">
              {stamp.country} · {stamp.rarity}
            </span>
          </div>
          <JellyButton
            type="button"
            onClick={onClose}
            aria-label="Close stamp details"
            className="liquid-glass-btn flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#0A0A0A] ring-1 ring-black/[0.06]"
          >
            <Reicon name="close" size={20} />
          </JellyButton>
        </div>

        <div className="px-6 pb-6">
        <div className="mx-auto mt-1 w-[228px]">
          <PerforatedStampCard
            stamp={stamp}
            showProgress={false}
            onToggleFavorite={onToggleFavorite}
          />
        </div>

        <div className="mt-5 text-center">
          <h2 className="font-display text-2xl font-bold text-[#0A0A0A]">{stamp.title}</h2>
          {stamp.celebrationLabel && (
            <p className="font-title mt-0.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              {stamp.celebrationLabel} · {stamp.sportDiscipline === 'cricket' ? 'Cricket Legend' : 'Football Legend'} #{stamp.jerseyNumber}
            </p>
          )}
          {stampTags.length > 0 && (
            <div
              data-testid="detail-stamp-tags"
              className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5"
              aria-label="Automated stamp theme tags"
            >
              {stampTags.map((tag) => (
                <ThemeTagPill
                  key={tag}
                  tag={tag}
                  variant="soft"
                  testId={`detail-tag-${tag.toLowerCase()}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Inline Liquid-Glass Share to Feed Composer */}
        <AnimatePresence initial={false}>
          {stamp.isUnlocked && shareComposerOpen && (
            <motion.form
              key="share-composer"
              data-testid="share-to-feed-panel"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              onSubmit={handleSubmitShare}
              className="liquid-glass-btn-soft mt-5 rounded-[20px] p-4 ring-1 ring-black/[0.06]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Reicon name="share" size={14} className="text-[#0A0A0A]" />
                  <p className="font-title text-xs font-semibold text-[#0A0A0A]">
                    Share to Feed
                  </p>
                </div>
                <span className="rounded-full bg-white/85 px-2.5 py-0.5 text-[10.5px] font-medium text-neutral-500 ring-1 ring-black/[0.05]">
                  Metadata attached
                </span>
              </div>

              {/* Auto-included location & stamp metadata pills */}
              <div
                className="mt-2.5 flex flex-wrap gap-1.5"
                aria-label="Included stamp metadata"
              >
                <span
                  data-testid="share-meta-location"
                  className="liquid-glass-btn inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium text-[#0A0A0A] ring-1 ring-black/[0.05]"
                >
                  <Reicon name="map-point" size={12} className="text-neutral-600" />
                  <span>{locationLabel}</span>
                </span>
                {stampTags[0] && (
                  <ThemeTagPill
                    tag={stampTags[0]}
                    variant="glass"
                    testId="share-meta-tag"
                  />
                )}
                <span
                  data-testid="share-meta-rarity"
                  className="liquid-glass-btn inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium text-[#0A0A0A] ring-1 ring-black/[0.05]"
                >
                  <Reicon name="star" size={12} className="text-neutral-600" />
                  <span>{rarityLabel}</span>
                </span>
                <span
                  data-testid="share-meta-folder"
                  className="liquid-glass-btn inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium text-[#0A0A0A] ring-1 ring-black/[0.05]"
                >
                  <Reicon name="folder" size={12} className="text-neutral-600" />
                  <span>{folderTitle}</span>
                </span>
              </div>

              <div className="mt-3">
                <label
                  htmlFor="modal-share-caption"
                  className="block text-[11px] font-semibold text-neutral-600"
                >
                  Collector Note
                </label>
                <textarea
                  id="modal-share-caption"
                  data-testid="modal-share-caption-input"
                  rows={2}
                  value={shareCaption}
                  onChange={(e) => setShareCaption(e.target.value)}
                  placeholder="Write a short note for your circle..."
                  className="mt-1.5 w-full resize-none rounded-[16px] bg-white/90 px-3.5 py-2.5 text-sm text-[#0A0A0A] placeholder:text-neutral-400 ring-1 ring-black/[0.06] focus:outline-2 focus:outline-[#0A0A0A]"
                />
              </div>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {quickCaptionPresets.map((preset) => {
                  const isSelected = shareCaption.trim() === preset.text;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setShareCaption(preset.text)}
                      className={`h-8 rounded-full px-3 text-[11px] font-medium transition-colors ${
                        isSelected
                          ? 'bg-[#0A0A0A] text-white'
                          : 'liquid-glass-btn text-neutral-700 ring-1 ring-black/[0.05] hover:text-[#0A0A0A]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3.5 flex items-center justify-end gap-2">
                <JellyButton
                  type="button"
                  onClick={() => setShareComposerOpen(false)}
                  className="liquid-glass-btn flex h-11 items-center justify-center rounded-full px-4 text-xs font-semibold text-[#0A0A0A] ring-1 ring-black/[0.06]"
                >
                  Cancel
                </JellyButton>
                <JellyButton
                  type="submit"
                  jellyIntensity="medium"
                  data-testid="confirm-share-to-feed-btn"
                  className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-[#0A0A0A] px-5 text-xs font-semibold text-white hover:bg-neutral-800"
                >
                  <Reicon name="send" size={14} />
                  <span>Post to Feed</span>
                </JellyButton>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Move Between Folders */}
        {pockets.length > 0 && onMoveStampToFolder && (
          <div className="liquid-glass-btn-soft mt-5 rounded-[20px] p-3.5 ring-1 ring-black/[0.06]">
            <p className="font-title text-xs font-semibold text-neutral-600">
              Folder Location
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {pockets.map((pocket) => {
                const isCurrent = stamp.pocketId === pocket.id;
                return (
                  <JellyButton
                    key={pocket.id}
                    type="button"
                    onClick={() => onMoveStampToFolder(stamp.id, pocket.id)}
                    aria-pressed={isCurrent}
                    className={`flex h-9 items-center gap-1 rounded-full px-3 text-xs font-medium transition-colors ${
                      isCurrent
                        ? 'bg-[#0A0A0A] text-white'
                        : 'liquid-glass-btn text-[#0A0A0A] ring-1 ring-black/[0.05]'
                    }`}
                  >
                    <Reicon name="folder" size={12} />
                    <span>{pocket.title}</span>
                  </JellyButton>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {!stamp.isUnlocked ? (
            <JellyButton
              type="button"
              jellyIntensity="medium"
              onClick={() => onCollectStamp(stamp.id)}
              className="col-span-2 flex h-12 items-center justify-center gap-2 rounded-full bg-[#0A0A0A] text-sm font-semibold text-white hover:bg-neutral-800"
            >
              <Reicon name="check" size={16} />
              <span>Collect Stamp</span>
            </JellyButton>
          ) : !shareComposerOpen ? (
            <JellyButton
              type="button"
              jellyIntensity="medium"
              data-testid="open-share-to-feed-btn"
              onClick={handleOpenComposer}
              className="col-span-2 flex h-12 items-center justify-center gap-2 rounded-full bg-[#0A0A0A] text-sm font-semibold text-white hover:bg-neutral-800"
            >
              <Reicon name="share" size={16} />
              <span>Share to Feed</span>
            </JellyButton>
          ) : null}

          <JellyButton
            type="button"
            onClick={() => onEditWithGemini(stamp)}
            className="liquid-glass-btn flex h-11 items-center justify-center gap-1.5 rounded-full text-xs font-semibold text-[#0A0A0A] ring-1 ring-black/[0.06]"
          >
            <Reicon name="wand" size={15} />
            <span>Remix Art</span>
          </JellyButton>

          <JellyButton
            type="button"
            onClick={() => onLocateOnGlobe(stamp.id)}
            className="liquid-glass-btn flex h-11 items-center justify-center gap-1.5 rounded-full text-xs font-semibold text-[#0A0A0A] ring-1 ring-black/[0.06]"
          >
            <Reicon name="globe" size={15} />
            <span>View on Globe</span>
          </JellyButton>
        </div>
        </div>
      </motion.div>
    </div>
  );
}

