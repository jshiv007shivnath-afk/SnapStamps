import { type ReactNode, useId } from 'react';

export type GlassShape = 'rounded' | 'pill' | 'circle';
export type GlassTint = 'clear' | 'amber' | 'sage' | 'coral' | 'sky';

const TINT_STYLES: Record<GlassTint, { bg: string; highlight: string }> = {
  clear: {
    bg: 'linear-gradient(155deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0.44) 100%)',
    highlight: 'rgba(255, 255, 255, 0.8)',
  },
  amber: {
    bg: 'linear-gradient(160deg, rgba(250, 214, 72, 0.62) 0%, rgba(242, 198, 42, 0.82) 100%)',
    highlight: 'rgba(255, 248, 214, 0.75)',
  },
  sage: {
    bg: 'linear-gradient(160deg, rgba(132, 196, 128, 0.56) 0%, rgba(102, 174, 108, 0.78) 100%)',
    highlight: 'rgba(226, 250, 224, 0.72)',
  },
  coral: {
    bg: 'linear-gradient(160deg, rgba(244, 134, 114, 0.56) 0%, rgba(226, 98, 76, 0.78) 100%)',
    highlight: 'rgba(255, 228, 220, 0.72)',
  },
  sky: {
    bg: 'linear-gradient(160deg, rgba(126, 186, 236, 0.54) 0%, rgba(96, 162, 224, 0.76) 100%)',
    highlight: 'rgba(224, 242, 255, 0.74)',
  },
};

interface LiquidGlassSurfaceProps {
  children: ReactNode;
  shape?: GlassShape;
  tint?: GlassTint;
  className?: string;
  enableRefractionFilter?: boolean;
}

/**
 * LiquidGlassSurface adapts the optical refraction, capsule/circle geometry,
 * and specular rim layering from dashersw/liquid-glass-js while maintaining
 * zero box-shadows and zero dark border lines.
 */
export function LiquidGlassSurface({
  children,
  shape = 'rounded',
  tint = 'clear',
  className = '',
  enableRefractionFilter = false,
}: LiquidGlassSurfaceProps) {
  const filterId = useId().replace(/:/g, '');
  const palette = TINT_STYLES[tint];

  const radiusClass =
    shape === 'circle'
      ? 'rounded-full aspect-square'
      : shape === 'pill'
        ? 'rounded-full'
        : 'rounded-[28px]';

  return (
    <div
      className={`relative overflow-hidden snap-no-shadow ${radiusClass} ${className}`}
      style={{
        background: palette.bg,
        backdropFilter: 'blur(22px) saturate(185%)',
        WebkitBackdropFilter: 'blur(22px) saturate(185%)',
        border: `1px solid ${palette.highlight}`,
      }}
    >
      {enableRefractionFilter && (
        <svg className="sr-only" aria-hidden="true">
          <defs>
            <filter id={`lg-refract-${filterId}`}>
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.015 0.015"
                numOctaves="2"
                seed="7"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="6"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}
      {/* Specular top optical sheen inspired by liquid-glass-js shader rim */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-3 top-0 h-[1px]"
        style={{
          background:
            'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0) 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          background:
            'radial-gradient(120% 60% at 20% 0%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 60%)',
          filter: enableRefractionFilter ? `url(#lg-refract-${filterId})` : undefined,
        }}
      />
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}
