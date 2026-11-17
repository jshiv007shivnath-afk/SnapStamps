import type { AppSettings, UserProfile } from '../types/stamp';
import { BackButton } from './BackButton';
import { JellyButton } from './JellyButton';
import { Reicon } from './Reicon';

interface SettingsViewProps {
  settings: AppSettings;
  userProfile: UserProfile;
  foldersCount: number;
  stampsCount: number;
  onBack: () => void;
  onUpdateSettings: (next: AppSettings) => void;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  onSignOut: () => void;
}

function SettingsToggleRow({
  title,
  description,
  checked,
  onToggle,
}: {
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="font-title text-[14.5px] font-medium text-[#0A0A0A]">{title}</p>
        <p className="font-body mt-0.5 text-[12px] text-neutral-500">{description}</p>
      </div>
      <JellyButton
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={onToggle}
        className={`relative flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-colors ${
          checked ? 'bg-[#0A0A0A]' : 'bg-neutral-200'
        }`}
      >
        <span
          className={`h-6 w-6 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </JellyButton>
    </div>
  );
}

export function SettingsView({
  settings,
  userProfile,
  foldersCount,
  stampsCount,
  onBack,
  onUpdateSettings,
  onOpenProfile,
  onOpenNotifications,
  onSignOut,
}: SettingsViewProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-36 pt-4 sm:px-8">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BackButton onClick={onBack} ariaLabel="Back to Stamp Library" />
          <div>
            <p className="font-body text-[12px] font-normal text-neutral-500">
              Preferences &amp; Alerts
            </p>
            <h1 className="font-title text-[24px] font-medium tracking-[-0.02em] text-[#0A0A0A] sm:text-[26px]">
              Settings
            </h1>
          </div>
        </div>
      </header>

      {/* Account Summary Card */}
      <section className="mt-6 rounded-[24px] border border-black/6 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E9DEC9] text-sm font-bold text-[#0A0A0A]">
              {userProfile.initials}
            </div>
            <div>
              <h2 className="font-title text-[16px] font-semibold text-[#0A0A0A]">
                {userProfile.name}
              </h2>
              <p className="font-body text-xs text-neutral-500">
                {userProfile.handle} · {foldersCount} Folders · {stampsCount} Stamps
              </p>
            </div>
          </div>

          <JellyButton
            type="button"
            onClick={onOpenProfile}
            className="font-control flex h-10 items-center gap-1.5 rounded-full bg-[#F5F5F7] px-4 text-xs font-medium text-[#0A0A0A] hover:bg-neutral-200"
          >
            <Reicon name="user" size={14} />
            <span>Open Profile</span>
          </JellyButton>
        </div>
      </section>

      {/* Notification & Haptic Toggles */}
      <section className="mt-4 rounded-[24px] border border-black/6 bg-white px-5 py-2">
        <div className="divide-y divide-black/6">
          <SettingsToggleRow
            title="New Version Releases"
            description="Notify when new SnapStamps updates and features launch"
            checked={settings.releaseAlerts}
            onToggle={() =>
              onUpdateSettings({ ...settings, releaseAlerts: !settings.releaseAlerts })
            }
          />
          <SettingsToggleRow
            title="Store Stamp Drops"
            description="Get alerts when new Country or Sports Legend editions arrive"
            checked={settings.storeDropAlerts}
            onToggle={() =>
              onUpdateSettings({ ...settings, storeDropAlerts: !settings.storeDropAlerts })
            }
          />
          <SettingsToggleRow
            title="SnapStamps Live Events"
            description="Seasonal collector challenges and limited-time stamp drops"
            checked={settings.eventAlerts}
            onToggle={() =>
              onUpdateSettings({ ...settings, eventAlerts: !settings.eventAlerts })
            }
          />
          <SettingsToggleRow
            title="Tactile Haptics"
            description="Physical touch vibration on button taps and purchases (mobile)"
            checked={settings.hapticsEnabled}
            onToggle={() =>
              onUpdateSettings({ ...settings, hapticsEnabled: !settings.hapticsEnabled })
            }
          />
        </div>
      </section>

      {/* Quick Actions & App Info */}
      <section className="mt-4 space-y-3">
        <JellyButton
          type="button"
          onClick={onOpenNotifications}
          className="flex h-14 w-full items-center justify-between rounded-[24px] border border-black/6 bg-white px-5 text-left"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7] text-[#0A0A0A]">
              <Reicon name="notification" size={18} />
            </span>
            <div>
              <p className="font-title text-[14.5px] font-medium text-[#0A0A0A]">
                Notification Inbox
              </p>
              <p className="font-body text-xs text-neutral-500">
                View release notes, store additions &amp; events
              </p>
            </div>
          </div>
          <Reicon name="arrow-left" size={16} className="rotate-180 text-neutral-400" />
        </JellyButton>

        <div className="flex items-center justify-between rounded-[24px] border border-black/6 bg-white px-5 py-4">
          <div>
            <p className="font-title text-[14px] font-medium text-[#0A0A0A]">SnapStamps</p>
            <p className="font-mono-nums text-xs text-neutral-500">Version 2.4.0 · Mobile Ready</p>
          </div>

          <JellyButton
            type="button"
            onClick={onSignOut}
            className="font-control flex h-10 items-center rounded-full bg-[#0A0A0A] px-4 text-xs font-medium text-white hover:bg-neutral-800"
          >
            Sign Out
          </JellyButton>
        </div>
      </section>
    </div>
  );
}
