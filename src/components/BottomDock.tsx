import { createPortal } from 'react-dom';
import type { AppTab } from '../types/stamp';
import { getNavIconLoopDelaySec } from '../utils/entryLoopLogic';
import { GlassSurface } from './GlassSurface';
import { JellyButton } from './JellyButton';
import { JellyRadio } from './JellyRadio';
import { Reicon, type ReiconName } from './Reicon';

interface BottomDockProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onOpenStore: () => void;
  animateIcons?: boolean;
  animationRunId?: number;
}

// Navigation order:
// 1. Library (Home) | 2. Streaks (Flame) | 3. Chats (Circle) | 4. Profile (User) + Right Circle: Store
const DOCK_ITEMS: Array<{ id: AppTab; label: string; icon: ReiconName }> = [
  { id: 'library', label: 'Library', icon: 'home' },
  { id: 'streaks', label: 'Streaks', icon: 'flame' },
  { id: 'feed', label: 'Circle', icon: 'chat' },
  { id: 'profile', label: 'Profile', icon: 'user' },
];

export function BottomDock({
  activeTab,
  onTabChange,
  onOpenStore,
  animateIcons = false,
  animationRunId = 0,
}: BottomDockProps) {
  const isStoreActive = activeTab === 'store';
  const radioValue = isStoreActive ? '__none__' : activeTab;

  const radioItems = DOCK_ITEMS.map((item, idx) => {
    const isActive = activeTab === item.id;
    const delaySec = getNavIconLoopDelaySec(idx);
    return {
      value: item.id,
      icon: (
        <span
          key={animateIcons ? `${item.id}-loop-${animationRunId}` : `${item.id}-idle`}
          data-nav-icon-animating={animateIcons ? 'true' : 'false'}
          className={animateIcons ? 'nav-icon-loop' : 'inline-flex items-center justify-center'}
          style={animateIcons ? { animationDelay: `${delaySec}s` } : undefined}
        >
          <Reicon
            name={item.icon}
            size={19}
            weight={isActive ? 'Filled' : 'Outline'}
          />
        </span>
      ),
      label: <span className="sr-only sm:not-sr-only">{item.label}</span>,
    };
  });

  const storeDelaySec = getNavIconLoopDelaySec(DOCK_ITEMS.length);

  const navContent = (
    <nav
      aria-label="Primary navigation"
      data-nav-loop-active={animateIcons ? 'true' : 'false'}
      className="fixed-bottom-dock fixed inset-x-0 bottom-0 z-50 touch-none pointer-events-none flex items-center justify-center gap-2.5 px-4 pb-safe-dock pt-2"
    >
      {/* Floating React Bits GlassSurface + JellyRadio 4-Tab Navigation Pill */}
      <GlassSurface
        width="auto"
        height={64}
        borderRadius={9999}
        distortionScale={-140}
        displace={0.65}
        backgroundOpacity={0.28}
        saturation={1.2}
        brightness={50}
        opacity={0.93}
        blur={11}
        className="pointer-events-auto snap-no-shadow"
      >
        <JellyRadio
          items={radioItems}
          value={radioValue}
          onChange={(nextValue) => onTabChange(nextValue as AppTab)}
          chipColor="rgba(255, 255, 255, 0.84)"
          activeColor="#0A0A0A"
          textColor="#0A0A0A"
          activeTextColor="#FFFFFF"
          size="lg"
          gap={6}
          radius={9999}
          swell={0.12}
          barge={3}
          shrink={0.04}
          jelly={0.9}
          bounce={0.34}
          stagger={26}
          stiffness={640}
          className="jelly-radio--icon-mobile"
          ariaLabel="SnapStamps navigation tabs"
        />
      </GlassSurface>

      {/* Separate Circular GlassSurface Store Button replacing '+' */}
      <GlassSurface
        width={58}
        height={58}
        borderRadius={9999}
        distortionScale={-140}
        displace={0.65}
        backgroundOpacity={0.28}
        saturation={1.2}
        brightness={50}
        opacity={0.93}
        blur={11}
        className="pointer-events-auto snap-no-shadow"
      >
        <JellyButton
          type="button"
          jellyIntensity="medium"
          onClick={onOpenStore}
          aria-label="Open Stamp Store"
          aria-current={isStoreActive ? 'page' : undefined}
          className={`font-control flex h-full w-full items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-[#0A0A0A] ${
            isStoreActive
              ? 'bg-[#0A0A0A] text-white'
              : 'liquid-glass-btn text-[#0A0A0A]'
          }`}
        >
          <span
            key={animateIcons ? `store-loop-${animationRunId}` : 'store-idle'}
            data-nav-icon-animating={animateIcons ? 'true' : 'false'}
            className={animateIcons ? 'nav-icon-loop' : 'inline-flex items-center justify-center'}
            style={animateIcons ? { animationDelay: `${storeDelaySec}s` } : undefined}
          >
            <Reicon
              name="store"
              size={21}
              weight={isStoreActive ? 'Filled' : 'Outline'}
            />
          </span>
        </JellyButton>
      </GlassSurface>
    </nav>
  );

  if (typeof document === 'undefined') return navContent;
  return createPortal(navContent, document.body);
}
