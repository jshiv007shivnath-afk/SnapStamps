export type AppTab =
  | 'library'
  | 'stamps'
  | 'feed'
  | 'profile'
  | 'globe'
  | 'store'
  | 'notifications'
  | 'settings';

export type CollectionFilter = 'all' | 'national' | 'favorites' | 'rare';

export type StoreSectionFilter = 'all' | 'country' | 'sports';

export type SportDisciplineFilter = 'all' | 'cricket' | 'football';

export type StampCategory = 'country' | 'city' | 'landmark' | 'sports';

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
