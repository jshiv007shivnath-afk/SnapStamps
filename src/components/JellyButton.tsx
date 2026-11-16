import {
  forwardRef,
  useEffect,
  useRef,
  type PointerEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import {
  animate,
  motion,
  motionValue,
  useReducedMotion,
  useTransform,
  type HTMLMotionProps,
} from 'motion/react';

export interface JellyButtonProps extends Omit<HTMLMotionProps<'button'>, 'style'> {
  children: ReactNode;
  jellyIntensity?: 'soft' | 'medium';
}

const spring = (k: number, m: number, bounce: number) => ({
  type: 'spring' as const,
  stiffness: k,
  damping: 2 * Math.sqrt(k * m) * (1 - bounce),
  mass: m,
});

/**
 * Reusable interactive button applying JellyRadio's anisotropic soft squash-and-stretch
 * spring physics on press and release across the entire SnapStamps app.
 */
export const JellyButton = forwardRef<HTMLButtonElement, JellyButtonProps>(
  function JellyButton(
    {
      children,
      jellyIntensity = 'soft',
      disabled,
      onPointerDown,
      onPointerUp,
      onPointerLeave,
      onPointerCancel,
      onKeyDown,
      onClick,
      type = 'button',
      ...rest
    },
    ref
  ) {
    const reduce = useReducedMotion();
    const sxRef = useRef(motionValue(1));
    const syRef = useRef(motionValue(1));
    const pressedRef = useRef(false);
    const downTimeRef = useRef(0);

    const transform = useTransform(
      () => `scale(${sxRef.current.get()}, ${syRef.current.get()})`
    );

    useEffect(() => {
      const sx = sxRef.current;
      const sy = syRef.current;
      return () => {
        sx.destroy();
        sy.destroy();
      };
    }, []);

    const amp = jellyIntensity === 'medium' ? 0.068 : 0.048;

    const squishIn = () => {
      if (reduce || disabled) return;
      pressedRef.current = true;
      downTimeRef.current = performance.now();
      // Gentle lateral expand + vertical compress just like soft jelly
      animate(sxRef.current, 1 + amp * 1.15, spring(580, 0.85, 0.25));
      animate(syRef.current, 1 - amp * 1.35, {
        ...spring(490, 0.92, 0.22),
        delay: 0.015,
      });
    };

    const bounceOut = (impulseIfUnpressed = false) => {
      if (reduce) {
        sxRef.current.jump(1);
        syRef.current.jump(1);
        pressedRef.current = false;
        return;
      }

      const elapsed = performance.now() - downTimeRef.current;
      // Ensure quick programmatic/single-frame clicks or keyboard taps still produce a soft jelly rebound
      if (impulseIfUnpressed || (pressedRef.current && elapsed < 36)) {
        sxRef.current.jump(1 + amp * 1.1);
        syRef.current.jump(1 - amp * 1.3);
      }

      if (!pressedRef.current && !impulseIfUnpressed) return;
      pressedRef.current = false;

      // Exact JellyRadio asymmetric stiffness + slight sy delay overshoot
      animate(sxRef.current, 1, spring(640, 0.8, 0.48));
      animate(syRef.current, 1, {
        ...spring(480, 0.95, 0.36),
        delay: 0.032,
      });
    };

    const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
      squishIn();
      onPointerDown?.(e);
    };

    const handlePointerUp = (e: PointerEvent<HTMLButtonElement>) => {
      bounceOut(false);
      onPointerUp?.(e);
    };

    const handlePointerLeave = (e: PointerEvent<HTMLButtonElement>) => {
      if (pressedRef.current) bounceOut(false);
      onPointerLeave?.(e);
    };

    const handlePointerCancel = (e: PointerEvent<HTMLButtonElement>) => {
      if (pressedRef.current) bounceOut(false);
      onPointerCancel?.(e);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
        squishIn();
      }
      onKeyDown?.(e);
    };

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (e.detail === 0 || !pressedRef.current) {
        // Keyboard trigger or instant synthetic click without sustained press
        if (Math.abs(sxRef.current.get() - 1) < 0.012) {
          bounceOut(true);
        }
      }
      onClick?.(e);
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled}
        style={{ transform, transformOrigin: '50% 50%' }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        {...rest}
      >
        {children}
      </motion.button>
    );
  }
);

export default JellyButton;
