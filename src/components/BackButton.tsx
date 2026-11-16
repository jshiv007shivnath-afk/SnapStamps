import { JellyButton } from './JellyButton';
import { Reicon } from './Reicon';

interface BackButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
}

/**
 * Standard black circular back button with white left arrow and soft JellyButton physics.
 */
export function BackButton({
  onClick,
  ariaLabel = 'Back',
  className = '',
}: BackButtonProps) {
  return (
    <JellyButton
      type="button"
      jellyIntensity="medium"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0A0A0A] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A] ${className}`}
    >
      <Reicon name="arrow-left" size={18} />
    </JellyButton>
  );
}

export default BackButton;
