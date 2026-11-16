import { useEffect, useState } from 'react';
import { DEMO_POCKETS, DEMO_POSTS, DEMO_STAMPS } from './data/seedData';
import type {
  AppTab,
  CollectionFilter,
  PlaceCandidate,
  SocialPost,
  StampItem,
  StampPocket,
  UserProfile,
} from './types/stamp';
import {
  clearDemoItems,
  collectStamp,
  toggleStampFavorite,
} from './utils/stampLogic';
import { BottomDock } from './components/BottomDock';
import { GlobeMapView } from './components/GlobeMapView';
import { LoginView } from './components/LoginView';
import { MyStampsView } from './components/MyStampsView';
import { OnboardingScreen } from './components/OnboardingScreen';
import { ProfileView } from './components/ProfileView';
import { SocialFeedView } from './components/SocialFeedView';
import { StampDetailModal } from './components/StampDetailModal';
import { StampLibraryView } from './components/StampLibraryView';
import { StampStudioModal } from './components/StampStudioModal';
import { SwiftUIExportDrawer } from './components/SwiftUIExportDrawer';

const STORAGE_KEY = 'snapstamps_state_v2';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Leni Coper',
  handle: '@leni.passport',
  email: 'leni@snapstamps.app',
  initials: 'LC',
  passportCode: 'SS-2026-0419',
  memberSince: 'Nov 2026',
};

interface PersistedState {
  hasOnboarded: boolean;
  isAuthenticated: boolean;
  userProfile: UserProfile;
  stamps: StampItem[];
  pockets: StampPocket[];
  posts: SocialPost[];
}

function loadInitialState(): PersistedState {
  const autostart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem('snapstamps_state_v1');
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      if (Array.isArray(parsed.stamps) && Array.isArray(parsed.pockets) && Array.isArray(parsed.posts)) {
        return {
          hasOnboarded: autostart ? true : Boolean(parsed.hasOnboarded),
          isAuthenticated: autostart ? true : parsed.isAuthenticated ?? Boolean(parsed.hasOnboarded),
          userProfile: parsed.userProfile ?? DEFAULT_PROFILE,
          stamps: parsed.stamps,
          pockets: parsed.pockets,
          posts: parsed.posts,
        };
      }
    }
  } catch {
    // Fall back to demo seed state
  }

  return {
    hasOnboarded: autostart,
    isAuthenticated: autostart,
    userProfile: DEFAULT_PROFILE,
    stamps: DEMO_STAMPS,
    pockets: DEMO_POCKETS,
    posts: DEMO_POSTS,
  };
}

