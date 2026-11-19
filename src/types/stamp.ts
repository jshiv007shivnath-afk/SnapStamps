export type AppTab =
  | 'library'
  | 'streaks'
  | 'stamps'
  | 'feed'
  | 'profile'
  | 'globe'
  | 'store'
  | 'notifications'
  | 'settings'
  | 'edit-profile';

export type CollectionFilter = 'all' | 'national' | 'favorites' | 'rare';

export type ChatFilterMode = 'all' | 'unread' | 'favorites' | 'finds';

export type StoreSectionFilter = 'all' | 'country' | 'sports';

export type SportDisciplineFilter = 'all' | 'cricket' | 'football';

export type StampCategory = 'country' | 'city' | 'landmark' | 'sports';

export type StampThemeTag = 'Nature' | 'Urban' | 'Culture' | 'Historical';

export type StampRarity = 'common' | 'rare' | 'legendary';

export type PocketTint = 'amber' | 'sage' | 'coral' | 'sky';

export interface StampCoordinates {
  lat: number;
  lng: number;
}

export interface UserProfile {
  name: string;
  handle: string;
  email: string;
  initials: string;
  passportCode: string;
  memberSince: string;
}

export interface StampItem {
  id: string;
  title: string;
  country: string;
  city: string;
  category: StampCategory;
  rarity: StampRarity;
  collectedCount: number;
  totalInSet: number;
  isFavorite: boolean;
  isUnlocked: boolean;
  coordinates: StampCoordinates;
  imageUrl: string;
  accentColor: string;
  bannerColor: string;
  pocketId: string;
  description: string;
  unlockedAt?: string;
  isCustomGenerated?: boolean;
  isDemoSeed?: boolean;
  // Store & Sports Legend collector fields
  sportDiscipline?: 'cricket' | 'football';
  athleteName?: string;
  celebrationLabel?: string;
  jerseyNumber?: string;
  priceDiamonds?: number;
  // Automated location-derived theme tags
  tags?: StampThemeTag[];
}

export interface StampPocket {
  id: string;
  title: string;
  subtitle: string;
  tint: PocketTint;
  category: StampCategory | 'rare';
  isDemoSeed?: boolean;
  isCustomFolder?: boolean;
}

export interface TravelArc {
  id: string;
  fromStampId: string;
  toStampId: string;
  distanceKm: number;
  dateLabel: string;
}

export interface SocialPost {
  id: string;
  authorName: string;
  authorHandle: string;
  authorInitials: string;
  authorTint: string;
  stampId: string;
  stampTitle?: string;
  stampCountry?: string;
  stampCity?: string;
  stampCategory?: StampCategory;
  stampRarity?: StampRarity;
  stampTags?: StampThemeTag[];
  folderTitle?: string;
  caption: string;
  locationLabel: string;
  timestampLabel: string;
  likesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  isDemoSeed?: boolean;
}

export interface PlaceCandidate {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  categoryLabel: string;
}

export interface DailyTaskStatus {
  id: string;
  title: string;
  description: string;
  rewardDiamonds: number;
  progress: number;
  target: number;
  isComplete: boolean;
  isClaimed: boolean;
}

export type NotificationCategory = 'release' | 'store' | 'event' | 'system';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestampLabel: string;
  isRead: boolean;
  actionLabel?: string;
  targetTab?: AppTab;
}

export interface AppSettings {
  hapticsEnabled: boolean;
  releaseAlerts: boolean;
  storeDropAlerts: boolean;
  eventAlerts: boolean;
}

export interface CircleMember {
  id: string;
  name: string;
  city: string;
  initials: string;
  avatarTint: string;
  isOnline: boolean;
  statusNote: string;
}

export interface CircleChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderInitials: string;
  senderTint: string;
  isSelf?: boolean;
  text: string;
  timestampLabel: string;
  stampId?: string;
}

export interface ChatMessageItem {
  id: string;
  senderId: string;
  senderName: string;
  senderInitials: string;
  senderTint: string;
  isSelf?: boolean;
  text: string;
  timestampLabel: string;
  dateDividerLabel?: string;
  stampId?: string;
  diamondGiftAmount?: number;
}

export interface ChatThread {
  id: string;
  memberId: string;
  name: string;
  subtitle: string;
  initials: string;
  avatarTint: string;
  isGroup?: boolean;
  isFavorite: boolean;
  unreadCount: number;
  lastTimeLabel: string;
  messages: ChatMessageItem[];
}

export interface StreakState {
  currentStreak: number;
  bestStreak: number;
  lastCheckInDate: string | null;
  shields: number;
  claimedMilestoneIds: string[];
  totalCheckIns: number;
}

export interface StreakDayStep {
  day: number;
  title: string;
  subtitle: string;
  rewardDiamonds: number;
  grantsStampSection?: 'country' | 'sports';
  isGrandReward?: boolean;
  status: 'claimed' | 'available' | 'locked';
}

export interface StreakMilestoneStep {
  id: string;
  targetDays: number;
  title: string;
  subtitle: string;
  rewardDiamonds: number;
  progress: number;
  isUnlocked: boolean;
  isClaimed: boolean;
}

