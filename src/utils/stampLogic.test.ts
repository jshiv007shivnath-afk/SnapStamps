import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assignStampsToFolder,
  buildDefaultShareCaption,
  buildTravelArcs,
  buyStreakShield,
  claimDailyStreakCheckIn,
  claimDailyTaskReward,
  claimStreakMilestone,
  clearDemoItems,
  collectStamp,
  createCustomFolder,
  createInitialStreakState,
  createSocialPostFromStamp,
  evaluateDailyChallenges,
  evaluateDailyMissions,
  filterChatThreads,
  filterStamps,
  filterStoreStamps,
  formatStampLocationLabel,
  getChatInboxCounts,
  getCollectionSummary,
  getStreakDaySteps,
  getStreakMilestones,
  getUnreadNotificationCount,
  haversineDistanceKm,
  markAllNotificationsRead,
  markChatThreadRead,
  markNotificationRead,
  purchaseStoreStamp,
  sendChatThreadMessage,
  toggleChatThreadFavorite,
  toggleStampFavorite,
  transferDiamondsInChat,
} from './stampLogic';
import {
  DEFAULT_CHAT_THREADS,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_SETTINGS,
  DEMO_POSTS,
  DEMO_STAMPS,
} from '../data/seedData';
import {
  STORE_COUNTRY_STAMPS,
  STORE_CRICKET_STAMPS,
  STORE_FOOTBALL_STAMPS,
} from '../data/storeCatalog';
import type { SocialPost, StampItem, StampPocket } from '../types/stamp';

const sampleStamps: StampItem[] = [
  {
    id: 'india-stamp',
    title: 'India',
    country: 'India',
    city: 'Agra',
    category: 'country',
    rarity: 'common',
    collectedCount: 1,
    totalInSet: 15,
    isFavorite: false,
    isUnlocked: true,
    coordinates: { lat: 27.1751, lng: 78.0421 },
    imageUrl: '/a.jpg',
    accentColor: '#F3BE7A',
    bannerColor: '#B45309',
    pocketId: 'countries',
    description: 'Taj Mahal marble domes',
    isDemoSeed: false,
  },
  {
    id: 'switzerland-stamp',
    title: 'Switzerland',
    country: 'Switzerland',
    city: 'Zermatt',
    category: 'country',
    rarity: 'rare',
    collectedCount: 1,
    totalInSet: 12,
    isFavorite: true,
    isUnlocked: true,
    coordinates: { lat: 46.0207, lng: 7.7491 },
    imageUrl: '/b.jpg',
    accentColor: '#E5957A',
    bannerColor: '#991B1B',
    pocketId: 'countries',
    description: 'Glacier Express under the Matterhorn',
    isDemoSeed: false,
  },
  {
    id: 'kyoto-custom',
    title: 'Kyoto',
    country: 'Japan',
    city: 'Kyoto',
    category: 'landmark',
    rarity: 'legendary',
    collectedCount: 1,
    totalInSet: 10,
    isFavorite: false,
    isUnlocked: false,
    coordinates: { lat: 34.9671, lng: 135.7727 },
    imageUrl: '/c.jpg',
    accentColor: '#F59E0B',
    bannerColor: '#B45309',
    pocketId: 'landmarks',
    description: 'Fushimi Inari',
    isCustomGenerated: true,
    isDemoSeed: false,
  },
];

