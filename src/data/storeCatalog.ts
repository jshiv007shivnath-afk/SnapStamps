import type { StampItem } from '../types/stamp';

// Vintage 1970s Brazilian Risograph Poster SVG for Pele's iconic Mexico 1970 fist-pump celebration
const PELE_1970_RISOGRAPH_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1E3A5F"/>
      <stop offset="55%" stop-color="#E97D32"/>
      <stop offset="100%" stop-color="#F6C85F"/>
    </linearGradient>
    <linearGradient id="turf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2D7A4D"/>
      <stop offset="100%" stop-color="#14452B"/>
    </linearGradient>
  </defs>
  <rect width="300" height="400" fill="url(#sky)"/>
  <circle cx="150" cy="148" r="88" fill="#FDE68A" opacity="0.88"/>
  <circle cx="150" cy="148" r="118" fill="none" stroke="#FFFBEB" stroke-width="1.5" stroke-dasharray="6 5" opacity="0.45"/>
  <!-- Stadium Bowl -->
  <path d="M0 245 Q150 220 300 245 L300 295 L0 295 Z" fill="#1F2937" opacity="0.72"/>
  <path d="M0 264 Q150 246 300 264" fill="none" stroke="#FCD34D" stroke-width="2" opacity="0.55"/>
  <rect x="0" y="290" width="300" height="110" fill="url(#turf)"/>
  <path d="M12 342 L288 342" stroke="#ECFDF5" stroke-width="2" opacity="0.4"/>
  <!-- Iconic 1970 Fist Pump Silhouette (Yellow #10 Kit + Green Trim) -->
  <g transform="translate(150, 178)">
    <!-- Shadow -->
    <ellipse cx="0" cy="134" rx="46" ry="10" fill="#0B2E1B" opacity="0.42"/>
    <!-- Left Arm Outstretched -->
    <path d="M-20 -18 L-68 18 L-58 29 L-14 2 Z" fill="#8C4B2A"/>
    <!-- Right Arm Raised High in Fist Pump -->
    <path d="M16 -26 L56 -88 L70 -78 L28 -8 Z" fill="#8C4B2A"/>
    <circle cx="66" cy="-86" r="11" fill="#8C4B2A"/>
    <!-- Head & Smile -->
    <circle cx="2" cy="-46" r="19" fill="#7A3E20"/>
    <circle cx="2" cy="-54" r="18" fill="#18181B"/>
    <circle cx="2" cy="-42" r="15" fill="#8C4B2A"/>
    <!-- Canary Yellow Brazil #10 Jersey -->
    <path d="M-28 -26 Q0 -34 28 -26 L26 32 L-26 32 Z" fill="#FACC15"/>
    <path d="M-28 -26 Q0 -18 28 -26 L24 -16 Q0 -10 -24 -16 Z" fill="#15803D"/>
    <text x="0" y="14" text-anchor="middle" fill="#15803D" font-family="sans-serif" font-weight="900" font-size="24">10</text>
    <!-- Cobalt Blue Shorts -->
    <path d="M-26 32 L26 32 L32 68 L4 68 L0 48 L-4 68 L-32 68 Z" fill="#1D4ED8"/>
    <!-- Dynamic Mid-Air Legs -->
    <path d="M-26 68 L-34 108 L-20 112 L-10 68 Z" fill="#8C4B2A"/>
    <path d="M10 68 L28 104 L42 98 L24 68 Z" fill="#8C4B2A"/>
    <!-- Socks & Boots -->
    <rect x="-36" y="106" width="16" height="14" rx="3" fill="#FFFDF7"/>
    <rect x="24" y="96" width="16" height="14" rx="3" fill="#FFFDF7" transform="rotate(-18 32 103)"/>
  </g>
</svg>`)}`;

export const STORE_COUNTRY_STAMPS: StampItem[] = [
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
    imageUrl: '/src/assets/images/stamp_switzerland_1794903984211.jpg',
    accentColor: '#E5957A',
    bannerColor: '#991B1B',
    pocketId: 'countries',
    description: 'Crimson Glacier Express crossing high alpine stone arches beneath the Matterhorn.',
    priceDiamonds: 220,
  },
  {
    id: 'store-india',
    title: 'India',
    country: 'India',
    city: 'Agra',
    category: 'country',
    rarity: 'legendary',
    collectedCount: 0,
    totalInSet: 15,
    isFavorite: false,
    isUnlocked: false,
    coordinates: { lat: 27.1751, lng: 78.0421 },
    imageUrl: '/src/assets/images/stamp_india_1794903983238.jpg',
    accentColor: '#F3BE7A',
    bannerColor: '#B45309',
    pocketId: 'countries',
    description: 'Ivory marble domes mirrored in a tranquil saffron-sunrise lotus courtyard.',
    priceDiamonds: 260,
  },
  {
    id: 'store-brazil',
    title: 'Brazil',
    country: 'Brazil',
    city: 'Rio de Janeiro',
    category: 'country',
    rarity: 'rare',
    collectedCount: 0,
    totalInSet: 12,
    isFavorite: false,
    isUnlocked: false,
    coordinates: { lat: -22.9068, lng: -43.1729 },
    imageUrl: '/src/assets/images/stamp_brazil_1794903984834.jpg',
    accentColor: '#76C7B7',
    bannerColor: '#0F766E',
    pocketId: 'countries',
    description: 'Sugarloaf headland and white Guanabara sailboats bathed in Atlantic sunset.',
    priceDiamonds: 180,
  },
  {
    id: 'store-morocco',
    title: 'Morocco',
    country: 'Morocco',
    city: 'Marrakech',
    category: 'country',
    rarity: 'common',
    collectedCount: 0,
    totalInSet: 10,
    isFavorite: false,
    isUnlocked: false,
    coordinates: { lat: 31.6295, lng: -7.9811 },
    imageUrl: '/src/assets/images/stamp_morocco_1794903985487.jpg',
    accentColor: '#7EA6D8',
    bannerColor: '#1E3A8A',
    pocketId: 'countries',
    description: 'Cobalt Majorelle archways, cedar courtyard palms, and zellige courtyard mosaic.',
    priceDiamonds: 140,
  },
];

