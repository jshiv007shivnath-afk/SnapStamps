// Museum-grade vintage risograph & WPA travel/sports poster SVG artwork generator.
// Deterministic, 100% offline, zero external URLs, and cleanly composed above PerforatedStampCard's title ribbon.

import type { StampCategory, StampThemeTag } from '../types/stamp';

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
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

type ResolvedCountryScene =
  | CountrySceneKind
  | 'aurora'
  | 'balloon'
  | 'savanna'
  | 'baobab'
  | 'windmill'
  | 'sydney'
  | 'petra'
  | 'angkor'
  | 'mayan'
  | 'dubai'
  | 'petronas'
  | 'marina-bay';

function resolveSpecializedScene(
  title: string,
  city: string | undefined,
  fallback: CountrySceneKind
): ResolvedCountryScene {
  const text = `${title} ${city ?? ''}`.toLowerCase();
  if (text.includes('iceland') || text.includes('vik') || text.includes('aurora')) return 'aurora';
  if (text.includes('cappadocia') || text.includes('turkey')) return 'balloon';
  if (text.includes('kenya') || text.includes('mara') || text.includes('serengeti') || text.includes('savanna')) return 'savanna';
  if (text.includes('madagascar') || text.includes('baobab') || text.includes('morondava')) return 'baobab';
  if (text.includes('netherlands') || text.includes('amsterdam') || text.includes('windmill')) return 'windmill';
  if (text.includes('australia') || text.includes('sydney')) return 'sydney';
  if (text.includes('jordan') || text.includes('petra')) return 'petra';
  if (text.includes('cambodia') || text.includes('siem reap') || text.includes('angkor')) return 'angkor';
  if (text.includes('mexico') || text.includes('chichen')) return 'mayan';
  if (text.includes('dubai') || text.includes('united arab emirates') || text.includes('uae')) return 'dubai';
  if (text.includes('malaysia') || text.includes('kuala lumpur')) return 'petronas';
  if (text.includes('singapore') || text.includes('marina bay')) return 'marina-bay';
  return fallback;
}

function buildPostmarkSeal(code: string, x: number, y: number, color = '#FFFDF7'): string {
  const safeCode = esc(code.slice(0, 6).toUpperCase());
  return `
    <g transform="translate(${x}, ${y}) rotate(-11)" opacity="0.34">
      <circle cx="0" cy="0" r="24" fill="none" stroke="${color}" stroke-width="1.3"/>
      <circle cx="0" cy="0" r="19" fill="none" stroke="${color}" stroke-width="0.8" stroke-dasharray="2.5 2"/>
      <text x="0" y="-4" text-anchor="middle" fill="${color}" font-family="Georgia, serif" font-size="6.5" font-weight="700" letter-spacing="1.2">AIR MAIL</text>
      <line x1="-15" y1="0" x2="15" y2="0" stroke="${color}" stroke-width="0.75"/>
      <text x="0" y="9" text-anchor="middle" fill="${color}" font-family="Georgia, serif" font-size="6.5" font-weight="700" letter-spacing="1">${safeCode}</text>
      <path d="M27 -7 Q36 -11 45 -7 T63 -7 M27 0 Q36 -4 45 0 T63 0 M27 7 Q36 3 45 7 T63 7" fill="none" stroke="${color}" stroke-width="1.1" stroke-linecap="round"/>
    </g>
  `;
}

function buildVintageFrame(inkColor = '#FFFDF7'): string {
  return `
    <rect x="9" y="9" width="282" height="382" rx="4" fill="none" stroke="${inkColor}" stroke-width="1.2" opacity="0.45"/>
    <rect x="13" y="13" width="274" height="374" rx="2" fill="none" stroke="${inkColor}" stroke-width="0.6" opacity="0.28"/>
  `;
}

function buildBirds(x: number, y: number, color = '#1F2937', opacity = 0.45): string {
  return `
    <g transform="translate(${x}, ${y})" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" opacity="${opacity}">
      <path d="M0 0 Q4 -5 9 0 Q14 -5 18 0"/>
      <path d="M24 -10 Q27 -14 31 -10 Q35 -14 38 -10"/>
      <path d="M14 11 Q17 8 20 11 Q23 8 26 11"/>
    </g>
  `;
}

function buildClouds(seed: number, tint = '#FFFDF7'): string {
  const shift = (seed % 34) - 17;
  return `
    <g fill="${tint}" opacity="0.28">
      <path d="M${18 + shift} 78 Q${42 + shift} 60 ${68 + shift} 72 Q${88 + shift} 62 ${108 + shift} 78 Z"/>
      <path d="M${182 - shift} 102 Q${206 - shift} 85 ${234 - shift} 96 Q${256 - shift} 88 ${278 - shift} 102 Z"/>
      <ellipse cx="${72 + shift}" cy="126" rx="34" ry="5" opacity="0.45"/>
      <ellipse cx="${224 - shift}" cy="64" rx="28" ry="4" opacity="0.4"/>
    </g>
  `;
}