const sampleStoreCatalog: StampItem[] = [
  {
    id: 'store-switzerland',
    title: 'Switzerland',
    country: 'Switzerland',
    city: 'Zermatt',
    category: 'country',
    rarity: 'rare',
    collectedCount: 0,
    totalInSet: 12,
    isFavorite: false,
    isUnlocked: false,
    coordinates: { lat: 46.0207, lng: 7.7491 },
    imageUrl: '/swiss.jpg',
    accentColor: '#D97757',
    bannerColor: '#991B1B',
    pocketId: 'countries',
    description: 'Matterhorn Alpine Express',
    priceDiamonds: 220,
  },
  {
    id: 'store-kohli',
    title: 'Virat Kohli',
    country: 'India',
    city: 'Mumbai',
    category: 'sports',
    sportDiscipline: 'cricket',
    athleteName: 'Virat Kohli',
    celebrationLabel: 'Century Roar',
    jerseyNumber: '18',
    rarity: 'legendary',
    collectedCount: 0,
    totalInSet: 1,
    isFavorite: false,
    isUnlocked: false,
    coordinates: { lat: 18.9389, lng: 72.8258 },
    imageUrl: '/kohli.jpg',
    accentColor: '#60A5FA',
    bannerColor: '#1E3A8A',
    pocketId: 'rare',
    description: 'Iconic bat-raised roar under stadium floodlights.',
    priceDiamonds: 550,
  },
  {
    id: 'store-messi',
    title: 'Lionel Messi',
    country: 'Argentina',
    city: 'Buenos Aires',
    category: 'sports',
    sportDiscipline: 'football',
    athleteName: 'Lionel Messi',
    celebrationLabel: 'Sky Tribute',
    jerseyNumber: '10',
    rarity: 'legendary',
    collectedCount: 0,
    totalInSet: 1,
    isFavorite: false,
    isUnlocked: false,
    coordinates: { lat: -34.6037, lng: -58.3816 },
    imageUrl: '/messi.jpg',
    accentColor: '#7DD3FC',
    bannerColor: '#0369A1',
    pocketId: 'rare',
    description: 'Two-finger skyward goal dedication.',
    priceDiamonds: 600,
  },
];

test('initial seed removes old pre-seeded travel stamps and posts', () => {
  assert.equal(DEMO_STAMPS.length, 0);
  assert.equal(DEMO_POSTS.length, 0);
});

test('filterStamps filters by favorites, rare, national, and search query', () => {
  assert.equal(filterStamps(sampleStamps, 'all', '').length, 3);
  assert.equal(filterStamps(sampleStamps, 'favorites', '').map((s) => s.id).join(','), 'switzerland-stamp');
  assert.equal(filterStamps(sampleStamps, 'rare', '').map((s) => s.id).join(','), 'switzerland-stamp,kyoto-custom');
  assert.equal(filterStamps(sampleStamps, 'national', '').map((s) => s.id).join(','), 'india-stamp,switzerland-stamp');
  assert.equal(filterStamps(sampleStamps, 'all', 'kyoto').map((s) => s.id).join(','), 'kyoto-custom');
});

test('filterStoreStamps separates country, cricket, and football legends cleanly', () => {
  assert.equal(filterStoreStamps(sampleStoreCatalog, 'all', 'all', '').length, 3);
  assert.equal(filterStoreStamps(sampleStoreCatalog, 'country', 'all', '').map((s) => s.id).join(','), 'store-switzerland');
  assert.equal(filterStoreStamps(sampleStoreCatalog, 'sports', 'all', '').length, 2);
  assert.equal(filterStoreStamps(sampleStoreCatalog, 'sports', 'cricket', '').map((s) => s.id).join(','), 'store-kohli');
  assert.equal(filterStoreStamps(sampleStoreCatalog, 'sports', 'football', '').map((s) => s.id).join(','), 'store-messi');
});

test('purchaseStoreStamp deducts golden diamonds, assigns folder, and prevents double buy or overdraft', () => {
  const buyKohli = purchaseStoreStamp(sampleStamps, sampleStoreCatalog[1], 1000, 'Nov 2026', 'folder-cricket');
  assert.equal(buyKohli.success, true);
  assert.equal(buyKohli.diamondBalance, 450);
  const ownedKohli = buyKohli.stamps.find((s) => s.id === 'store-kohli');
  assert.equal(ownedKohli?.isUnlocked, true);
  assert.equal(ownedKohli?.pocketId, 'folder-cricket');
  assert.equal(ownedKohli?.celebrationLabel, 'Century Roar');

  const doubleBuy = purchaseStoreStamp(buyKohli.stamps, sampleStoreCatalog[1], buyKohli.diamondBalance);
  assert.equal(doubleBuy.success, false);
  assert.equal(doubleBuy.reason, 'already_owned');
  assert.equal(doubleBuy.diamondBalance, 450);

  const insufficient = purchaseStoreStamp(buyKohli.stamps, sampleStoreCatalog[2], 450);
  assert.equal(insufficient.success, false);
  assert.equal(insufficient.reason, 'insufficient_diamonds');
  assert.equal(insufficient.diamondBalance, 450);
});

