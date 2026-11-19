import type {
  AppNotification,
  ChatFilterMode,
  ChatMessageItem,
  ChatThread,
  CollectionFilter,
  DailyTaskStatus,
  PocketTint,
  SocialPost,
  SportDisciplineFilter,
  StampCategory,
  StampCoordinates,
  StampItem,
  StampPocket,
  StampRarity,
  StampThemeTag,
  StoreSectionFilter,
  StreakDayStep,
  StreakMilestoneStep,
  StreakState,
  TravelArc,
  UserProfile,
} from '../types/stamp';
import { ensureStampTags, getStampTags } from './stampTagging';

export function filterStamps(
  stamps: StampItem[],
  filter: CollectionFilter,
  searchQuery: string,
  pocketId?: string | null,
  themeTag?: StampThemeTag | 'all' | null
): StampItem[] {
  const q = searchQuery.trim().toLowerCase();

  return stamps.filter((stamp) => {
    if (pocketId && stamp.pocketId !== pocketId) {
      return false;
    }

    if (filter === 'national' && stamp.category !== 'country' && stamp.country.toLowerCase() !== 'india') {
      return false;
    }
    if (filter === 'favorites' && !stamp.isFavorite) {
      return false;
    }
    if (filter === 'rare' && stamp.rarity === 'common') {
      return false;
    }

    const resolvedTags = getStampTags(stamp);
    if (themeTag && themeTag !== 'all' && !resolvedTags.includes(themeTag)) {
      return false;
    }

    if (q) {
      const haystack = `${stamp.title} ${stamp.city} ${stamp.country} ${stamp.category} ${stamp.rarity} ${resolvedTags.join(' ')} ${stamp.celebrationLabel ?? ''} ${stamp.sportDiscipline ?? ''}`.toLowerCase();
      return haystack.includes(q);
    }

    return true;
  });
}

export function filterStoreStamps(
  catalog: StampItem[],
  section: StoreSectionFilter,
  sportDiscipline: SportDisciplineFilter,
  searchQuery: string
): StampItem[] {
  const q = searchQuery.trim().toLowerCase();

  return catalog.filter((item) => {
    if (section === 'country' && item.category !== 'country') {
      return false;
    }
    if (section === 'sports') {
      if (item.category !== 'sports') return false;
      if (sportDiscipline !== 'all' && item.sportDiscipline !== sportDiscipline) {
        return false;
      }
    }

    if (q) {
      const haystack = `${item.title} ${item.country} ${item.athleteName ?? ''} ${item.celebrationLabel ?? ''} ${item.sportDiscipline ?? ''}`.toLowerCase();
      return haystack.includes(q);
    }

    return true;
  });
}

export interface PurchaseResult {
  success: boolean;
  reason?: 'already_owned' | 'insufficient_diamonds';
  stamps: StampItem[];
  diamondBalance: number;
  purchasedStamp?: StampItem;
}

export function purchaseStoreStamp(
  currentStamps: StampItem[],
  storeStamp: StampItem,
  diamondBalance: number,
  unlockedAt = 'Nov 2026',
  targetPocketId?: string
): PurchaseResult {
  const existing = currentStamps.find((s) => s.id === storeStamp.id);
  if (existing && existing.isUnlocked) {
    return {
      success: false,
      reason: 'already_owned',
      stamps: currentStamps,
      diamondBalance,
    };
  }

  const price = Math.max(0, storeStamp.priceDiamonds ?? 0);
  if (diamondBalance < price) {
    return {
      success: false,
      reason: 'insufficient_diamonds',
      stamps: currentStamps,
      diamondBalance,
    };
  }

  const ownedStamp: StampItem = ensureStampTags({
    ...storeStamp,
    pocketId: targetPocketId || storeStamp.pocketId || 'countries',
    isUnlocked: true,
    collectedCount: Math.max(1, storeStamp.collectedCount),
    unlockedAt,
    isDemoSeed: false,
  });

  const nextStamps = existing
    ? currentStamps.map((s) => (s.id === storeStamp.id ? ownedStamp : s))
    : [ownedStamp, ...currentStamps];

  return {
    success: true,
    stamps: nextStamps,
    diamondBalance: diamondBalance - price,
    purchasedStamp: ownedStamp,
  };
}

