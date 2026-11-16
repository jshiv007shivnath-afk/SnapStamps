import type { AppTab } from '../types/stamp';
import { GlassSurface } from './GlassSurface';
import { JellyButton } from './JellyButton';
import { JellyRadio } from './JellyRadio';
import { Reicon, type ReiconName } from './Reicon';

interface BottomDockProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onOpenStudio: () => void;
}

// Navigation order matched strictly to reference image:
// 1. Library (Home) | 2. My Stamps (Frame) | 3. Rare Finds Feed (Chat) | 4. Profile (User)
const DOCK_ITEMS: Array<{ id: AppTab; label: string; icon: ReiconName }> = [
  { id: 'library', label: 'Library', icon: 'home' },
  { id: 'stamps', label: 'My Stamps', icon: 'frame' },
  { id: 'feed', label: 'Rare Finds', icon: 'chat' },
  { id: 'profile', label: 'Profile', icon: 'user' },
];

export function BottomDock({ activeTab, onTabChange, onOpenStudio }: BottomDockProps) {
  const radioItems = DOCK_ITEMS.map((item) => {
    const isActive = activeTab === item.id;
    return {
      value: item.id,
      icon: (
        <Reicon
          name={item.icon}
          size={19}
          weight={isActive ? 'Filled' : 'Outline'}
        />
      ),
      label: <span className="sr-only sm:not-sr-only">{item.label}</span>,
    };
  });

  return (
    <nav
      aria-label="Primary navigation"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex items-center justify-center gap-2.5 px-4 pb-safe-dock pt-2"
    >
      {/* Floating React Bits GlassSurface + JellyRadio 4-Tab Navigation Pill */}
      <GlassSurface
        width="auto"
        height={64}
        borderRadius={32}
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
          value={activeTab}
          onChange={(nextValue) => onTabChange(nextValue as AppTab)}
          chipColor="rgba(255, 255, 255, 0.34)"
          activeColor="#0A0A0A"
          textColor="#0A0A0A"
          activeTextColor="#FFFFFF"
          size="lg"
          gap={6}
          radius={22}
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

      {/* Separate Circular GlassSurface '+' Stamp Studio Button with Soft Jelly Bounce */}
      <GlassSurface
        width={58}
        height={58}
        borderRadius={29}
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
          onClick={onOpenStudio}
          aria-label="Open Stamp Studio"
          className="font-control flex h-full w-full items-center justify-center rounded-full bg-white/15 text-[#0A0A0A] transition-colors hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
        >
          <Reicon name="plus" size={22} />
        </JellyButton>
      </GlassSurface>
    </nav>
  );
}
