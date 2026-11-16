import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  APILoadingStatus,
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMapCanvas,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
} from '@vis.gl/react-google-maps';
import { geoGraticule10, geoOrthographic, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { FeatureCollection, Geometry } from 'geojson';
import countriesAtlas from 'world-atlas/countries-110m.json';
import type { PlaceCandidate, StampItem, TravelArc } from '../types/stamp';
import { buildTravelArcs, getCollectionSummary } from '../utils/stampLogic';
import { BackButton } from './BackButton';
import { JellyButton } from './JellyButton';
import { JellyRadio } from './JellyRadio';
import { Reicon } from './Reicon';

interface GlobeMapViewProps {
  stamps: StampItem[];
  focusedStampId: string | null;
  onBack?: () => void;
  onSelectStamp: (stamp: StampItem) => void;
  onCollectStamp: (stampId: string) => void;
  onAddPlaceAsStamp: (place: PlaceCandidate) => void;
}

type ExplorerMode = 'globe' | 'maps';

const MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();

const VISITED_COUNTRY_NAMES: Record<string, string[]> = {
  spain: ['spain'],
  japan: ['japan'],
  france: ['france'],
  egypt: ['egypt'],
  greece: ['greece'],
  'united states': ['united states of america', 'united states'],
};

type MarkerInstance = ReturnType<typeof useAdvancedMarkerRef>[1];

function StampAdvancedMarker({
  stamp,
  isSelected,
  onClick,
}: {
  stamp: StampItem;
  isSelected: boolean;
  onClick: (stamp: StampItem, marker: MarkerInstance) => void;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <AdvancedMarker
      ref={markerRef}
      position={stamp.coordinates}
      title={`${stamp.title}, ${stamp.country}`}
      onClick={() => onClick(stamp, marker)}
    >
      <div
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-transform ${
          isSelected ? 'scale-110' : 'hover:scale-105'
        } ${
          stamp.isUnlocked
            ? 'bg-[#0A0A0A] text-white'
            : 'bg-white text-[#0A0A0A]'
        }`}
        style={{
          border: stamp.isUnlocked ? '1.5px solid rgba(255,255,255,0.85)' : '1.5px solid #F38D31',
        }}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: stamp.isUnlocked ? '#34D399' : '#F38D31' }}
        />
        <span className="whitespace-nowrap">{stamp.title}</span>
      </div>
    </AdvancedMarker>
  );
}

function MapsStatusWatcher() {
  const status = useApiLoadingStatus();

  useEffect(() => {
    if (status === APILoadingStatus.AUTH_FAILURE || status === APILoadingStatus.FAILED) {
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    }
  }, [status]);

  return null;
}

export function GlobeMapView({
  stamps,
  focusedStampId,
  onBack,
  onSelectStamp,
  onCollectStamp,
  onAddPlaceAsStamp,
}: GlobeMapViewProps) {
  const [mode, setMode] = useState<ExplorerMode>('globe');
  const [rotation, setRotation] = useState<[number, number, number]>([4, -36, 0]);
  const [activeStampId, setActiveStampId] = useState<string>(
    focusedStampId || stamps[0]?.id || ''
  );
  const [selectedMarker, setSelectedMarker] = useState<MarkerInstance>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  // Places API (New) discovery state
  const [placeQuery, setPlaceQuery] = useState('');
  const [places, setPlaces] = useState<PlaceCandidate[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState('');

  const dragStateRef = useRef<{ dragging: boolean; x: number; y: number }>({
    dragging: false,
    x: 0,
    y: 0,
  });

  const activeStamp = useMemo(
    () => stamps.find((s) => s.id === activeStampId) ?? stamps[0] ?? null,
    [stamps, activeStampId]
  );

  // Focus globe when an external stamp is selected
  useEffect(() => {
    if (!focusedStampId) return;
    const target = stamps.find((s) => s.id === focusedStampId);
    if (target) {
      setActiveStampId(target.id);
      setRotation([-target.coordinates.lng, -target.coordinates.lat, 0]);
    }
  }, [focusedStampId, stamps]);

  const worldFeatures = useMemo(() => {
    const topo = countriesAtlas as unknown as {
      type: 'Topology';
      objects: { countries: Parameters<typeof feature>[1] };
    };
    return feature(topo as never, topo.objects.countries) as unknown as FeatureCollection<Geometry>;
  }, []);

  const unlockedCountrySet = useMemo(() => {
    const names: string[] = [];
    for (const s of stamps) {
      if (!s.isUnlocked) continue;
      const c = s.country.toLowerCase();
      const mapped = VISITED_COUNTRY_NAMES[c] ?? [c];
      names.push(...mapped);
    }
    return names;
  }, [stamps]);

  const travelArcs: TravelArc[] = useMemo(() => buildTravelArcs(stamps), [stamps]);
  const summary = useMemo(() => getCollectionSummary(stamps), [stamps]);

  // Orthographic 3D projection geometry
  const globeSize = 420;
  const projection = useMemo(
    () =>
      geoOrthographic()
        .scale(178)
        .translate([globeSize / 2, globeSize / 2])
        .rotate(rotation)
        .clipAngle(90),
    [rotation]
  );

  const pathGenerator = useMemo(() => geoPath(projection), [projection]);
  const graticulePath = useMemo(() => pathGenerator(geoGraticule10()) || '', [pathGenerator]);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    dragStateRef.current = { dragging: true, x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragStateRef.current.dragging) return;
    const dx = e.clientX - dragStateRef.current.x;
    const dy = e.clientY - dragStateRef.current.y;
    dragStateRef.current.x = e.clientX;
    dragStateRef.current.y = e.clientY;

    setRotation(([lambda, phi, gamma]) => [
      lambda + dx * 0.42,
      Math.max(-75, Math.min(75, phi - dy * 0.42)),
      gamma,
    ]);
  };

  const handlePointerUp = () => {
    dragStateRef.current.dragging = false;
  };

  const focusStampOnGlobe = useCallback((stamp: StampItem) => {
    setActiveStampId(stamp.id);
    setRotation([-stamp.coordinates.lng, -stamp.coordinates.lat, 0]);
  }, []);

  const parsePlacesResponse = (rawPlaces: Array<Record<string, unknown>>): PlaceCandidate[] => {
    return rawPlaces
      .map((p, idx) => {
        const displayObj = p.displayName as { text?: string } | undefined;
        const typeObj = p.primaryTypeDisplayName as { text?: string } | undefined;
        const locObj = p.location as { latitude?: number; longitude?: number } | undefined;
        if (typeof locObj?.latitude !== 'number' || typeof locObj?.longitude !== 'number') {
          return null;
        }
        return {
          id: String(p.id || `place-${idx}`),
          name: displayObj?.text || 'Landmark',
          address: String(p.formattedAddress || ''),
          lat: locObj.latitude,
          lng: locObj.longitude,
          categoryLabel: typeObj?.text || 'Landmark',
        };
      })
      .filter((item): item is PlaceCandidate => item !== null);
  };

  const handleSearchPlaces = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeQuery.trim()) return;
    setPlacesLoading(true);
    setPlacesError('');
    try {
      const res = await fetch('/api/places/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: placeQuery.trim() }),
      });
      const data = (await res.json()) as {
        places?: Array<Record<string, unknown>>;
        error?: string;
        quotaExceeded?: boolean;
      };
      if (res.status === 429 || data.quotaExceeded) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      }
      if (!res.ok) {
        setPlacesError(data.error || 'Unable to search places right now.');
        setPlaces([]);
        return;
      }
      setPlaces(parsePlacesResponse(data.places ?? []));
    } catch {
      setPlacesError('Network error while contacting Google Places.');
    } finally {
      setPlacesLoading(false);
    }
  };

  const handleDiscoverNearby = async () => {
    const center = activeStamp?.coordinates ?? { lat: 40.4168, lng: -3.7038 };
    setPlacesLoading(true);
    setPlacesError('');
    try {
      const res = await fetch('/api/places/nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: center.lat, lng: center.lng, radius: 8000 }),
      });
      const data = (await res.json()) as {
        places?: Array<Record<string, unknown>>;
        error?: string;
        quotaExceeded?: boolean;
      };
      if (res.status === 429 || data.quotaExceeded) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      }
      if (!res.ok) {
        setPlacesError(data.error || 'Unable to discover nearby landmarks.');
        setPlaces([]);
        return;
      }
      setPlaces(parsePlacesResponse(data.places ?? []));
    } catch {
      setPlacesError('Network error while discovering nearby landmarks.');
    } finally {
      setPlacesLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-32 pt-4 sm:px-8">
      {/* Header + Segmented Globe/Maps Mode Switch */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && <BackButton onClick={onBack} ariaLabel="Back to Profile" />}
          <div>
            <p className="text-[12px] font-medium text-neutral-500">
              {summary.countriesCount} Countries · {summary.unlockedCount} Unlocked · {travelArcs.length} Routes
            </p>
            <h1 className="font-display text-[26px] font-bold tracking-[-0.02em] text-[#0A0A0A]">
              World Explorer
            </h1>
          </div>
        </div>

        <JellyRadio
          items={[
            { value: 'globe', label: '3D Globe', icon: <Reicon name="globe" size={16} /> },
            { value: 'maps', label: 'Google Maps', icon: <Reicon name="map" size={16} /> },
          ]}
          value={mode}
          onChange={(val) => setMode(val as ExplorerMode)}
          chipColor="rgba(255, 255, 255, 0.5)"
          activeColor="#0A0A0A"
          textColor="#0A0A0A"
          activeTextColor="#FFFFFF"
          size="md"
          gap={8}
          radius={20}
          swell={0.07}
          barge={3}
          shrink={0.03}
          jelly={0.9}
          bounce={0.34}
          ariaLabel="Explorer visualization mode"
        />
      </header>

      {/* Main Split Workspace on Desktop, Vertical Stack on iOS */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left/Center Visualization Surface */}
        <div className="lg:col-span-8">
          {mode === 'globe' ? (
            <div
              data-testid="interactive-globe-surface"
              className="relative flex flex-col items-center justify-center overflow-hidden rounded-[28px] bg-white p-4 sm:p-6"
            >
              <div className="flex w-full items-center justify-between text-xs text-neutral-500">
                <span>Drag globe to spin · Tap any pin to inspect</span>
                <JellyButton
                  type="button"
                  onClick={() => setRotation([4, -36, 0])}
                  className="liquid-glass-btn flex h-10 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium text-[#0A0A0A]"
                >
                  <Reicon name="compass" size={14} />
                  <span>Reset View</span>
                </JellyButton>
              </div>

              <svg
                viewBox={`0 0 ${globeSize} ${globeSize}`}
                className="my-2 h-[340px] w-full max-w-[420px] cursor-grab touch-none active:cursor-grabbing sm:h-[420px]"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                role="img"
                aria-label="Interactive 3D travel globe showing visited countries and stamp routes"
              >
                {/* Ocean sphere */}
                <circle
                  cx={globeSize / 2}
                  cy={globeSize / 2}
                  r={178}
                  fill="#EDF3F8"
                />

                {/* Latitude / Longitude Graticule */}
                <path
                  d={graticulePath}
                  fill="none"
                  stroke="rgba(15, 23, 42, 0.06)"
                  strokeWidth={0.75}
                />

                {/* Country Polygons */}
                {worldFeatures.features.map((countryFeature, index) => {
                  const d = pathGenerator(countryFeature) || '';
                  if (!d) return null;
                  const props = countryFeature.properties as { name?: string } | undefined;
                  const cname = (props?.name || '').toLowerCase();
                  const isVisited = unlockedCountrySet.some((v) => cname.includes(v));
                  return (
                    <path
                      key={countryFeature.id ?? index}
                      d={d}
                      fill={isVisited ? '#9BD4BE' : '#DCE2EA'}
                      stroke="#FFFFFF"
                      strokeWidth={0.65}
                    />
                  );
                })}

                {/* Great-Circle Travel Arcs */}
                {travelArcs.map((arc) => {
                  const from = stamps.find((s) => s.id === arc.fromStampId);
                  const to = stamps.find((s) => s.id === arc.toStampId);
                  if (!from || !to) return null;
                  const arcLine: GeoJSON.LineString = {
                    type: 'LineString',
                    coordinates: [
                      [from.coordinates.lng, from.coordinates.lat],
                      [to.coordinates.lng, to.coordinates.lat],
                    ],
                  };
                  const d = pathGenerator(arcLine);
                  if (!d) return null;
                  return (
                    <path
                      key={arc.id}
                      d={d}
                      fill="none"
                      stroke="#D64527"
                      strokeWidth={1.6}
                      strokeDasharray="4 4"
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* Stamp Location Pins */}
                {stamps.map((stamp) => {
                  const point: GeoJSON.Point = {
                    type: 'Point',
                    coordinates: [stamp.coordinates.lng, stamp.coordinates.lat],
                  };
                  // Check visibility on front hemisphere via geoPath
                  const visiblePath = pathGenerator(point);
                  if (!visiblePath) return null;
                  const projected = projection([stamp.coordinates.lng, stamp.coordinates.lat]);
                  if (!projected) return null;
                  const [cx, cy] = projected;
                  const isSelected = activeStamp?.id === stamp.id;

                  return (
                    <g
                      key={stamp.id}
                      transform={`translate(${cx}, ${cy})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        focusStampOnGlobe(stamp);
                      }}
                      className="cursor-pointer"
                    >
                      <circle
                        r={isSelected ? 10 : 7}
                        fill={stamp.isUnlocked ? '#0A0A0A' : '#FFFFFF'}
                        stroke={stamp.isUnlocked ? '#FFFFFF' : '#F38D31'}
                        strokeWidth={2}
                      />
                      {isSelected && (
                        <g transform="translate(12, 4)">
                          <rect
                            x={-2}
                            y={-13}
                            width={stamp.title.length * 7.2 + 16}
                            height={20}
                            rx={10}
                            fill="#0A0A0A"
                          />
                          <text
                            x={6}
                            y={1}
                            fill="#FFFFFF"
                            fontSize="11"
                            fontWeight="600"
                            fontFamily="Plus Jakarta Sans, sans-serif"
                          >
                            {stamp.title}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Quick Destination Jump Strip */}
              <div className="mt-2 flex w-full gap-2 overflow-x-auto pb-1">
                {stamps.map((s) => (
                  <JellyButton
                    key={s.id}
                    type="button"
                    onClick={() => focusStampOnGlobe(s)}
                    className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium whitespace-nowrap transition-colors ${
                      activeStamp?.id === s.id
                        ? 'bg-[#0A0A0A] text-white'
                        : 'liquid-glass-btn text-[#0A0A0A]'
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: s.isUnlocked ? '#34D399' : '#F38D31' }}
                    />
                    <span>{s.title}</span>
                  </JellyButton>
                ))}
              </div>
            </div>
          ) : (
            <div
              data-testid="google-maps-surface"
              className="overflow-hidden rounded-[28px] bg-white p-4"
            >
              {/* Search & Discover Nearby Controls */}
              <div className="mb-3 flex flex-col gap-2 sm:flex-row">
                <form onSubmit={handleSearchPlaces} className="flex flex-1 gap-2">
                  <label htmlFor="gmp-search-input" className="sr-only">
                    Search landmarks on Google Maps
                  </label>
                  <input
                    id="gmp-search-input"
                    type="text"
                    value={placeQuery}
                    onChange={(e) => setPlaceQuery(e.target.value)}
                    placeholder="Search cities or landmarks (e.g., Prado Museum, Tokyo Tower)"
                    className="h-11 flex-1 rounded-full bg-[#F7F7F9] px-4 text-sm text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-2 focus:outline-[#0A0A0A]"
                  />
                  <JellyButton
                    type="submit"
                    disabled={placesLoading}
                    className="flex h-11 items-center gap-1.5 rounded-full bg-[#0A0A0A] px-5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                  >
                    <Reicon name="search" size={16} />
                    <span>Search</span>
                  </JellyButton>
                </form>

                <JellyButton
                  type="button"
                  onClick={handleDiscoverNearby}
                  disabled={placesLoading}
                  className="liquid-glass-btn flex h-11 items-center justify-center gap-1.5 rounded-full px-4 text-xs font-semibold text-[#0A0A0A] disabled:opacity-50"
                >
                  <Reicon name="pin" size={16} />
                  <span>Nearby Landmarks</span>
                </JellyButton>
              </div>

              {placesError && (
                <p className="mb-3 rounded-2xl bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-900">
                  {placesError}
                </p>
              )}

              {/* Live Google Maps Platform View */}
              {MAPS_API_KEY ? (
                <div className="h-[380px] w-full overflow-hidden rounded-[20px] sm:h-[430px]">
                  <APIProvider apiKey={MAPS_API_KEY} libraries={['marker']} language="en" region="US">
                    <MapsStatusWatcher />
                    <GoogleMapCanvas
                      mapId="DEMO_MAP_ID"
                      defaultCenter={activeStamp?.coordinates ?? { lat: 40.4168, lng: -3.7038 }}
                      center={activeStamp?.coordinates}
                      defaultZoom={4}
                      gestureHandling="greedy"
                      disableDefaultUI={false}
                      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                      style={{ width: '100%', height: '100%' }}
                    >
                      {stamps.map((stamp) => (
                        <StampAdvancedMarker
                          key={stamp.id}
                          stamp={stamp}
                          isSelected={activeStamp?.id === stamp.id}
                          onClick={(s, marker) => {
                            setActiveStampId(s.id);
                            setSelectedMarker(marker);
                            setInfoOpen(true);
                          }}
                        />
                      ))}

                      {infoOpen && selectedMarker && activeStamp && (
                        <InfoWindow
                          anchor={selectedMarker}
                          maxWidth={220}
                          onCloseClick={() => setInfoOpen(false)}
                        >
                          <div className="space-y-1 p-1">
                            <p className="font-display text-sm font-bold text-[#0A0A0A]">
                              {activeStamp.title}
                            </p>
                            <p className="text-xs text-neutral-600">
                              {activeStamp.city}, {activeStamp.country}
                            </p>
                            <JellyButton
                              type="button"
                              onClick={() => onSelectStamp(activeStamp)}
                              className="mt-1 inline-flex h-8 items-center rounded-full bg-[#0A0A0A] px-3 text-[11px] font-semibold text-white"
                            >
                              Open Stamp
                            </JellyButton>
                          </div>
                        </InfoWindow>
                      )}
                    </GoogleMapCanvas>
                  </APIProvider>
                </div>
              ) : (
                <div className="flex h-[320px] flex-col items-center justify-center rounded-[20px] bg-[#F7F7F9] p-6 text-center">
                  <Reicon name="map-point" size={28} color="#0A0A0A" />
                  <p className="mt-3 font-display text-base font-semibold text-[#0A0A0A]">
                    Google Maps Key Needed
                  </p>
                  <p className="mt-1 max-w-sm text-xs text-neutral-500">
                    Configure VITE_GOOGLE_MAPS_API_KEY in Settings &gt; Secrets or use the 3D Globe view above.
                  </p>
                </div>
              )}

              {/* Places API (New) Results Strip */}
              {places.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-neutral-500">
                    Discovered Landmarks (Google Places)
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {places.map((place) => (
                      <div
                        key={place.id}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-[#F7F7F9] px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#0A0A0A]">
                            {place.name}
                          </p>
                          <p className="truncate text-xs text-neutral-500">
                            {place.categoryLabel} · {place.address}
                          </p>
                        </div>
                        <JellyButton
                          type="button"
                          onClick={() => onAddPlaceAsStamp(place)}
                          className="flex h-10 shrink-0 items-center gap-1 rounded-full bg-[#0A0A0A] px-3.5 text-xs font-semibold text-white hover:bg-neutral-800"
                        >
                          <Reicon name="plus" size={14} />
                          <span>Collect</span>
                        </JellyButton>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side Inspector Card (Selected Destination & Travel Routes) */}
        <aside className="flex flex-col gap-4 lg:col-span-4">
          {activeStamp && (
            <div className="rounded-[28px] bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                    {activeStamp.category} · {activeStamp.rarity}
                  </p>
                  <h2 className="mt-0.5 font-display text-xl font-bold text-[#0A0A0A]">
                    {activeStamp.title}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {activeStamp.city}, {activeStamp.country}
                  </p>
                </div>
                <span className="font-mono-nums rounded-full bg-[#F7F7F9] px-3 py-1 text-xs font-semibold text-[#0A0A0A]">
                  {activeStamp.collectedCount}/{activeStamp.totalInSet}
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                {activeStamp.description}
              </p>

              <p className="font-mono-nums mt-3 text-xs text-neutral-400">
                {activeStamp.coordinates.lat.toFixed(4)}°, {activeStamp.coordinates.lng.toFixed(4)}°
              </p>

              <div className="mt-4 flex flex-col gap-2">
                {!activeStamp.isUnlocked ? (
                  <JellyButton
                    type="button"
                    jellyIntensity="medium"
                    onClick={() => onCollectStamp(activeStamp.id)}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0A0A0A] text-sm font-semibold text-white hover:bg-neutral-800"
                  >
                    <Reicon name="check" size={16} />
                    <span>Collect Location Stamp</span>
                  </JellyButton>
                ) : (
                  <JellyButton
                    type="button"
                    jellyIntensity="medium"
                    onClick={() => onSelectStamp(activeStamp)}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0A0A0A] text-sm font-semibold text-white hover:bg-neutral-800"
                  >
                    <span>View Stamp Details</span>
                  </JellyButton>
                )}
              </div>
            </div>
          )}

          {/* Recent Flight / Travel Arcs */}
          <div className="rounded-[28px] bg-white p-5">
            <h3 className="font-display text-sm font-bold text-[#0A0A0A]">Passport Flight Routes</h3>
            {travelArcs.length === 0 ? (
              <p className="mt-2 text-xs text-neutral-500">
                Unlock at least two stamps to trace your travel routes across the globe.
              </p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {travelArcs.slice(0, 5).map((arc) => {
                  const from = stamps.find((s) => s.id === arc.fromStampId);
                  const to = stamps.find((s) => s.id === arc.toStampId);
                  if (!from || !to) return null;
                  return (
                    <li
                      key={arc.id}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="truncate font-medium text-neutral-800">
                        {from.title} → {to.title}
                      </span>
                      <span className="font-mono-nums shrink-0 text-neutral-500">
                        {arc.distanceKm.toLocaleString()} km
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
