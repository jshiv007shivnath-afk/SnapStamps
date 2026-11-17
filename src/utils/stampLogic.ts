import type {
  AppNotification,
  CollectionFilter,
  DailyTaskStatus,
  PocketTint,
  SocialPost,
  SportDisciplineFilter,
  StampCoordinates,
  StampItem,
  StampPocket,
  StoreSectionFilter,
  TravelArc,
} from '../types/stamp';

export function filterStamps(
  stamps: StampItem[],
  filter: CollectionFilter,
  searchQuery: string,
  pocketId?: string | null
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

    if (q) {
      const haystack = `${stamp.title} ${stamp.city} ${stamp.country} ${stamp.category} ${stamp.rarity} ${stamp.celebrationLabel ?? ''} ${stamp.sportDiscipline ?? ''}`.toLowerCase();
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

  const ownedStamp: StampItem = {
    ...storeStamp,
    pocketId: targetPocketId || storeStamp.pocketId || 'countries',
    isUnlocked: true,
    collectedCount: Math.max(1, storeStamp.collectedCount),
    unlockedAt,
    isDemoSeed: false,
  };

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
      rewardDiamonds: 150,
      progress: 1,
      target: 1,
      isComplete: true,
      isClaimed: claimed.has('mission-daily-login'),
    },
    {
      id: 'mission-favorite-stamp',
      title: 'Favorite a stamp',
      description: 'Tap the star icon on any stamp in your collection.',
      rewardDiamonds: 100,
      progress: hasFavorite ? 1 : 0,
      target: 1,
      isComplete: hasFavorite,
      isClaimed: claimed.has('mission-favorite-stamp'),
    },
    {
      id: 'mission-create-folder',
      title: 'Create a custom folder',
      description: 'Use the + icon on Home to organize your editions.',
      rewardDiamonds: 120,
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
  claimedChallengeIds,
}: {
  stamps: StampItem[];
  posts: SocialPost[];
  claimedChallengeIds: string[];
}): DailyTaskStatus[] {
  const claimed = new Set(claimedChallengeIds);
  const unlockedCount = stamps.filter((s) => s.isUnlocked).length;
  const userPostsCount = posts.filter((p) => !p.isDemoSeed).length;

  return [
    {
      id: 'challenge-collect-stamp',
      title: 'Collect one new stamp',
      description: 'Unlock any Country or Sports Legend edition from Store or Studio.',
      rewardDiamonds: 200,
      progress: unlockedCount >= 1 ? 1 : 0,
      target: 1,
      isComplete: unlockedCount >= 1,
      isClaimed: claimed.has('challenge-collect-stamp'),
    },
    {
      id: 'challenge-share-post',
      title: 'Share a post',
      description: 'Publish a stamp story to the Travelers Circle feed.',
      rewardDiamonds: 150,
      progress: userPostsCount >= 1 ? 1 : 0,
      target: 1,
      isComplete: userPostsCount >= 1,
      isClaimed: claimed.has('challenge-share-post'),
    },
    {
      id: 'challenge-collector-trio',
      title: 'Curate three editions',
      description: 'Build a showcase with 3 unlocked stamps in your passport.',
      rewardDiamonds: 300,
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