test('createCustomFolder and assignStampsToFolder organize stamps into custom folders', () => {
  const basePockets: StampPocket[] = [
    { id: 'countries', title: 'Countries', subtitle: 'National', tint: 'amber', category: 'country' },
  ];
  const created = createCustomFolder(basePockets, 'Cricket Vault', 'sky');
  assert.equal(created.pocket.isCustomFolder, true);
  assert.equal(created.pocket.title, 'Cricket Vault');
  assert.equal(created.pockets.length, 2);

  const reassigned = assignStampsToFolder(sampleStamps, ['india-stamp'], created.pocket.id);
  assert.equal(reassigned.find((s) => s.id === 'india-stamp')?.pocketId, created.pocket.id);
});

test('Daily Missions and Daily Challenges evaluate progress and claim diamond rewards once', () => {
  const customPockets: StampPocket[] = [
    { id: 'folder-cricket', title: 'Cricket', subtitle: 'Custom', tint: 'sky', category: 'rare', isCustomFolder: true },
  ];
  const missions = evaluateDailyMissions({
    stamps: sampleStamps,
    pockets: customPockets,
    claimedMissionIds: [],
  });
  const loginMission = missions.find((m) => m.id === 'mission-daily-login')!;
  const favMission = missions.find((m) => m.id === 'mission-favorite-stamp')!;
  assert.equal(loginMission.isComplete, true);
  assert.equal(favMission.isComplete, true);

  assert.equal(loginMission.rewardDiamonds, 5);
  const claimLogin = claimDailyTaskReward({
    task: loginMission,
    claimedIds: [],
    diamondBalance: 1500,
  });
  assert.equal(claimLogin.claimed, true);
  assert.equal(claimLogin.diamondBalance, 1505);

  const posts: SocialPost[] = [
    {
      id: 'user-post-1',
      authorName: 'Leni Coper',
      authorHandle: '@leni',
      authorInitials: 'LC',
      authorTint: '#0A0A0A',
      stampId: 'india-stamp',
      caption: 'Unlocked India!',
      locationLabel: 'Agra · India',
      timestampLabel: 'Just now',
      likesCount: 1,
      isLiked: true,
      isSaved: false,
      isDemoSeed: false,
    },
  ];
  const challenges = evaluateDailyChallenges({
    stamps: sampleStamps,
    posts,
    claimedChallengeIds: [],
  });
  const collectChallenge = challenges.find((c) => c.id === 'challenge-collect-stamp')!;
  const shareChallenge = challenges.find((c) => c.id === 'challenge-share-post')!;
  assert.equal(collectChallenge.isComplete, true);
  assert.equal(shareChallenge.isComplete, true);
  assert.equal(collectChallenge.rewardDiamonds, 10);
  assert.equal(shareChallenge.rewardDiamonds, 15);

  const claimCollect = claimDailyTaskReward({
    task: collectChallenge,
    claimedIds: [],
    diamondBalance: 1505,
  });
  assert.equal(claimCollect.claimed, true);
  assert.equal(claimCollect.diamondBalance, 1515);

  // Double-claim rejected
  const updatedChallenges = evaluateDailyChallenges({
    stamps: sampleStamps,
    posts,
    claimedChallengeIds: claimCollect.claimedIds,
  });
  const doubleClaim = claimDailyTaskReward({
    task: updatedChallenges.find((c) => c.id === 'challenge-collect-stamp')!,
    claimedIds: claimCollect.claimedIds,
    diamondBalance: claimCollect.diamondBalance,
  });
  assert.equal(doubleClaim.claimed, false);
  assert.equal(doubleClaim.diamondBalance, 1515);
});

test('toggleStampFavorite flips favorite flag deterministically', () => {
  const toggled = toggleStampFavorite(sampleStamps, 'india-stamp');
  assert.equal(toggled.find((s) => s.id === 'india-stamp')?.isFavorite, true);
  assert.equal(toggled.find((s) => s.id === 'switzerland-stamp')?.isFavorite, true);
});

