import type { StampThemeTag } from '../types/stamp';
import { Reicon, type ReiconName } from './Reicon';

const TAG_ICON_MAP: Record<StampThemeTag, ReiconName> = {
  Nature: 'compass',
  Urban: 'map',
  Culture: 'sparkles',
  Historical: 'crown',
};

const TAG_ICON_COLOR_MAP: Record<StampThemeTag, string> = {
  Nature: '#2E6F52',
  Urban: '#2563EB',
  Culture: '#9A5B13',
  Historical: '#52525B',
};

export function getThemeTagIcon(tag: StampThemeTag): ReiconName {
  return TAG_ICON_MAP[tag];
}

interface ThemeTagPillProps {
  tag: StampThemeTag;
  variant?: 'glass' | 'soft';
  size?: 'xs' | 'sm';
  testId?: string;
}

export function ThemeTagPill({
  tag,
  variant = 'soft',
  size = 'xs',
  testId,
}: ThemeTagPillProps) {
  const surfaceClass =
    variant === 'glass' ? 'liquid-glass-btn' : 'liquid-glass-btn-soft';
  const sizeClass =
    size === 'sm'
      ? 'px-3 py-1 text-xs'
      : 'px-2.5 py-1 text-[11px]';

  return (
    <span
      data-testid={testId}
      className={`${surfaceClass} inline-flex items-center gap-1 rounded-full font-medium text-[#0A0A0A] ring-1 ring-black/[0.05] ${sizeClass}`}
    >
      <Reicon
        name={TAG_ICON_MAP[tag]}
        size={size === 'sm' ? 13 : 12}
        color={TAG_ICON_COLOR_MAP[tag]}
      />
      <span>{tag}</span>
    </span>
  );
}
