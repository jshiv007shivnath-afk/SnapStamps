import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { STORE_CATALOG } from '../data/storeCatalog';
import type {
  ChatFilterMode,
  ChatThread,
  CircleMember,
  SocialPost,
  StampItem,
  UserProfile,
} from '../types/stamp';
import { filterChatThreads, getChatInboxCounts } from '../utils/stampLogic';
import { BackButton } from './BackButton';
import { DiamondIcon } from './DiamondIcon';
import { JellyButton } from './JellyButton';
import { JellyRadio } from './JellyRadio';
import { PerforatedStampCard } from './PerforatedStampCard';
import { Reicon } from './Reicon';

interface SocialFeedViewProps {
  posts: SocialPost[];
  stamps: StampItem[];
  circleMembers: CircleMember[];
  chatThreads: ChatThread[];
  activeThreadId: string | null;
  diamondBalance: number;
  userProfile: UserProfile;
  onSelectThread: (threadId: string | null) => void;
  onSendThreadMessage: (
    threadId: string,
    payload: { text: string; stampId?: string; diamondGiftAmount?: number }
  ) => { success: boolean; reason?: string };
  onToggleThreadFavorite: (threadId: string) => void;
  onStartMemberChat: (member: CircleMember) => void;
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onSelectStamp: (stamp: StampItem) => void;
  onCreatePost: (stampId: string, caption: string) => void;
}

const GIFT_AMOUNTS = [10, 25, 50];