test('collectStamp unlocks locked stamp and increments collected count once', () => {
  const unlocked = collectStamp(sampleStamps, 'kyoto-custom', 'Nov 2026');
  const kyoto = unlocked.find((s) => s.id === 'kyoto-custom');
  assert.equal(kyoto?.isUnlocked, true);
  assert.equal(kyoto?.collectedCount, 2);
  assert.equal(kyoto?.unlockedAt, 'Nov 2026');

  const alreadyUnlocked = collectStamp(unlocked, 'kyoto-custom', 'Dec 2026');
  assert.equal(alreadyUnlocked.find((s) => s.id === 'kyoto-custom')?.collectedCount, 2);
});

test('haversineDistanceKm and buildTravelArcs compute accurate routes', () => {
  const km = haversineDistanceKm({ lat: 40.4168, lng: -3.7038 }, { lat: 38.9067, lng: 1.4206 });
  assert.ok(km > 440 && km < 490, `Expected ~470km between Madrid and Ibiza, got ${km}`);

  const arcs = buildTravelArcs(sampleStamps);
  assert.equal(arcs.length, 1);
  assert.equal(arcs[0].fromStampId, 'india-stamp');
  assert.equal(arcs[0].toStampId, 'switzerland-stamp');
});

test('getCollectionSummary aggregates unlocked, countries, and rare counts', () => {
  const summary = getCollectionSummary(sampleStamps);
  assert.equal(summary.totalStamps, 3);
  assert.equal(summary.unlockedCount, 2);
  assert.equal(summary.countriesCount, 2);
  assert.equal(summary.rareCount, 1);
  assert.equal(summary.favoritesCount, 1);
});

test('clearDemoItems strips seed stamps and posts while keeping user custom stamps', () => {
  const pockets: StampPocket[] = [
    { id: 'cities', title: 'Cities', subtitle: 'Urban gems', tint: 'amber', category: 'city', isDemoSeed: true },
  ];
  const posts: SocialPost[] = [
    {
      id: 'p1',
      authorName: 'Leni',
      authorHandle: '@leni',
      authorInitials: 'LC',
      authorTint: '#F59E0B',
      stampId: 'india-stamp',
      caption: 'Sunset!',
      locationLabel: 'Agra · India',
      timestampLabel: '2h ago',
      likesCount: 4,
      isLiked: false,
      isSaved: false,
      isDemoSeed: true,
    },
  ];
  const mixedStamps: StampItem[] = [
    ...sampleStamps,
    { ...sampleStamps[0], id: 'legacy-demo', isDemoSeed: true },
  ];
  const cleared = clearDemoItems(mixedStamps, pockets, posts);
  assert.equal(cleared.stamps.length, 3);
  assert.equal(cleared.posts.length, 0);
  assert.equal(cleared.pockets.length, 1);
});

test('DEFAULT_NOTIFICATIONS and notification read helpers track unread counts', () => {
  assert.ok(DEFAULT_NOTIFICATIONS.some((n) => n.category === 'release'));
  assert.ok(DEFAULT_NOTIFICATIONS.some((n) => n.category === 'store'));
  assert.ok(DEFAULT_NOTIFICATIONS.some((n) => n.category === 'event'));
  assert.equal(DEFAULT_SETTINGS.hapticsEnabled, true);

  const initialUnread = getUnreadNotificationCount(DEFAULT_NOTIFICATIONS);
  assert.equal(initialUnread, DEFAULT_NOTIFICATIONS.length);

  const oneRead = markNotificationRead(DEFAULT_NOTIFICATIONS, DEFAULT_NOTIFICATIONS[0].id);
  assert.equal(getUnreadNotificationCount(oneRead), initialUnread - 1);

  const allRead = markAllNotificationsRead(oneRead);
  assert.equal(getUnreadNotificationCount(allRead), 0);
});

test('store catalog provides 50 stamps per section with accurate Kohli #18 and Rohit #45 jerseys', () => {
  assert.equal(STORE_COUNTRY_STAMPS.length, 50);
  assert.equal(STORE_CRICKET_STAMPS.length, 50);
  assert.equal(STORE_FOOTBALL_STAMPS.length, 50);

  const kohli = STORE_CRICKET_STAMPS.find((s) => s.id === 'store-kohli');
  const rohit = STORE_CRICKET_STAMPS.find((s) => s.id === 'store-rohit');
  assert.equal(kohli?.jerseyNumber, '18');
  assert.equal(rohit?.jerseyNumber, '45');
  assert.ok(kohli?.imageUrl.includes('18'));
  assert.ok(rohit?.imageUrl.includes('45'));
});