export function createCustomFolder(
  pockets: StampPocket[],
  title: string,
  tint: PocketTint,
  subtitle = 'Custom collector folder'
): { pocket: StampPocket; pockets: StampPocket[] } {
  const cleanTitle = title.trim().slice(0, 28) || 'New Folder';
  const slugBase = cleanTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'folder';
  let candidateId = `folder-${slugBase}`;
  let suffix = 2;
  while (pockets.some((p) => p.id === candidateId)) {
    candidateId = `folder-${slugBase}-${suffix}`;
    suffix += 1;
  }

  const pocket: StampPocket = {
    id: candidateId,
    title: cleanTitle,
    subtitle: subtitle.trim() || 'Custom collector folder',
    tint,
    category: 'rare',
    isCustomFolder: true,
  };

  return {
    pocket,
    pockets: [pocket, ...pockets],
  };
}

export function assignStampsToFolder(
  stamps: StampItem[],
  stampIds: string[],
  pocketId: string
): StampItem[] {
  if (stampIds.length === 0) return stamps;
  const targetSet = new Set(stampIds);
  return stamps.map((s) => (targetSet.has(s.id) ? { ...s, pocketId } : s));
}

export function getTodayDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function evaluateDailyMissions({
  stamps,
  pockets,
  claimedMissionIds,
}: {
  stamps: StampItem[];
  pockets: StampPocket[];
  claimedMissionIds: string[];
}): DailyTaskStatus[] {
  const claimed = new Set(claimedMissionIds);
  const hasFavorite = stamps.some((s) => s.isFavorite);
  const customFolders = pockets.filter((p) => p.isCustomFolder).length;

  return [
    {
      id: 'mission-daily-login',
      title: 'Log in daily',
      description: 'Open SnapStamps today to collect your daily diamond bonus.',
      rewardDiamonds: 5,
      progress: 1,
      target: 1,
      isComplete: true,
      isClaimed: claimed.has('mission-daily-login'),
    },
    {
      id: 'mission-favorite-stamp',
      title: 'Favorite a stamp',
      description: 'Tap the star icon on any stamp in your collection.',
      rewardDiamonds: 10,
      progress: hasFavorite ? 1 : 0,
      target: 1,
      isComplete: hasFavorite,
      isClaimed: claimed.has('mission-favorite-stamp'),
    },
    {
      id: 'mission-create-folder',
      title: 'Create a custom folder',
      description: 'Use the + icon on Home to organize your editions.',
      rewardDiamonds: 15,
      progress: customFolders >= 1 ? 1 : 0,
      target: 1,
      isComplete: customFolders >= 1,
      isClaimed: claimed.has('mission-create-folder'),
    },
  ];
}

export function evaluateDailyChallenges({
  stamps,
  posts,
  chatMessagesCount = 0,
  claimedChallengeIds,
}: {
  stamps: StampItem[];
  posts: SocialPost[];
  chatMessagesCount?: number;
  claimedChallengeIds: string[];
}): DailyTaskStatus[] {
  const claimed = new Set(claimedChallengeIds);
  const unlockedCount = stamps.filter((s) => s.isUnlocked).length;
  const userSharesCount = posts.filter((p) => !p.isDemoSeed).length + chatMessagesCount;

  return [
    {
      id: 'challenge-collect-stamp',
      title: 'Collect one new stamp',
      description: 'Unlock any Country or Sports Legend edition from Store or Studio.',
      rewardDiamonds: 10,
      progress: unlockedCount >= 1 ? 1 : 0,
      target: 1,
      isComplete: unlockedCount >= 1,
      isClaimed: claimed.has('challenge-collect-stamp'),
    },
    {
      id: 'challenge-share-post',
      title: 'Say hi or share in Circle',
      description: 'Send a message or stamp in the Travelers Circle chat.',
      rewardDiamonds: 15,
      progress: userSharesCount >= 1 ? 1 : 0,
      target: 1,
      isComplete: userSharesCount >= 1,
      isClaimed: claimed.has('challenge-share-post'),
    },
    {
      id: 'challenge-collector-trio',
      title: 'Curate three editions',
      description: 'Collect 3 unlocked stamps in your collection.',
      rewardDiamonds: 20,
      progress: Math.min(unlockedCount, 3),
      target: 3,
      isComplete: unlockedCount >= 3,
      isClaimed: claimed.has('challenge-collector-trio'),
    },
  ];
}

