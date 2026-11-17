import type {
  AppNotification,
  AppSettings,
  SocialPost,
  StampItem,
  StampPocket,
} from '../types/stamp';

export const DEMO_POCKETS: StampPocket[] = [
  {
    id: 'countries',
    title: 'Countries',
    subtitle: 'National passport editions',
    tint: 'amber',
    category: 'country',
  },
  {
    id: 'sports-vault',
    title: 'Sports Vault',
    subtitle: 'Cricket & Football celebrations',
    tint: 'sky',
    category: 'sports',
  },
  {
    id: 'cities',
    title: 'Cities',
    subtitle: 'Coastal & historic capitals',
    tint: 'sage',
    category: 'city',
  },
  {
    id: 'landmarks',
    title: 'Landmarks',
    subtitle: 'Architectural & natural wonders',
    tint: 'coral',
    category: 'landmark',
  },
];

// Old pre-seeded travel demo stamps removed per user request so collections start clean.
export const DEMO_STAMPS: StampItem[] = [];

export const DEMO_POSTS: SocialPost[] = [];

export const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-release-24',
    category: 'release',
    title: 'New Version Released · SnapStamps v2.4',
    message:
      'SnapStamps v2.4 is now live with liquid-glass custom folders, Rarity Badges, and mobile Capacitor support.',
    timestampLabel: 'Just now',
    isRead: false,
    actionLabel: 'Open Settings',
    targetTab: 'settings',
  },
  {
    id: 'notif-store-legends',
    category: 'store',
    title: 'New Stamps Added in Store',
    message:
      'Country Editions (Switzerland, India, Brazil, Morocco) plus Cricket & Football Legend celebration stamps are now available.',
    timestampLabel: '1h ago',
    isRead: false,
    actionLabel: 'Visit Store',
    targetTab: 'store',
  },
  {
    id: 'notif-event-drop',
    category: 'event',
    title: 'Championship Stamp Event on SnapStamps',
    message:
      'Limited-run Matchday Celebration drops and Daily Challenges are active this week in your Passport Profile.',
    timestampLabel: '3h ago',
    isRead: false,
    actionLabel: 'View Profile',
    targetTab: 'profile',
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  hapticsEnabled: true,
  releaseAlerts: true,
  storeDropAlerts: true,
  eventAlerts: true,
};

// Visual preview cards shown exclusively on OnboardingScreen before starting
export const ONBOARDING_SHOWCASE_STAMPS: StampItem[] = [
  {
    id: 'onboarding-canarias',
    title: 'Islas Canarias',
    country: 'Spain',
    city: 'Tenerife',
    category: 'country',
    rarity: 'legendary',
    collectedCount: 16,
    totalInSet: 20,
    isFavorite: true,
    isUnlocked: true,
    coordinates: { lat: 28.2916, lng: -16.6291 },
    imageUrl: '/src/assets/images/stamp_canarias_1794828254242.jpg',
    accentColor: '#98D4DC',
    bannerColor: '#0E7490',
    pocketId: 'countries',
    description: 'Volcanic Atlantic cliffs, sailboat coves, and desert flora.',
  },
  {
    id: 'onboarding-sevilla',
    title: 'Sevilla',
    country: 'Spain',
    city: 'Sevilla',
    category: 'city',
    rarity: 'rare',
    collectedCount: 12,
    totalInSet: 20,
    isFavorite: false,
    isUnlocked: true,
    coordinates: { lat: 37.3891, lng: -5.9845 },
    imageUrl: '/src/assets/images/stamp_sevilla_1794828252692.jpg',
    accentColor: '#F38D31',
    bannerColor: '#C84B1E',
    pocketId: 'cities',
    description: 'La Giralda bell tower framed by date palms and canal reflections.',
  },
];
