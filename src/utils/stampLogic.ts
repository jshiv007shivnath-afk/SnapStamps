import type {
  CollectionFilter,
  SocialPost,
  StampCoordinates,
  StampItem,
  StampPocket,
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

    if (filter === 'national' && stamp.category !== 'country' && stamp.country.toLowerCase() !== 'spain') {
      return false;
    }
    if (filter === 'favorites' && !stamp.isFavorite) {
      return false;
    }
    if (filter === 'rare' && stamp.rarity === 'common') {
      return false;
    }

    if (q) {
      const haystack = `${stamp.title} ${stamp.city} ${stamp.country} ${stamp.category} ${stamp.rarity}`.toLowerCase();
      return haystack.includes(q);
    }

    return true;
  });
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
  // Keep pockets structurally available so user-created stamps remain organized
  const cleanPockets = pockets.map((p) => ({ ...p, isDemoSeed: false }));
  return {
    stamps: userStamps,
    pockets: cleanPockets,
    posts: userPosts,
  };
}