export function claimDailyTaskReward({
  task,
  claimedIds,
  diamondBalance,
}: {
  task: DailyTaskStatus;
  claimedIds: string[];
  diamondBalance: number;
}): {
  claimed: boolean;
  claimedIds: string[];
  diamondBalance: number;
  addedDiamonds: number;
} {
  if (!task.isComplete || task.isClaimed || claimedIds.includes(task.id)) {
    return {
      claimed: false,
      claimedIds,
      diamondBalance,
      addedDiamonds: 0,
    };
  }

  return {
    claimed: true,
    claimedIds: [...claimedIds, task.id],
    diamondBalance: diamondBalance + task.rewardDiamonds,
    addedDiamonds: task.rewardDiamonds,
  };
}

export function getPocketStampCount(stamps: StampItem[], pocketId: string): number {
  return stamps.filter((s) => s.pocketId === pocketId && s.isUnlocked).length;
}

export function getPocketStamps(stamps: StampItem[], pocketId: string): StampItem[] {
  return stamps.filter((s) => s.pocketId === pocketId);
}

export function toggleStampFavorite(stamps: StampItem[], stampId: string): StampItem[] {
  return stamps.map((s) => (s.id === stampId ? { ...s, isFavorite: !s.isFavorite } : s));
}

export function collectStamp(
  stamps: StampItem[],
  stampId: string,
  unlockedAt: string
): StampItem[] {
  return stamps.map((s) => {
    if (s.id !== stampId) return s;
    const nextCount = s.isUnlocked
      ? s.collectedCount
      : Math.min(s.totalInSet, s.collectedCount + 1);
    return {
      ...s,
      isUnlocked: true,
      collectedCount: nextCount,
      unlockedAt: s.unlockedAt ?? unlockedAt,
    };
  });
}