test('chat inbox filtering, thread messaging, read/favorite toggles, and diamond transfers', () => {
  const counts = getChatInboxCounts(DEFAULT_CHAT_THREADS);
  assert.ok(counts.unreadThreadsCount >= 4);
  assert.ok(counts.favoritesCount >= 4);

  const unreadOnly = filterChatThreads(DEFAULT_CHAT_THREADS, 'unread', '');
  assert.ok(unreadOnly.every((t) => t.unreadCount > 0));

  const searchMatches = filterChatThreads(DEFAULT_CHAT_THREADS, 'all', 'aarav');
  assert.equal(searchMatches.length, 1);
  assert.equal(searchMatches[0].id, 'thread-aarav');

  const markedRead = markChatThreadRead(DEFAULT_CHAT_THREADS, 'thread-aarav');
  assert.equal(markedRead.find((t) => t.id === 'thread-aarav')?.unreadCount, 0);

  const toggledFav = toggleChatThreadFavorite(markedRead, 'thread-meera');
  assert.equal(toggledFav.find((t) => t.id === 'thread-meera')?.isFavorite, true);

  const okTransfer = transferDiamondsInChat(200, 25);
  assert.equal(okTransfer.success, true);
  assert.equal(okTransfer.diamondBalance, 175);

  const badTransfer = transferDiamondsInChat(10, 25);
  assert.equal(badTransfer.success, false);
  assert.equal(badTransfer.reason, 'insufficient_diamonds');

  const updatedThreads = sendChatThreadMessage(toggledFav, 'thread-aarav', {
    senderName: 'Leni Coper',
    senderInitials: 'LC',
    text: '',
    diamondGiftAmount: 25,
  });
  const aaravMessages = updatedThreads.find((t) => t.id === 'thread-aarav')?.messages ?? [];
  assert.equal(aaravMessages[aaravMessages.length - 1]?.diamondGiftAmount, 25);
});

test('Streak Ladder check-in awards Day 3 Mystery Country stamp, blocks duplicate same-day claim, unlocks milestones, and buys shields', () => {
  const todayKey = '2026-11-19';
  const initial = createInitialStreakState(new Date('2026-11-19T10:00:00Z'));
  assert.equal(initial.currentStreak, 2);

  const stepsBefore = getStreakDaySteps(initial, todayKey);
  assert.equal(stepsBefore.length, 7);
  assert.equal(stepsBefore[0].status, 'claimed');
  assert.equal(stepsBefore[1].status, 'claimed');
  assert.equal(stepsBefore[2].status, 'available');
  assert.equal(stepsBefore[3].status, 'locked');

  const claimRes = claimDailyStreakCheckIn({
    streakState: initial,
    stamps: [],
    storeCatalog: sampleStoreCatalog,
    diamondBalance: 100,
    todayKey,
  });
  assert.equal(claimRes.claimed, true);
  assert.equal(claimRes.claimedDay, 3);
  assert.equal(claimRes.streakState.currentStreak, 3);
  assert.equal(claimRes.diamondBalance, 110);
  assert.equal(claimRes.rewardedStamp?.id, 'store-switzerland');
  assert.equal(claimRes.stamps.length, 1);

  const dupClaim = claimDailyStreakCheckIn({
    streakState: claimRes.streakState,
    stamps: claimRes.stamps,
    storeCatalog: sampleStoreCatalog,
    diamondBalance: claimRes.diamondBalance,
    todayKey,
  });
  assert.equal(dupClaim.claimed, false);
  assert.equal(dupClaim.reason, 'already_checked_in');

  const weekReachedState = { ...claimRes.streakState, currentStreak: 7, bestStreak: 7 };
  const milestones = getStreakMilestones(weekReachedState);
  assert.equal(milestones[0].isUnlocked, true);
  assert.equal(milestones[1].isUnlocked, false);

  const claimedM7 = claimStreakMilestone({
    streakState: weekReachedState,
    milestoneId: 'milestone-7d',
    diamondBalance: 110,
  });
  assert.equal(claimedM7.claimed, true);
  assert.equal(claimedM7.diamondBalance, 130);

  const shieldOk = buyStreakShield({
    streakState: claimedM7.streakState,
    diamondBalance: claimedM7.diamondBalance,
  });
  assert.equal(shieldOk.success, true);
  assert.equal(shieldOk.streakState.shields, 2);
  assert.equal(shieldOk.diamondBalance, 105);

  const shieldOverMax = buyStreakShield({
    streakState: { ...shieldOk.streakState, shields: 3 },
    diamondBalance: 500,
  });
  assert.equal(shieldOverMax.success, false);
  assert.equal(shieldOverMax.reason, 'max_shields');
});

