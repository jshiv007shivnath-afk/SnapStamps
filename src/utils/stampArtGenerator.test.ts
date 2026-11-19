import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAthleteStampSvg,
  buildCountryStampSvg,
  buildCustomTravelStampSvg,
} from './stampArtGenerator';

test('buildCountryStampSvg produces rich bespoke scenes without duplicate bottom title banners', () => {
  const turkey = decodeURIComponent(
    buildCountryStampSvg({
      title: 'Turkey',
      city: 'Cappadocia',
      skyTop: '#EA580C',
      skyBottom: '#FDE68A',
      sunColor: '#FFFBEB',
      landColor: '#78350F',
      accentColor: '#FDBA74',
      scene: 'dome',
    })
  );
  assert.ok(turkey.includes('AIR MAIL'));
  assert.ok(turkey.includes('CAPPA'));
  assert.ok(turkey.includes('ellipse'), 'Cappadocia stamp includes hot air balloons');
  // Ensure no duplicate white title box baked at y=348
  assert.ok(!turkey.includes('y="348"'));

  const iceland = decodeURIComponent(
    buildCountryStampSvg({
      title: 'Iceland',
      city: 'Vik',
      skyTop: '#064E3B',
      skyBottom: '#6EE7B7',
      sunColor: '#ECFEFF',
      landColor: '#0F172A',
      accentColor: '#6EE7B7',
      scene: 'fjord',
    })
  );
  assert.ok(iceland.includes('#34D399'), 'Iceland stamp renders emerald aurora');
});

test('buildAthleteStampSvg renders heroic sports poster art with jersey number and commemorative seal', () => {
  const bumrah = decodeURIComponent(
    buildAthleteStampSvg({
      discipline: 'cricket',
      jerseyColor: '#1D4ED8',
      jerseyTrim: '#F97316',
      jerseyNumber: '93',
      skyTop: '#1E3A8A',
      skyBottom: '#60A5FA',
      turfColor: '#15803D',
      skinTone: '#8C5230',
      pose: 'bowler-roar',
    })
  );
  assert.ok(bumrah.includes('>93<'));
  assert.ok(bumrah.includes('NO.93'));
  assert.ok(bumrah.includes('AIR MAIL'));
  assert.ok(bumrah.includes('radialGradient'));
});

test('buildCustomTravelStampSvg adapts scenery to destination metadata and theme tag', () => {
  const yosemite = decodeURIComponent(
    buildCustomTravelStampSvg({
      title: 'Yosemite Valley',
      country: 'United States',
      themeTag: 'Nature',
    })
  );
  assert.ok(yosemite.startsWith('data:image/svg+xml;utf8,<svg'));
  assert.ok(yosemite.includes('AIR MAIL'));

  const sydney = decodeURIComponent(
    buildCustomTravelStampSvg({
      title: 'Sydney Harbor',
      country: 'Australia',
      themeTag: 'Urban',
    })
  );
  assert.ok(sydney.includes('#FFFDF7'));
});