export function haversineDistanceKm(a: StampCoordinates, b: StampCoordinates): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return Math.round(2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

export function buildTravelArcs(stamps: StampItem[]): TravelArc[] {
  const unlocked = stamps.filter((s) => s.isUnlocked);
  if (unlocked.length < 2) return [];

  const arcs: TravelArc[] = [];
  for (let i = 0; i < unlocked.length - 1; i++) {
    const from = unlocked[i];
    const to = unlocked[i + 1];
    arcs.push({
      id: `arc-${from.id}-${to.id}`,
      fromStampId: from.id,
      toStampId: to.id,
      distanceKm: haversineDistanceKm(from.coordinates, to.coordinates),
      dateLabel: to.unlockedAt || '2026',
    });
  }
  return arcs;
}

export function getCollectionSummary(stamps: StampItem[]) {
  const unlocked = stamps.filter((s) => s.isUnlocked);
  const countries = new Set(unlocked.map((s) => s.country.trim().toLowerCase()));
  const rareCount = unlocked.filter((s) => s.rarity === 'rare' || s.rarity === 'legendary').length;
  const favoritesCount = stamps.filter((s) => s.isFavorite).length;

  return {
    totalStamps: stamps.length,
    unlockedCount: unlocked.length,
    countriesCount: countries.size,
    rareCount,
    favoritesCount,
  };
}

export function clearDemoItems(
  stamps: StampItem[],
  pockets: StampPocket[],
  posts: SocialPost[]
): { stamps: StampItem[]; pockets: StampPocket[]; posts: SocialPost[] } {
  const userStamps = stamps.filter((s) => !s.isDemoSeed);
  const userPosts = posts.filter((p) => !p.isDemoSeed);
  const cleanPockets = pockets.map((p) => ({ ...p, isDemoSeed: false }));
  return {
    stamps: userStamps,
    pockets: cleanPockets,
    posts: userPosts,
  };
}

export function getUnreadNotificationCount(notifications: AppNotification[]): number {
  return notifications.filter((n) => !n.isRead).length;
}

export function markNotificationRead(
  notifications: AppNotification[],
  id: string
): AppNotification[] {
  return notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
}

export function markAllNotificationsRead(
  notifications: AppNotification[]
): AppNotification[] {
  return notifications.map((n) => ({ ...n, isRead: true }));
}

export function filterChatThreads(
  threads: ChatThread[],
  filter: ChatFilterMode,
  searchQuery: string
): ChatThread[] {
  const q = searchQuery.trim().toLowerCase();
  return threads.filter((thread) => {
    if (filter === 'unread' && thread.unreadCount === 0) return false;
    if (filter === 'favorites' && !thread.isFavorite) return false;
    if (!q) return true;
    const lastText = thread.messages[thread.messages.length - 1]?.text ?? '';
    return (
      thread.name.toLowerCase().includes(q) ||
      thread.subtitle.toLowerCase().includes(q) ||
      lastText.toLowerCase().includes(q)
    );
  });
}

export function getChatInboxCounts(threads: ChatThread[]): {
  unreadThreadsCount: number;
  favoritesCount: number;
} {
  return {
    unreadThreadsCount: threads.filter((t) => t.unreadCount > 0).length,
    favoritesCount: threads.filter((t) => t.isFavorite).length,
  };
}

export function markChatThreadRead(threads: ChatThread[], threadId: string): ChatThread[] {
  return threads.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t));
}

export function toggleChatThreadFavorite(threads: ChatThread[], threadId: string): ChatThread[] {
  return threads.map((t) => (t.id === threadId ? { ...t, isFavorite: !t.isFavorite } : t));
}

export function transferDiamondsInChat(
  diamondBalance: number,
  amount: number
): {
  success: boolean;
  diamondBalance: number;
  reason?: 'invalid_amount' | 'insufficient_diamonds';
} {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, diamondBalance, reason: 'invalid_amount' };
  }
  if (diamondBalance < amount) {
    return { success: false, diamondBalance, reason: 'insufficient_diamonds' };
  }
  return {
    success: true,
    diamondBalance: diamondBalance - amount,
  };
}

export function sendChatThreadMessage(
  threads: ChatThread[],
  threadId: string,
  payload: {
    senderName: string;
    senderInitials: string;
    text: string;
    stampId?: string;
    diamondGiftAmount?: number;
    timestampLabel?: string;
  }
): ChatThread[] {
  const msg: ChatMessageItem = {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    senderId: 'self',
    senderName: payload.senderName,
    senderInitials: payload.senderInitials,
    senderTint: '#0A0A0A',
    isSelf: true,
    text: payload.text,
    timestampLabel: payload.timestampLabel ?? 'Just now',
    stampId: payload.stampId,
    diamondGiftAmount: payload.diamondGiftAmount,
  };

  return threads.map((t) => {
    if (t.id !== threadId) return t;
    return {
      ...t,
      unreadCount: 0,
      lastTimeLabel: 'Just now',
      messages: [...t.messages, msg],
    };
  });
}

export const STREAK_SHIELD_COST = 25;
export const MAX_STREAK_SHIELDS = 3;

interface StreakDayTemplate {
  day: number;
  title: string;
  subtitle: string;
  rewardDiamonds: number;
  grantsStampSection?: 'country' | 'sports';
  isGrandReward?: boolean;
}