export function buildCountryStampSvg({
  title,
  city,
  skyTop,
  skyBottom,
  sunColor,
  landColor,
  accentColor,
  scene,
}: {
  title: string;
  city?: string;
  skyTop: string;
  skyBottom: string;
  sunColor: string;
  landColor: string;
  accentColor: string;
  scene: CountrySceneKind;
}): string {
  const seed = hashSeed(`${title}|${city ?? ''}|${scene}`);
  const resolved = resolveSpecializedScene(title, city, scene);
  const uid = `cs_${seed.toString(36)}`;
  const sunX = resolved === 'savanna' || resolved === 'baobab' ? 150 : 112 + (seed % 76);
  const sunY = resolved === 'savanna' || resolved === 'baobab' ? 176 : 94 + (seed % 34);
  const sunR = resolved === 'savanna' ? 68 : resolved === 'baobab' ? 62 : 44 + (seed % 14);
  const badgeCode = (city || title).replace(/[^A-Za-z]/g, '').slice(0, 5) || 'WORLD';

  let motif = '';

  if (resolved === 'aurora') {
    motif = `
      <!-- Starfield -->
      <g fill="#FFFDF7" opacity="0.72">
        <circle cx="42" cy="44" r="1.4"/><circle cx="88" cy="34" r="1.1"/><circle cx="132" cy="52" r="1.6"/>
        <circle cx="192" cy="36" r="1.3"/><circle cx="246" cy="48" r="1.5"/><circle cx="268" cy="84" r="1.1"/>
        <circle cx="64" cy="92" r="1.2"/><circle cx="164" cy="74" r="1.1"/><circle cx="218" cy="70" r="1.4"/>
      </g>
      <!-- Luminous Aurora Ribbons -->
      <path d="M-10 144 Q64 70 142 118 T310 82 L310 140 Q222 170 140 144 T-10 176 Z" fill="#34D399" opacity="0.48"/>
      <path d="M-10 120 Q80 56 164 102 T310 66 L310 100 Q218 134 156 116 T-10 142 Z" fill="#A7F3D0" opacity="0.58"/>
      <path d="M20 96 Q110 42 194 86 T304 54" fill="none" stroke="#ECFEFF" stroke-width="2.5" opacity="0.65"/>
      <!-- Distant Snowy Mountains -->
      <polygon points="0,264 62,188 124,264" fill="#1E293B" opacity="0.82"/>
      <polygon points="154,264 232,172 300,264" fill="#0F172A" opacity="0.9"/>
      <polygon points="62,188 49,212 61,208 72,216" fill="#E0F2FE" opacity="0.82"/>
      <polygon points="232,172 216,204 232,198 248,208" fill="#E0F2FE" opacity="0.82"/>
      <!-- Glassy Arctic Lagoon -->
      <rect x="0" y="256" width="300" height="144" fill="#0F172A"/>
      <path d="M0 256 L300 256 L300 324 Q150 308 0 324 Z" fill="#065F46" opacity="0.62"/>
      <!-- Basalt Sea Stacks (Reynisdrangar) -->
      <polygon points="74,284 86,204 96,284" fill="#090D16"/>
      <polygon points="94,288 112,182 126,288" fill="#090D16"/>
      <polygon points="122,286 135,222 146,286" fill="#1E293B"/>
      <!-- Aurora Water Reflections -->
      <g stroke="#6EE7B7" stroke-linecap="round" opacity="0.48">
        <line x1="48" y1="296" x2="128" y2="296" stroke-width="2.2"/>
        <line x1="158" y1="306" x2="254" y2="306" stroke-width="2"/>
        <line x1="82" y1="322" x2="218" y2="322" stroke-width="1.6"/>
      </g>
    `;
  } else if (resolved === 'balloon') {
    motif = `
      <!-- Rose Anatolian Ridges -->
      <path d="M0 242 Q72 210 156 234 T300 222 L300 400 L0 400 Z" fill="${accentColor}" opacity="0.72"/>
      <path d="M0 270 Q92 246 184 268 T300 258 L300 400 L0 400 Z" fill="${landColor}"/>
      <!-- Fairy Chimneys -->
      <g fill="#5C2612">
        <path d="M24 298 L36 226 L54 298 Z"/>
        <ellipse cx="38" cy="226" rx="11" ry="6" fill="#3F180A"/>
        <path d="M60 304 L72 248 L88 304 Z"/>
        <ellipse cx="73" cy="248" rx="9" ry="5" fill="#3F180A"/>
        <path d="M214 302 L228 232 L248 302 Z"/>
        <ellipse cx="230" cy="232" rx="12" ry="6" fill="#3F180A"/>
        <path d="M254 308 L266 254 L282 308 Z"/>
        <ellipse cx="267" cy="254" rx="9" ry="5" fill="#3F180A"/>
      </g>
      <!-- Drifting Striped Hot Air Balloons -->
      <g transform="translate(92, 134)">
        <ellipse cx="0" cy="0" rx="22" ry="26" fill="#DC2626"/>
        <path d="M-8 -25 Q0 0 -8 24 L8 24 Q0 0 8 -25 Z" fill="#FDE68A"/>
        <rect x="-5" y="29" width="10" height="7" rx="1.5" fill="#451A03"/>
        <line x1="-6" y1="22" x2="-4" y2="29" stroke="#451A03" stroke-width="1"/>
        <line x1="6" y1="22" x2="4" y2="29" stroke="#451A03" stroke-width="1"/>
      </g>
      <g transform="translate(198, 108) scale(0.86)">
        <ellipse cx="0" cy="0" rx="22" ry="26" fill="#0F766E"/>
        <path d="M-8 -25 Q0 0 -8 24 L8 24 Q0 0 8 -25 Z" fill="#FDBA74"/>
        <rect x="-5" y="29" width="10" height="7" rx="1.5" fill="#451A03"/>
      </g>
      <g transform="translate(148, 178) scale(0.62)">
        <ellipse cx="0" cy="0" rx="22" ry="26" fill="#1D4ED8"/>
        <path d="M-7 -24 Q0 0 -7 23 L7 23 Q0 0 7 -24 Z" fill="#FFFDF7"/>
        <rect x="-5" y="29" width="10" height="7" rx="1.5" fill="#451A03"/>
      </g>
      <g transform="translate(242, 166) scale(0.46)">
        <ellipse cx="0" cy="0" rx="22" ry="26" fill="#B45309"/>
        <rect x="-5" y="29" width="10" height="7" rx="1.5" fill="#451A03"/>
      </g>
      <g transform="translate(52, 174) scale(0.42)">
        <ellipse cx="0" cy="0" rx="22" ry="26" fill="#9F1239"/>
        <rect x="-5" y="29" width="10" height="7" rx="1.5" fill="#451A03"/>
      </g>
      <!-- Foreground Valley Rim -->
      <path d="M0 306 Q140 282 300 304 L300 400 L0 400 Z" fill="#3F180A"/>
    `;
  } else if (resolved === 'savanna') {
    motif = `
      <!-- Distant Savanna Ridge -->
      <path d="M0 248 Q74 224 148 240 T300 232 L300 400 L0 400 Z" fill="${accentColor}" opacity="0.62"/>
      <path d="M0 270 Q150 256 300 270 L300 400 L0 400 Z" fill="${landColor}"/>
      <!-- Iconic Flat-Top Acacia Trees -->
      <g fill="#2A1205">
        <path d="M68 292 Q72 248 64 218 L72 218 Q80 248 78 292 Z"/>
        <path d="M66 226 L42 206 L46 202 L68 220 Z"/>
        <path d="M72 224 L104 202 L108 206 L74 230 Z"/>
        <ellipse cx="72" cy="198" rx="54" ry="12"/>
        <ellipse cx="52" cy="192" rx="28" ry="8"/>
        <ellipse cx="96" cy="194" rx="30" ry="9"/>
      </g>
      <g fill="#3E1B08" transform="translate(158, 34) scale(0.68)">
        <path d="M68 292 Q72 248 64 218 L72 218 Q80 248 78 292 Z"/>
        <ellipse cx="72" cy="202" rx="48" ry="11"/>
        <ellipse cx="52" cy="196" rx="24" ry="7"/>
      </g>
      ${buildBirds(182, 126, '#451A03', 0.55)}
      <!-- Golden Grass Horizon -->
      <path d="M0 308 Q150 296 300 310 L300 400 L0 400 Z" fill="#2A1205"/>
      <path d="M24 306 Q150 296 276 306" stroke="#FDE047" stroke-width="1.5" fill="none" opacity="0.35"/>
    `;
  } else if (resolved === 'baobab') {
    motif = `
      <path d="M0 258 Q150 242 300 258 L300 400 L0 400 Z" fill="${landColor}"/>
      <!-- Avenue of the Baobabs -->
      <g fill="#2B0E06">
        <!-- Left giant baobab -->
        <path d="M44 308 C42 252 46 204 54 166 L74 166 C82 204 86 252 84 308 Z"/>
        <path d="M56 170 L32 138 M64 168 L62 128 M72 170 L98 140 M60 156 L42 152 M70 154 L90 152" stroke="#2B0E06" stroke-width="5.5" stroke-linecap="round"/>
        <ellipse cx="64" cy="132" rx="44" ry="12" opacity="0.92"/>
        <!-- Center-right giant baobab -->
        <path d="M198 312 C196 248 202 194 212 150 L236 150 C246 194 250 248 248 312 Z"/>
        <path d="M214 156 L184 122 M224 152 L222 112 M234 156 L264 126" stroke="#2B0E06" stroke-width="6" stroke-linecap="round"/>
        <ellipse cx="224" cy="118" rx="48" ry="13" opacity="0.92"/>
        <!-- Mid-distance baobabs -->
        <path d="M126 286 C126 252 129 224 134 202 L144 202 C149 224 152 252 152 286 Z" opacity="0.72"/>
        <ellipse cx="139" cy="196" rx="22" ry="7" opacity="0.72"/>
        <path d="M166 282 C166 256 168 234 172 218 L180 218 C184 234 186 256 186 282 Z" opacity="0.62"/>
        <ellipse cx="176" cy="212" rx="18" ry="6" opacity="0.62"/>
      </g>
      <!-- Warm Red Dust Path -->
      <path d="M108 395 Q148 320 156 270 Q164 320 206 395 Z" fill="#B45309" opacity="0.52"/>
    `;
  } else if (resolved === 'windmill') {
    motif = `
      <!-- Soft Dutch Lowland Horizon -->
      <path d="M0 248 Q150 236 300 248 L300 400 L0 400 Z" fill="#15803D"/>
      <!-- Stepped Gable Canal Houses in Distance -->
      <g fill="#7F1D1D" opacity="0.76">
        <path d="M16 248 L16 206 L26 196 L36 206 L36 248 Z"/>
        <path d="M38 248 L38 198 L50 188 L62 198 L62 248 Z" fill="#1E3A8A"/>
        <path d="M64 248 L64 210 L74 200 L84 210 L84 248 Z" fill="#B45309"/>
      </g>
      <!-- Classic Dutch Windmill -->
      <g transform="translate(178, 174)">
        <path d="M-28 96 L-18 6 L18 6 L28 96 Z" fill="#5C2D16"/>
        <path d="M-21 6 Q0 -16 21 6 Z" fill="#3B1D0E"/>
        <rect x="-8" y="64" width="16" height="32" rx="7" fill="#FEF3C7"/>
        <rect x="-6" y="32" width="12" height="14" rx="2" fill="#FEF3C7" opacity="0.88"/>
        <!-- Lattice Windmill Blades -->
        <g transform="translate(0, 6) rotate(32)">
          <line x1="-68" y1="0" x2="68" y2="0" stroke="#1F2937" stroke-width="3.2"/>
          <line x1="0" y1="-68" x2="0" y2="68" stroke="#1F2937" stroke-width="3.2"/>
          <rect x="8" y="-12" width="56" height="11" fill="#FFFDF7" opacity="0.82" stroke="#1F2937" stroke-width="1"/>
          <rect x="-64" y="1" width="56" height="11" fill="#FFFDF7" opacity="0.82" stroke="#1F2937" stroke-width="1"/>
          <rect x="1" y="8" width="11" height="56" fill="#FFFDF7" opacity="0.82" stroke="#1F2937" stroke-width="1"/>
          <rect x="-12" y="-64" width="11" height="56" fill="#FFFDF7" opacity="0.82" stroke="#1F2937" stroke-width="1"/>
          <circle cx="0" cy="0" r="5" fill="#B91C1C"/>
        </g>
      </g>
      <!-- Vibrant Striped Tulip Fields -->
      <path d="M0 282 L300 282 L300 400 L0 400 Z" fill="#166534"/>
      <polygon points="0,308 138,282 146,282 48,364" fill="#E11D48"/>
      <polygon points="62,368 152,282 162,282 126,372" fill="#FACC15"/>
      <polygon points="140,372 168,282 178,282 214,372" fill="#FB7185"/>
      <polygon points="228,370 184,282 194,282 300,328" fill="#F97316"/>
    `;
  } else if (resolved === 'sydney') {
    motif = `
      <!-- Sydney Harbour Bridge Arch in Background -->
      <path d="M14 252 Q126 154 242 252" fill="none" stroke="#334155" stroke-width="6" opacity="0.55"/>
      <path d="M30 252 Q126 174 226 252" fill="none" stroke="#334155" stroke-width="2.5" opacity="0.5"/>
      <rect x="14" y="210" width="16" height="44" fill="#475569" opacity="0.65"/>
      <rect x="224" y="210" width="16" height="44" fill="#475569" opacity="0.65"/>
      <!-- Sparkling Harbor Water -->
      <rect x="0" y="248" width="300" height="152" fill="${landColor}"/>
      <!-- Iconic White Opera House Shells -->
      <g transform="translate(154, 248)">
        <rect x="-106" y="-8" width="212" height="14" rx="2" fill="#D6C6B2"/>
        <path d="M-92 -8 C-84 -62 -46 -84 -24 -8 Z" fill="#FFFDF7"/>
        <path d="M-64 -8 C-56 -80 -10 -106 16 -8 Z" fill="#FFFDF7" stroke="#CBD5E1" stroke-width="1"/>
        <path d="M-18 -8 C-10 -66 24 -88 48 -8 Z" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1"/>
        <path d="M28 -8 C36 -54 64 -70 86 -8 Z" fill="#FFFDF7" stroke="#CBD5E1" stroke-width="1"/>
        <path d="M-54 -8 C-48 -56 -16 -72 4 -8 Z" fill="#1E293B" opacity="0.22"/>
      </g>
      <!-- Water Reflections & Sailboat -->
      <g stroke="#FFFDF7" stroke-linecap="round" opacity="0.45">
        <line x1="64" y1="274" x2="238" y2="274" stroke-width="2.2"/>
        <line x1="88" y1="290" x2="212" y2="290" stroke-width="1.8"/>
        <line x1="112" y1="306" x2="188" y2="306" stroke-width="1.4"/>
      </g>
      <polygon points="56,288 56,246 82,284" fill="#FFFDF7" opacity="0.92"/>
      <path d="M44 290 L84 290 L76 298 L50 298 Z" fill="#0F172A"/>
      ${buildBirds(208, 108, '#0F172A', 0.42)}
    `;
  } else if (resolved === 'petra') {
    motif = `
      <!-- Towering Rose-Red Canyon Siq Cliffs -->
      <polygon points="0,0 74,0 56,310 0,310" fill="#6D1D1D"/>
      <polygon points="300,0 226,0 244,310 300,310" fill="#6D1D1D"/>
      <!-- Carved Al-Khazneh Treasury Facade -->
      <g transform="translate(150, 128)">
        <rect x="-74" y="0" width="148" height="176" fill="#D97757"/>
        <!-- Upper Tholos & Urn -->
        <rect x="-20" y="16" width="40" height="44" fill="#C2593F"/>
        <polygon points="-24,16 0,0 24,16" fill="#9A3412"/>
        <circle cx="0" cy="-4" r="6" fill="#FDE68A"/>
        <rect x="-66" y="20" width="38" height="40" fill="#B84A32"/>
        <rect x="28" y="20" width="38" height="40" fill="#B84A32"/>
        <!-- Classical Pediment -->
        <polygon points="-68,84 0,60 68,84" fill="#FDBA74"/>
        <rect x="-74" y="84" width="148" height="10" fill="#9A3412"/>
        <!-- Fluted Columns & Dark Portal -->
        <rect x="-24" y="94" width="48" height="82" fill="#3B0D0C"/>
        <rect x="-64" y="94" width="11" height="82" fill="#FDBA74"/>
        <rect x="-42" y="94" width="11" height="82" fill="#FDBA74"/>
        <rect x="31" y="94" width="11" height="82" fill="#FDBA74"/>
        <rect x="53" y="94" width="11" height="82" fill="#FDBA74"/>
      </g>
      <!-- Sandstone Courtyard Floor -->
      <path d="M0 302 L300 302 L300 400 L0 400 Z" fill="#4C1414"/>
      <path d="M62 302 L238 302 L274 390 L26 390 Z" fill="#9A3412" opacity="0.45"/>
    `;
  } else if (resolved === 'angkor') {
    motif = `
      <!-- Dawn Jungle Canopy -->
      <path d="M0 248 Q62 216 124 242 T300 236 L300 400 L0 400 Z" fill="#064E3B"/>
      <!-- Five Lotus Sandstone Towers (Angkor Wat) -->
      <g transform="translate(150, 256)" fill="#451A03">
        <rect x="-106" y="-22" width="212" height="24"/>
        <path d="M-16 -22 L-12 -118 Q0 -138 12 -118 L16 -22 Z" fill="#5C260B"/>
        <path d="M-56 -22 L-50 -86 Q-40 -102 -30 -86 L-24 -22 Z" fill="#451A03"/>
        <path d="M24 -22 L30 -86 Q40 -102 50 -86 L56 -22 Z" fill="#451A03"/>
        <path d="M-92 -22 L-86 -62 Q-78 -74 -70 -62 L-64 -22 Z" fill="#3B1606"/>
        <path d="M64 -22 L70 -62 Q78 -74 86 -62 L92 -22 Z" fill="#3B1606"/>
        <!-- Stepped Crown Horizontal Lines -->
        <g stroke="#F59E0B" stroke-width="1.2" opacity="0.55">
          <line x1="-13" y1="-98" x2="13" y2="-98"/>
          <line x1="-14" y1="-74" x2="14" y2="-74"/>
          <line x1="-50" y1="-68" x2="-30" y2="-68"/>
          <line x1="30" y1="-68" x2="50" y2="-68"/>
        </g>
      </g>
      <!-- Reflective Lotus Moat -->
      <rect x="0" y="256" width="300" height="144" fill="${skyBottom}" opacity="0.45"/>
      <rect x="0" y="256" width="300" height="144" fill="#064E3B" opacity="0.65"/>
      <!-- Mirrored Lotus Spire Reflection -->
      <g transform="translate(150, 258) scale(1, -0.58)" fill="#2B0E06" opacity="0.45">
        <path d="M-16 -22 L-12 -118 Q0 -138 12 -118 L16 -22 Z"/>
        <path d="M-56 -22 L-50 -86 Q-40 -102 -30 -86 L-24 -22 Z"/>
        <path d="M24 -22 L30 -86 Q40 -102 50 -86 L56 -22 Z"/>
      </g>
      <g stroke="#FDE68A" stroke-linecap="round" opacity="0.42">
        <line x1="60" y1="286" x2="240" y2="286" stroke-width="2"/>
        <line x1="94" y1="304" x2="206" y2="304" stroke-width="1.5"/>
      </g>
    `;
  } else if (resolved === 'mayan') {
    motif = `
      <!-- Emerald Yucatan Jungle Backdrop -->
      <path d="M0 264 Q76 230 150 256 T300 246 L300 400 L0 400 Z" fill="#14532D"/>
      <!-- Stepped El Castillo Pyramid -->
      <g transform="translate(150, 286)">
        <rect x="-112" y="-18" width="224" height="18" fill="#D97706"/>
        <rect x="-98" y="-36" width="196" height="18" fill="#EAB308"/>
        <rect x="-84" y="-54" width="168" height="18" fill="#D97706"/>
        <rect x="-70" y="-72" width="140" height="18" fill="#EAB308"/>
        <rect x="-56" y="-90" width="112" height="18" fill="#D97706"/>
        <rect x="-42" y="-108" width="84" height="18" fill="#EAB308"/>
        <rect x="-24" y="-134" width="48" height="26" fill="#FDE68A"/>
        <rect x="-9" y="-124" width="18" height="16" fill="#451A03"/>
        <!-- Central Stone Stairway -->
        <polygon points="-14,-108 14,-108 32,0 -32,0" fill="#B45309"/>
        <polygon points="-10,-108 10,-108 24,0 -24,0" fill="#92400E" opacity="0.55"/>
      </g>
      <rect x="0" y="286" width="300" height="114" fill="#166534"/>
      <path d="M0 286 L300 286" stroke="#FDE68A" stroke-width="2" opacity="0.4"/>
    `;
  } else if (resolved === 'dubai') {
    motif = `
      <!-- Sculpted Golden Dunes -->
      <path d="M0 278 Q86 242 174 268 T300 256 L300 400 L0 400 Z" fill="#D97706"/>
      <!-- Burj Khalifa Spire & Skyline -->
      <g transform="translate(150, 274)">
        <rect x="-88" y="-82" width="26" height="82" fill="#1E293B" opacity="0.82"/>
        <rect x="-54" y="-114" width="24" height="114" fill="#334155"/>
        <rect x="34" y="-104" width="26" height="104" fill="#334155"/>
        <rect x="68" y="-72" width="24" height="72" fill="#1E293B" opacity="0.82"/>
        <!-- Center Needle Spire -->
        <polygon points="-22,0 -16,-70 16,-70 22,0" fill="#0F172A"/>
        <polygon points="-14,-70 -9,-136 9,-136 14,-70" fill="#1E293B"/>
        <polygon points="-7,-136 -3,-188 3,-188 7,-136" fill="#334155"/>
        <line x1="0" y1="-188" x2="0" y2="-224" stroke="#FFFDF7" stroke-width="2.6"/>
        <circle cx="0" cy="-224" r="3" fill="#FEF08A"/>
        <!-- Sunlit Glass Ribbons -->
        <line x1="0" y1="0" x2="0" y2="-184" stroke="#7DD3FC" stroke-width="2" opacity="0.72"/>
      </g>
      <path d="M0 296 Q110 274 220 298 T300 290 L300 400 L0 400 Z" fill="#92400E"/>
    `;
  } else if (resolved === 'petronas') {
    motif = `
      <!-- Equatorial Park Canopy -->
      <path d="M0 274 Q82 246 154 268 T300 258 L300 400 L0 400 Z" fill="#064E3B"/>
      <!-- Petronas Twin Spires & Skybridge -->
      <g transform="translate(150, 282)">
        <g transform="translate(-38, 0)">
          <rect x="-18" y="-156" width="36" height="156" rx="3" fill="#CBD5E1"/>
          <rect x="-12" y="-184" width="24" height="28" rx="2" fill="#E2E8F0"/>
          <polygon points="0,-222 -6,-184 6,-184" fill="#FFFDF7"/>
          <line x1="0" y1="-156" x2="0" y2="0" stroke="#1E3A8A" stroke-width="1.5" opacity="0.35"/>
        </g>
        <g transform="translate(38, 0)">
          <rect x="-18" y="-156" width="36" height="156" rx="3" fill="#CBD5E1"/>
          <rect x="-12" y="-184" width="24" height="28" rx="2" fill="#E2E8F0"/>
          <polygon points="0,-222 -6,-184 6,-184" fill="#FFFDF7"/>
          <line x1="0" y1="-156" x2="0" y2="0" stroke="#1E3A8A" stroke-width="1.5" opacity="0.35"/>
        </g>
        <!-- Iconic Double-Decker Skybridge -->
        <rect x="-24" y="-102" width="48" height="8" fill="#FFFDF7"/>
        <line x1="-22" y1="-94" x2="0" y2="-74" stroke="#E2E8F0" stroke-width="2.2"/>
        <line x1="22" y1="-94" x2="0" y2="-74" stroke="#E2E8F0" stroke-width="2.2"/>
      </g>
      <path d="M0 296 Q150 278 300 296 L300 400 L0 400 Z" fill="#065F46"/>
    `;
  } else if (resolved === 'marina-bay') {
    motif = `
      <!-- Twilight Bay Reflections -->
      <rect x="0" y="256" width="300" height="144" fill="#0C4A6E"/>
      <!-- Marina Bay Three Towers & Skypark -->
      <g transform="translate(150, 256)">
        <rect x="-74" y="-128" width="26" height="128" rx="2" fill="#1E293B"/>
        <rect x="-13" y="-132" width="26" height="132" rx="2" fill="#334155"/>
        <rect x="48" y="-128" width="26" height="128" rx="2" fill="#1E293B"/>
        <!-- Boat-Shaped Skypark Deck -->
        <path d="M-96 -130 Q0 -142 104 -136 L92 -122 Q0 -126 -88 -122 Z" fill="#E0F2FE"/>
        <!-- Glowing Window Dots -->
        <g fill="#FDE047" opacity="0.65">
          <rect x="-66" y="-110" width="10" height="3"/><rect x="-66" y="-94" width="10" height="3"/>
          <rect x="-5" y="-112" width="10" height="3"/><rect x="-5" y="-90" width="10" height="3"/>
          <rect x="56" y="-110" width="10" height="3"/><rect x="56" y="-94" width="10" height="3"/>
        </g>
      </g>
      <g stroke="#38BDF8" stroke-linecap="round" opacity="0.55">
        <line x1="48" y1="278" x2="252" y2="278" stroke-width="2.2"/>
        <line x1="76" y1="294" x2="224" y2="294" stroke-width="1.8"/>
        <line x1="102" y1="310" x2="198" y2="310" stroke-width="1.4"/>
      </g>
    `;
  } else if (resolved === 'mountain') {
    const isHimalaya = `${title} ${city ?? ''}`.toLowerCase().match(/nepal|bhutan|kilimanjaro|peru|machu/);
    motif = `
      <!-- Distant Atmospheric Ridge -->
      <polygon points="-10,268 72,166 154,242 224,158 310,268" fill="${accentColor}" opacity="0.58"/>
      <!-- Heroic Alpine Peaks with Faceted Shadow -->
      <polygon points="8,286 106,136 204,286" fill="${landColor}"/>
      <polygon points="106,136 204,286 134,286" fill="#0A0A0A" opacity="0.22"/>
      <polygon points="106,136 82,174 96,170 108,184 124,172" fill="#FFFDF7" opacity="0.94"/>
      <polygon points="122,286 218,120 306,286" fill="${landColor}"/>
      <polygon points="218,120 306,286 238,286" fill="#0A0A0A" opacity="0.24"/>
      <polygon points="218,120 192,164 208,158 220,172 236,158 244,166" fill="#FFFDF7" opacity="0.95"/>
      <!-- Glacial Mirror Lake & Pine Foreground -->
      <rect x="0" y="274" width="300" height="126" fill="${skyTop}" opacity="0.72"/>
      <polygon points="122,276 218,342 300,276" fill="${landColor}" opacity="0.32"/>
      <g stroke="#FFFDF7" stroke-linecap="round" opacity="0.45">
        <line x1="56" y1="296" x2="244" y2="296" stroke-width="2"/>
        <line x1="92" y1="314" x2="208" y2="314" stroke-width="1.5"/>
      </g>
      <!-- Pine Tree Silhouettes -->
      <g fill="#0F172A" opacity="0.88">
        <polygon points="18,318 32,258 46,318"/>
        <polygon points="40,322 52,274 64,322"/>
        <polygon points="244,322 258,266 272,322"/>
        <polygon points="266,320 280,254 294,320"/>
      </g>
      ${isHimalaya ? `<path d="M22 246 Q150 264 278 242" fill="none" stroke="#FFFDF7" stroke-width="1.2" stroke-dasharray="6 5" opacity="0.7"/>` : ''}
      ${buildBirds(74, 108, '#1F2937', 0.42)}
    `;
  } else if (resolved === 'pagoda') {
    const countryLower = `${title} ${city ?? ''}`.toLowerCase();
      if (countryLower.includes('bhutan') || countryLower.includes('tibet') || countryLower.includes('nepal')) {
        // Cliffside Himalayan Monastery & Prayer Flags
        motif = `
          <path d="M0 248 L72 172 L152 248 L228 164 L300 248 L300 400 L0 400 Z" fill="${accentColor}" opacity="0.58"/>
          <path d="M0 264 L96 196 L184 268 L266 206 L300 260 L300 400 L0 400 Z" fill="${landColor}"/>
          <!-- Cliffside Dzong Monastery -->
          <g transform="translate(150, 146)">
            <rect x="-56" y="42" width="112" height="62" rx="2" fill="#FFFDF7"/>
            <rect x="-62" y="34" width="124" height="10" rx="1.5" fill="#991B1B"/>
            <polygon points="-66,34 0,12 66,34" fill="#F59E0B"/>
            <rect x="-26" y="2" width="52" height="22" fill="#FFFDF7"/>
            <polygon points="-32,2 0,-16 32,2" fill="#F59E0B"/>
            <rect x="-42" y="54" width="10" height="14" rx="1" fill="#1E293B"/>
            <rect x="-18" y="54" width="10" height="14" rx="1" fill="#1E293B"/>
            <rect x="8" y="54" width="10" height="14" rx="1" fill="#1E293B"/>
            <rect x="32" y="54" width="10" height="14" rx="1" fill="#1E293B"/>
            <rect x="-12" y="76" width="24" height="28" rx="12" fill="#7F1D1D"/>
          </g>
          <!-- Fluttering Prayer Flag Line -->
          <path d="M12 104 Q150 148 288 94" fill="none" stroke="#1E293B" stroke-width="1.2" opacity="0.65"/>
          <g opacity="0.88">
            <rect x="34" y="109" width="12" height="9" fill="#2563EB" transform="rotate(14 34 109)"/>
            <rect x="64" y="118" width="12" height="9" fill="#FFFDF7" transform="rotate(10 64 118)"/>
            <rect x="94" y="123" width="12" height="9" fill="#DC2626" transform="rotate(6 94 123)"/>
            <rect x="196" y="118" width="12" height="9" fill="#16A34A" transform="rotate(-10 196 118)"/>
            <rect x="228" y="111" width="12" height="9" fill="#FACC15" transform="rotate(-14 228 111)"/>
          </g>
          ${buildBirds(206, 76, '#1E293B', 0.45)}
        `;
      } else if (countryLower.includes('thailand') || countryLower.includes('bangkok') || countryLower.includes('myanmar')) {
        // Golden Siamese Chedi Spire & Lotus Sanctuary
        motif = `
          <rect x="0" y="274" width="300" height="126" fill="${landColor}"/>
          <path d="M0 274 Q150 258 300 274" fill="none" stroke="#FDE047" stroke-width="1.6" opacity="0.5"/>
          <g transform="translate(150, 96)">
            <!-- Stepped Golden Chedi Spire -->
            <polygon points="-2,0 2,0 9,74 -9,74" fill="#FDE047"/>
            <path d="M-24 124 C-24 84 24 84 24 124 Z" fill="#F59E0B"/>
            <rect x="-38" y="124" width="76" height="18" rx="2" fill="#B45309"/>
            <rect x="-54" y="142" width="108" height="36" rx="2" fill="#92400E"/>
            <!-- Flanking Ornamental Gables -->
            <polygon points="-86,178 -62,126 -38,178" fill="#D97706"/>
            <polygon points="38,178 62,126 86,178" fill="#D97706"/>
            <path d="M-12 178 L-12 152 A12 12 0 0 1 12 152 L12 178 Z" fill="#FEF3C7"/>
          </g>
          <!-- Mirror River Shimmer -->
          <g stroke="#FEF08A" stroke-linecap="round" opacity="0.45">
            <line x1="88" y1="294" x2="212" y2="294" stroke-width="2.2"/>
            <line x1="110" y1="308" x2="190" y2="308" stroke-width="1.8"/>
            <line x1="126" y1="322" x2="174" y2="322" stroke-width="1.4"/>
          </g>
        `;
      } else {
        motif = `
          <path d="M0 248 Q75 212 150 238 T300 226 L300 400 L0 400 Z" fill="${accentColor}" opacity="0.55"/>
          <path d="M0 278 Q150 264 300 278 L300 400 L0 400 Z" fill="${landColor}"/>
          <!-- Five-Tiered Architectural Pagoda -->
          <g transform="translate(150, 108)">
            <rect x="-46" y="132" width="92" height="44" fill="#1E293B"/>
            <path d="M-74 134 Q0 116 74 134 L54 114 L-54 114 Z" fill="${landColor}"/>
            <rect x="-36" y="88" width="72" height="28" fill="#1E293B"/>
            <path d="M-62 90 Q0 74 62 90 L44 72 L-44 72 Z" fill="${landColor}"/>
            <rect x="-26" y="48" width="52" height="26" fill="#1E293B"/>
            <path d="M-48 50 Q0 36 48 50 L32 34 L-32 34 Z" fill="${landColor}"/>
            <polygon points="-4,34 0,-6 4,34" fill="#FDE68A"/>
            <rect x="-12" y="142" width="24" height="26" rx="2" fill="#FEF3C7" opacity="0.88"/>
            <rect x="-10" y="96" width="20" height="14" rx="1.5" fill="#FEF3C7" opacity="0.85"/>
            <rect x="-8" y="55" width="16" height="12" rx="1.5" fill="#FEF3C7" opacity="0.85"/>
          </g>
          <path d="M0 58 Q58 64 96 96" fill="none" stroke="#1E293B" stroke-width="3.5" stroke-linecap="round"/>
          <g fill="#FFF1F2" opacity="0.88">
            <circle cx="48" cy="64" r="5"/><circle cx="68" cy="74" r="6"/><circle cx="88" cy="90" r="4.5"/><circle cx="32" cy="70" r="4"/>
          </g>
          <path d="M62 304 L238 304 M90 320 L210 320" stroke="#FFFDF7" stroke-width="1.8" opacity="0.38"/>
        `;
      }
  } else if (resolved === 'coastal') {
    const coastalLower = `${title} ${city ?? ''}`.toLowerCase();
    const isMediterraneanCliff =
      coastalLower.includes('portugal') ||
      coastalLower.includes('lisbon') ||
      coastalLower.includes('croatia') ||
      coastalLower.includes('greece') ||
      coastalLower.includes('spain') ||
      coastalLower.includes('italy') ||
      coastalLower.includes('ireland') ||
      coastalLower.includes('malta') ||
      seed % 2 === 1;

    if (isMediterraneanCliff) {
      // Sunlit Coastal Headland, Striped Lighthouse & White Terracotta Houses
      motif = `
        <!-- Terracotta Coastal Cliff & Old Town -->
        <path d="M0 246 L0 162 Q78 158 144 218 L184 258 L0 258 Z" fill="${landColor}"/>
        <path d="M0 246 Q68 202 152 246 L0 258 Z" fill="#1E293B" opacity="0.32"/>
        <!-- Striped Coastal Lighthouse -->
        <g transform="translate(56, 108)">
          <polygon points="-10,64 -6,6 6,6 10,64" fill="#FFFDF7"/>
          <rect x="-8" y="20" width="16" height="10" fill="#DC2626"/>
          <rect x="-9" y="42" width="18" height="10" fill="#DC2626"/>
          <rect x="-8" y="-2" width="16" height="9" rx="2" fill="#FEF08A"/>
          <polygon points="-11,-2 0,-12 11,-2" fill="#1E293B"/>
        </g>
        <!-- Terracotta Roofed Hillside Houses -->
        <g transform="translate(102, 184)">
          <rect x="0" y="14" width="24" height="24" fill="#FFFDF7"/>
          <polygon points="-3,14 12,4 27,14" fill="#EA580C"/>
          <rect x="26" y="24" width="22" height="22" fill="#FAF4E8"/>
          <polygon points="24,24 37,15 50,24" fill="#C2410C"/>
        </g>
        <!-- Deep Harbor Water & Sun Reflection -->
        <rect x="0" y="254" width="300" height="146" fill="${skyTop}" opacity="0.86"/>
        <g fill="${sunColor}" opacity="0.48">
          <rect x="176" y="268" width="72" height="3.5" rx="1.5"/>
          <rect x="190" y="280" width="48" height="3" rx="1.5"/>
          <rect x="202" y="292" width="32" height="2.5" rx="1"/>
        </g>
        <!-- Twin Sailboats -->
        <g transform="translate(218, 256) scale(0.84)">
          <polygon points="0,-54 0,-4 30,-8" fill="#FFFDF7"/>
          <polygon points="-4,-42 -4,-4 -20,-8" fill="#FFFDF7" opacity="0.8"/>
          <path d="M-24 0 L32 0 L24 10 L-16 10 Z" fill="#1E293B"/>
        </g>
        ${buildBirds(182, 92, '#1F2937', 0.44)}
      `;
    } else {
      motif = `
        <path d="M164 246 Q226 178 300 206 L300 264 L148 264 Z" fill="${accentColor}"/>
        <path d="M0 248 Q58 214 114 252 L0 264 Z" fill="${landColor}" opacity="0.65"/>
        <rect x="0" y="252" width="300" height="148" fill="${landColor}"/>
        <g fill="${sunColor}" opacity="0.52">
          <rect x="${sunX - 38}" y="264" width="76" height="4" rx="2"/>
          <rect x="${sunX - 28}" y="276" width="56" height="3.5" rx="2"/>
          <rect x="${sunX - 18}" y="288" width="36" height="3" rx="1.5"/>
        </g>
        <g transform="translate(114, 260)">
          <polygon points="0,-58 0,-4 34,-8" fill="#FFFDF7"/>
          <polygon points="-4,-48 -4,-4 -24,-8" fill="#FFFDF7" opacity="0.82"/>
          <path d="M-28 0 L38 0 L28 12 L-18 12 Z" fill="#1E293B"/>
        </g>
        <g fill="#0F291E" opacity="0.85">
          <path d="M0 164 Q42 128 84 148 Q44 146 0 184 Z"/>
          <path d="M0 146 Q36 96 76 106 Q42 114 0 162 Z"/>
          <path d="M300 132 Q254 96 218 118 Q256 118 300 154 Z"/>
        </g>
        ${buildBirds(186, 104, '#1F2937', 0.44)}
      `;
    }
  } else if (resolved === 'arch') {
    motif = `
      <!-- Courtyard Cypress & Sunlit Backdrop -->
      <rect x="0" y="284" width="300" height="116" fill="${landColor}"/>
      <ellipse cx="150" cy="236" rx="22" ry="52" fill="#14532D" opacity="0.72"/>
      <!-- Ornate Moorish / Roman Architectural Archway -->
      <path d="M24 294 L24 120 Q150 106 276 120 L276 294 L208 294 L208 212 A58 58 0 0 0 92 212 L92 294 Z" fill="${accentColor}"/>
      <path d="M92 294 L92 212 A58 58 0 0 1 208 212 L208 294" fill="none" stroke="#FFFDF7" stroke-width="3" opacity="0.65"/>
      <!-- Geometric Tile Band -->
      <rect x="24" y="128" width="252" height="12" fill="${landColor}" opacity="0.45"/>
      <rect x="44" y="162" width="26" height="58" rx="13" fill="${skyBottom}" opacity="0.78"/>
      <rect x="230" y="162" width="26" height="58" rx="13" fill="${skyBottom}" opacity="0.78"/>
      <!-- Courtyard Mosaic Reflection -->
      <path d="M112 294 L188 294 L212 368 L88 368 Z" fill="#FFFDF7" opacity="0.22"/>
    `;
  } else if (resolved === 'dome') {
    motif = `
      <!-- Reflections Courtyard -->
      <rect x="0" y="280" width="300" height="120" fill="${landColor}"/>
      <!-- Twin Minarets -->
      <rect x="46" y="164" width="16" height="116" rx="3" fill="#FFFDF7"/>
      <path d="M44 164 Q54 146 64 164 Z" fill="${accentColor}"/>
      <rect x="238" y="164" width="16" height="116" rx="3" fill="#FFFDF7"/>
      <path d="M236 164 Q246 146 256 164 Z" fill="${accentColor}"/>
      <!-- Central Fluted Onion Dome & Sanctuary -->
      <path d="M96 208 C96 130 204 130 204 208 Z" fill="#FFFDF7"/>
      <path d="M126 208 C126 146 174 146 174 208 Z" fill="${accentColor}" opacity="0.28"/>
      <line x1="150" y1="126" x2="150" y2="148" stroke="#FDE047" stroke-width="3"/>
      <rect x="74" y="208" width="152" height="72" fill="#FAF4E8"/>
      <path d="M122 280 L122 232 A28 28 0 0 1 178 232 L178 280 Z" fill="${accentColor}"/>
      <rect x="86" y="226" width="20" height="36" rx="10" fill="${landColor}" opacity="0.65"/>
      <rect x="194" y="226" width="20" height="36" rx="10" fill="${landColor}" opacity="0.65"/>
      <!-- Mirror Reflecting Pool -->
      <polygon points="122,284 178,284 208,370 92,370" fill="${skyBottom}" opacity="0.48"/>
      <line x1="106" y1="308" x2="194" y2="308" stroke="#FFFDF7" stroke-width="1.6" opacity="0.5"/>
    `;
  } else if (resolved === 'pyramid') {
    motif = `
      <path d="M0 282 Q150 264 300 282 L300 400 L0 400 Z" fill="${landColor}"/>
      <polygon points="22,284 124,148 220,284" fill="${accentColor}"/>
      <polygon points="124,148 220,284 152,284" fill="#0A0A0A" opacity="0.22"/>
      <polygon points="160,284 234,186 296,284" fill="${accentColor}" opacity="0.92"/>
      <polygon points="234,186 296,284 252,284" fill="#0A0A0A" opacity="0.22"/>
      <!-- Foreground Sculpted Dunes -->
      <path d="M0 304 Q90 278 186 306 T300 296 L300 400 L0 400 Z" fill="#78350F" opacity="0.72"/>
      ${buildBirds(196, 104, '#451A03', 0.45)}
    `;
  } else if (resolved === 'fjord') {
    const fjordLower = `${title} ${city ?? ''}`.toLowerCase();
    if (fjordLower.includes('vietnam') || fjordLower.includes('ha long') || fjordLower.includes('philippines')) {
      // Emerald Limestone Karst Pillars & Traditional Wooden Junk Boat
      motif = `
        <!-- Misty Distant Limestone Islands -->
        <path d="M18 264 Q36 174 62 186 Q86 196 98 264 Z" fill="${accentColor}" opacity="0.65"/>
        <path d="M188 264 Q212 162 246 176 Q272 188 286 264 Z" fill="${accentColor}" opacity="0.68"/>
        <!-- Iconic Sculpted Karst Pillars -->
        <path d="M62 272 Q74 188 106 192 Q132 196 142 272 Z" fill="${landColor}"/>
        <path d="M214 274 Q230 198 260 202 Q284 208 298 274 Z" fill="${landColor}" opacity="0.92"/>
        <!-- Emerald Bay Water -->
        <rect x="0" y="264" width="300" height="136" fill="${skyTop}" opacity="0.88"/>
        <!-- Traditional Ribbed Junk Sailboat -->
        <g transform="translate(158, 266)">
          <path d="M-28 0 L34 0 L24 11 L-20 11 Z" fill="#451A03"/>
          <path d="M-4 -4 L-4 -52 Q24 -44 26 -8 Z" fill="#B45309"/>
          <path d="M-4 -40 L20 -34 M-4 -28 L24 -22 M-4 -16 L25 -12" stroke="#451A03" stroke-width="1.2"/>
          <path d="M-10 -4 L-10 -38 Q-24 -32 -22 -8 Z" fill="#D97706"/>
        </g>
        <g stroke="#FFFDF7" stroke-linecap="round" opacity="0.42">
          <line x1="68" y1="292" x2="232" y2="292" stroke-width="2"/>
          <line x1="98" y1="308" x2="202" y2="308" stroke-width="1.5"/>
        </g>
      `;
    } else {
      motif = `
        <polygon points="0,288 0,126 128,242 96,288" fill="${landColor}"/>
        <polygon points="300,288 300,118 168,242 204,288" fill="${accentColor}"/>
        <path d="M56 176 Q64 218 60 270" fill="none" stroke="#E0F2FE" stroke-width="4" opacity="0.82"/>
        <path d="M234 166 Q226 214 230 270" fill="none" stroke="#E0F2FE" stroke-width="3" opacity="0.7"/>
        <rect x="0" y="266" width="300" height="134" fill="${skyTop}" opacity="0.84"/>
        <polygon points="0,266 96,266 42,340 0,340" fill="${landColor}" opacity="0.34"/>
        <polygon points="204,266 300,266 300,340 258,340" fill="${accentColor}" opacity="0.3"/>
        <polygon points="150,262 150,224 172,256" fill="#FFFDF7" opacity="0.9"/>
        <path d="M132 264 L176 264 L168 272 L140 272 Z" fill="#0F172A"/>
        <g stroke="#FFFDF7" stroke-linecap="round" opacity="0.42">
          <line x1="76" y1="296" x2="224" y2="296" stroke-width="2"/>
          <line x1="102" y1="316" x2="198" y2="316" stroke-width="1.5"/>
        </g>
      `;
    }
  } else {
    // Rich Art-Deco Skyline with illuminated windows & harbor reflection
    motif = `
      <g fill="${landColor}" opacity="0.72">
        <rect x="22" y="188" width="32" height="96"/>
        <rect x="64" y="150" width="38" height="134"/>
        <rect x="206" y="160" width="36" height="124"/>
        <rect x="248" y="196" width="30" height="88"/>
      </g>
      <g fill="#0F172A">
        <rect x="108" y="120" width="44" height="164"/>
        <polygon points="130,78 118,120 142,120" fill="${accentColor}"/>
        <line x1="130" y1="54" x2="130" y2="80" stroke="#FFFDF7" stroke-width="2"/>
        <rect x="160" y="142" width="40" height="142" fill="#1E293B"/>
      </g>
      <!-- Illuminated Golden Window Grid -->
      <g fill="#FEF08A" opacity="0.72">
        <rect x="116" y="136" width="8" height="4"/><rect x="134" y="136" width="8" height="4"/>
        <rect x="116" y="152" width="8" height="4"/><rect x="134" y="152" width="8" height="4"/>
        <rect x="116" y="168" width="8" height="4"/><rect x="134" y="168" width="8" height="4"/>
        <rect x="168" y="158" width="8" height="4"/><rect x="184" y="158" width="8" height="4"/>
        <rect x="168" y="176" width="8" height="4"/><rect x="184" y="176" width="8" height="4"/>
        <rect x="74" y="168" width="8" height="4"/><rect x="74" y="186" width="8" height="4"/>
      </g>
      <!-- Waterfront Shimmer -->
      <rect x="0" y="280" width="300" height="120" fill="${landColor}"/>
      <g stroke="#FEF08A" stroke-linecap="round" opacity="0.4">
        <line x1="68" y1="298" x2="232" y2="298" stroke-width="2"/>
        <line x1="98" y1="314" x2="202" y2="314" stroke-width="1.6"/>
      </g>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
    <defs>
      <linearGradient id="${uid}_sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${skyTop}"/>
        <stop offset="62%" stop-color="${skyBottom}"/>
        <stop offset="100%" stop-color="${accentColor}"/>
      </linearGradient>
      <radialGradient id="${uid}_sun" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${sunColor}" stop-opacity="0.98"/>
        <stop offset="58%" stop-color="${sunColor}" stop-opacity="0.42"/>
        <stop offset="100%" stop-color="${sunColor}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${uid}_vignette" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0A0A0A" stop-opacity="0.14"/>
        <stop offset="22%" stop-color="#0A0A0A" stop-opacity="0"/>
        <stop offset="78%" stop-color="#0A0A0A" stop-opacity="0"/>
        <stop offset="100%" stop-color="#0A0A0A" stop-opacity="0.28"/>
      </linearGradient>
    </defs>
    <rect width="300" height="400" fill="url(#${uid}_sky)"/>
    ${
      resolved !== 'aurora'
        ? `<circle cx="${sunX}" cy="${sunY}" r="${sunR * 1.9}" fill="url(#${uid}_sun)"/>
           <circle cx="${sunX}" cy="${sunY}" r="${sunR}" fill="${sunColor}" opacity="0.95"/>`
        : ''
    }
    ${resolved !== 'aurora' ? buildClouds(seed) : ''}
    ${motif}
    <rect width="300" height="400" fill="url(#${uid}_vignette)"/>
    ${buildPostmarkSeal(badgeCode, 240, 52)}
    ${buildVintageFrame()}
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
  const seed = hashSeed(`${discipline}|${jerseyNumber}|${pose}|${jerseyColor}`);
  const id = `sp_${seed.toString(36)}`;

  const lightJersey = ['#ffffff', '#facc15', '#bae6fd', '#fde047', '#fef08a', '#7dd3fc'].includes(
    jerseyColor.toLowerCase()
  );
  const numberTextColor = lightJersey ? '#0F172A' : '#FFFFFF';
  const numberStrokeColor = lightJersey ? '#FFFFFF' : '#0F172A';

  // Radial vintage championship poster sunburst beams
  const sunburstRays = Array.from({ length: 12 }, (_, idx) => {
    const angle = idx * 30;
    return `<polygon points="150,188 134,-20 166,-20" fill="#FFFDF7" opacity="0.065" transform="rotate(${angle} 150 188)"/>`;
  }).join('');

  // Stadium crowd bokeh dots
  const crowdDots = Array.from({ length: 24 }, (_, idx) => {
    const cx = 14 + idx * 12;
    const cy = 232 + ((idx * 17 + seed) % 24);
    const fill = idx % 3 === 0 ? '#FEF08A' : idx % 3 === 1 ? '#FFFDF7' : jerseyTrim;
    return `<circle cx="${cx}" cy="${cy}" r="${1.3 + (idx % 2) * 0.6}" fill="${fill}" opacity="0.58"/>`;
  }).join('');

  const groundGear =
    discipline === 'cricket'
      ? `
        <!-- Perspective Cricket Pitch Strip & Wooden Stumps -->
        <polygon points="104,282 196,282 222,395 78,395" fill="#E7D3A3" opacity="0.34"/>
        <line x1="98" y1="308" x2="202" y2="308" stroke="#FFFDF7" stroke-width="2" opacity="0.62"/>
        <g transform="translate(46, 254)">
          <rect x="0" y="0" width="4.5" height="62" rx="2" fill="#FDE68A" stroke="#92400E" stroke-width="0.6"/>
          <rect x="9.5" y="0" width="4.5" height="62" rx="2" fill="#FDE68A" stroke="#92400E" stroke-width="0.6"/>
          <rect x="19" y="0" width="4.5" height="62" rx="2" fill="#FDE68A" stroke="#92400E" stroke-width="0.6"/>
          <rect x="-1" y="-3" width="12" height="3.5" rx="1.5" fill="#F59E0B"/>
          <rect x="12" y="-3" width="12" height="3.5" rx="1.5" fill="#F59E0B"/>
        </g>
        <!-- Stitched Cricket Ball Arc -->
        <path d="M214 140 Q254 176 248 228" fill="none" stroke="#FEF08A" stroke-width="1.8" stroke-dasharray="4 4" opacity="0.55"/>
        <g transform="translate(248, 232)">
          <circle cx="0" cy="0" r="8.5" fill="#DC2626" stroke="#7F1D1D" stroke-width="1"/>
          <path d="M-6 -4 Q0 0 6 4" fill="none" stroke="#FFFDF7" stroke-width="1.2" stroke-dasharray="2 1.5"/>
        </g>
      `
      : `
        <!-- Perspective Penalty Arc & Match Ball -->
        <path d="M64 316 Q150 286 236 316" fill="none" stroke="#FFFDF7" stroke-width="2.2" opacity="0.45"/>
        <path d="M214 274 Q246 254 256 292" fill="none" stroke="#FEF08A" stroke-width="2" stroke-dasharray="4 4" opacity="0.52"/>
        <g transform="translate(242, 304)">
          <circle cx="0" cy="0" r="15" fill="#FFFDF7" stroke="#0F172A" stroke-width="1.8"/>
          <polygon points="0,-6 6,-2 4,5 -4,5 -6,-2" fill="#0F172A"/>
          <line x1="0" y1="-6" x2="0" y2="-14" stroke="#0F172A" stroke-width="1.2"/>
          <line x1="6" y1="-2" x2="13" y2="-5" stroke="#0F172A" stroke-width="1.2"/>
          <line x1="-6" y1="-2" x2="-13" y2="-5" stroke="#0F172A" stroke-width="1.2"/>
        </g>
      `;

  let arms = '';
  let prop = '';
  let dynamicArc = '';
  let torsoTilt = 0;

  if (pose === 'bat-raise' || pose === 'helicopter') {
    torsoTilt = pose === 'helicopter' ? -7 : -3;
    dynamicArc =
      pose === 'helicopter'
        ? `<path d="M-74 -58 Q0 -116 86 -54" fill="none" stroke="#FEF08A" stroke-width="3.2" stroke-linecap="round" opacity="0.58"/>`
        : `<path d="M-64 -44 Q0 -96 74 -58" fill="none" stroke="#FFFDF7" stroke-width="2" stroke-linecap="round" opacity="0.36"/>`;
    arms = `
      <path d="M-24 -22 Q-46 -40 -54 -64 L-40 -70 Q-30 -48 -14 -30 Z" fill="${skinTone}"/>
      <path d="M22 -22 Q44 -48 56 -78 L68 -70 Q54 -38 30 -10 Z" fill="${skinTone}"/>
      <!-- Sleeves -->
      <path d="M-30 -24 L-44 -42 L-28 -50 L-16 -28 Z" fill="${jerseyColor}"/>
      <path d="M28 -24 L44 -44 L30 -52 L16 -28 Z" fill="${jerseyColor}"/>
    `;
    prop = `
      <g transform="translate(60, -76) rotate(${pose === 'helicopter' ? 32 : 16})">
        <rect x="-6.5" y="-68" width="13" height="58" rx="3.5" fill="#E8C68D" stroke="#78350F" stroke-width="1.4"/>
        <line x1="0" y1="-64" x2="0" y2="-14" stroke="#B45309" stroke-width="1.2" opacity="0.55"/>
        <rect x="-2.5" y="-10" width="5" height="20" rx="1.5" fill="#18181B"/>
        <circle cx="-2" cy="4" r="7.5" fill="#FFFDF7" stroke="#0F172A" stroke-width="1.2"/>
      </g>
    `;
  } else if (pose === 'bowler-roar' || pose === 'siuu-leap') {
    torsoTilt = pose === 'siuu-leap' ? 0 : -4;
    dynamicArc = `<path d="M-84 -32 Q0 -98 84 -32" fill="none" stroke="${jerseyTrim}" stroke-width="2.6" stroke-linecap="round" opacity="0.55"/>`;
    arms = `
      <path d="M-24 -22 Q-52 -36 -74 -58 L-64 -68 Q-42 -48 -16 -32 Z" fill="${skinTone}"/>
      <path d="M24 -22 Q52 -36 74 -58 L64 -68 Q42 -48 16 -32 Z" fill="${skinTone}"/>
      <path d="M-30 -24 L-48 -38 L-36 -50 L-18 -30 Z" fill="${jerseyColor}"/>
      <path d="M30 -24 L48 -38 L36 -50 L18 -30 Z" fill="${jerseyColor}"/>
    `;
  } else if (pose === 'sky-point') {
    dynamicArc = `<path d="M-46 -98 Q0 -124 46 -98" fill="none" stroke="#FEF08A" stroke-width="2.4" stroke-linecap="round" opacity="0.62"/>`;
    arms = `
      <path d="M-22 -20 Q-32 -54 -34 -92 L-22 -94 Q-18 -58 -10 -24 Z" fill="${skinTone}"/>
      <path d="M22 -20 Q32 -54 34 -92 L22 -94 Q18 -58 10 -24 Z" fill="${skinTone}"/>
      <path d="M-28 -24 L-34 -46 L-18 -48 L-14 -24 Z" fill="${jerseyColor}"/>
      <path d="M28 -24 L34 -46 L18 -48 L14 -24 Z" fill="${jerseyColor}"/>
    `;
  } else if (pose === 'knee-slide') {
    torsoTilt = 6;
    dynamicArc = `<path d="M-82 72 Q0 92 82 68" fill="none" stroke="#FFFDF7" stroke-width="2.8" stroke-linecap="round" opacity="0.42"/>`;
    arms = `
      <path d="M-26 -16 Q-4 4 18 4 L18 16 Q-8 16 -32 -4 Z" fill="${skinTone}"/>
      <path d="M26 -16 Q4 4 -18 4 L-18 16 Q8 16 32 -4 Z" fill="${skinTone}"/>
      <path d="M-30 -22 L-42 -6 L-24 2 L-16 -16 Z" fill="${jerseyColor}"/>
      <path d="M30 -22 L42 -6 L24 2 L16 -16 Z" fill="${jerseyColor}"/>
    `;
  } else if (pose === 'trophy-lift') {
    dynamicArc = `<circle cx="0" cy="-84" r="34" fill="#FEF08A" opacity="0.22"/>`;
    arms = `
      <path d="M-22 -20 Q-32 -48 -28 -74 L-16 -76 Q-18 -50 -10 -24 Z" fill="${skinTone}"/>
      <path d="M22 -20 Q32 -48 28 -74 L16 -76 Q18 -50 10 -24 Z" fill="${skinTone}"/>
      <path d="M-28 -24 L-36 -46 L-20 -48 L-14 -24 Z" fill="${jerseyColor}"/>
      <path d="M28 -24 L36 -46 L20 -48 L14 -24 Z" fill="${jerseyColor}"/>
    `;
    prop = `
      <g transform="translate(0, -88)">
        <path d="M-20 -16 C-20 8 -8 14 0 14 C8 14 20 8 20 -16 Z" fill="#FACC15" stroke="#92400E" stroke-width="1.5"/>
        <path d="M-20 -12 C-30 -12 -30 4 -16 4" fill="none" stroke="#FACC15" stroke-width="3"/>
        <path d="M20 -12 C30 -12 30 4 16 4" fill="none" stroke="#FACC15" stroke-width="3"/>
        <rect x="-4" y="14" width="8" height="12" fill="#EAB308"/>
        <rect x="-14" y="24" width="28" height="7" rx="2.5" fill="#78350F"/>
      </g>
    `;
  } else {
    torsoTilt = pose === 'bicycle-kick' ? -12 : 4;
    dynamicArc = `<path d="M-76 -16 Q0 -74 78 -42" fill="none" stroke="#FEF08A" stroke-width="2.4" stroke-linecap="round" opacity="0.48"/>`;
    arms = `
      <path d="M-24 -20 Q-48 2 -62 12 L-52 22 Q-36 10 -14 -8 Z" fill="${skinTone}"/>
      <path d="M22 -22 Q48 -46 64 -62 L74 -52 Q56 -32 28 -10 Z" fill="${skinTone}"/>
      <path d="M-30 -24 L-44 -10 L-30 0 L-16 -18 Z" fill="${jerseyColor}"/>
      <path d="M28 -24 L44 -42 L30 -52 L16 -28 Z" fill="${jerseyColor}"/>
    `;
    prop =
      discipline === 'cricket'
        ? `<g transform="translate(64, -58) rotate(28)">
             <rect x="-5.5" y="-54" width="11" height="48" rx="3" fill="#E8C68D" stroke="#78350F" stroke-width="1.2"/>
             <rect x="-2" y="-6" width="4" height="16" fill="#18181B"/>
           </g>`
        : '';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
    <defs>
      <linearGradient id="${id}_sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${skyTop}"/>
        <stop offset="68%" stop-color="${skyBottom}"/>
        <stop offset="100%" stop-color="${turfColor}"/>
      </linearGradient>
      <radialGradient id="${id}_halo" cx="50%" cy="46%" r="48%">
        <stop offset="0%" stop-color="#FFFDF7" stop-opacity="0.34"/>
        <stop offset="60%" stop-color="${jerseyTrim}" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${id}_turf" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${turfColor}"/>
        <stop offset="100%" stop-color="#052E16"/>
      </linearGradient>
      <linearGradient id="${id}_kit" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${jerseyColor}"/>
        <stop offset="65%" stop-color="${jerseyColor}"/>
        <stop offset="100%" stop-color="#0F172A" stop-opacity="0.35"/>
      </linearGradient>
    </defs>

    <!-- Atmospheric Stadium Night/Twilight Sky -->
    <rect width="300" height="400" fill="url(#${id}_sky)"/>
    ${sunburstRays}
    <rect width="300" height="400" fill="url(#${id}_halo)"/>

    <!-- Top-Left Commemorative Edition Mark -->
    <g transform="translate(24, 34)" opacity="0.72">
      <text x="0" y="0" fill="#FFFDF7" font-family="Georgia, serif" font-size="8.5" font-weight="700" letter-spacing="1.6">${discipline === 'cricket' ? 'CRICKET' : 'FOOTBALL'}</text>
      <text x="0" y="12" fill="${jerseyTrim}" font-family="'Oswald', 'Arial Black', sans-serif" font-size="11" font-weight="900" letter-spacing="0.8">NO.${safeNum}</text>
    </g>

    <!-- Curved Stadium Roof Canopy & Floodlight Banks -->
    <path d="M-10 88 Q150 48 310 88 L310 66 Q150 28 -10 66 Z" fill="#0F172A" opacity="0.58"/>
    <g opacity="0.92">
      <circle cx="52" cy="70" r="10" fill="#FEF3C7" opacity="0.28"/>
      <circle cx="52" cy="70" r="4.5" fill="#FFFBEB"/>
      <circle cx="248" cy="70" r="10" fill="#FEF3C7" opacity="0.28"/>
      <circle cx="248" cy="70" r="4.5" fill="#FFFBEB"/>
    </g>
    <polygon points="52,72 8,248 118,248" fill="#FEF3C7" opacity="0.09"/>
    <polygon points="248,72 182,248 292,248" fill="#FEF3C7" opacity="0.09"/>

    <!-- Curved Stadium Grandstand Bowl & Crowd Bokeh -->
    <path d="M0 218 Q150 186 300 218 L300 282 L0 282 Z" fill="#0F172A" opacity="0.78"/>
    <path d="M0 242 Q150 214 300 242" fill="none" stroke="${jerseyTrim}" stroke-width="2.5" opacity="0.65"/>
    ${crowdDots}

    <!-- Mowed Perspective Field Turf -->
    <rect x="0" y="276" width="300" height="124" fill="url(#${id}_turf)"/>
    <g fill="#FFFFFF" opacity="0.06">
      <rect x="0" y="294" width="300" height="16"/>
      <rect x="0" y="328" width="300" height="20"/>
    </g>
    ${groundGear}

    <!-- Heroic Vintage Poster Athlete Figure -->
    <g transform="translate(150, 198) rotate(${torsoTilt})">
      <ellipse cx="0" cy="116" rx="50" ry="10" fill="#000000" opacity="0.34"/>
      ${dynamicArc}
      ${arms}
      ${prop}
      <!-- Neck & Sculpted Head -->
      <rect x="-6" y="-34" width="12" height="14" rx="4" fill="${skinTone}"/>
      <path d="M-6 -26 Q0 -20 6 -26" fill="#0F172A" opacity="0.16"/>
      <ellipse cx="0" cy="-48" rx="15.5" ry="18.5" fill="${skinTone}"/>
      <!-- Distinct Headwear / Hair Silhouette -->
      ${
        discipline === 'cricket' && seed % 3 === 0
          ? `<path d="M-16 -52 C-17 -70 17 -70 16 -52 Z" fill="${jerseyColor}"/>
             <path d="M-16 -52 L22 -50 L14 -56 L-16 -55 Z" fill="${jerseyTrim}"/>`
          : seed % 3 === 1
            ? `<path d="M-16 -50 C-17 -70 17 -70 16 -50 C11 -60 -9 -60 -16 -50 Z" fill="#18181B"/>
               <rect x="-16" y="-56" width="32" height="4.5" rx="2" fill="${jerseyTrim}" opacity="0.92"/>`
            : `<path d="M-16 -49 C-18 -71 18 -71 16 -49 C12 -59 -6 -62 -16 -49 Z" fill="#18181B"/>
               <path d="M-14 -56 Q2 -66 15 -54" fill="none" stroke="#3F3F46" stroke-width="1.6" opacity="0.6"/>`
      }
      <!-- Athletic V-Tapered Jersey with Smooth Shoulders, Crest & Dimensional Shading -->
      <path d="M-33 -22 C-24 -32 24 -32 33 -22 L25 38 L-25 38 Z" fill="${jerseyColor}"/>
      <path d="M-33 -22 C-24 -32 24 -32 33 -22 L25 38 L-25 38 Z" fill="url(#${id}_kit)" opacity="0.32"/>
      <path d="M-33 -22 L-10 -26 L25 24 L25 38 L10 38 L-31 -10 Z" fill="#FFFFFF" opacity="0.11"/>
      <path d="M-13 -28 L0 -14 L13 -28 L7 -30 L0 -21 L-7 -30 Z" fill="${jerseyTrim}"/>
      <!-- Vintage Club/National Crest Star -->
      <circle cx="15" cy="-12" r="4.2" fill="${jerseyTrim}" opacity="0.95"/>
      <circle cx="15" cy="-12" r="1.8" fill="#FFFDF7"/>
      <rect x="-25" y="31" width="50" height="5" fill="${jerseyTrim}" opacity="0.92"/>
      <!-- Crisp Oversized Varsity Jersey Number -->
      <text x="0" y="21" text-anchor="middle" fill="${numberTextColor}" stroke="${numberStrokeColor}" stroke-width="0.7" font-family="'Oswald', 'Arial Black', sans-serif" font-weight="900" font-size="26" letter-spacing="0.5">${safeNum}</text>
      <!-- Athletic Shorts / Trousers & Dynamic Legs -->
      <path d="M-25 38 L25 38 L29 72 L6 72 L0 52 L-6 72 L-29 72 Z" fill="${jerseyColor}"/>
      <path d="M-25 38 L-28 72 L-22 72 L-20 38 Z" fill="${jerseyTrim}" opacity="0.88"/>
      <path d="M25 38 L28 72 L22 72 L20 38 Z" fill="${jerseyTrim}" opacity="0.88"/>
      <path d="M-23 72 L-29 110 L-13 112 L-8 72 Z" fill="${discipline === 'cricket' ? jerseyColor : skinTone}"/>
      <path d="M8 72 L19 110 L35 106 L21 72 Z" fill="${discipline === 'cricket' ? jerseyColor : skinTone}"/>
      <!-- Cricket Batting Pads or Football Socks -->
      ${
        discipline === 'cricket'
          ? `<rect x="-29" y="76" width="15" height="32" rx="4" fill="#FFFDF7" opacity="0.94"/>
             <line x1="-29" y1="88" x2="-14" y2="88" stroke="#CBD5E1" stroke-width="1"/>
             <rect x="14" y="76" width="15" height="32" rx="4" fill="#FFFDF7" opacity="0.94" transform="rotate(-14 22 92)"/>`
          : `<rect x="-28" y="88" width="14" height="20" rx="2" fill="${jerseyTrim}"/>
             <rect x="16" y="86" width="14" height="20" rx="2" fill="${jerseyTrim}" transform="rotate(-14 23 96)"/>`
      }
      <!-- Cleats -->
      <rect x="-32" y="108" width="20" height="8.5" rx="4" fill="#FFFDF7"/>
      <rect x="18" y="103" width="20" height="8.5" rx="4" fill="#FFFDF7"/>
    </g>

    <!-- Commemorative Edition Postmark & Archival Frame -->
    ${buildPostmarkSeal(`NO.${safeNum}`, 240, 50, '#FFFDF7')}
    ${buildVintageFrame('#FFFDF7')}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const CUSTOM_PALETTES: Record<
  StampThemeTag,
  { skyTop: string; skyBottom: string; sun: string; land: string; accent: string; scene: CountrySceneKind }
> = {
  Nature: {
    skyTop: '#0369A1',
    skyBottom: '#BAE6FD',
    sun: '#FEF3C7',
    land: '#065F46',
    accent: '#5EEAD4',
    scene: 'mountain',
  },
  Urban: {
    skyTop: '#1E3A8A',
    skyBottom: '#FBCFE8',
    sun: '#FEF08A',
    land: '#1E293B',
    accent: '#93C5FD',
    scene: 'skyline',
  },
  Culture: {
    skyTop: '#C2410C',
    skyBottom: '#FDE68A',
    sun: '#FFFBEB',
    land: '#7C2D12',
    accent: '#FDBA74',
    scene: 'pagoda',
  },
  Historical: {
    skyTop: '#B45309',
    skyBottom: '#FDE68A',
    sun: '#FFFBEB',
    land: '#78350F',
    accent: '#E9B37B',
    scene: 'arch',
  },
};

/**
 * Generates bespoke, location-aware vintage travel poster artwork for custom Studio
 * stamps and Google Maps discovered places based on title, country, category, and theme tag.
 */
export function buildCustomTravelStampSvg({
  title,
  country,
  city,
  category,
  themeTag,
  stylePreset,
}: {
  title: string;
  country?: string;
  city?: string;
  category?: StampCategory;
  themeTag?: StampThemeTag;
  stylePreset?: string;
}): string {
  const combined = `${title} ${city ?? ''} ${country ?? ''}`.toLowerCase();
  const baseTag: StampThemeTag =
    themeTag ??
    (category === 'landmark'
      ? 'Historical'
      : category === 'city'
        ? 'Urban'
        : 'Nature');
  const palette = { ...CUSTOM_PALETTES[baseTag] };

  // Infer exact scene silhouette from location keywords
  if (combined.match(/beach|bay|coast|island|sea|ocean|harbor|harbour|lagoon|lisbon|amalfi|santorini|bali|hawaii|rio/)) {
    palette.scene = 'coastal';
  } else if (combined.match(/fjord|waterfall|glacier|lake|sound|aurora|iceland|norway/)) {
    palette.scene = 'fjord';
  } else if (combined.match(/pyramid|giza|sphinx|desert|sahara|chichen|mayan/)) {
    palette.scene = 'pyramid';
  } else if (combined.match(/dome|taj|mosque|samarkand|palace|cathedral|basilica/)) {
    palette.scene = 'dome';
  } else if (combined.match(/temple|pagoda|shrine|kyoto|fuji|bangkok|angkor|seoul/)) {
    palette.scene = 'pagoda';
  } else if (combined.match(/colosseum|ruins|arch|castle|fort|rome|athens|petra|morocco/)) {
    palette.scene = 'arch';
  } else if (combined.match(/tower|skyline|downtown|shibuya|tokyo|new york|london|dubai|singapore|city/)) {
    palette.scene = 'skyline';
  } else if (combined.match(/mountain|valley|park|alps|yosemite|banff|peak|canyon|forest|himalaya/)) {
    palette.scene = 'mountain';
  }

  // Subtle palette flavor shift per Studio illustration style
  if (stylePreset === 'Warm Gouache') {
    palette.skyTop = '#EA580C';
    palette.skyBottom = '#FED7AA';
  } else if (stylePreset === 'Mediterranean Poster') {
    palette.skyTop = '#0284C7';
    palette.skyBottom = '#BAE6FD';
  } else if (stylePreset === 'Minimalist Woodcut') {
    palette.skyTop = '#1E293B';
    palette.skyBottom = '#CBD5E1';
    palette.land = '#0F172A';
  }

  return buildCountryStampSvg({
    title: title.trim() || 'Travel',
    city: city?.trim() || country?.trim(),
    skyTop: palette.skyTop,
    skyBottom: palette.skyBottom,
    sunColor: palette.sun,
    landColor: palette.land,
    accentColor: palette.accent,
    scene: palette.scene,
  });
}
