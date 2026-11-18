import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  DEFAULT_CHAT_THREADS,
  DEFAULT_CIRCLE_CHAT,
  DEFAULT_CIRCLE_MEMBERS,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_SETTINGS,
  DEMO_POCKETS,
  DEMO_POSTS,
  DEMO_STAMPS,
  ONBOARDING_SHOWCASE_STAMPS,
} from './data/seedData';
import type {
  AppNotification,
  AppSettings,
  AppTab,
  ChatThread,
  CircleChatMessage,
  CircleMember,
  CollectionFilter,
  DailyTaskStatus,
  PlaceCandidate,
  PocketTint,
  SocialPost,
  StampItem,
  StampPocket,
  UserProfile,
} from './types/stamp';
import { initCapacitorMobile, triggerHapticImpact } from './utils/capacitorBridge';
import {
  assignStampsToFolder,
  claimDailyTaskReward,
  collectStamp,
  createCustomFolder,
  evaluateDailyChallenges,
  getTodayDateKey,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markChatThreadRead,
  markNotificationRead,
  purchaseStoreStamp,
  sendChatThreadMessage,
  toggleChatThreadFavorite,
  toggleStampFavorite,
  transferDiamondsInChat,
} from './utils/stampLogic';
import { BottomDock } from './components/BottomDock';
import { CreateFolderModal } from './components/CreateFolderModal';
import { EditProfileView } from './components/EditProfileView';
import { GlobeMapView } from './components/GlobeMapView';
import { LoginView } from './components/LoginView';
import { MyStampsView } from './components/MyStampsView';
import { NotificationsView } from './components/NotificationsView';
import { OnboardingScreen } from './components/OnboardingScreen';
import { ProfileView } from './components/ProfileView';
import { SelectFolderModal } from './components/SelectFolderModal';
import { SettingsView } from './components/SettingsView';
import { SocialFeedView } from './components/SocialFeedView';
import { StampDetailModal } from './components/StampDetailModal';
import { StampLibraryView } from './components/StampLibraryView';
import { StampStudioModal } from './components/StampStudioModal';
import { StoreView } from './components/StoreView';

const STORAGE_KEY = 'snapstamps_state_v3';
const INITIAL_DIAMOND_BALANCE = 1500;

const DEFAULT_PROFILE: UserProfile = {
  name: 'Leni Coper',
  handle: '@leni.collector',
  email: 'leni@snapstamps.app',
  initials: 'LC',
  passportCode: 'SS-2026-0419',
  memberSince: 'Nov 2026',
};

interface PersistedState {
  hasOnboarded: boolean;
  isAuthenticated: boolean;
  userProfile: UserProfile;
  stamps: StampItem[];
  pockets: StampPocket[];
  posts: SocialPost[];
  circleMessages: CircleChatMessage[];
  chatThreads: ChatThread[];
  diamondBalance: number;
  dailyDateKey: string;
  claimedChallengeIds: string[];
  notifications: AppNotification[];
  settings: AppSettings;
}

function loadInitialState(): PersistedState {
  const todayKey = getTodayDateKey();
  const autostart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      if (
        Array.isArray(parsed.stamps) &&
        Array.isArray(parsed.pockets) &&
        Array.isArray(parsed.posts)
      ) {
        const sameDay = parsed.dailyDateKey === todayKey;
        return {
          hasOnboarded: autostart ? true : Boolean(parsed.hasOnboarded),
          isAuthenticated: autostart
            ? true
            : parsed.isAuthenticated ?? Boolean(parsed.hasOnboarded),
          userProfile: parsed.userProfile ?? DEFAULT_PROFILE,
          stamps: parsed.stamps,
          pockets: parsed.pockets.length > 0 ? parsed.pockets : DEMO_POCKETS,
          posts: parsed.posts,
          circleMessages:
            Array.isArray(parsed.circleMessages) && parsed.circleMessages.length > 0
              ? parsed.circleMessages
              : DEFAULT_CIRCLE_CHAT,
          chatThreads:
            Array.isArray(parsed.chatThreads) && parsed.chatThreads.length > 0
              ? parsed.chatThreads
              : DEFAULT_CHAT_THREADS,
          diamondBalance:
            typeof parsed.diamondBalance === 'number'
              ? parsed.diamondBalance
              : INITIAL_DIAMOND_BALANCE,
          dailyDateKey: todayKey,
          claimedChallengeIds:
            sameDay && Array.isArray(parsed.claimedChallengeIds)
              ? parsed.claimedChallengeIds
              : [],
          notifications:
            Array.isArray(parsed.notifications) && parsed.notifications.length > 0
              ? parsed.notifications
              : DEFAULT_NOTIFICATIONS,
          settings: parsed.settings ? { ...DEFAULT_SETTINGS, ...parsed.settings } : DEFAULT_SETTINGS,
        };
      }
    }
  } catch {
    // Fall back to fresh clean state
  }

  return {
    hasOnboarded: autostart,
    isAuthenticated: autostart,
    userProfile: DEFAULT_PROFILE,
    stamps: DEMO_STAMPS,
    pockets: DEMO_POCKETS,
    posts: DEMO_POSTS,
    circleMessages: DEFAULT_CIRCLE_CHAT,
    chatThreads: DEFAULT_CHAT_THREADS,
    diamondBalance: INITIAL_DIAMOND_BALANCE,
    dailyDateKey: todayKey,
    claimedChallengeIds: [],
    notifications: DEFAULT_NOTIFICATIONS,
    settings: DEFAULT_SETTINGS,
  };
}

