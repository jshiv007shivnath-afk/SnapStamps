import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyStampLocationTags,
  ensureStampTags,
  getStampTags,
  STAMP_THEME_TAGS,
} from './stampTagging';
import type { StampItem } from '../types/stamp';

test('classifyStampLocationTags categorizes Nature destinations from location metadata', () => {
  const yosemite = classifyStampLocationTags({
    title: 'Yosemite Valley',
    city: 'Yosemite National Park',
    country: 'United States',
    category: 'landmark',
  });
  assert.equal(yosemite.primaryTag, 'Nature');
  assert.ok(yosemite.tags.includes('Nature'));

  const swissAlps = classifyStampLocationTags({
    title: 'Zermatt',
    city: 'Matterhorn',
    country: 'Switzerland',
    category: 'city',
  });
  assert.equal(swissAlps.primaryTag, 'Nature');
});

test('classifyStampLocationTags categorizes Urban destinations from location metadata', () => {
  const shibuya = classifyStampLocationTags({
    title: 'Shibuya Crossing',
    city: 'Tokyo',
    country: 'Japan',
    category: 'city',
  });
  assert.equal(shibuya.primaryTag, 'Urban');
  assert.ok(shibuya.tags.includes('Urban'));

  const manhattan = classifyStampLocationTags({
    title: 'Manhattan Skyline',
    city: 'New York',
    country: 'United States',
    category: 'city',
  });
  assert.equal(manhattan.primaryTag, 'Urban');
});

test('classifyStampLocationTags categorizes Culture destinations and sports legends', () => {
  const louvre = classifyStampLocationTags({
    title: 'Louvre Art Museum',
    city: 'Paris',
    country: 'France',
    category: 'landmark',
  });
  assert.equal(louvre.primaryTag, 'Culture');

  const marrakech = classifyStampLocationTags({
    title: 'Marrakech Souk',
    city: 'Marrakech',
    country: 'Morocco',
    category: 'city',
  });
  assert.equal(marrakech.primaryTag, 'Culture');

  const sportsLegend = classifyStampLocationTags({
    title: 'Virat Kohli',
    city: 'Delhi',
    country: 'India',
    category: 'sports',
  });
  assert.equal(sportsLegend.primaryTag, 'Culture');
});

test('classifyStampLocationTags categorizes Historical landmarks and ancient sites', () => {
  const colosseum = classifyStampLocationTags({
    title: 'Colosseum Ruins',
    city: 'Rome',
    country: 'Italy',
    category: 'landmark',
  });
  assert.equal(colosseum.primaryTag, 'Historical');

  const tajMahal = classifyStampLocationTags({
    title: 'Taj Mahal',
    city: 'Agra',
    country: 'India',
    category: 'landmark',
  });
  assert.equal(tajMahal.primaryTag, 'Historical');

  const petra = classifyStampLocationTags({
    title: 'Petra',
    city: 'Ma an',
    country: 'Jordan',
    category: 'landmark',
  });
  assert.equal(petra.primaryTag, 'Historical');
});

test('classifyStampLocationTags handles Google Maps Places address/categoryLabel and deterministic fallbacks', () => {
  const mapPlace = classifyStampLocationTags({
    title: 'Banff Gondola',
    city: 'Banff',
    country: 'Canada',
    address: '100 Mountain Ave, Banff National Park, AB, Canada',
    categoryLabel: 'National Park',
    category: 'landmark',
  });
  assert.equal(mapPlace.primaryTag, 'Nature');

  const unknownCity = classifyStampLocationTags({
    title: 'Solara',
    city: 'Solara',
    country: 'Custom Atlas',
    category: 'city',
  });
  assert.ok(STAMP_THEME_TAGS.includes(unknownCity.primaryTag));
  assert.equal(unknownCity.primaryTag, 'Urban');
  assert.equal(unknownCity.tags.length, 1);
});

test('ensureStampTags and getStampTags preserve existing tags and auto-tag untagged stamps', () => {
  const untaggedStamp: StampItem = {
    id: 'test-1',
    title: 'Acropolis',
    country: 'Greece',
    city: 'Athens',
    category: 'landmark',
    rarity: 'rare',
    collectedCount: 1,
    totalInSet: 10,
    isFavorite: false,
    isUnlocked: true,
    coordinates: { lat: 37.9715, lng: 23.7257 },
    imageUrl: '',
    accentColor: '#F4A28C',
    bannerColor: '#D64527',
    pocketId: 'landmarks',
    description: 'Ancient citadel overlooking Athens.',
  };

  const tagged = ensureStampTags(untaggedStamp);
  assert.deepEqual(tagged.tags, ['Historical']);
  assert.deepEqual(getStampTags(untaggedStamp), ['Historical']);

  const pretagged: StampItem = { ...untaggedStamp, tags: ['Culture'] };
  assert.deepEqual(ensureStampTags(pretagged).tags, ['Culture']);
});