export function SocialFeedView({
  posts,
  stamps,
  circleMembers,
  chatThreads,
  activeThreadId,
  diamondBalance,
  onSelectThread,
  onSendThreadMessage,
  onToggleThreadFavorite,
  onStartMemberChat,
  onToggleLike,
  onToggleSave,
  onSelectStamp,
  onCreatePost,
}: SocialFeedViewProps) {
  const [filterMode, setFilterMode] = useState<ChatFilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);

  // Active thread composer state
  const [draftMessage, setDraftMessage] = useState('');
  const [attachedStampId, setAttachedStampId] = useState<string>('');
  const [drawerMode, setDrawerMode] = useState<'none' | 'stamp' | 'diamond'>('none');
  const [threadMenuOpen, setThreadMenuOpen] = useState(false);
  const [likedMessages, setLikedMessages] = useState<Record<string, boolean>>({});
  const [chatError, setChatError] = useState('');

  // Rare Finds composer state
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedStampId, setSelectedStampId] = useState(
    stamps.find((s) => s.isUnlocked)?.id ?? stamps[0]?.id ?? ''
  );
  const [caption, setCaption] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { unreadThreadsCount, favoritesCount } = getChatInboxCounts(chatThreads);
  const visibleThreads = filterChatThreads(chatThreads, filterMode, searchQuery);
  const activeThread = activeThreadId
    ? chatThreads.find((t) => t.id === activeThreadId) ?? null
    : null;

  const unlockedStamps = stamps.filter((s) => s.isUnlocked);
  const activeSelectedStampId =
    selectedStampId || unlockedStamps[0]?.id || stamps[0]?.id || '';
  const attachedStamp = attachedStampId
    ? stamps.find((s) => s.id === attachedStampId)
    : undefined;

  const filterItems = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: unreadThreadsCount > 0 ? `Unread ${unreadThreadsCount}` : 'Unread' },
    { value: 'favorites', label: favoritesCount > 0 ? `Favorites ${favoritesCount}` : 'Favorites' },
    { value: 'finds', label: 'Finds' },
  ];

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread) return;
    const cleanText = draftMessage.trim();
    if (!cleanText && !attachedStampId) return;

    const result = onSendThreadMessage(activeThread.id, {
      text: cleanText,
      stampId: attachedStampId || undefined,
    });
    if (result.success) {
      setDraftMessage('');
      setAttachedStampId('');
      setDrawerMode('none');
      setChatError('');
    }
  };

  const handleSendDiamondGift = (amount: number) => {
    if (!activeThread) return;
    const result = onSendThreadMessage(activeThread.id, {
      text: '',
      diamondGiftAmount: amount,
    });
    if (!result.success) {
      setChatError(
        `You need ${amount} Diamonds to gift this amount (balance: ${diamondBalance}).`
      );
      return;
    }
    setChatError('');
    setDrawerMode('none');
  };

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

  // Active Chat Conversation Thread View (liquid-glass Apple/Swiss layout matching reference)
  if (activeThread) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col bg-[#F7F7F9]">
        {/* Sticky Centered Avatar & Contact Header */}
        <header className="liquid-glass-btn sticky top-0 z-30 flex items-center justify-between border-b border-black/6 px-4 py-3 sm:px-6">
          <BackButton
            onClick={() => {
              setThreadMenuOpen(false);
              setDrawerMode('none');
              setChatError('');
              onSelectThread(null);
            }}
            ariaLabel="Back to Chats"
          />

          <div className="flex min-w-0 flex-col items-center text-center">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: activeThread.avatarTint }}
            >
              {activeThread.initials}
            </div>
            <h1 className="font-title mt-1 max-w-[180px] truncate text-[15px] font-semibold text-[#0A0A0A]">
              {activeThread.name}
            </h1>
            <p className="font-body truncate text-[11px] text-neutral-500">
              {activeThread.subtitle}
            </p>
          </div>

          <div className="relative">
            <JellyButton
              type="button"
              onClick={() => setThreadMenuOpen((prev) => !prev)}
              aria-label="Conversation options"
              aria-expanded={threadMenuOpen}
              className="liquid-glass-btn flex h-11 w-11 items-center justify-center rounded-full text-[#0A0A0A]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </JellyButton>

            <AnimatePresence>
              {threadMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: -6 }}
                  className="liquid-glass-btn absolute right-0 top-12 z-40 w-48 overflow-hidden rounded-2xl border border-black/8 p-1.5"
                >
                  <JellyButton
                    type="button"
                    onClick={() => {
                      onToggleThreadFavorite(activeThread.id);
                      setThreadMenuOpen(false);
                    }}
                    className="flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-left text-[13px] font-medium text-[#0A0A0A] hover:bg-black/5"
                  >
                    <Reicon
                      name="star"
                      size={16}
                      weight={activeThread.isFavorite ? 'Filled' : 'Outline'}
                    />
                    <span>
                      {activeThread.isFavorite ? 'Remove Favorite' : 'Favorite Chat'}
                    </span>
                  </JellyButton>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Scrollable Liquid-Glass Message Stream */}
        <div className="flex-1 space-y-4 px-4 py-5 sm:px-6">
          {activeThread.messages.map((msg) => {
            const sharedStamp = msg.stampId
              ? (stamps.find((s) => s.id === msg.stampId) ??
                STORE_CATALOG.find((s) => s.id === msg.stampId))
              : undefined;
            const isSelfMsg = Boolean(msg.isSelf);
            const isReacted = Boolean(likedMessages[msg.id]);

            return (
              <div key={msg.id} className="space-y-2">
                {msg.dateDividerLabel && (
                  <p className="font-mono-nums py-1 text-center text-[11.5px] font-medium text-neutral-400">
                    {msg.dateDividerLabel}
                  </p>
                )}

                {/* Rich Golden-Yellow Diamond Gift Transfer Card */}
                {msg.diamondGiftAmount ? (
                  <div className="space-y-2.5">
                    <div className={`flex ${isSelfMsg ? 'justify-end' : 'justify-start'}`}>
                      <div className="flex max-w-[240px] flex-col items-end">
                        <div
                          className="w-[224px] rounded-[24px] border border-white/65 px-5 py-4 text-center backdrop-blur-xl"
                          style={{
                            background:
                              'linear-gradient(145deg, rgba(251, 191, 36, 0.92) 0%, rgba(245, 158, 11, 0.95) 100%)',
                          }}
                        >
                          <p className="font-title text-[12px] font-semibold text-[#0A0A0A]/80">
                            {isSelfMsg ? 'You sent' : `${msg.senderName} sent`}
                          </p>
                          <div className="mt-1 flex items-center justify-center gap-2">
                            <DiamondIcon size={26} />
                            <span className="font-hero font-mono-nums text-[38px] font-bold leading-none tracking-[-0.03em] text-[#0A0A0A]">
                              {msg.diamondGiftAmount}
                            </span>
                          </div>
                          <p className="font-body mt-1 text-[11px] font-medium text-[#0A0A0A]/75">
                            Diamonds
                          </p>
                        </div>
                        <span className="font-mono-nums mt-1 px-1 text-[10.5px] text-neutral-400">
                          {msg.timestampLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <span className="liquid-glass-btn-soft font-body rounded-full px-3.5 py-1 text-[11.5px] font-medium text-neutral-500">
                        {isSelfMsg
                          ? `You sent ${msg.diamondGiftAmount} Diamonds to ${activeThread.name}`
                          : `${msg.senderName} sent ${msg.diamondGiftAmount} Diamonds`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`flex flex-col ${
                      isSelfMsg ? 'items-end' : 'items-start'
                    }`}
                  >
                    {msg.text && (
                      <div
                        className={`max-w-[82%] rounded-[22px] px-4 py-2.5 text-[14px] leading-relaxed backdrop-blur-md sm:max-w-[72%] ${
                          isSelfMsg
                            ? 'rounded-br-[6px] bg-[#0A0A0A]/92 text-white'
                            : 'liquid-glass-btn-soft rounded-bl-[6px] text-[#0A0A0A]'
                        }`}
                      >
                        {msg.text}
                      </div>
                    )}

                    {sharedStamp && (
                      <div className="liquid-glass-btn mt-2 w-[208px] rounded-[22px] p-2.5">
                        <PerforatedStampCard
                          stamp={{ ...sharedStamp, isUnlocked: true }}
                          compact
                          showProgress={false}
                          showUncollectedBadge={false}
                          onSelect={onSelectStamp}
                        />
                        <p className="font-title mt-1.5 truncate text-center text-[12px] font-semibold text-[#0A0A0A]">
                          {sharedStamp.title}
                        </p>
                      </div>
                    )}

                    <div
                      className={`mt-1.5 flex items-center gap-2 px-1 ${
                        isSelfMsg ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {!isSelfMsg && (
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white"
                          style={{ backgroundColor: msg.senderTint }}
                        >
                          {msg.senderInitials}
                        </span>
                      )}
                      <span className="font-mono-nums text-[10.5px] text-neutral-400">
                        {msg.timestampLabel}
                      </span>
                      {!isSelfMsg && (
                        <button
                          type="button"
                          onClick={() =>
                            setLikedMessages((prev) => ({
                              ...prev,
                              [msg.id]: !prev[msg.id],
                            }))
                          }
                          aria-label={isReacted ? 'Remove reaction' : 'React to message'}
                          className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                            isReacted
                              ? 'bg-[#0A0A0A] text-white'
                              : 'bg-black/5 text-neutral-500 hover:bg-black/10'
                          }`}
                        >
                          <Reicon
                            name="heart"
                            size={12}
                            weight={isReacted ? 'Filled' : 'Outline'}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Liquid-Glass Drawers & Composer Bar */}
        <div className="liquid-glass-btn sticky bottom-0 z-30 border-t border-black/6 px-3 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-2.5 sm:px-5">
          {chatError && (
            <p className="mb-2 px-2 text-xs font-medium text-[#D64527]" role="alert">
              {chatError}
            </p>
          )}

          {/* Attached Stamp Preview Chip */}
          <AnimatePresence>
            {attachedStamp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2 overflow-hidden"
              >
                <div className="liquid-glass-btn-soft flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Reicon name="frame" size={16} color="#2563EB" />
                    <span className="font-body truncate text-xs font-medium text-[#0A0A0A]">
                      Attached: {attachedStamp.title}
                    </span>
                  </div>
                  <JellyButton
                    type="button"
                    onClick={() => setAttachedStampId('')}
                    aria-label="Remove attached stamp"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-neutral-500"
                  >
                    <Reicon name="close" size={14} />
                  </JellyButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Diamond Gift Drawer */}
          <AnimatePresence>
            {drawerMode === 'diamond' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2.5 overflow-hidden"
              >
                <div className="liquid-glass-btn-soft rounded-2xl p-3">
                  <div className="flex items-center justify-between gap-2 pb-2">
                    <span className="font-title text-xs font-semibold text-[#0A0A0A]">
                      Send Diamonds to {activeThread.name}
                    </span>
                    <span className="font-mono-nums flex items-center gap-1 text-[11px] font-medium text-neutral-500">
                      <DiamondIcon size={12} />
                      {diamondBalance.toLocaleString()} left
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {GIFT_AMOUNTS.map((amt) => (
                      <JellyButton
                        key={amt}
                        type="button"
                        onClick={() => handleSendDiamondGift(amt)}
                        className="liquid-glass-btn font-mono-nums flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-xs font-semibold text-[#0A0A0A]"
                      >
                        <DiamondIcon size={14} />
                        <span>{amt}</span>
                      </JellyButton>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stamp Attachment Drawer */}
          <AnimatePresence>
            {drawerMode === 'stamp' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2.5 overflow-hidden"
              >
                <div className="liquid-glass-btn-soft rounded-2xl p-3">
                  <p className="font-title mb-2 text-xs font-semibold text-neutral-600">
                    Attach a stamp from your library
                  </p>
                  {unlockedStamps.length === 0 ? (
                    <p className="font-body text-xs text-neutral-500">
                      Unlock stamps in Store first to share them here.
                    </p>
                  ) : (
                    <div className="no-scrollbar flex gap-2 overflow-x-auto overscroll-none pb-0.5">
                      {unlockedStamps.slice(0, 12).map((stamp) => {
                        const active = attachedStampId === stamp.id;
                        return (
                          <JellyButton
                            key={stamp.id}
                            type="button"
                            onClick={() => {
                              setAttachedStampId(active ? '' : stamp.id);
                              setDrawerMode('none');
                            }}
                            className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium ${
                              active ? 'bg-[#0A0A0A] text-white' : 'bg-white text-[#0A0A0A]'
                            }`}
                          >
                            <Reicon name="frame" size={13} />
                            <span className="whitespace-nowrap">{stamp.title}</span>
                          </JellyButton>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reference-Aligned Liquid-Glass Composer Row */}
          <form onSubmit={handleSendText} className="flex items-center gap-2">
            <JellyButton
              type="button"
              onClick={() =>
                setDrawerMode((prev) => (prev === 'diamond' ? 'none' : 'diamond'))
              }
              aria-label="Send Diamonds"
              aria-expanded={drawerMode === 'diamond'}
              className={`liquid-glass-btn-soft flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                drawerMode === 'diamond' ? 'ring-2 ring-[#0A0A0A]' : ''
              }`}
            >
              <DiamondIcon size={19} />
            </JellyButton>

            <div className="liquid-glass-btn-soft flex h-11 flex-1 items-center gap-1.5 rounded-full pl-4 pr-1.5">
              <label htmlFor="thread-message-input" className="sr-only">
                Type a message
              </label>
              <input
                id="thread-message-input"
                type="text"
                value={draftMessage}
                onChange={(e) => setDraftMessage(e.target.value)}
                placeholder="Type a message..."
                className="font-body h-full w-full bg-transparent text-sm text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-none"
              />
              <JellyButton
                type="button"
                onClick={() =>
                  setDrawerMode((prev) => (prev === 'stamp' ? 'none' : 'stamp'))
                }
                aria-label="Attach stamp"
                aria-expanded={drawerMode === 'stamp'}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  drawerMode === 'stamp' || attachedStampId
                    ? 'bg-[#0A0A0A] text-white'
                    : 'text-neutral-500 hover:text-[#0A0A0A]'
                }`}
              >
                <Reicon name="frame" size={17} />
              </JellyButton>
            </div>

            <JellyButton
              type="submit"
              jellyIntensity="medium"
              aria-label="Send message"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0A0A0A] text-white hover:bg-neutral-800"
            >
              <Reicon name="send" size={17} />
            </JellyButton>
          </form>
        </div>
      </div>
    );
  }

  // Chats Inbox List View (Black Accents, Liquid-Glass Style matching Reference)
  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-36 pt-4 sm:px-8">
      {/* Top Bar: Chats Title + Solid Black Circular '+' Action */}
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-title text-[28px] font-semibold tracking-[-0.025em] text-[#0A0A0A] sm:text-[32px]">
          Chats
        </h1>

        <JellyButton
          type="button"
          jellyIntensity="medium"
          onClick={() => setNewChatOpen((prev) => !prev)}
          aria-label="Start new chat"
          aria-expanded={newChatOpen}
          data-testid="chats-new-btn"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0A0A0A] text-white hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
        >
          <Reicon name={newChatOpen ? 'close' : 'plus'} size={20} />
        </JellyButton>
      </header>

      {/* New Chat Collector Picker */}
      <AnimatePresence>
        {newChatOpen && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="liquid-glass-btn-soft rounded-[24px] p-4">
              <p className="font-title text-xs font-semibold text-[#0A0A0A]">
                Start a conversation with a collector
              </p>
              <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto overscroll-none pb-1">
                {circleMembers.map((member) => (
                  <JellyButton
                    key={member.id}
                    type="button"
                    onClick={() => {
                      setNewChatOpen(false);
                      onStartMemberChat(member);
                    }}
                    className="liquid-glass-btn flex w-24 shrink-0 flex-col items-center rounded-2xl p-2.5 text-center"
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: member.avatarTint }}
                    >
                      {member.initials}
                    </div>
                    <span className="font-title mt-1.5 w-full truncate text-[12px] font-medium text-[#0A0A0A]">
                      {member.name.split(' ')[0]}
                    </span>
                    <span className="font-body w-full truncate text-[10.5px] text-neutral-500">
                      {member.city}
                    </span>
                  </JellyButton>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Liquid-Glass Rounded Search Field */}
      <div className="mt-4">
        <label htmlFor="chats-search-input" className="sr-only">
          Search chats
        </label>
        <div className="liquid-glass-btn-soft flex h-11 items-center gap-2.5 rounded-full px-4">
          <Reicon name="search" size={17} color="#6B7280" />
          <input
            id="chats-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="font-body w-full bg-transparent text-sm text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-none"
          />
          {searchQuery && (
            <JellyButton
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear chat search"
              className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500"
            >
              <Reicon name="close" size={15} />
            </JellyButton>
          )}
        </div>
      </div>

      {/* Black-Accented Filter Pills Row (All | Unread | Favorites | Finds) */}
      <div className="no-scrollbar mt-3.5 -mx-1 overflow-x-auto overscroll-none px-1">
        <JellyRadio
          items={filterItems}
          value={filterMode}
          onChange={(val) => setFilterMode(val as ChatFilterMode)}
          chipColor="rgba(0, 0, 0, 0.05)"
          activeColor="#0A0A0A"
          textColor="#4A4A4A"
          activeTextColor="#FFFFFF"
          size="sm"
          gap={8}
          radius={9999}
          swell={0.07}
          barge={2}
          shrink={0.03}
          jelly={0.9}
          bounce={0.34}
          stagger={20}
          stiffness={620}
          ariaLabel="Filter chats"
        />
      </div>

      {filterMode === 'finds' ? (
        <section aria-label="Rare Finds Showcase" className="mt-5">
          <div className="flex justify-end">
            <JellyButton
              type="button"
              jellyIntensity="medium"
              onClick={() => setComposerOpen((prev) => !prev)}
              className="flex h-11 items-center gap-2 rounded-full bg-[#0A0A0A] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]"
            >
              <Reicon name="share" size={16} />
              <span>Share Rare Find</span>
            </JellyButton>
          </div>

          {composerOpen && (
            <motion.form
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handlePublish}
              className="mt-4 rounded-[24px] bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-semibold text-[#0A0A0A]">
                  Post to Rare Finds
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
                  <label
                    htmlFor="share-stamp-select"
                    className="block text-xs font-medium text-neutral-500"
                  >
                    Collected Stamp
                  </label>
                  <select
                    id="share-stamp-select"
                    value={activeSelectedStampId}
                    onChange={(e) => setSelectedStampId(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-2xl bg-[#F7F7F9] px-3 text-sm font-medium text-[#0A0A0A] focus:outline-2 focus:outline-[#0A0A0A]"
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
                  <label
                    htmlFor="share-caption-input"
                    className="block text-xs font-medium text-neutral-500"
                  >
                    Collector Note
                  </label>
                  <input
                    id="share-caption-input"
                    type="text"
                    value={caption}
                    onChange={(e) => {
                      setCaption(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Share the story behind this stamp..."
                    className="mt-1.5 h-11 w-full rounded-2xl bg-[#F7F7F9] px-3.5 text-sm text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-2 focus:outline-[#0A0A0A]"
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

          {posts.length === 0 ? (
            <div className="liquid-glass-btn-soft mt-4 rounded-[24px] p-10 text-center">
              <p className="font-display text-base font-semibold text-[#0A0A0A]">
                No rare finds shared yet
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Unlock a Country or Sports edition in Store, or share one from your collection.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
              {posts.map((post) => {
                const stamp = stamps.find((s) => s.id === post.stampId) ?? stamps[0];
                return (
                  <article
                    key={post.id}
                    className="flex flex-col justify-between rounded-[24px] bg-white p-5"
                  >
                    <div>
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
                            {post.timestampLabel}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-xs font-medium text-neutral-500">
                        {post.locationLabel}
                      </p>

                      {stamp && (
                        <div className="mx-auto mt-3 w-[216px]">
                          <PerforatedStampCard
                            stamp={stamp}
                            compact
                            showProgress={false}
                            onSelect={onSelectStamp}
                          />
                        </div>
                      )}

                      <p className="mt-4 text-sm leading-relaxed text-neutral-700">
                        {post.caption}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3">
                      <JellyButton
                        type="button"
                        onClick={() => onToggleLike(post.id)}
                        aria-label={
                          post.isLiked
                            ? `Unlike ${post.authorName}'s post`
                            : `Like ${post.authorName}'s post`
                        }
                        className={`liquid-glass-btn flex h-11 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold ${
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
                        className="liquid-glass-btn flex h-11 w-11 items-center justify-center rounded-full text-[#0A0A0A]"
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
        </section>
      ) : (
        <section aria-label="Chats List" className="mt-4">
          {visibleThreads.length === 0 ? (
            <div className="liquid-glass-btn-soft rounded-[24px] p-10 text-center">
              <p className="font-title text-base font-semibold text-[#0A0A0A]">
                No matching chats
              </p>
              <p className="font-body mt-1 text-sm text-neutral-500">
                Try another filter or tap + to start a new conversation.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-black/[0.05] overflow-hidden rounded-[24px] border border-black/6 bg-white">
              {visibleThreads.map((thread) => {
                const lastMsg = thread.messages[thread.messages.length - 1];
                const previewText = lastMsg
                  ? lastMsg.diamondGiftAmount
                    ? `Sent ${lastMsg.diamondGiftAmount} Diamonds`
                    : lastMsg.text || 'Shared a stamp edition'
                  : thread.subtitle;

                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => onSelectThread(thread.id)}
                    aria-label={`Open chat with ${thread.name}`}
                    className="flex w-full items-center justify-between gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-[#F7F7F9] focus-visible:outline-2 focus-visible:outline-[#0A0A0A] sm:px-5"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3.5">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ backgroundColor: thread.avatarTint }}
                      >
                        {thread.initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-title truncate text-[15px] font-semibold text-[#0A0A0A]">
                            {thread.name}
                          </span>
                          {thread.isFavorite && (
                            <Reicon
                              name="star"
                              size={12}
                              weight="Filled"
                              color="#0A0A0A"
                              className="shrink-0 opacity-60"
                            />
                          )}
                        </div>
                        <p className="font-body mt-0.5 truncate text-[13px] text-neutral-500">
                          {previewText}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="font-mono-nums whitespace-nowrap text-[11.5px] font-normal text-neutral-400">
                        {thread.lastTimeLabel}
                      </span>
                      {thread.unreadCount > 0 ? (
                        <span className="font-mono-nums flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#0A0A0A] px-1.5 text-[11px] font-bold text-white">
                          {thread.unreadCount}
                        </span>
                      ) : (
                        <span className="h-6" aria-hidden="true" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
