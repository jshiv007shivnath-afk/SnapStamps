interface AppLogoProps {
  size?: number;
  className?: string;
  alt?: string;
}

export function AppLogo({
  size = 44,
  className = '',
  alt = 'SnapStamps Logo',
}: AppLogoProps) {
  return (
    <img
      src="/assets/aistudio/Gemini_Generated_Image_7urt8y7urt8y7urt_d025fabc.png"
      alt={alt}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`shrink-0 select-none object-contain mix-blend-multiply ${className}`}
      draggable={false}
    />
  );
}

export default AppLogo;
