import { useState } from 'react';
import { motion } from 'motion/react';
import type { SocialPost, StampItem } from '../types/stamp';
import { BackButton } from './BackButton';
import { JellyButton } from './JellyButton';
import { PerforatedStampCard } from './PerforatedStampCard';
import { Reicon } from './Reicon';

interface SocialFeedViewProps {
  posts: SocialPost[];
  stamps: StampItem[];
  onBack: () => void;
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onSelectStamp: (stamp: StampItem) => void;
  onCreatePost: (stampId: string, caption: string) => void;
}

export function SocialFeedView({
  posts,
  stamps,
  onBack,
  onToggleLike,
  onToggleSave,
  onSelectStamp,
  onCreatePost,
}: SocialFeedViewProps) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedStampId, setSelectedStampId] = useState(
    stamps.find((s) => s.isUnlocked)?.id ?? stamps[0]?.id ?? ''
  );
  const [caption, setCaption] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const unlockedStamps = stamps.filter((s) => s.isUnlocked);
  const activeSelectedStampId =
    selectedStampId || unlockedStamps[0]?.id || stamps[0]?.id || '';

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSelectedStampId) {
      setErrorMsg('Collect a stamp from Store or Studio first.');
      return;
    }
    if (!caption.trim()) {
      setErrorMsg('Write a short travel note about your find.');
      return;
    }
    onCreatePost(activeSelectedStampId, caption.trim());
    setCaption('');
    setErrorMsg('');
    setComposerOpen(false);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-32 pt-4 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BackButton onClick={onBack} ariaLabel="Back to Stamp Library" />
          <div>
            <p className="text-[12px] font-medium text-neutral-500">Travelers Circle</p>
            <h1 className="font-display text-[22px] font-bold tracking-[-0.02em] text-[#0A0A0A] sm:text-[26px]">
              Rare Finds Feed
            </h1>
          </div>
        </div>

        <JellyButton
          type="button"
          jellyIntensity="medium"
          onClick={() => setComposerOpen((prev) => !prev)}
          className="flex h-11 items-center gap-2 rounded-full bg-[#0A0A0A] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]"
        >
          <Reicon name="share" size={16} />
          <span>Share Rare Find</span>
        </JellyButton>
      </header>

      {/* Inline Share Rare Find Composer */}
      {composerOpen && (
        <motion.form
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handlePublish}
          className="mt-5 rounded-[24px] bg-white p-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-[#0A0A0A]">
              Post to Travelers Circle
            </h2>
            <JellyButton
              type="button"
              onClick={() => setComposerOpen(false)}
              aria-label="Close share composer"
              className="liquid-glass-btn flex h-11 w-11 items-center justify-center rounded-full text-[#0A0A0A]"
            >
              <Reicon name="close" size={18} />
            </JellyButton>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="share-stamp-select" className="block text-xs font-medium text-neutral-500">
                Collected Stamp
              </label>
              <select
                id="share-stamp-select"
                value={activeSelectedStampId}
                onChange={(e) => setSelectedStampId(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl bg-[#F7F7F9] px-3 text-sm font-medium text-[#0A0A0A] focus:outline-2 focus:outline-[#0A0A0A]"
              >
                {unlockedStamps.length === 0 && stamps.length === 0 ? (
                  <option value="">No collected stamps yet</option>
                ) : (
                  (unlockedStamps.length > 0 ? unlockedStamps : stamps).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.country})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="share-caption-input" className="block text-xs font-medium text-neutral-500">
                Field Note
              </label>
              <input
                id="share-caption-input"
                type="text"
                value={caption}
                onChange={(e) => {
                  setCaption(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Describe where and when you unlocked this stamp..."
                className="mt-1.5 h-11 w-full rounded-xl bg-[#F7F7F9] px-3.5 text-sm text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-2 focus:outline-[#0A0A0A]"
              />
            </div>
          </div>

          {errorMsg && <p className="mt-2 text-xs font-medium text-[#D64527]">{errorMsg}</p>}

          <div className="mt-4 flex justify-end">
            <JellyButton
              type="submit"
              jellyIntensity="medium"
              className="flex h-11 items-center gap-2 rounded-full bg-[#0A0A0A] px-6 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              <Reicon name="send" size={16} />
              <span>Publish Find</span>
            </JellyButton>
          </div>
        </motion.form>
      )}

      {/* Feed Cards Grid */}
      {posts.length === 0 ? (
        <div className="mt-8 rounded-[28px] bg-white p-10 text-center">
          <p className="font-display text-base font-semibold text-[#0A0A0A]">No rare finds shared yet</p>
          <p className="mt-1 text-sm text-neutral-500">
            Collect a stamp on the Globe Map or craft one in the studio, then share it with friends.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const stamp = stamps.find((s) => s.id === post.stampId) ?? stamps[0];
            return (
              <article
                key={post.id}
                className="flex flex-col justify-between rounded-[24px] bg-white p-5"
              >
                <div>
                  {/* Author Row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: post.authorTint }}
                      >
                        {post.authorInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#0A0A0A]">
                          {post.authorName}
                        </p>
                        <p className="truncate text-xs text-neutral-500">
                          {post.authorHandle} · {post.timestampLabel}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Clean Unboxed Location & Rarity Metadata */}
                  <p className="mt-3 text-xs font-medium text-neutral-500">{post.locationLabel}</p>

                  {/* Stamp Card Showcase */}
                  {stamp && (
                    <div className="mx-auto mt-3 w-[176px]">
                      <PerforatedStampCard
                        stamp={stamp}
                        compact
                        showProgress={false}
                        onSelect={onSelectStamp}
                      />
                    </div>
                  )}

                  <p className="mt-4 text-sm leading-relaxed text-neutral-700">{post.caption}</p>
                </div>

                {/* Action Row (44px touch targets) */}
                <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3">
                  <JellyButton
                    type="button"
                    onClick={() => onToggleLike(post.id)}
                    aria-label={post.isLiked ? `Unlike ${post.authorName}'s post` : `Like ${post.authorName}'s post`}
                    className={`liquid-glass-btn flex h-11 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-[#0A0A0A] ${
                      post.isLiked ? 'text-[#D64527]' : 'text-[#0A0A0A]'
                    }`}
                  >
                    <Reicon
                      name="heart"
                      size={18}
                      weight={post.isLiked ? 'Filled' : 'Outline'}
                    />
                    <span className="font-mono-nums">{post.likesCount}</span>
                  </JellyButton>

                  <JellyButton
                    type="button"
                    onClick={() => onToggleSave(post.id)}
                    aria-label={post.isSaved ? 'Remove bookmark' : 'Bookmark find'}
                    className="liquid-glass-btn flex h-11 w-11 items-center justify-center rounded-full text-[#0A0A0A] focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
                  >
                    <Reicon
                      name="bookmark"
                      size={18}
                      weight={post.isSaved ? 'Filled' : 'Outline'}
                    />
                  </JellyButton>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
