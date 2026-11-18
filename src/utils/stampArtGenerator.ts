// Procedural vintage risograph SVG poster artwork generator for expanded Country & Sports Stamp editions.
// Zero external network URLs: produces deterministic crisp vector stamp illustrations offline.

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export type CountrySceneKind =
  | 'mountain'
  | 'pagoda'
  | 'coastal'
  | 'arch'
  | 'dome'
  | 'pyramid'
  | 'fjord'
  | 'skyline';

export function buildCountryStampSvg({
  title,
  skyTop,
  skyBottom,
  sunColor,
  landColor,
  accentColor,
  scene,
}: {
  title: string;
  skyTop: string;
  skyBottom: string;
  sunColor: string;
  landColor: string;
  accentColor: string;
  scene: CountrySceneKind;
}): string {
  const safeTitle = esc(title.slice(0, 14).toUpperCase());
  const gradId = `cs_${safeTitle.replace(/[^A-Z0-9]/g, '')}`;

  let motif = '';
  if (scene === 'mountain') {
    motif = `
      <polygon points="15,285 95,155 168,285" fill="${accentColor}"/>
      <polygon points="105,285 192,132 288,285" fill="${landColor}"/>
      <polygon points="192,132 168,176 184,172 198,182 214,170" fill="#FFFDF7" opacity="0.92"/>
      <polygon points="95,155 78,185 92,182 104,190 114,180" fill="#FFFDF7" opacity="0.88"/>
      <rect x="0" y="282" width="300" height="118" fill="${landColor}"/>
      <path d="M0 326 Q150 308 300 326" stroke="#FFFDF7" stroke-width="2" fill="none" opacity="0.35"/>
    `;
  } else if (scene === 'pagoda') {
    motif = `
      <path d="M0 295 Q150 265 300 295 L300 400 L0 400 Z" fill="${landColor}"/>
      <g transform="translate(150, 130)">
        <rect x="-42" y="122" width="84" height="44" fill="${accentColor}"/>
        <path d="M-56 122 L56 122 L42 106 L-42 106 Z" fill="#1F2937"/>
        <rect x="-32" y="78" width="64" height="28" fill="${accentColor}"/>
        <path d="M-46 78 L46 78 L32 64 L-32 64 Z" fill="#1F2937"/>
        <rect x="-22" y="40" width="44" height="24" fill="${accentColor}"/>
        <path d="M-34 40 L34 40 L20 26 L-20 26 Z" fill="#1F2937"/>
        <rect x="-3" y="2" width="6" height="24" fill="#1F2937"/>
      </g>
    `;
  } else if (scene === 'coastal') {
    motif = `
      <path d="M0 265 Q80 245 150 265 T300 265 L300 400 L0 400 Z" fill="${landColor}"/>
      <path d="M0 298 Q90 282 180 298 T300 296" stroke="#FFFDF7" stroke-width="2.5" fill="none" opacity="0.45"/>
      <path d="M180 250 Q232 186 300 218 L300 265 L180 265 Z" fill="${accentColor}"/>
      <polygon points="116,258 116,204 148,252" fill="#FFFDF7"/>
      <path d="M98 260 L152 260 L142 272 L106 272 Z" fill="#1F2937"/>
    `;
  } else if (scene === 'arch') {
    motif = `
      <rect x="0" y="290" width="300" height="110" fill="${landColor}"/>
      <rect x="52" y="148" width="196" height="142" rx="10" fill="${accentColor}"/>
      <path d="M104 290 L104 206 A46 46 0 0 1 196 206 L196 290 Z" fill="${skyBottom}"/>
      <rect x="64" y="164" width="24" height="44" rx="12" fill="${skyBottom}" opacity="0.8"/>
      <rect x="212" y="164" width="24" height="44" rx="12" fill="${skyBottom}" opacity="0.8"/>
    `;
  } else if (scene === 'dome') {
    motif = `
      <rect x="0" y="286" width="300" height="114" fill="${landColor}"/>
      <path d="M92 220 C92 142 208 142 208 220 Z" fill="#FFFDF7"/>
      <rect x="74" y="220" width="152" height="66" fill="#F9F4E8"/>
      <path d="M128 286 L128 242 A22 22 0 0 1 172 242 L172 286 Z" fill="${accentColor}"/>
      <rect x="52" y="196" width="14" height="90" fill="#FFFDF7"/>
      <rect x="234" y="196" width="14" height="90" fill="#FFFDF7"/>
      <rect x="148" y="142" width="4" height="20" fill="${accentColor}"/>
    `;
  } else if (scene === 'pyramid') {
    motif = `
      <path d="M0 290 Q150 272 300 290 L300 400 L0 400 Z" fill="${landColor}"/>
      <polygon points="36,288 128,162 214,288" fill="${accentColor}"/>
      <polygon points="128,162 214,288 152,288" fill="#0A0A0A" opacity="0.16"/>
      <polygon points="154,288 228,194 288,288" fill="${accentColor}" opacity="0.9"/>
    `;
  } else if (scene === 'fjord') {
    motif = `
      <polygon points="0,295 0,148 118,246 84,295" fill="${landColor}"/>
      <polygon points="300,295 300,136 176,246 214,295" fill="${accentColor}"/>
      <rect x="0" y="272" width="300" height="128" fill="${skyTop}" opacity="0.78"/>
      <path d="M74 318 L226 318 M98 340 L202 340" stroke="#FFFDF7" stroke-width="2" opacity="0.4"/>
    `;
  } else {
    motif = `
      <rect x="0" y="294" width="300" height="106" fill="${landColor}"/>
      <rect x="44" y="182" width="38" height="112" fill="${accentColor}"/>
      <rect x="92" y="138" width="46" height="156" fill="${landColor}"/>
      <rect x="146" y="114" width="36" height="180" fill="${accentColor}"/>
      <polygon points="164,74 156,114 172,114" fill="#FFFDF7"/>
      <rect x="192" y="164" width="44" height="130" fill="${landColor}"/>
      <rect x="244" y="204" width="30" height="90" fill="${accentColor}"/>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${skyTop}"/>
        <stop offset="100%" stop-color="${skyBottom}"/>
      </linearGradient>
    </defs>
    <rect width="300" height="400" fill="url(#${gradId})"/>
    <circle cx="150" cy="118" r="56" fill="${sunColor}" opacity="0.92"/>
    <path d="M24 72 Q70 58 112 72" stroke="#FFFDF7" stroke-width="4" stroke-linecap="round" opacity="0.35" fill="none"/>
    <path d="M196 88 Q236 76 274 88" stroke="#FFFDF7" stroke-width="4" stroke-linecap="round" opacity="0.35" fill="none"/>
    ${motif}
    <rect x="24" y="348" width="252" height="32" rx="6" fill="#FFFDF7" opacity="0.92"/>
    <text x="150" y="369" text-anchor="middle" fill="#0A0A0A" font-family="Georgia, serif" font-weight="700" font-size="14" letter-spacing="2">${safeTitle}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export type AthletePoseKind =
  | 'bat-raise'
  | 'helicopter'
  | 'bowler-roar'
  | 'cover-drive'
  | 'wicket-keep'
  | 'siuu-leap'
  | 'sky-point'
  | 'knee-slide'
  | 'bicycle-kick'
  | 'trophy-lift';

export function buildAthleteStampSvg({
  discipline,
  jerseyColor,
  jerseyTrim,
  jerseyNumber,
  skyTop,
  skyBottom,
  turfColor,
  skinTone,
  pose,
}: {
  discipline: 'cricket' | 'football';
  jerseyColor: string;
  jerseyTrim: string;
  jerseyNumber: string;
  skyTop: string;
  skyBottom: string;
  turfColor: string;
  skinTone: string;
  pose: AthletePoseKind;
}): string {
  const safeNum = esc(jerseyNumber.slice(0, 4));
  const id = `sp_${discipline}_${safeNum.replace(/[^A-Z0-9]/g, '')}_${pose}`;

  const gear =
    discipline === 'cricket'
      ? `
        <!-- Cricket Stumps -->
        <g transform="translate(52, 266)">
          <rect x="0" y="0" width="4" height="58" rx="1.5" fill="#FDE68A"/>
          <rect x="9" y="0" width="4" height="58" rx="1.5" fill="#FDE68A"/>
          <rect x="18" y="0" width="4" height="58" rx="1.5" fill="#FDE68A"/>
          <rect x="0" y="-2" width="22" height="3" rx="1" fill="#F59E0B"/>
        </g>
      `
      : `
        <!-- Football Match Ball -->
        <g transform="translate(234, 306)">
          <circle cx="0" cy="0" r="15" fill="#FFFDF7" stroke="#0A0A0A" stroke-width="2"/>
          <polygon points="0,-6 6,-2 4,5 -4,5 -6,-2" fill="#0A0A0A"/>
        </g>
      `;

  let arms = '';
  let prop = '';
  if (pose === 'bat-raise' || pose === 'helicopter') {
    arms = `
      <path d="M-20 -18 L-52 -56 L-40 -66 L-12 -28 Z" fill="${skinTone}"/>
      <path d="M18 -20 L54 -72 L66 -62 L28 -8 Z" fill="${skinTone}"/>
    `;
    prop = `
      <g transform="translate(58, -72) rotate(18)">
        <rect x="-5" y="-58" width="12" height="54" rx="3" fill="#E6C28B" stroke="#854D0E" stroke-width="1.5"/>
        <rect x="-2" y="-4" width="6" height="16" fill="#0A0A0A"/>
      </g>
    `;
  } else if (pose === 'bowler-roar' || pose === 'siuu-leap') {
    arms = `
      <path d="M-22 -18 L-68 -44 L-60 -56 L-14 -30 Z" fill="${skinTone}"/>
      <path d="M22 -18 L68 -44 L60 -56 L14 -30 Z" fill="${skinTone}"/>
    `;
  } else if (pose === 'sky-point') {
    arms = `
      <path d="M-20 -18 L-34 -82 L-22 -84 L-8 -20 Z" fill="${skinTone}"/>
      <path d="M20 -18 L34 -82 L22 -84 L8 -20 Z" fill="${skinTone}"/>
    `;
  } else if (pose === 'knee-slide') {
    arms = `
      <path d="M-24 -12 L8 6 L4 18 L-28 0 Z" fill="${skinTone}"/>
      <path d="M24 -12 L-8 6 L-4 18 L28 0 Z" fill="${skinTone}"/>
    `;
  } else if (pose === 'trophy-lift') {
    arms = `
      <path d="M-20 -18 L-32 -66 L-20 -68 L-8 -20 Z" fill="${skinTone}"/>
      <path d="M20 -18 L32 -66 L20 -68 L8 -20 Z" fill="${skinTone}"/>
    `;
    prop = `
      <g transform="translate(0, -82)">
        <path d="M-18 -14 L18 -14 L10 10 L-10 10 Z" fill="#FACC15" stroke="#92400E" stroke-width="1.5"/>
        <rect x="-3" y="10" width="6" height="12" fill="#FACC15"/>
        <rect x="-12" y="22" width="24" height="6" rx="2" fill="#92400E"/>
      </g>
    `;
  } else {
    arms = `
      <path d="M-22 -18 L-58 8 L-48 18 L-14 -6 Z" fill="${skinTone}"/>
      <path d="M20 -20 L58 -58 L68 -46 L28 -8 Z" fill="${skinTone}"/>
    `;
    prop =
      discipline === 'cricket'
        ? `<rect x="52" y="-88" width="10" height="44" rx="3" fill="#E6C28B" transform="rotate(24 57 -66)"/>`
        : '';
  }

  const numberTextColor = jerseyColor.toLowerCase() === '#ffffff' || jerseyColor.toLowerCase() === '#facc15' || jerseyColor.toLowerCase() === '#bae6fd'
    ? '#0A0A0A'
    : '#FFFFFF';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
    <defs>
      <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${skyTop}"/>
        <stop offset="100%" stop-color="${skyBottom}"/>
      </linearGradient>
    </defs>
    <rect width="300" height="400" fill="url(#${id})"/>
    <!-- Stadium Floodlight Towers -->
    <rect x="26" y="42" width="48" height="30" rx="4" fill="#FEF3C7" opacity="0.92"/>
    <rect x="226" y="42" width="48" height="30" rx="4" fill="#FEF3C7" opacity="0.92"/>
    <polygon points="50,72 18,220 96,220" fill="#FEF3C7" opacity="0.12"/>
    <polygon points="250,72 204,220 282,220" fill="#FEF3C7" opacity="0.12"/>
    <!-- Stadium Tier -->
    <path d="M0 220 Q150 192 300 220 L300 284 L0 284 Z" fill="#1E293B" opacity="0.72"/>
    <path d="M0 248 Q150 226 300 248" stroke="#FCD34D" stroke-width="2" fill="none" opacity="0.45"/>
    <!-- Field Turf -->
    <rect x="0" y="280" width="300" height="120" fill="${turfColor}"/>
    <line x1="0" y1="322" x2="300" y2="322" stroke="#FFFFFF" stroke-width="2" opacity="0.3"/>
    ${gear}
    <!-- Athlete Silhouette & Kit -->
    <g transform="translate(150, 198)">
      <ellipse cx="0" cy="118" rx="44" ry="9" fill="#000000" opacity="0.28"/>
      ${arms}
      ${prop}
      <!-- Head & Hair -->
      <circle cx="0" cy="-42" r="18" fill="${skinTone}"/>
      <path d="M-18 -45 C-18 -64 18 -64 18 -45 C12 -52 -12 -52 -18 -45 Z" fill="#18181B"/>
      <!-- Jersey -->
      <path d="M-28 -24 Q0 -32 28 -24 L25 36 L-25 36 Z" fill="${jerseyColor}"/>
      <path d="M-28 -24 Q0 -16 28 -24 L24 -14 Q0 -8 -24 -14 Z" fill="${jerseyTrim}"/>
      <text x="0" y="18" text-anchor="middle" fill="${numberTextColor}" font-family="Arial, sans-serif" font-weight="900" font-size="24">${safeNum}</text>
      <!-- Shorts / Trousers & Legs -->
      <path d="M-25 36 L25 36 L28 70 L5 70 L0 50 L-5 70 L-28 70 Z" fill="${jerseyColor}"/>
      <path d="M-24 70 L-28 110 L-14 112 L-8 70 Z" fill="${discipline === 'cricket' ? jerseyColor : skinTone}"/>
      <path d="M8 70 L20 110 L34 106 L22 70 Z" fill="${discipline === 'cricket' ? jerseyColor : skinTone}"/>
      <rect x="-31" y="108" width="17" height="9" rx="3" fill="#FFFDF7"/>
      <rect x="18" y="104" width="17" height="9" rx="3" fill="#FFFDF7"/>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