test('createSocialPostFromStamp includes structured metadata, deduplicated location, and default/custom captions', () => {
  const userProfile = {
    name: 'Leni Coper',
    handle: '@leni.collector',
    initials: 'LC',
  };

  // Distinct city and country
  assert.equal(formatStampLocationLabel(sampleStamps[0]), 'Agra, India');

  // Matching city and country deduplication
  assert.equal(
    formatStampLocationLabel({ city: 'Singapore', country: 'Singapore' }),
    'Singapore'
  );

  const defaultCaption = buildDefaultShareCaption(sampleStamps[0], 'Countries');
  assert.equal(
    defaultCaption,
    'Added India (Common) to my Countries folder.'
  );

  // Blank caption falls back to auto-generated metadata caption
  const autoPost = createSocialPostFromStamp({
    stamp: sampleStamps[0],
    userProfile,
    caption: '   ',
    folderTitle: 'Countries',
    postId: 'post-auto-1',
  });
  assert.equal(autoPost.id, 'post-auto-1');
  assert.equal(autoPost.stampId, 'india-stamp');
  assert.equal(autoPost.stampTitle, 'India');
  assert.equal(autoPost.stampCountry, 'India');
  assert.equal(autoPost.stampCity, 'Agra');
  assert.equal(autoPost.stampCategory, 'country');
  assert.equal(autoPost.stampRarity, 'common');
  assert.equal(autoPost.folderTitle, 'Countries');
  assert.equal(autoPost.locationLabel, 'Agra, India');
  assert.equal(autoPost.caption, 'Added India (Common) to my Countries folder.');
  assert.equal(autoPost.isLiked, true);
  assert.equal(autoPost.likesCount, 1);

  // Custom caption + sports stamp metadata
  const kohliStamp = STORE_CRICKET_STAMPS.find((s) => s.id === 'store-kohli')!;
  const customPost = createSocialPostFromStamp({
    stamp: kohliStamp,
    userProfile,
    caption: '  Unboxed this legend from my streak drop.  ',
    folderTitle: 'Sports Legends',
    postId: 'post-custom-2',
  });
  assert.equal(customPost.caption, 'Unboxed this legend from my streak drop.');
  assert.equal(customPost.stampRarity, kohliStamp.rarity);
  assert.equal(customPost.stampCategory, 'sports');
  assert.equal(customPost.folderTitle, 'Sports Legends');
  assert.equal(customPost.locationLabel, formatStampLocationLabel(kohliStamp));
  assert.ok(Array.isArray(customPost.stampTags) && customPost.stampTags.includes('Culture'));
});

test('filterStamps filters by automated themeTag and purchaseStoreStamp auto-tags new stamps', () => {
  const switzerland = sampleStoreCatalog.find((s) => s.id === 'store-switzerland')!;
  const purchase = purchaseStoreStamp([], switzerland, 500);
  assert.equal(purchase.success, true);
  assert.ok(purchase.purchasedStamp?.tags?.includes('Nature'));

  const combined = [...sampleStamps, purchase.purchasedStamp!];
  const natureOnly = filterStamps(combined, 'all', '', null, 'Nature');
  assert.ok(natureOnly.some((s) => s.id === 'store-switzerland'));
  assert.ok(!natureOnly.some((s) => s.id === 'india-stamp'));

  const historicalOnly = filterStamps(combined, 'all', '', null, 'Historical');
  assert.ok(historicalOnly.some((s) => s.id === 'india-stamp'));

  const searchByTag = filterStamps(combined, 'all', 'nature');
  assert.ok(searchByTag.some((s) => s.id === 'store-switzerland'));
});




