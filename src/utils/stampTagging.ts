import type {
  StampCategory,
  StampCoordinates,
  StampItem,
  StampThemeTag,
} from '../types/stamp';

export const STAMP_THEME_TAGS: readonly StampThemeTag[] = [
  'Nature',
  'Urban',
  'Culture',
  'Historical',
] as const;

export interface StampLocationMetadata {
  title?: string;
  city?: string;
  country?: string;
  address?: string;
  categoryLabel?: string;
  category?: StampCategory;
  description?: string;
  coordinates?: StampCoordinates;
}

export interface StampTaggingResult {
  primaryTag: StampThemeTag;
  tags: StampThemeTag[];
  matchedSignals: string[];
}

interface KeywordRule {
  tag: StampThemeTag;
  keywords: readonly string[];
}

const KEYWORD_RULES: readonly KeywordRule[] = [
  {
    tag: 'Nature',
    keywords: [
      'nature',
      'natural',
      'national park',
      'park',
      'mountain',
      'mountains',
      'alps',
      'alpine',
      'peak',
      'summit',
      'volcano',
      'glacier',
      'fjord',
      'fjords',
      'waterfall',
      'falls',
      'canyon',
      'valley',
      'forest',
      'woods',
      'jungle',
      'rainforest',
      'desert',
      'dunes',
      'oasis',
      'island',
      'islands',
      'archipelago',
      'reef',
      'lagoon',
      'beach',
      'coast',
      'coastal',
      'bay',
      'cliff',
      'cliffs',
      'lake',
      'river',
      'savanna',
      'safari',
      'wildlife',
      'reserve',
      'botanical',
      'garden',
      'gardens',
      'meadow',
      'aurora',
      'yosemite',
      'banff',
      'zermatt',
      'interlaken',
      'matterhorn',
      'fuji',
      'patagonia',
      'queenstown',
      'reykjavik',
      'iceland',
      'switzerland',
      'norway',
      'new zealand',
      'costa rica',
      'maldives',
      'bali',
      'galapagos',
      'serengeti',
      'amazon',
      'grand canyon',
      'yellowstone',
      'dolomites',
      'santorini',
      'amalfi',
      'halong',
      'jeju',
      'lofoten',
      'tahiti',
      'fiji',
      'seychelles',
      'kenya',
      'tanzania',
      'canada',
      'alaska',
      'hawaii',
      'maui',
      'kauai',
      'niagara',
      'everest',
      'himalaya',
      'himalayas',
      'kashmir',
      'ladakh',
      'kerala',
    ],
  },
  {
    tag: 'Historical',
    keywords: [
      'historical',
      'historic',
      'history',
      'ancient',
      'ruins',
      'ruin',
      'monument',
      'monuments',
      'memorial',
      'castle',
      'fort',
      'fortress',
      'citadel',
      'palace',
      'pyramid',
      'pyramids',
      'sphinx',
      'colosseum',
      'acropolis',
      'parthenon',
      'temple',
      'shrine',
      'cathedral',
      'basilica',
      'abbey',
      'monastery',
      'mosque',
      'church',
      'tomb',
      'mausoleum',
      'amphitheater',
      'amphitheatre',
      'aqueduct',
      'archaeological',
      'heritage',
      'old town',
      'medieval',
      'dynasty',
      'imperial',
      'empire',
      'wall',
      'gate',
      'taj mahal',
      'agra',
      'giza',
      'cairo',
      'luxor',
      'petra',
      'machu picchu',
      'cusco',
      'angkor',
      'pompeii',
      'stonehenge',
      'alhambra',
      'versailles',
      'rome',
      'athens',
      'jerusalem',
      'istanbul',
      'prague',
      'edinburgh',
      'florence',
      'venice',
      'xi an',
      'xian',
      'beijing',
      'delhi',
      'jaipur',
      'hampi',
      'egypt',
      'greece',
      'peru',
      'jordan',
      'cambodia',
      'turkey',
      'italy',
      'england',
      'scotland',
    ],
  },
  {
    tag: 'Culture',
    keywords: [
      'culture',
      'cultural',
      'museum',
      'gallery',
      'art',
      'arts',
      'theatre',
      'theater',
      'opera',
      'symphony',
      'concert',
      'festival',
      'carnival',
      'music',
      'jazz',
      'fado',
      'flamenco',
      'samba',
      'tango',
      'dance',
      'cuisine',
      'culinary',
      'food',
      'market',
      'bazaar',
      'souk',
      'medina',
      'artisan',
      'craft',
      'pottery',
      'lantern',
      'tea house',
      'teahouse',
      'geisha',
      'stadium',
      'arena',
      'cricket',
      'football',
      'soccer',
      'sports',
      'legend',
      'louvre',
      'prado',
      'uffizi',
      'guggenheim',
      'broadway',
      'kyoto',
      'nara',
      'marrakech',
      'fez',
      'varanasi',
      'oaxaca',
      'seville',
      'granada',
      'barcelona',
      'lisbon',
      'porto',
      'vienna',
      'salzburg',
      'paris',
      'rio de janeiro',
      'rio',
      'buenos aires',
      'havana',
      'new orleans',
      'mexico city',
      'bangkok',
      'chiang mai',
      'hanoi',
      'morocco',
      'spain',
      'portugal',
      'mexico',
      'brazil',
      'argentina',
      'india',
      'japan',
      'thailand',
      'vietnam',
      'france',
      'austria',
      'ireland',
      'dublin',
    ],
  },
  {
    tag: 'Urban',
    keywords: [
      'urban',
      'city',
      'metropolis',
      'metro',
      'downtown',
      'midtown',
      'uptown',
      'skyline',
      'skyscraper',
      'tower',
      'towers',
      'financial',
      'business district',
      'district',
      'boulevard',
      'avenue',
      'street',
      'crossing',
      'square',
      'plaza',
      'station',
      'subway',
      'bridge',
      'harbor',
      'harbour',
      'marina',
      'waterfront',
      'pier',
      'promenade',
      'mall',
      'tech',
      'neon',
      'modern',
      'contemporary',
      'shibuya',
      'shinjuku',
      'ginza',
      'manhattan',
      'brooklyn',
      'times square',
      'soho',
      'marina bay',
      'canary wharf',
      'gangnam',
      'pudong',
      'tokyo',
      'new york',
      'nyc',
      'london',
      'singapore',
      'hong kong',
      'seoul',
      'dubai',
      'abu dhabi',
      'doha',
      'shanghai',
      'shenzhen',
      'osaka',
      'taipei',
      'chicago',
      'san francisco',
      'los angeles',
      'miami',
      'seattle',
      'boston',
      'toronto',
      'vancouver',
      'sydney',
      'melbourne',
      'berlin',
      'frankfurt',
      'munich',
      'amsterdam',
      'rotterdam',
      'zurich',
      'stockholm',
      'copenhagen',
      'kuala lumpur',
      'mumbai',
      'bengaluru',
      'bangalore',
      'united states',
      'usa',
      'germany',
      'netherlands',
      'south korea',
      'united arab emirates',
      'uae',
      'australia',
    ],
  },
];

