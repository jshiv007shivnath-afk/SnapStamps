import { useState } from 'react';
import type { AppNotification, AppTab, NotificationCategory } from '../types/stamp';
import { BackButton } from './BackButton';
import { JellyButton } from './JellyButton';
import { JellyRadio } from './JellyRadio';
import { Reicon, type ReiconName } from './Reicon';

interface NotificationsViewProps {
  notifications: AppNotification[];
  onBack: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigateTab: (tab: AppTab) => void;
}

type NotificationFilter = 'all' | 'release' | 'store' | 'event';

const CATEGORY_META: Record<
  NotificationCategory,
  { label: string; icon: ReiconName; tintBg: string; tintColor: string }
> = {
  release: {
    label: 'App Release',
    icon: 'sparkles',
    tintBg: '#EFF6FF',
    tintColor: '#2563EB',
  },
  store: {
    label: 'Store Drop',
    icon: 'store',
    tintBg: '#FEF3C7',
    tintColor: '#B45309',
  },
  event: {
    label: 'Live Event',
    icon: 'trophy',
    tintBg: '#ECFDF5',
    tintColor: '#047857',
  },
  system: {
    label: 'Account',
    icon: 'notification',
    tintBg: '#F4F4F5',
    tintColor: '#0A0A0A',
  },
};

const FILTER_TABS: Array<{ value: NotificationFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'release', label: 'Releases' },
  { value: 'store', label: 'Store Drops' },
  { value: 'event', label: 'Events' },
];

export function NotificationsView({
  notifications,
  onBack,
  onMarkRead,
  onMarkAllRead,
  onNavigateTab,
}: NotificationsViewProps) {
  const [filter, setFilter] = useState<NotificationFilter>('all');

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const visible = notifications.filter((n) =>
    filter === 'all' ? true : n.category === filter
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-36 pt-4 sm:px-8">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <BackButton onClick={onBack} ariaLabel="Back to Stamp Library" />
          <div className="min-w-0">
            <p className="font-body whitespace-nowrap text-[12px] font-normal text-neutral-500">
              Updates &amp; Drops
            </p>
            <h1 className="font-title truncate text-[24px] font-medium tracking-[-0.02em] text-[#0A0A0A] sm:text-[26px]">
              Notifications
            </h1>
          </div>
        </div>

        {unreadCount > 0 && (
          <JellyButton
            type="button"
            jellyIntensity="soft"
            onClick={onMarkAllRead}
            className="liquid-glass-btn font-control flex h-11 items-center gap-1.5 rounded-full px-4 text-[12.5px] font-medium text-[#0A0A0A]"
          >
            <Reicon name="check" size={14} />
            <span>Mark all read</span>
          </JellyButton>
        )}
      </header>

      {/* Filter Bar */}
      <div className="no-scrollbar mt-5 -mx-1 overflow-x-auto overscroll-none px-1">
        <JellyRadio
          items={FILTER_TABS}
          value={filter}
          onChange={(val) => setFilter(val as NotificationFilter)}
          chipColor="rgba(255, 255, 255, 0.84)"
          activeColor="#0A0A0A"
          textColor="#0A0A0A"
          activeTextColor="#FFFFFF"
          size="sm"
          gap={8}
          radius={9999}
          swell={0.07}
          barge={2}
          shrink={0.03}
          jelly={0.9}
          bounce={0.34}
          stagger={20}
          stiffness={600}
          ariaLabel="Filter notifications"
        />
      </div>

      {visible.length === 0 ? (
        <div className="mt-6 rounded-[24px] border border-black/6 bg-white p-10 text-center">
          <p className="font-title text-base font-semibold text-[#0A0A0A]">
            All caught up
          </p>
          <p className="font-body mt-1 text-sm text-neutral-500">
            New SnapStamps releases, Store drops, and live events will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {visible.map((item) => {
            const meta = CATEGORY_META[item.category];
            return (
              <article
                key={item.id}
                className="rounded-[24px] border border-black/6 bg-white p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: meta.tintBg, color: meta.tintColor }}
                    >
                      <Reicon name={meta.icon} size={18} />
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-control rounded-full bg-[#F5F5F7] px-2.5 py-0.5 text-[11px] font-medium text-neutral-600">
                          {meta.label}
                        </span>
                        <span className="font-body text-[11.5px] text-neutral-400">
                          {item.timestampLabel}
                        </span>
                        {!item.isRead && (
                          <span
                            aria-label="Unread notification"
                            className="h-2 w-2 rounded-full bg-[#2563EB]"
                          />
                        )}
                      </div>

                      <h2 className="font-title mt-1.5 text-[15.5px] font-semibold text-[#0A0A0A]">
                        {item.title}
                      </h2>
                      <p className="font-body mt-1 text-[13px] leading-relaxed text-neutral-600">
                        {item.message}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 flex flex-wrap items-center justify-end gap-2">
                  {!item.isRead && (
                    <JellyButton
                      type="button"
                      onClick={() => onMarkRead(item.id)}
                      className="font-control flex h-9 items-center rounded-full bg-[#F5F5F7] px-3.5 text-xs font-medium text-[#0A0A0A] hover:bg-neutral-200"
                    >
                      Mark as read
                    </JellyButton>
                  )}

                  {item.targetTab && item.actionLabel && (
                    <JellyButton
                      type="button"
                      jellyIntensity="medium"
                      onClick={() => {
                        onMarkRead(item.id);
                        onNavigateTab(item.targetTab!);
                      }}
                      className="font-control flex h-9 items-center rounded-full bg-[#0A0A0A] px-4 text-xs font-medium text-white hover:bg-neutral-800"
                    >
                      {item.actionLabel}
                    </JellyButton>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