const WEEKLY_STREAK_TEMPLATES: StreakDayTemplate[] = [
  {
    day: 1,
    title: 'Day 1',
    subtitle: 'Daily Kickoff Bonus',
    rewardDiamonds: 5,
  },
  {
    day: 2,
    title: 'Day 2',
    subtitle: 'Collector Momentum',
    rewardDiamonds: 10,
  },
  {
    day: 3,
    title: 'Day 3',
    subtitle: 'Mystery Country Stamp + Bonus',
    rewardDiamonds: 10,
    grantsStampSection: 'country',
  },
  {
    day: 4,
    title: 'Day 4',
    subtitle: 'Midweek Vault Boost',
    rewardDiamonds: 15,
  },
  {
    day: 5,
    title: 'Day 5',
    subtitle: 'Dedicated Explorer Bonus',
    rewardDiamonds: 15,
  },
  {
    day: 6,
    title: 'Day 6',
    subtitle: 'Pre-Finale Diamond Drop',
    rewardDiamonds: 20,
  },
  {
    day: 7,
    title: 'Day 7',
    subtitle: 'Guaranteed Sports Legend + Bonus',
    rewardDiamonds: 25,
    grantsStampSection: 'sports',
    isGrandReward: true,
  },
];

const STREAK_MILESTONE_TEMPLATES = [
  {
    id: 'milestone-7d',
    targetDays: 7,
    title: '7-Day Habit',
    subtitle: 'Complete your first full week climb',
    rewardDiamonds: 20,
  },
  {
    id: 'milestone-14d',
    targetDays: 14,
    title: '14-Day Explorer',
    subtitle: 'Two unbroken weeks of collecting',
    rewardDiamonds: 35,
  },
  {
    id: 'milestone-21d',
    targetDays: 21,
    title: '21-Day Curator',
    subtitle: 'Habit locked in across three weeks',
    rewardDiamonds: 50,
  },
  {
    id: 'milestone-30d',
    targetDays: 30,
    title: '30-Day Vault Master',
    subtitle: 'Full month collector mastery payout',
    rewardDiamonds: 100,
  },
];

export function getYesterdayDateKey(date = new Date()): string {
  const prev = new Date(date.getTime());
  prev.setDate(prev.getDate() - 1);
  return getTodayDateKey(prev);
}

export function createInitialStreakState(today = new Date()): StreakState {
  return {
    currentStreak: 2,
    bestStreak: 2,
    lastCheckInDate: getYesterdayDateKey(today),
    shields: 1,
    claimedMilestoneIds: [],
    totalCheckIns: 2,
  };
}

export function hasCheckedInToday(streakState: StreakState, todayKey: string): boolean {
  return streakState.lastCheckInDate === todayKey;
}

export function getActiveCycleDay(streakState: StreakState, todayKey: string): number {
  const checkedToday = hasCheckedInToday(streakState, todayKey);
  if (checkedToday) {
    return ((Math.max(1, streakState.currentStreak) - 1) % 7) + 1;
  }
  return (streakState.currentStreak % 7) + 1;
}

export function getStreakDaySteps(
  streakState: StreakState,
  todayKey: string
): StreakDayStep[] {
  const checkedToday = hasCheckedInToday(streakState, todayKey);
  const completedInCycle = checkedToday
    ? ((Math.max(1, streakState.currentStreak) - 1) % 7) + 1
    : streakState.currentStreak % 7;

  return WEEKLY_STREAK_TEMPLATES.map((tpl) => {
    let status: StreakDayStep['status'] = 'locked';
    if (tpl.day <= completedInCycle) {
      status = 'claimed';
    } else if (!checkedToday && tpl.day === completedInCycle + 1) {
      status = 'available';
    }
    return {
      ...tpl,
      status,
    };
  });
}

export function getStreakMilestones(streakState: StreakState): StreakMilestoneStep[] {
  const claimed = new Set(streakState.claimedMilestoneIds);
  const effectiveBest = Math.max(streakState.currentStreak, streakState.bestStreak);

  return STREAK_MILESTONE_TEMPLATES.map((tpl) => ({
    ...tpl,
    progress: Math.min(effectiveBest, tpl.targetDays),
    isUnlocked: effectiveBest >= tpl.targetDays,
    isClaimed: claimed.has(tpl.id),
  }));
}

