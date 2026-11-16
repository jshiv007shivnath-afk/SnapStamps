export type AppTab = 'library' | 'stamps' | 'feed' | 'profile' | 'globe';

export type CollectionFilter = 'all' | 'national' | 'favorites' | 'rare';

export type StampCategory = 'country' | 'city' | 'landmark';

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
}

export interface StampPocket {
  id: string;
  title: string;
  subtitle: string;
  tint: PocketTint;
  category: StampCategory | 'rare';
  isDemoSeed?: boolean;
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