function escapeRegex(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeText(value?: string): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesKeyword(haystack: string, keyword: string): boolean {
  if (!haystack) return false;
  const pattern = new RegExp(`(?:^|\\s)${escapeRegex(keyword)}(?:$|\\s)`, 'i');
  return pattern.test(haystack);
}

/**
 * Automatically categorizes a stamp into 'Nature', 'Urban', 'Culture', or 'Historical'
 * based on its location metadata (title, city, country, address, place category, and description).
 */
export function classifyStampLocationTags(
  metadata: StampLocationMetadata
): StampTaggingResult {
  const scores: Record<StampThemeTag, number> = {
    Nature: 0,
    Urban: 0,
    Culture: 0,
    Historical: 0,
  };
  const matchedSignals: string[] = [];

  const weightedFields: Array<{ text: string; weight: number }> = [
    { text: normalizeText(metadata.title), weight: 3 },
    { text: normalizeText(metadata.city), weight: 3 },
    { text: normalizeText(metadata.address), weight: 3 },
    { text: normalizeText(metadata.categoryLabel), weight: 3 },
    { text: normalizeText(metadata.country), weight: 2 },
    { text: normalizeText(metadata.description), weight: 1 },
  ];

  for (const rule of KEYWORD_RULES) {
    const seenForTag = new Set<string>();
    for (const keyword of rule.keywords) {
      let bestWeight = 0;
      for (const field of weightedFields) {
        if (field.text && matchesKeyword(field.text, keyword)) {
          if (field.weight > bestWeight) {
            bestWeight = field.weight;
          }
        }
      }
      if (bestWeight > 0 && !seenForTag.has(keyword)) {
        seenForTag.add(keyword);
        scores[rule.tag] += bestWeight;
        if (matchedSignals.length < 6) {
          matchedSignals.push(keyword);
        }
      }
    }
  }

  // Category-level structural priors when location signals are subtle or tied
  if (metadata.category === 'sports') {
    scores.Culture += 4;
  } else if (metadata.category === 'landmark') {
    scores.Historical += 1;
  } else if (metadata.category === 'city') {
    scores.Urban += 1;
  }

  // Deterministic ranking order if scores are equal
  const priorityOrder: StampThemeTag[] = ['Historical', 'Nature', 'Culture', 'Urban'];
  const ranked = [...priorityOrder].sort((a, b) => scores[b] - scores[a]);
  const topScore = scores[ranked[0]];

  let primaryTag: StampThemeTag;
  if (topScore > 0) {
    primaryTag = ranked[0];
  } else if (metadata.category === 'landmark') {
    primaryTag = 'Historical';
  } else if (metadata.category === 'sports' || metadata.category === 'country') {
    primaryTag = 'Culture';
  } else {
    primaryTag = 'Urban';
  }

  const tags: StampThemeTag[] = [primaryTag];
  const secondTag = ranked[1];
  const secondScore = scores[secondTag];
  if (
    secondTag &&
    secondTag !== primaryTag &&
    secondScore >= 3 &&
    topScore > 0 &&
    secondScore >= topScore * 0.6
  ) {
    tags.push(secondTag);
  }

  return {
    primaryTag,
    tags,
    matchedSignals,
  };
}

export function getStampTags(stamp: Pick<StampItem, 'title' | 'city' | 'country' | 'category' | 'description' | 'coordinates' | 'tags'>): StampThemeTag[] {
  if (Array.isArray(stamp.tags) && stamp.tags.length > 0) {
    return stamp.tags;
  }
  return classifyStampLocationTags(stamp).tags;
}

export function ensureStampTags(stamp: StampItem): StampItem {
  if (Array.isArray(stamp.tags) && stamp.tags.length > 0) {
    return stamp;
  }
  const { tags } = classifyStampLocationTags(stamp);
  return {
    ...stamp,
    tags,
  };
}
