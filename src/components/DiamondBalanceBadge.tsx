import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { DiamondIcon } from './DiamondIcon';
import { JellyButton } from './JellyButton';

interface DiamondBalanceBadgeProps {
  balance: number;
  onClick?: () => void;
  ariaLabel?: string;
  testId?: string;
}

export function DiamondBalanceBadge({
  balance,
  onClick,
  ariaLabel,
  testId = 'diamond-balance',
}: DiamondBalanceBadgeProps) {
  const shouldReduceMotion = useReducedMotion();
  const prevBalanceRef = useRef(balance);
  const [pulseCount, setPulseCount] = useState(0);
  const [delta, setDelta] = useState<number | null>(null);

  useEffect(() => {
    const prev = prevBalanceRef.current;
    if (prev !== balance) {
      const diff = balance - prev;
      prevBalanceRef.current = balance;
      setDelta(diff);
      setPulseCount((c) => c + 1);
      const timer = window.setTimeout(() => {
        setDelta(null);
      }, 1150);
      return () => window.clearTimeout(timer);
    }
  }, [balance]);

  const innerContent = (
    <motion.div
      key={`pulse-${pulseCount}`}
      initial={pulseCount > 0 && !shouldReduceMotion ? { scale: 1 } : false}
      animate={
        pulseCount > 0 && !shouldReduceMotion
          ? { scale: [1, 1.07, 1] }
          : { scale: 1 }
      }
      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex h-11 items-center gap-2 rounded-full px-4"
    >
      {/* Subtle Golden-Yellow Liquid Glass Pulse Overlay */}
      {pulseCount > 0 && !shouldReduceMotion && (
        <motion.span
          aria-hidden="true"
          initial={{ opacity: 0.72, scale: 0.96 }}
          animate={{ opacity: 0, scale: 1.18 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(250, 204, 21, 0.38) 0%, rgba(245, 158, 11, 0.14) 65%, transparent 100%)',
            border: '1px solid rgba(250, 204, 21, 0.75)',
          }}
        />
      )}

      <motion.span
        animate={
          pulseCount > 0 && !shouldReduceMotion
            ? { rotate: [0, -12, 10, 0], scale: [1, 1.16, 1] }
            : {}
        }
        transition={{ duration: 0.45 }}
        className="relative z-10 flex items-center"
      >
        <DiamondIcon size={18} />
      </motion.span>

      <span
        data-testid={testId}
        className="font-mono-nums relative z-10 text-[14px] font-semibold text-[#0A0A0A]"
      >
        {balance.toLocaleString()}
      </span>

      {/* Floating Delta Indicator */}
      <AnimatePresence>
        {delta !== null && !shouldReduceMotion && (
          <motion.span
            key={`delta-${pulseCount}`}
            initial={{ opacity: 0, y: 6, scale: 0.85 }}
            animate={{ opacity: 1, y: -22, scale: 1 }}
            exit={{ opacity: 0, y: -32 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className={`font-mono-nums pointer-events-none absolute right-2 top-0 z-20 rounded-full px-2 py-0.5 text-[11px] font-bold ${
              delta > 0
                ? 'bg-[#FEF3C7] text-[#B45309] ring-1 ring-[#F59E0B]/45'
                : 'bg-white/95 text-[#0A0A0A] ring-1 ring-black/10'
            }`}
          >
            {delta > 0 ? `+${delta.toLocaleString()}` : delta.toLocaleString()}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );

  if (onClick) {
    return (
      <JellyButton
        type="button"
        onClick={onClick}
        aria-label={ariaLabel || `SnapStamps Diamonds balance: ${balance.toLocaleString()}`}
        className={`liquid-glass-btn relative rounded-full focus-visible:outline-2 focus-visible:outline-[#0A0A0A] ${
          delta !== null ? 'ring-1 ring-[#FACC15]/70' : ''
        }`}
      >
        {innerContent}
      </JellyButton>
    );
  }

  return (
    <div
      aria-label={ariaLabel || `SnapStamps Diamonds balance: ${balance.toLocaleString()}`}
      className={`liquid-glass-btn relative rounded-full transition-colors duration-300 ${
        delta !== null ? 'ring-1 ring-[#FACC15]/70' : ''
      }`}
    >
      {innerContent}
    </div>
  );
}