export function claimDailyStreakCheckIn({
  streakState,
  stamps,
  storeCatalog,
  diamondBalance,
  todayKey,
  unlockedAtLabel = 'Nov 2026',
}: {
  streakState: StreakState;
  stamps: StampItem[];
  storeCatalog: StampItem[];
  diamondBalance: number;
  todayKey: string;
  unlockedAtLabel?: string;
}): {
  claimed: boolean;
  reason?: 'already_checked_in';
  streakState: StreakState;
  stamps: StampItem[];
  diamondBalance: number;
  addedDiamonds: number;
  claimedDay: number;
  rewardedStamp?: StampItem;
} {
  if (hasCheckedInToday(streakState, todayKey)) {
    return {
      claimed: false,
      reason: 'already_checked_in',
      streakState,
      stamps,
      diamondBalance,
      addedDiamonds: 0,
      claimedDay: getActiveCycleDay(streakState, todayKey),
    };
  }

  const nextStreak = streakState.currentStreak + 1;
  const cycleDay = ((nextStreak - 1) % 7) + 1;
  const template = WEEKLY_STREAK_TEMPLATES[cycleDay - 1] ?? WEEKLY_STREAK_TEMPLATES[0];

  let nextStamps = stamps;
  let rewardedStamp: StampItem | undefined;

  if (template.grantsStampSection) {
    const ownedIds = new Set(stamps.filter((s) => s.isUnlocked).map((s) => s.id));
    const candidates = storeCatalog.filter((item) => {
      if (ownedIds.has(item.id)) return false;
      if (template.grantsStampSection === 'country') return item.category === 'country';
      return item.category === 'sports';
    });
    const pick = candidates[0];
    if (pick) {
      const targetPocketId = pick.category === 'sports' ? 'sports-vault' : 'countries';
      rewardedStamp = ensureStampTags({
        ...pick,
        isUnlocked: true,
        collectedCount: Math.max(1, pick.collectedCount),
        unlockedAt: unlockedAtLabel,
        pocketId: targetPocketId,
        isDemoSeed: false,
      });
      const existsIdx = stamps.findIndex((s) => s.id === pick.id);
      if (existsIdx >= 0) {
        nextStamps = stamps.map((s) => (s.id === pick.id ? rewardedStamp! : s));
      } else {
        nextStamps = [rewardedStamp, ...stamps];
      }
    }
  }

  const nextState: StreakState = {
    ...streakState,
    currentStreak: nextStreak,
    bestStreak: Math.max(streakState.bestStreak, nextStreak),
    lastCheckInDate: todayKey,
    totalCheckIns: streakState.totalCheckIns + 1,
  };

  return {
    claimed: true,
    streakState: nextState,
    stamps: nextStamps,
    diamondBalance: diamondBalance + template.rewardDiamonds,
    addedDiamonds: template.rewardDiamonds,
    claimedDay: cycleDay,
    rewardedStamp,
  };
}

export function claimStreakMilestone({
  streakState,
  milestoneId,
  diamondBalance,
}: {
  streakState: StreakState;
  milestoneId: string;
  diamondBalance: number;
}): {
  claimed: boolean;
  streakState: StreakState;
  diamondBalance: number;
  addedDiamonds: number;
} {
  const milestone = getStreakMilestones(streakState).find((m) => m.id === milestoneId);
  if (!milestone || !milestone.isUnlocked || milestone.isClaimed) {
    return {
      claimed: false,
      streakState,
      diamondBalance,
      addedDiamonds: 0,
    };
  }

  return {
    claimed: true,
    streakState: {
      ...streakState,
      claimedMilestoneIds: [...streakState.claimedMilestoneIds, milestone.id],
    },
    diamondBalance: diamondBalance + milestone.rewardDiamonds,
    addedDiamonds: milestone.rewardDiamonds,
  };
}

