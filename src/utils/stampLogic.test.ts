import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTravelArcs,
  clearDemoItems,
  collectStamp,
  filterStamps,
  getCollectionSummary,
  haversineDistanceKm,
  toggleStampFavorite,
} from './stampLogic';
import type { SocialPost, StampItem, StampPocket } from '../types/stamp';

const sampleStamps: StampItem[] = [
  {
    id: 'madrid',
    title: 'Madrid',
    country: 'Spain',
    city: 'Madrid',
    category: 'city',
    rarity: 'common',
    collectedCount: 12,
    totalInSet: 20,
    isFavorite: false,
    isUnlocked: true,
    coordinates: { lat: 40.4168, lng: -3.7038 },
    imageUrl: '/a.jpg',
    accentColor: '#F48A78',
    bannerColor: '#D64527',
    pocketId: 'cities',
    description: 'Royal Palace',
    isDemoSeed: true,
  },
  {
    id: 'ibiza',
    title: 'Ibiza',
    country: 'Spain',
    city: 'Ibiza',
    category: 'city',
    rarity: 'rare',
    collectedCount: 14,
    totalInSet: 20,
    isFavorite: true,
    isUnlocked: true,
    coordinates: { lat: 38.9067, lng: 1.4206 },
    imageUrl: '/b.jpg',
    accentColor: '#9ED6DC',
    bannerColor: '#D64527',
    pocketId: 'cities',
    description: 'Whitewashed Cove',
    isDemoSeed: true,
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

test('filterStamps filters by favorites, rare, national, and search query', () => {
  assert.equal(filterStamps(sampleStamps, 'all', '').length, 3);
  assert.equal(filterStamps(sampleStamps, 'favorites', '').map((s) => s.id).join(','), 'ibiza');
  assert.equal(filterStamps(sampleStamps, 'rare', '').map((s) => s.id).join(','), 'ibiza,kyoto-custom');
  assert.equal(filterStamps(sampleStamps, 'national', '').map((s) => s.id).join(','), 'madrid,ibiza');
  assert.equal(filterStamps(sampleStamps, 'all', 'kyoto').map((s) => s.id).join(','), 'kyoto-custom');
});

test('toggleStampFavorite flips favorite flag deterministically', () => {
  const toggled = toggleStampFavorite(sampleStamps, 'madrid');
  assert.equal(toggled.find((s) => s.id === 'madrid')?.isFavorite, true);
  assert.equal(toggled.find((s) => s.id === 'ibiza')?.isFavorite, true);
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
  assert.equal(arcs[0].fromStampId, 'madrid');
  assert.equal(arcs[0].toStampId, 'ibiza');
});

test('getCollectionSummary aggregates unlocked, countries, and rare counts', () => {
  const summary = getCollectionSummary(sampleStamps);
  assert.equal(summary.totalStamps, 3);
  assert.equal(summary.unlockedCount, 2);
  assert.equal(summary.countriesCount, 1);
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
      stampId: 'ibiza',
      caption: 'Sunset!',
      locationLabel: 'Ibiza · Spain',
      timestampLabel: '2h ago',
      likesCount: 4,
      isLiked: false,
      isSaved: false,
      isDemoSeed: true,
    },
  ];
  const cleared = clearDemoItems(sampleStamps, pockets, posts);
  assert.equal(cleared.stamps.length, 1);
  assert.equal(cleared.stamps[0].id, 'kyoto-custom');
  assert.equal(cleared.posts.length, 0);
  assert.equal(cleared.pockets.length, 1);
});