export default function App() {
  const [initial] = useState<PersistedState>(() => loadInitialState());
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(initial.hasOnboarded);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initial.isAuthenticated);
  const [showLoginScreen, setShowLoginScreen] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(initial.userProfile);
  const [activeTab, setActiveTab] = useState<AppTab>('library');
  const [stamps, setStamps] = useState<StampItem[]>(initial.stamps);
  const [pockets, setPockets] = useState<StampPocket[]>(initial.pockets);
  const [posts, setPosts] = useState<SocialPost[]>(initial.posts);

  // Filters & search
  const [activeFilter, setActiveFilter] = useState<CollectionFilter>('all');
  const [activePocketId, setActivePocketId] = useState<string | null>(null);
  const [librarySearch, setLibrarySearch] = useState('');
  const [stampsSearch, setStampsSearch] = useState('');

  // Modals & Inspector state
  const [selectedStampId, setSelectedStampId] = useState<string | null>(null);
  const [focusedGlobeStampId, setFocusedGlobeStampId] = useState<string | null>(null);
  const [studioOpen, setStudioOpen] = useState(false);
  const [studioPocketId, setStudioPocketId] = useState<string | null>(null);
  const [studioEditStamp, setStudioEditStamp] = useState<StampItem | null>(null);
  const [swiftDrawerOpen, setSwiftDrawerOpen] = useState(false);

  // Google Maps Platform Demo Key Quota Banner State
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  useEffect(() => {
    const onQuotaExceeded = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
  }, []);

  useEffect(() => {
    try {
      const payload: PersistedState = {
        hasOnboarded,
        isAuthenticated,
        userProfile,
        stamps,
        pockets,
        posts,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota issues
    }
  }, [hasOnboarded, isAuthenticated, userProfile, stamps, pockets, posts]);

  const selectedStamp = stamps.find((s) => s.id === selectedStampId) ?? null;
  const hasDemoData = stamps.some((s) => s.isDemoSeed) || posts.some((p) => p.isDemoSeed);

  const handleToggleFavorite = (stampId: string) => {
    setStamps((prev) => toggleStampFavorite(prev, stampId));
  };

  const handleCollectStamp = (stampId: string) => {
    setStamps((prev) => collectStamp(prev, stampId, 'Nov 2026'));
  };

  const handleAddPlaceAsStamp = (place: PlaceCandidate) => {
    const newStamp: StampItem = {
      id: `place-${place.id}`,
      title: place.name.slice(0, 20),
      country: place.address.split(',').pop()?.trim() || 'Explorer',
      city: place.name,
      category: 'landmark',
      rarity: 'rare',
      collectedCount: 1,
      totalInSet: 10,
      isFavorite: false,
      isUnlocked: true,
      coordinates: { lat: place.lat, lng: place.lng },
      imageUrl: DEMO_STAMPS[0]?.imageUrl || '',
      accentColor: '#98D4DC',
      bannerColor: '#0E7490',
      pocketId: 'landmarks',
      description: `${place.categoryLabel} discovered via Google Maps at ${place.address}.`,
      unlockedAt: 'Nov 2026',
      isDemoSeed: false,
    };
    setStamps((prev) => {
      if (prev.some((s) => s.id === newStamp.id)) return prev;
      return [newStamp, ...prev];
    });
    setSelectedStampId(newStamp.id);
  };

  const handleSaveNewStamp = (newStamp: StampItem) => {
    setStamps((prev) => [newStamp, ...prev]);
    setActiveTab('stamps');
    setActivePocketId(newStamp.pocketId);
    setActiveFilter('all');
  };

  const handleUpdateStampArt = (stampId: string, newImageUrl: string) => {
    setStamps((prev) =>
      prev.map((s) =>
        s.id === stampId ? { ...s, imageUrl: newImageUrl, isCustomGenerated: true } : s
      )
    );
  };

  const handleTogglePostLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked: !p.isLiked,
              likesCount: p.isLiked ? Math.max(0, p.likesCount - 1) : p.likesCount + 1,
            }
          : p
      )
    );
  };

  const handleTogglePostSave = (postId: string) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, isSaved: !p.isSaved } : p)));
  };

  const handleCreatePost = (stampId: string, caption: string) => {
    const stamp = stamps.find((s) => s.id === stampId);
    if (!stamp) return;
    const post: SocialPost = {
      id: `post-${Date.now()}`,
      authorName: userProfile.name,
      authorHandle: userProfile.handle,
      authorInitials: userProfile.initials,
      authorTint: '#0A0A0A',
      stampId: stamp.id,
      caption,
      locationLabel: `${stamp.city} · ${stamp.country} · ${stamp.rarity[0].toUpperCase()}${stamp.rarity.slice(1)}`,
      timestampLabel: 'Just now',
      likesCount: 1,
      isLiked: true,
      isSaved: false,
      isDemoSeed: false,
    };
    setPosts((prev) => [post, ...prev]);
    setActiveTab('feed');
  };

  const handleClearDemoData = () => {
    const cleaned = clearDemoItems(stamps, pockets, posts);
    setStamps(cleaned.stamps);
    setPockets(cleaned.pockets);
    setPosts(cleaned.posts);
  };

  const handleRestoreDemoData = () => {
    setStamps(DEMO_STAMPS);
    setPockets(DEMO_POCKETS);
    setPosts(DEMO_POSTS);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F9] text-[#0A0A0A]">
      {gmpQuotaExceeded && (
        <div className="sticky top-0 z-50 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-xs text-amber-900 md:text-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-amber-950 underline hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {showLoginScreen ? (
        <LoginView
          featuredStamps={stamps}
          defaultProfile={userProfile}
          onAuthenticated={(nextProfile) => {
            setUserProfile(nextProfile);
            setIsAuthenticated(true);
            setHasOnboarded(true);
            setShowLoginScreen(false);
            setActiveTab('library');
          }}
          onContinueGuest={() => {
            setIsAuthenticated(true);
            setHasOnboarded(true);
            setShowLoginScreen(false);
            setActiveTab('library');
          }}
          onBackToOnboarding={() => {
            setShowLoginScreen(false);
            setHasOnboarded(false);
          }}
        />
      ) : !hasOnboarded ? (
        <OnboardingScreen
          featuredStamps={stamps}
          onGetStarted={() => {
            setHasOnboarded(true);
            setIsAuthenticated(true);
          }}
          onOpenLogin={() => setShowLoginScreen(true)}
        />
      ) : (
        <main className="min-h-screen">
          {activeTab === 'library' && (
            <StampLibraryView
              pockets={pockets}
              stamps={stamps}
              userProfile={userProfile}
              searchQuery={librarySearch}
              onSearchChange={setLibrarySearch}
              onOpenPocket={(pocketId) => {
                setActivePocketId(pocketId);
                setActiveFilter('all');
                setActiveTab('stamps');
              }}
              onQuickAddToPocket={(pocketId) => {
                setStudioPocketId(pocketId);
                setStudioEditStamp(null);
                setStudioOpen(true);
              }}
              onSelectStamp={(s) => setSelectedStampId(s.id)}
              onOpenSwiftUIExport={() => setSwiftDrawerOpen(true)}
              onOpenProfile={() => setActiveTab('profile')}
            />
          )}

          {activeTab === 'stamps' && (
            <MyStampsView
              stamps={stamps}
              pockets={pockets}
              activeFilter={activeFilter}
              activePocketId={activePocketId}
              searchQuery={stampsSearch}
              onFilterChange={setActiveFilter}
              onClearPocketFilter={() => setActivePocketId(null)}
              onSearchChange={setStampsSearch}
              onBack={() => setActiveTab('library')}
              onSelectStamp={(s) => setSelectedStampId(s.id)}
              onToggleFavorite={handleToggleFavorite}
              onOpenStudio={() => {
                setStudioPocketId(activePocketId);
                setStudioEditStamp(null);
                setStudioOpen(true);
              }}
            />
          )}

          {activeTab === 'feed' && (
            <SocialFeedView
              posts={posts}
              stamps={stamps}
              onToggleLike={handleTogglePostLike}
              onToggleSave={handleTogglePostSave}
              onSelectStamp={(s) => setSelectedStampId(s.id)}
              onCreatePost={handleCreatePost}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              profile={userProfile}
              stamps={stamps}
              postsCount={posts.length}
              onUpdateProfile={setUserProfile}
              onSelectStamp={(s) => setSelectedStampId(s.id)}
              onOpenGlobe={() => setActiveTab('globe')}
              onOpenSwiftUIExport={() => setSwiftDrawerOpen(true)}
              onSignOut={() => {
                setIsAuthenticated(false);
                setShowLoginScreen(true);
              }}
            />
          )}

          {activeTab === 'globe' && (
            <GlobeMapView
              stamps={stamps}
              focusedStampId={focusedGlobeStampId}
              onBack={() => setActiveTab('profile')}
              onSelectStamp={(s) => setSelectedStampId(s.id)}
              onCollectStamp={handleCollectStamp}
              onAddPlaceAsStamp={handleAddPlaceAsStamp}
            />
          )}

          {activeTab !== 'stamps' && (
            <BottomDock
              activeTab={activeTab === 'globe' ? 'profile' : activeTab}
              onTabChange={setActiveTab}
              onOpenStudio={() => {
                setStudioPocketId(activePocketId);
                setStudioEditStamp(null);
                setStudioOpen(true);
              }}
            />
          )}
        </main>
      )}

      <StampDetailModal
        stamp={selectedStamp}
        onClose={() => setSelectedStampId(null)}
        onToggleFavorite={handleToggleFavorite}
        onCollectStamp={handleCollectStamp}
        onEditWithGemini={(s) => {
          setSelectedStampId(null);
          setStudioEditStamp(s);
          setStudioOpen(true);
        }}
        onLocateOnGlobe={(stampId) => {
          setSelectedStampId(null);
          setFocusedGlobeStampId(stampId);
          setActiveTab('globe');
        }}
        onShareToFeed={(s) => {
          setSelectedStampId(null);
          handleCreatePost(s.id, `Added ${s.title} (${s.country}) to my SnapStamps passport!`);
        }}
      />

      <StampStudioModal
        key={`${studioOpen}-${studioEditStamp?.id || 'new'}-${studioPocketId || 'default'}`}
        isOpen={studioOpen}
        pockets={pockets}
        stamps={stamps}
        initialPocketId={studioPocketId}
        initialEditStamp={studioEditStamp}
        onClose={() => {
          setStudioOpen(false);
          setStudioEditStamp(null);
        }}
        onSaveNewStamp={handleSaveNewStamp}
        onUpdateStampArt={handleUpdateStampArt}
      />

      <SwiftUIExportDrawer
        isOpen={swiftDrawerOpen}
        hasDemoData={hasDemoData}
        onClose={() => setSwiftDrawerOpen(false)}
        onClearDemoData={handleClearDemoData}
        onRestoreDemoData={handleRestoreDemoData}
      />
    </div>
  );
}