export function buyStreakShield({
  streakState,
  diamondBalance,
}: {
  streakState: StreakState;
  diamondBalance: number;
}): {
  success: boolean;
  reason?: 'max_shields' | 'insufficient_diamonds';
  streakState: StreakState;
  diamondBalance: number;
} {
  if (streakState.shields >= MAX_STREAK_SHIELDS) {
    return { success: false, reason: 'max_shields', streakState, diamondBalance };
  }
  if (diamondBalance < STREAK_SHIELD_COST) {
    return { success: false, reason: 'insufficient_diamonds', streakState, diamondBalance };
  }
  return {
    success: true,
    streakState: {
      ...streakState,
      shields: streakState.shields + 1,
    },
    diamondBalance: diamondBalance - STREAK_SHIELD_COST,
  };
}

export function formatStampLocationLabel(
  stamp: Pick<StampItem, 'city' | 'country'>
): string {
  const city = stamp.city.trim();
  const country = stamp.country.trim();
  if (city && country && city.toLowerCase() !== country.toLowerCase()) {
    return `${city}, ${country}`;
  }
  return city || country || 'World Collection';
}

export function formatStampRarityLabel(rarity: StampRarity): string {
  if (rarity === 'legendary') return 'Legendary';
  if (rarity === 'rare') return 'Rare';
  return 'Common';
}

export function formatStampCategoryLabel(category: StampCategory): string {
  if (category === 'sports') return 'Sports';
  if (category === 'landmark') return 'Landmark';
  if (category === 'city') return 'City';
  return 'Country';
}

export function buildDefaultShareCaption(
  stamp: StampItem,
  folderTitle?: string
): string {
  const location = formatStampLocationLabel(stamp);
  const cleanFolder = folderTitle?.trim();

  if (stamp.category === 'sports' && stamp.celebrationLabel) {
    return `Collected ${stamp.title} (${stamp.celebrationLabel}) in ${cleanFolder || 'Sports Legends'}.`;
  }

  const normalizedTitle = stamp.title.trim().toLowerCase();
  const normalizedLocation = location.toLowerCase();
  if (
    normalizedTitle === normalizedLocation ||
    normalizedLocation.includes(normalizedTitle)
  ) {
    return `Added ${stamp.title} (${formatStampRarityLabel(stamp.rarity)}) to ${
      cleanFolder ? `my ${cleanFolder} folder` : 'my collection'
    }.`;
  }

  return `Collected ${stamp.title} from ${location}${
    cleanFolder ? ` in ${cleanFolder}` : ''
  }.`;
}

export function createSocialPostFromStamp({
  stamp,
  userProfile,
  caption,
  folderTitle,
  postId,
  timestampLabel = 'Just now',
}: {
  stamp: StampItem;
  userProfile: Pick<UserProfile, 'name' | 'handle' | 'initials'>;
  caption?: string;
  folderTitle?: string;
  postId?: string;
  timestampLabel?: string;
}): SocialPost {
  const cleanFolder = folderTitle?.trim() || formatStampCategoryLabel(stamp.category);
  const trimmedCaption = caption?.trim() ?? '';
  const finalCaption =
    trimmedCaption.length > 0
      ? trimmedCaption
      : buildDefaultShareCaption(stamp, cleanFolder);

  return {
    id: postId ?? `post-${Date.now()}`,
    authorName: userProfile.name,
    authorHandle: userProfile.handle,
    authorInitials: userProfile.initials,
    authorTint: '#0A0A0A',
    stampId: stamp.id,
    stampTitle: stamp.title,
    stampCountry: stamp.country,
    stampCity: stamp.city,
    stampCategory: stamp.category,
    stampRarity: stamp.rarity,
    stampTags: getStampTags(stamp),
    folderTitle: cleanFolder,
    caption: finalCaption,
    locationLabel: formatStampLocationLabel(stamp),
    timestampLabel,
    likesCount: 1,
    isLiked: true,
    isSaved: false,
    isDemoSeed: false,
  };
}