export const STORE_SPORTS_STAMPS: StampItem[] = [
  // Cricket Legends
  {
    id: 'store-kohli',
    title: 'Virat Kohli',
    country: 'India',
    city: 'Melbourne',
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
    coordinates: { lat: -37.82, lng: 144.9834 },
    imageUrl: '/src/assets/images/stamp_kohli_roar_1794904008663.jpg',
    accentColor: '#7BB0EE',
    bannerColor: '#1D4ED8',
    pocketId: 'rare',
    description: 'Bat raised skyward in his unmistakable match-winning century roar under lights.',
    priceDiamonds: 550,
  },
  {
    id: 'store-dhoni',
    title: 'MS Dhoni',
    country: 'India',
    city: 'Mumbai',
    category: 'sports',
    sportDiscipline: 'cricket',
    athleteName: 'MS Dhoni',
    celebrationLabel: 'Helicopter Finish',
    jerseyNumber: '7',
    rarity: 'legendary',
    collectedCount: 0,
    totalInSet: 1,
    isFavorite: false,
    isUnlocked: false,
    coordinates: { lat: 18.9389, lng: 72.8258 },
    imageUrl: '/src/assets/images/stamp_dhoni_finisher_1794904008390.jpg',
    accentColor: '#6C9CD8',
    bannerColor: '#1E3A8A',
    pocketId: 'rare',
    description: 'Signature sweeping helicopter whip sending the winning ball deep into the night stands.',
    priceDiamonds: 600,
  },
  {
    id: 'store-sachin',
    title: 'Sachin Tendulkar',
    country: 'India',
    city: 'Mumbai',
    category: 'sports',
    sportDiscipline: 'cricket',
    athleteName: 'Sachin Tendulkar',
    celebrationLabel: 'Skyward Tribute',
    jerseyNumber: '10',
    rarity: 'legendary',
    collectedCount: 0,
    totalInSet: 1,
    isFavorite: false,
    isUnlocked: false,
    coordinates: { lat: 18.9389, lng: 72.8258 },
    imageUrl: '/src/assets/images/stamp_sachin_tribute_1794903979850.jpg',
    accentColor: '#F3BD68',
    bannerColor: '#B45309',
    pocketId: 'rare',
    description: 'Helmet and willow raised gracefully skyward after reaching the milestone century.',
    priceDiamonds: 650,
  },
  {
    id: 'store-rohit',
    title: 'Rohit Sharma',
    country: 'India',
    city: 'Kolkata',
    category: 'sports',
    sportDiscipline: 'cricket',
    athleteName: 'Rohit Sharma',
    celebrationLabel: 'Century Salute',
    jerseyNumber: '45',
    rarity: 'rare',
    collectedCount: 0,
    totalInSet: 1,
    isFavorite: false,
    isUnlocked: false,
    coordinates: { lat: 22.5646, lng: 88.3433 },
    imageUrl: '/src/assets/images/stamp_rohit_century_1794903980258.jpg',
    accentColor: '#F29D52',
    bannerColor: '#1D4ED8',
    pocketId: 'rare',
    description: 'Composed bat-and-cap salute following a sweeping double-hundred masterclass.',
    priceDiamonds: 420,
  },

  // Football Legends
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
    imageUrl: '/src/assets/images/stamp_messi_sky_1794904008786.jpg',
    accentColor: '#8AD0EC',
    bannerColor: '#0369A1',
    pocketId: 'rare',
    description: 'Both index fingers pointed skyward in his timeless, heartfelt goal dedication.',
    priceDiamonds: 650,
  },
  {
    id: 'store-ronaldo',
    title: 'Cristiano Ronaldo',
    country: 'Portugal',
    city: 'Lisbon',
    category: 'sports',
    sportDiscipline: 'football',
    athleteName: 'Cristiano Ronaldo',
    celebrationLabel: 'Siuuu Leap',
    jerseyNumber: '7',
    rarity: 'legendary',
    collectedCount: 0,
    totalInSet: 1,
    isFavorite: false,
    isUnlocked: false,
    coordinates: { lat: 38.7223, lng: -9.1393 },
    imageUrl: '/src/assets/images/stamp_ronaldo_siuu_1794904010669.jpg',
    accentColor: '#E07A74',
    bannerColor: '#991B1B',
    pocketId: 'rare',
    description: 'Suspended mid-air pirouette before landing arms wide to a roaring stadium.',
    priceDiamonds: 620,
  },
  {
    id: 'store-mbappe',
    title: 'Kylian Mbappé',
    country: 'France',
    city: 'Paris',
    category: 'sports',
    sportDiscipline: 'football',
    athleteName: 'Kylian Mbappé',
    celebrationLabel: 'Crossed-Arms Slide',
    jerseyNumber: '10',
    rarity: 'rare',
    collectedCount: 0,
    totalInSet: 1,
    isFavorite: false,
    isUnlocked: false,
    coordinates: { lat: 48.8414, lng: 2.253 },
    imageUrl: '/src/assets/images/stamp_mbappe_slide_1794903983925.jpg',
    accentColor: '#7A9AC9',
    bannerColor: '#1E293B',
    pocketId: 'rare',
    description: 'Ice-cool knee slide with arms folded across the chest under Parisian lights.',
    priceDiamonds: 460,
  },
  {
    id: 'store-pele',
    title: 'Pelé',
    country: 'Brazil',
    city: 'Santos',
    category: 'sports',
    sportDiscipline: 'football',
    athleteName: 'Pelé',
    celebrationLabel: '1970 Fist Pump',
    jerseyNumber: '10',
    rarity: 'legendary',
    collectedCount: 0,
    totalInSet: 1,
    isFavorite: false,
    isUnlocked: false,
    coordinates: { lat: -23.9608, lng: -46.3336 },
    imageUrl: PELE_1970_RISOGRAPH_SVG,
    accentColor: '#F5CB5C',
    bannerColor: '#15803D',
    pocketId: 'rare',
    description: 'Triumphant 1970 World Cup leap punching the right fist skyward in golden sunlight.',
    priceDiamonds: 580,
  },
];

export const STORE_CATALOG: StampItem[] = [
  ...STORE_COUNTRY_STAMPS,
  ...STORE_SPORTS_STAMPS,
];