export default function App() {
  const shouldReduceMotion = useReducedMotion();
  const [initial] = useState<PersistedState>(() => loadInitialState());
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(initial.hasOnboarded);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    initial.isAuthenticated
  );
  const [showLoginScreen, setShowLoginScreen] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(initial.userProfile);
  const [activeTab, setActiveTab] = useState<AppTab>('library');
  const [stamps, setStamps] = useState<StampItem[]>(initial.stamps);
  const [pockets, setPockets] = useState<StampPocket[]>(initial.pockets);
  const [posts, setPosts] = useState<SocialPost[]>(initial.posts);
  const [circleMessages] = useState<CircleChatMessage[]>(
    initial.circleMessages
  );
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(initial.chatThreads);
  const [activeChatThreadId, setActiveChatThreadId] = useState<string | null>(null);
  const [diamondBalance, setDiamondBalance] = useState<number>(
    initial.diamondBalance
  );
  const [claimedChallengeIds, setClaimedChallengeIds] = useState<string[]>(
    initial.claimedChallengeIds
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(
    initial.notifications
  );
  const [settings, setSettings] = useState<AppSettings>(initial.settings);

  // Filters & search
  const [activeFilter, setActiveFilter] = useState<CollectionFilter>('all');
  const [activePocketId, setActivePocketId] = useState<string | null>(null);
  const [librarySearch, setLibrarySearch] = useState('');
  const [stampsSearch, setStampsSearch] = useState('');

  // Modals & Inspector state
  const [selectedStampId, setSelectedStampId] = useState<string | null>(null);
  const [focusedGlobeStampId, setFocusedGlobeStampId] = useState<string | null>(
    null
  );
  const [studioOpen, setStudioOpen] = useState(false);
  const [studioPocketId, setStudioPocketId] = useState<string | null>(null);
  const [studioEditStamp, setStudioEditStamp] = useState<StampItem | null>(null);

  // Folder creation & post-purchase folder selection modals
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [pendingFolderStamp, setPendingFolderStamp] = useState<StampItem | null>(null);

  // Google Maps Platform Demo Key Quota Banner State
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  const playHaptic = (level: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!settings.hapticsEnabled) return;
    void triggerHapticImpact(level);
  };

  useEffect(() => {
    void initCapacitorMobile();
    const onQuotaExceeded = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
  }, []);

  const mainScrollRef = useRef<HTMLElement | null>(null);
  const authScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    mainScrollRef.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    authScrollRef.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [activeTab, isAuthenticated, hasOnboarded, showLoginScreen]);

  useEffect(() => {
    try {
      const payload: PersistedState = {
        hasOnboarded,
        isAuthenticated,
        userProfile,
        stamps,
        pockets,
        posts,
        circleMessages,
        chatThreads,
        diamondBalance,
        dailyDateKey: getTodayDateKey(),
        claimedChallengeIds,
        notifications,
        settings,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota issues
    }
  }, [
    hasOnboarded,
    isAuthenticated,
    userProfile,
    stamps,
    pockets,
    posts,
    circleMessages,
    chatThreads,
    diamondBalance,
    claimedChallengeIds,
    notifications,
    settings,
  ]);

  const selectedStamp = stamps.find((s) => s.id === selectedStampId) ?? null;
  const unreadNotificationsCount = getUnreadNotificationCount(notifications);
  const userChatCount =
    circleMessages.filter((m) => Boolean(m.isSelf)).length +
    chatThreads.reduce(
      (sum, thread) =>
        sum + thread.messages.filter((m) => Boolean(m.isSelf) && m.id.startsWith('msg-')).length,
      0
    );

  const dailyChallenges = evaluateDailyChallenges({
    stamps,
    posts,
    chatMessagesCount: userChatCount,
    claimedChallengeIds,
  });

  const handleToggleFavorite = (stampId: string) => {
    playHaptic('light');
    setStamps((prev) => toggleStampFavorite(prev, stampId));
  };

  const handleCollectStamp = (stampId: string) => {
    playHaptic('medium');
    setStamps((prev) => collectStamp(prev, stampId, 'Nov 2026'));
  };

  const handleBuyStoreStamp = (storeStamp: StampItem) => {
    const result = purchaseStoreStamp(
      stamps,
      storeStamp,
      diamondBalance,
      'Nov 2026'
    );
    if (result.success && result.purchasedStamp) {
      playHaptic('medium');
      setStamps(result.stamps);
      setDiamondBalance(result.diamondBalance);
      setPendingFolderStamp(result.purchasedStamp);
    }
    return { success: result.success, reason: result.reason };
  };

  const handleCreateFolder = ({
    title,
    tint,
    initialStampIds,
  }: {
    title: string;
    tint: PocketTint;
    initialStampIds: string[];
  }) => {
    playHaptic('light');
    const created = createCustomFolder(pockets, title, tint);
    setPockets(created.pockets);
    if (initialStampIds.length > 0) {
      setStamps((prev) =>
        assignStampsToFolder(prev, initialStampIds, created.pocket.id)
      );
    }
  };

  const handleMoveStampToPocket = (stampId: string, targetPocketId: string) => {
    playHaptic('medium');
    setStamps((prev) => assignStampsToFolder(prev, [stampId], targetPocketId));
  };

  const handleSelectFolderForPurchasedStamp = (pocketId: string) => {
    if (!pendingFolderStamp) return;
    playHaptic('light');
    setStamps((prev) =>
      assignStampsToFolder(prev, [pendingFolderStamp.id], pocketId)
    );
    setPendingFolderStamp(null);
  };

  const handleCreateAndSelectFolder = (title: string, tint: PocketTint) => {
    if (!pendingFolderStamp) return;
    playHaptic('medium');
    const created = createCustomFolder(pockets, title, tint);
    setPockets(created.pockets);
    setStamps((prev) =>
      assignStampsToFolder(prev, [pendingFolderStamp.id], created.pocket.id)
    );
    setPendingFolderStamp(null);
  };

  const handleClaimChallenge = (challenge: DailyTaskStatus) => {
    const result = claimDailyTaskReward({
      task: challenge,
      claimedIds: claimedChallengeIds,
      diamondBalance,
    });
    if (result.claimed) {
      playHaptic('medium');
      setClaimedChallengeIds(result.claimedIds);
      setDiamondBalance(result.diamondBalance);
    }
  };

  const handleAddPlaceAsStamp = (place: PlaceCandidate) => {
    const newStamp: StampItem = {
      id: `place-${place.id}`,
      title: place.name.slice(0, 20),
      country: place.address.split(',').pop()?.trim() || 'Explorer',
      city: place.name,
      category: 'landmark',
      rarity: 'rare',
      collectedCount: 1,
      totalInSet: 10,
      isFavorite: false,
      isUnlocked: true,
      coordinates: { lat: place.lat, lng: place.lng },
      imageUrl: ONBOARDING_SHOWCASE_STAMPS[0]?.imageUrl || '',
      accentColor: '#98D4DC',
      bannerColor: '#0E7490',
      pocketId: pockets[0]?.id || 'landmarks',
      description: `${place.categoryLabel} discovered via Google Maps at ${place.address}.`,
      unlockedAt: 'Nov 2026',
      isDemoSeed: false,
    };
    setStamps((prev) => {
      if (prev.some((s) => s.id === newStamp.id)) return prev;
      return [newStamp, ...prev];
    });
    setSelectedStampId(newStamp.id);
  };

  const handleSaveNewStamp = (newStamp: StampItem) => {
    playHaptic('medium');
    setStamps((prev) => [newStamp, ...prev]);
    setActiveTab('stamps');
    setActivePocketId(newStamp.pocketId);
    setActiveFilter('all');
  };

  const handleUpdateStampArt = (stampId: string, newImageUrl: string) => {
    setStamps((prev) =>
      prev.map((s) =>
        s.id === stampId
          ? { ...s, imageUrl: newImageUrl, isCustomGenerated: true }
          : s
      )
    );
  };

  const handleTogglePostLike = (postId: string) => {
    playHaptic('light');
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked: !p.isLiked,
              likesCount: p.isLiked ? Math.max(0, p.likesCount - 1) : p.likesCount + 1,
            }
          : p
      )
    );
  };

  const handleTogglePostSave = (postId: string) => {
    playHaptic('light');
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isSaved: !p.isSaved } : p))
    );
  };

  const handleCreatePost = (stampId: string, caption: string) => {
    const stamp = stamps.find((s) => s.id === stampId);
    if (!stamp) return;
    playHaptic('medium');
    const post: SocialPost = {
      id: `post-${Date.now()}`,
      authorName: userProfile.name,
      authorHandle: userProfile.handle,
      authorInitials: userProfile.initials,
      authorTint: '#0A0A0A',
      stampId: stamp.id,
      caption,
      locationLabel: `${stamp.city} · ${stamp.country} · ${stamp.rarity[0].toUpperCase()}${stamp.rarity.slice(1)}`,
      timestampLabel: 'Just now',
      likesCount: 1,
      isLiked: true,
      isSaved: false,
      isDemoSeed: false,
    };
    setPosts((prev) => [post, ...prev]);
    setActiveTab('feed');
  };

  const handleSelectChatThread = (threadId: string | null) => {
    setActiveChatThreadId(threadId);
    if (threadId) {
      setChatThreads((prev) => markChatThreadRead(prev, threadId));
    }
  };

  const handleSendThreadMessage = (
    threadId: string,
    payload: { text: string; stampId?: string; diamondGiftAmount?: number }
  ): { success: boolean; reason?: string } => {
    if (payload.diamondGiftAmount) {
      const transfer = transferDiamondsInChat(diamondBalance, payload.diamondGiftAmount);
      if (!transfer.success) {
        return { success: false, reason: transfer.reason };
      }
      setDiamondBalance(transfer.diamondBalance);
    }
    playHaptic('medium');
    setChatThreads((prev) =>
      sendChatThreadMessage(prev, threadId, {
        senderName: userProfile.name,
        senderInitials: userProfile.initials,
        text: payload.text,
        stampId: payload.stampId,
        diamondGiftAmount: payload.diamondGiftAmount,
      })
    );
    return { success: true };
  };

  const handleToggleThreadFavorite = (threadId: string) => {
    playHaptic('light');
    setChatThreads((prev) => toggleChatThreadFavorite(prev, threadId));
  };

  const handleStartMemberChat = (member: CircleMember) => {
    playHaptic('light');
    const existing = chatThreads.find((t) => t.memberId === member.id);
    if (existing) {
      handleSelectChatThread(existing.id);
      return;
    }
    const newThread: ChatThread = {
      id: `thread-${member.id}-${Date.now()}`,
      memberId: member.id,
      name: member.name,
      subtitle: `${member.city} · ${member.isOnline ? 'Active now' : 'Collector'}`,
      initials: member.initials,
      avatarTint: member.avatarTint,
      isFavorite: false,
      unreadCount: 0,
      lastTimeLabel: 'Now',
      messages: [
        {
          id: `welcome-${Date.now()}`,
          senderId: member.id,
          senderName: member.name,
          senderInitials: member.initials,
          senderTint: member.avatarTint,
          text: `Hey! Happy collecting from ${member.city}. Which stamps are you hunting today?`,
          timestampLabel: 'Now',
          dateDividerLabel: 'Today',
        },
      ],
    };
    setChatThreads((prev) => [newThread, ...prev]);
    setActiveChatThreadId(newThread.id);
  };

  const pageTransition = shouldReduceMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: 12, scale: 0.99 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -8, scale: 0.99 },
        transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
      };

  const screenKey = !isAuthenticated || showLoginScreen
    ? 'screen-login'
    : !hasOnboarded
      ? 'screen-onboarding'
      : activeTab === 'feed' && activeChatThreadId
        ? `screen-feed-${activeChatThreadId}`
        : `screen-${activeTab}`;

  const dockActiveTab: AppTab =
    activeTab === 'globe' || activeTab === 'settings' || activeTab === 'edit-profile'
      ? 'profile'
      : activeTab === 'notifications'
        ? 'library'
        : activeTab;

  const hideDockForSubscreen =
    activeTab === 'stamps' ||
    activeTab === 'edit-profile' ||
    (activeTab === 'feed' && activeChatThreadId !== null);

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F7F7F9] text-[#0A0A0A] touch-none overscroll-none">
      {gmpQuotaExceeded && (
        <div className="fixed inset-x-0 top-0 z-50 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-xs text-amber-900 md:text-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-amber-950 underline hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!isAuthenticated || showLoginScreen ? (
          <motion.div
            ref={authScrollRef}
            key={screenKey}
            {...pageTransition}
            className="h-screen w-full overflow-y-auto overflow-x-hidden overscroll-none"
          >
            <LoginView
              defaultProfile={userProfile}
              onAuthenticated={(nextProfile) => {
                setUserProfile(nextProfile);
                setIsAuthenticated(true);
                setShowLoginScreen(false);
                setActiveTab('library');
              }}
              onContinueGoogle={() => {
                setIsAuthenticated(true);
                setShowLoginScreen(false);
                setActiveTab('library');
              }}
            />
          </motion.div>
        ) : !hasOnboarded ? (
          <motion.div
            ref={authScrollRef}
            key={screenKey}
            {...pageTransition}
            className="h-screen w-full overflow-y-auto overflow-x-hidden overscroll-none"
          >
            <OnboardingScreen
              featuredStamps={
                stamps.length >= 2 ? stamps : ONBOARDING_SHOWCASE_STAMPS
              }
              onGetStarted={() => {
                setHasOnboarded(true);
              }}
            />
          </motion.div>
        ) : (
          <main
            ref={mainScrollRef}
            className="h-screen w-full overflow-y-auto overflow-x-hidden overscroll-none"
          >
            <AnimatePresence mode="wait">
              <motion.div key={screenKey} {...pageTransition}>
                {activeTab === 'library' && (
                  <StampLibraryView
                    pockets={pockets}
                    stamps={stamps}
                    userProfile={userProfile}
                    unreadNotificationsCount={unreadNotificationsCount}
                    searchQuery={librarySearch}
                    onSearchChange={setLibrarySearch}
                    onOpenPocket={(pocketId) => {
                      setActivePocketId(pocketId);
                      setActiveFilter('all');
                      setActiveTab('stamps');
                    }}
                    onMoveStampToPocket={handleMoveStampToPocket}
                    onOpenCreateFolder={() => setCreateFolderOpen(true)}
                    onOpenNotifications={() => setActiveTab('notifications')}
                    onSelectStamp={(s) => setSelectedStampId(s.id)}
                    onOpenProfile={() => setActiveTab('profile')}
                  />
                )}

                {activeTab === 'stamps' && (
                  <MyStampsView
                    stamps={stamps}
                    pockets={pockets}
                    activeFilter={activeFilter}
                    activePocketId={activePocketId}
                    searchQuery={stampsSearch}
                    onFilterChange={setActiveFilter}
                    onClearPocketFilter={() => setActivePocketId(null)}
                    onSearchChange={setStampsSearch}
                    onBack={() => setActiveTab('library')}
                    onSelectStamp={(s) => setSelectedStampId(s.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenStudio={() => {
                      setStudioPocketId(activePocketId);
                      setStudioEditStamp(null);
                      setStudioOpen(true);
                    }}
                    onOpenStore={() => setActiveTab('store')}
                  />
                )}

                {activeTab === 'feed' && (
                  <SocialFeedView
                    posts={posts}
                    stamps={stamps}
                    circleMembers={DEFAULT_CIRCLE_MEMBERS}
                    chatThreads={chatThreads}
                    activeThreadId={activeChatThreadId}
                    diamondBalance={diamondBalance}
                    userProfile={userProfile}
                    onSelectThread={handleSelectChatThread}
                    onSendThreadMessage={handleSendThreadMessage}
                    onToggleThreadFavorite={handleToggleThreadFavorite}
                    onStartMemberChat={handleStartMemberChat}
                    onToggleLike={handleTogglePostLike}
                    onToggleSave={handleTogglePostSave}
                    onSelectStamp={(s) => setSelectedStampId(s.id)}
                    onCreatePost={handleCreatePost}
                  />
                )}

                {activeTab === 'store' && (
                  <StoreView
                    stamps={stamps}
                    diamondBalance={diamondBalance}
                    onBack={() => setActiveTab('library')}
                    onBuyStamp={handleBuyStoreStamp}
                    onSelectStamp={(s) => setSelectedStampId(s.id)}
                  />
                )}

                {activeTab === 'notifications' && (
                  <NotificationsView
                    notifications={notifications}
                    onBack={() => setActiveTab('library')}
                    onMarkRead={(id) => setNotifications((prev) => markNotificationRead(prev, id))}
                    onMarkAllRead={() => setNotifications((prev) => markAllNotificationsRead(prev))}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                  />
                )}

                {activeTab === 'settings' && (
                  <SettingsView
                    settings={settings}
                    userProfile={userProfile}
                    foldersCount={pockets.length}
                    stampsCount={stamps.filter((s) => s.isUnlocked).length}
                    onBack={() => setActiveTab('profile')}
                    onUpdateSettings={setSettings}
                    onOpenEditProfile={() => setActiveTab('edit-profile')}
                    onOpenNotifications={() => setActiveTab('notifications')}
                    onSignOut={() => {
                      setIsAuthenticated(false);
                      setShowLoginScreen(true);
                    }}
                  />
                )}

                {activeTab === 'edit-profile' && (
                  <EditProfileView
                    profile={userProfile}
                    onBack={() => setActiveTab('settings')}
                    onUpdateProfile={setUserProfile}
                  />
                )}

                {activeTab === 'profile' && (
                  <ProfileView
                    profile={userProfile}
                    stamps={stamps}
                    postsCount={posts.length}
                    diamondBalance={diamondBalance}
                    dailyChallenges={dailyChallenges}
                    onBack={() => setActiveTab('library')}
                    onSelectStamp={(s) => setSelectedStampId(s.id)}
                    onClaimChallenge={handleClaimChallenge}
                    onOpenGlobe={() => setActiveTab('globe')}
                    onOpenStore={() => setActiveTab('store')}
                    onOpenSettings={() => setActiveTab('settings')}
                    onSignOut={() => {
                      setIsAuthenticated(false);
                      setShowLoginScreen(true);
                    }}
                  />
                )}

                {activeTab === 'globe' && (
                  <GlobeMapView
                    stamps={stamps}
                    focusedStampId={focusedGlobeStampId}
                    onBack={() => setActiveTab('profile')}
                    onSelectStamp={(s) => setSelectedStampId(s.id)}
                    onCollectStamp={handleCollectStamp}
                    onAddPlaceAsStamp={handleAddPlaceAsStamp}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        )}
      </AnimatePresence>

      {isAuthenticated && !showLoginScreen && hasOnboarded && !hideDockForSubscreen && (
        <BottomDock
          activeTab={dockActiveTab}
          onTabChange={(nextTab) => {
            playHaptic('light');
            if (nextTab === 'feed') setActiveChatThreadId(null);
            setActiveTab(nextTab);
          }}
          onOpenStore={() => {
            playHaptic('light');
            setActiveTab('store');
          }}
        />
      )}

      <StampDetailModal
        stamp={selectedStamp}
        pockets={pockets}
        onClose={() => setSelectedStampId(null)}
        onToggleFavorite={handleToggleFavorite}
        onCollectStamp={handleCollectStamp}
        onMoveStampToFolder={handleMoveStampToPocket}
        onEditWithGemini={(s) => {
          setSelectedStampId(null);
          setStudioEditStamp(s);
          setStudioOpen(true);
        }}
        onLocateOnGlobe={(stampId) => {
          setSelectedStampId(null);
          setFocusedGlobeStampId(stampId);
          setActiveTab('globe');
        }}
        onShareToFeed={(s) => {
          setSelectedStampId(null);
          handleCreatePost(
            s.id,
            `Added ${s.title} (${s.country}) to my SnapStamps collection!`
          );
        }}
      />

      <StampStudioModal
        key={`${studioOpen}-${studioEditStamp?.id || 'new'}-${studioPocketId || 'default'}`}
        isOpen={studioOpen}
        pockets={pockets}
        stamps={stamps}
        initialPocketId={studioPocketId}
        initialEditStamp={studioEditStamp}
        onClose={() => {
          setStudioOpen(false);
          setStudioEditStamp(null);
        }}
        onSaveNewStamp={handleSaveNewStamp}
        onUpdateStampArt={handleUpdateStampArt}
      />

      <CreateFolderModal
        isOpen={createFolderOpen}
        stamps={stamps}
        onClose={() => setCreateFolderOpen(false)}
        onCreateFolder={handleCreateFolder}
      />

      <SelectFolderModal
        stamp={pendingFolderStamp}
        pockets={pockets}
        stamps={stamps}
        onClose={() => setPendingFolderStamp(null)}
        onSelectFolder={handleSelectFolderForPurchasedStamp}
        onCreateAndSelectFolder={handleCreateAndSelectFolder}
      />
    </div>
  );
}
