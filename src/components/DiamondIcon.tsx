interface DiamondIconProps {
  size?: number;
  className?: string;
}

/**
 * Faceted golden-yellow SnapStamps Diamond currency glyph.
 */
export function DiamondIcon({ size = 16, className = '' }: DiamondIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      {/* Top crown */}
      <polygon points="5,4 19,4 22,9.5 2,9.5" fill="#FDE047" />
      <polygon points="8.5,4 15.5,4 17,9.5 7,9.5" fill="#FEF08A" />
      {/* Faceted golden pavilion */}
      <polygon points="2,9.5 7.5,9.5 12,20.5" fill="#F59E0B" />
      <polygon points="7.5,9.5 16.5,9.5 12,20.5" fill="#FACC15" />
      <polygon points="16.5,9.5 22,9.5 12,20.5" fill="#D97706" />
      {/* Crisp subtle hairline facet edges */}
      <path
        d="M5 4H19L22 9.5L12 20.5L2 9.5L5 4Z"
        stroke="#B45309"
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
      <path d="M2 9.5H22" stroke="#B45309" strokeWidth="1" />
    </svg>
  );
}
