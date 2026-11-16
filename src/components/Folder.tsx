import {
  Children,
  type CSSProperties,
  isValidElement,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import './Folder.css';

const TAU = Math.PI * 2;
const STEP = 1 / 240;
const MAX_ITEMS = 6;
const DEFAULT_ITEMS = [{ title: 'Stamp 1' }, { title: 'Stamp 2' }, { title: 'Stamp 3' }, { title: 'Stamp 4' }];

const FLAP_REST_DEFAULT = [
  { x: 0.16, rise: 0, r: 3 },
  { x: -0.17, rise: 0.05, r: -3.5 },
  { x: 0, rise: 0.1, r: 0.5 },
  { x: 0.25, rise: 0.08, r: 5 },
  { x: -0.25, rise: 0.09, r: -5.5 },
  { x: 0.08, rise: 0.12, r: 1.5 },
];

// Tuned 4-card fanned layout matching the SnapStamps pocket showcase
const FLAP_REST_POCKET_4 = [
  { x: -0.32, rise: 0.03, r: -9 },
  { x: -0.11, rise: 0.045, r: -3 },
  { x: 0.11, rise: 0.055, r: 4 },
  { x: 0.32, rise: 0.03, r: 10 },
];

const SPREAD_TURN = [-6, -2, 2, 6, -4, 4];
const SPREAD_DROP = [0.02, -0.02, -0.01, 0.03, 0.02, -0.03];
const DROP_TURN = [-6, 4, -3, 7, -5, 3];
const FLAP_ANGLES = { open: -56, receive: -28, peek: -13, rest: 0 };
const LAYERS = { out: 50, drag: 80, focus: 90 };

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const parseColor = (() => {
  let context: CanvasRenderingContext2D | null = null;
  const cache = new Map<string, number[]>();
  return (value: string): number[] => {
    const key = String(value);
    const cached = cache.get(key);
    if (cached) return cached;
    let rgb = [245, 205, 66];
    if (typeof document !== 'undefined') {
      context ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      if (context) {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = '#3d8bff';
        context.fillStyle = key;
        context.fillRect(0, 0, 1, 1);
        rgb = Array.from(context.getImageData(0, 0, 1, 1).data.slice(0, 3));
      }
    }
    cache.set(key, rgb);
    return rgb;
  };
})();

const mixRgb = (rgb: number[], target: number[], amount: number) =>
  rgb.map((channel, i) => Math.round(channel + (target[i] - channel) * amount));
const rgbString = (rgb: number[]) => `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
const luma = (rgb: number[]) => (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;

const multiply = (a: number[], b: number[]): number[] => {
  const out = new Array<number>(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      out[col * 4 + row] =
        a[row] * b[col * 4] +
        a[4 + row] * b[col * 4 + 1] +
        a[8 + row] * b[col * 4 + 2] +
        a[12 + row] * b[col * 4 + 3];
    }
  }
  return out;
};

const chain = (...list: number[][]) => list.reduce(multiply);
const move = (x: number, y: number, z = 0) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
const stretch = (x: number, y: number) => [x, 0, 0, 0, 0, y, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

const turnX = (degrees: number) => {
  const r = (degrees * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
};

const turnY = (degrees: number) => {
  const r = (degrees * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
};

const turnZ = (degrees: number) => {
  const r = (degrees * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
};

const toCss = (m: number[]) =>
  `matrix3d(${m.map((v) => (Math.abs(v) < 1e-7 ? 0 : Number(v.toFixed(6)))).join(', ')})`;

interface FolderGeometry {
  scale: number;
  w: number;
  h: number;
  tabH: number;
  r: number;
  shoulder: number;
  corners: number[];
  tabW: number;
  tabX: number;
  frontTop: number;
  frontH: number;
  docW: number;
  docH: number;
  hideTab: boolean;
}

const measureFolder = (
  scale: number,
  labelWidth: number,
  hasLabel: boolean,
  tabPosition: 'left' | 'center' | 'right',
  customWidth?: number,
  customFrontHeight?: number,
  customPeekHeight?: number,
  customRadius?: number,
  hideTab = false
): FolderGeometry => {
  const w = customWidth ?? 224 * scale;
  const frontHeight = customFrontHeight ?? 176 * scale * 0.7;
  const peekHeight = customPeekHeight ?? (hideTab ? 48 : 176 * scale * 0.3);
  const tabH = hideTab ? 0 : 20 * scale;
  const h = peekHeight + frontHeight;
  const r = customRadius ?? 14 * scale;
  const shoulder = tabH * 0.75;
  const frontTop = tabH + peekHeight;
  const corners = [r, r, r, r];
  const maxTab = Math.max(40, w - corners[0] - corners[1] - shoulder * 2 - 10 * scale);
  const tabW = clamp(hasLabel ? labelWidth + 14 * scale + shoulder : w * 0.34, Math.min(w * 0.3, maxTab), maxTab);
  const tabX =
    tabPosition === 'left'
      ? corners[0] + 5 * scale + shoulder
      : tabPosition === 'center'
        ? (w - tabW) / 2
        : w - corners[1] - 5 * scale - shoulder - tabW;

  const docW = hideTab ? clamp(Math.round(w * 0.245), 76, 98) : w * 0.54;
  const docH = hideTab ? Math.round(docW / 1.12 + 10) : docW * 1.22;

  return {
    scale,
    w,
    h,
    tabH,
    r,
    shoulder,
    corners,
    tabW,
    tabX,
    frontTop,
    frontH: frontHeight,
    docW,
    docH,
    hideTab,
  };
};

const backPath = (g: FolderGeometry) => {
  const { w, h, tabX, tabW, tabH, shoulder, frontTop, hideTab } = g;
  const [tl, tr, br, bl] = g.corners;
  const top = hideTab ? frontTop : tabH;
  const bottom = tabH + h;
  if (hideTab) {
    return [
      `M 0 ${top + tl}`,
      `Q 0 ${top} ${tl} ${top}`,
      `L ${w - tr} ${top}`,
      `Q ${w} ${top} ${w} ${top + tr}`,
      `L ${w} ${bottom - br}`,
      `Q ${w} ${bottom} ${w - br} ${bottom}`,
      `L ${bl} ${bottom}`,
      `Q 0 ${bottom} 0 ${bottom - bl}`,
      'Z',
    ].join(' ');
  }
  return [
    `M 0 ${top + tl}`,
    `Q 0 ${top} ${tl} ${top}`,
    `L ${tabX - shoulder} ${top}`,
    `C ${tabX} ${top} ${tabX} 0 ${tabX + shoulder} 0`,
    `L ${tabX + tabW - shoulder} 0`,
    `C ${tabX + tabW} 0 ${tabX + tabW} ${top} ${tabX + tabW + shoulder} ${top}`,
    `L ${w - tr} ${top}`,
    `Q ${w} ${top} ${w} ${top + tr}`,
    `L ${w} ${bottom - br}`,
    `Q ${w} ${bottom} ${w - br} ${bottom}`,
    `L ${bl} ${bottom}`,
    `Q 0 ${bottom} 0 ${bottom - bl}`,
    'Z',
  ].join(' ');
};

const placeFlap = (
  rank: number,
  count: number,
  phase: 'rest' | 'peek' | 'receive' | 'open',
  layout: 'spread' | 'stack' | 'row',
  g: FolderGeometry,
  pointer: number | null
) => {
  const usePocket4 = g.hideTab && count === 4;
  const restTable = usePocket4 ? FLAP_REST_POCKET_4 : FLAP_REST_DEFAULT;
  const rest = restTable[rank] ?? restTable[restTable.length - 1];
  const floor = g.hideTab
    ? g.frontTop + g.docH * 0.1
    : g.tabH + g.h - 5 * g.scale - g.docH / 2;
  const mid = (count - 1) / 2;

  if (phase === 'open') {
    const lift = g.hideTab ? g.frontTop - g.docH * 0.24 : g.tabH - g.h * 0.02;
    if (layout === 'stack') {
      const strip = Math.min(30 * g.scale, (g.h * 0.62) / Math.max(1, count - 1));
      const fit = 1.04 - rank * 0.05;
      return {
        x: g.w / 2,
        y: g.tabH + g.h * 0.1 - rank * strip - (g.docH * (1.04 - fit)) / 2,
        z: -rank * 18 * g.scale,
        r: 0,
        ry: 0,
        s: fit,
      };
    }
    const gap = g.hideTab ? 6 : 12 * g.scale;
    const fit = g.hideTab
      ? 1.04
      : Math.min(0.94, (g.w * 2.3 - gap * (count - 1)) / (count * g.docW));
    const step = g.docW * fit + gap;
    const tidy = layout === 'row';
    return {
      x: g.w / 2 + (rank - mid) * (g.hideTab ? step * 0.88 : step),
      y: lift + (tidy ? 0 : (SPREAD_DROP[rank] ?? 0) * g.h * 0.55),
      z: 0,
      r: tidy ? 0 : (SPREAD_TURN[rank] ?? 0) * 0.85,
      ry: 0,
      s: fit,
    };
  }

  const part = phase === 'receive' ? 1.18 : phase === 'peek' ? 1.08 : 1;
  const x = g.w / 2 + rest.x * g.w * part;
  if (phase === 'rest') {
    return { x, y: floor - rest.rise * g.h, z: 0, r: rest.r, ry: 0, s: 1 };
  }
  const near = pointer != null && phase === 'peek' ? Math.max(0, 1 - Math.abs(pointer - x) / (g.w * 0.34)) : 0;
  const rise = rest.rise + (phase === 'receive' ? 0.05 : 0.09);
  return {
    x,
    y: floor - rise * g.h - near * near * g.h * 0.08,
    z: 0,
    r: rest.r * 1.18,
    ry: 0,
    s: 1 + near * 0.04,
  };
};

interface SpringVal {
  value: number;
  velocity: number;
}

interface ItemAnimState {
  x: SpringVal;
  y: SpringVal;
  z: SpringVal;
  r: SpringVal;
  ry: SpringVal;
  s: SpringVal;
  hover: SpringVal;
  mx: SpringVal;
  my: SpringVal;
  alpha: SpringVal;
  place: 'inside' | 'out';
  rank: number;
  layer: 'inside' | 'out' | 'drag' | 'focus';
  elevated: boolean;
  insertUntil: number;
  insertFrom: 'top' | null;
  outX: number;
  outY: number;
  outR: number;
  outS: number;
  outOrder: number;
  localX: number;
  localY: number;
  fresh: boolean;
}

export interface FolderItemEntry {
  id?: string;
  title?: string;
  description?: string;
  image?: string;
  alt?: string;
  content?: ReactNode;
}

export type FolderInputItem = string | number | FolderItemEntry | ReactNode;

export interface FolderProps {
  items?: FolderInputItem[];
  label?: string;
  variant?: 'solid' | 'glass' | 'matte';
  color?: string;
  paperColor?: string;
  tabPosition?: 'left' | 'center' | 'right';
  layout?: 'spread' | 'stack' | 'row';
  size?: number;
  width?: number;
  frontHeight?: number;
  peekHeight?: number;
  borderRadius?: number;
  hideTab?: boolean;
  openOn?: 'click' | 'hover';
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onItemClick?: (item: FolderInputItem, index: number) => void;
  onItemDrop?: (item: FolderInputItem, index: number, inside: boolean) => void;
  draggable?: boolean;
  zoomOnClick?: boolean;
  peek?: boolean;
  intro?: boolean;
  tilt?: number;
  bounce?: number;
  speed?: number;
  frost?: number;
  closeOnOutsideClick?: boolean;
  theme?: 'dark' | 'light';
  frontOverlay?: ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const renderItem = (item: FolderInputItem): ReactNode => {
  if (isValidElement(item)) return item;
  if (typeof item === 'string' || typeof item === 'number') {
    return (
      <div className="folder-doc">
        <span className="font-body text-xs font-semibold text-[#0A0A0A]">{String(item)}</span>
      </div>
    );
  }
  if (item && typeof item === 'object') {
    const entry = item as FolderItemEntry;
    if (entry.content) return entry.content;
    if (entry.image) {
      return (
        <div className="folder-photo">
          <img src={entry.image} alt={entry.alt ?? entry.title ?? ''} draggable={false} />
        </div>
      );
    }
    return (
      <div className="folder-doc">
        <span className="font-body text-xs font-semibold text-[#0A0A0A]">{entry.title}</span>
      </div>
    );
  }
  return <div className="folder-doc" />;
};

export function Folder({
  items,
  label,
  variant = 'glass',
  color = '#F5CD42',
  paperColor = '#ffffff',
  tabPosition = 'right',
  layout = 'spread',
  size = 1,
  width: customWidth,
  frontHeight: customFrontHeight,
  peekHeight: customPeekHeight,
  borderRadius: customRadius,
  hideTab = false,
  openOn = 'click',
  open,
  defaultOpen = false,
  onOpenChange,
  onItemClick,
  onItemDrop,
  draggable = true,
  zoomOnClick = false,
  peek = true,
  intro = true,
  tilt = 0.45,
  bounce = 0.4,
  speed = 1,
  frost = 0.3,
  closeOnOutsideClick = true,
  theme = 'light',
  frontOverlay,
  ariaLabel,
  className = '',
  style,
  children,
}: FolderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const measureRef = useRef<HTMLSpanElement>(null);
  const engineRef = useRef<{
    wake: () => void;
    consumeClick: () => boolean;
    interactive: (index: number) => boolean;
    select: (index: number) => void;
    blur: () => boolean;
  } | null>(null);

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [labelWidth, setLabelWidth] = useState(0);
  const [outside, setOutside] = useState<number[]>([]);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? Boolean(open) : internalOpen;

  const entries = useMemo(() => {
    const custom = Children.toArray(children).filter(isValidElement);
    const source: FolderInputItem[] = custom.length ? custom : items?.length ? items : DEFAULT_ITEMS;
    return source.slice(0, MAX_ITEMS);
  }, [children, items]);
  const count = entries.length;

  const scale = Math.max(0.3, Number(size) || 1);
  const g = measureFolder(
    scale,
    labelWidth,
    Boolean(label),
    tabPosition,
    customWidth,
    customFrontHeight,
    customPeekHeight,
    customRadius,
    hideTab
  );
  const total = g.tabH + g.h;

  useIsomorphicLayoutEffect(() => {
    const node = measureRef.current;
    if (!node) return undefined;
    let active = true;
    const measure = () => {
      if (active) setLabelWidth(node.offsetWidth);
    };
    measure();
    document.fonts?.ready.then(measure);
    return () => {
      active = false;
    };
  }, [label, scale]);

  const setOpen = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      const value = typeof next === 'function' ? next(isOpen) : next;
      if (!isControlled) setInternalOpen(value);
      if (value !== isOpen) onOpenChange?.(value);
    },
    [isControlled, isOpen, onOpenChange]
  );

  const setOpenRef = useRef(setOpen);
  setOpenRef.current = setOpen;

  const rgb = parseColor(color);
  const paper = parseColor(paperColor);
  const backTone = mixRgb(rgb, [0, 0, 0], 0.14);
  const insideTop = rgbString(mixRgb(rgb, [0, 0, 0], 0.06));
  const insideBottom = rgbString(backTone);

  const settingsRef = useRef({
    open: isOpen,
    layout,
    openOn,
    peek,
    intro,
    draggable,
    zoomOnClick,
    closeOnOutsideClick,
    onItemClick,
    onItemDrop,
    tilt: clamp(tilt, 0, 1.5),
    bounce: clamp(bounce, 0, 1),
    speed: clamp(speed, 0.2, 3),
    frost: clamp(frost, 0, 1),
    count,
    entries,
    depth: Math.round(Math.max(g.w, g.h) * 5),
    g,
  });

  settingsRef.current = {
    open: isOpen,
    layout,
    openOn,
    peek,
    intro,
    draggable,
    zoomOnClick,
    closeOnOutsideClick,
    onItemClick,
    onItemDrop,
    tilt: clamp(tilt, 0, 1.5),
    bounce: clamp(bounce, 0, 1),
    speed: clamp(speed, 0.2, 3),
    frost: clamp(frost, 0, 1),
    count,
    entries,
    depth: Math.round(Math.max(g.w, g.h) * 5),
    g,
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    const spring = (value: number): SpringVal => ({ value, velocity: 0 });
    const state = {
      raf: 0,
      last: 0,
      ready: false,
      hovered: false,
      pressed: false,
      pointerX: 0,
      pointerY: 0,
      deskX: 0,
      deskY: 0,
      hoveredItem: -1,
      phase: 'rest' as 'rest' | 'peek' | 'receive' | 'open',
      previous: 'rest' as 'rest' | 'peek' | 'receive' | 'open',
      changedAt: 0,
      front: spring(0),
      rx: spring(0),
      ry: spring(0),
      lift: spring(0),
      squash: spring(1),
      items: [] as ItemAnimState[],
      focus: -1,
      drag: null as null | {
        index: number;
        id: number;
        clientX: number;
        clientY: number;
        downX: number;
        downY: number;
        grabX: number;
        grabY: number;
        scale: number;
        clip: { left: number; top: number; right: number; bottom: number } | null;
        active: boolean;
        samples: Array<[number, number, number]>;
      },
      receiving: false,
      receiveUntil: 0,
      suppressClick: false,
      dropCount: 0,
      intro: { phase: 'done' as 'wait' | 'run' | 'done', start: 0, opening: false },
      appear: 1,
    };

    const ensureItems = (n: number) => {
      while (state.items.length < n) {
        state.items.push({
          x: spring(0),
          y: spring(0),
          z: spring(0),
          r: spring(0),
          ry: spring(0),
          s: spring(1),
          hover: spring(0),
          mx: spring(0),
          my: spring(0),
          alpha: spring(1),
          place: 'inside',
          rank: 0,
          layer: 'inside',
          elevated: false,
          insertUntil: 0,
          insertFrom: null,
          outX: 0,
          outY: 0,
          outR: 0,
          outS: 1,
          outOrder: 0,
          localX: 0,
          localY: 0,
          fresh: true,
        });
      }
      if (state.items.length > n) {
        state.items.length = n;
        if (state.focus >= n) state.focus = -1;
        syncOutside();
      }
    };

    const syncOutside = () => {
      const list: number[] = [];
      state.items.forEach((item, index) => {
        if (item.place === 'out') list.push(index);
      });
      setOutside((previous) =>
        previous.length === list.length && previous.every((value, i) => value === list[i]) ? previous : list
      );
    };

    const integrate = (item: SpringVal, target: number, omega: number, zeta: number, dt: number) => {
      const k = omega * omega;
      const d = 2 * zeta * omega;
      const steps = Math.max(1, Math.ceil(dt / STEP));
      const step = dt / steps;
      for (let i = 0; i < steps; i++) {
        item.velocity += (k * (target - item.value) - d * item.velocity) * step;
        item.value += item.velocity * step;
      }
      return Math.abs(target - item.value) > 0.01 || Math.abs(item.velocity) > 0.01;
    };

    const snap = (item: SpringVal, value: number) => {
      item.value = value;
      item.velocity = 0;
    };

    const toDesk = (clientX: number, clientY: number): [number, number] => {
      const box = root.getBoundingClientRect();
      const kx = root.offsetWidth / (box.width || 1);
      const ky = root.offsetHeight / (box.height || 1);
      return [(clientX - box.left) * kx, (clientY - box.top) * ky];
    };

    const clipBounds = () => {
      const box = root.getBoundingClientRect();
      let left = 0;
      let top = 0;
      let right = window.innerWidth;
      let bottom = window.innerHeight;
      for (let node = root.parentElement; node && node !== document.body; node = node.parentElement) {
        const computed = getComputedStyle(node);
        if (/(hidden|clip|auto|scroll)/.test(`${computed.overflowX} ${computed.overflowY}`)) {
          const rect = node.getBoundingClientRect();
          left = Math.max(left, rect.left);
          top = Math.max(top, rect.top);
          right = Math.min(right, rect.right);
          bottom = Math.min(bottom, rect.bottom);
          break;
        }
      }
      const kx = root.offsetWidth / (box.width || 1);
      const ky = root.offsetHeight / (box.height || 1);
      return {
        left: (left - box.left) * kx,
        top: (top - box.top) * ky,
        right: (right - box.left) * kx,
        bottom: (bottom - box.top) * ky,
      };
    };

    const overFolder = (x: number, y: number) => {
      const { g: geometry } = settingsRef.current;
      return x >= 0 && x <= geometry.w && y >= 0 && y <= geometry.tabH + geometry.h;
    };

    const inPocket = (item: ItemAnimState) => {
      const { g: geometry } = settingsRef.current;
      const halfW = (geometry.docW * item.s.value) / 2;
      const halfH = (geometry.docH * item.s.value) / 2;
      if (state.front.value < -42) return false;
      return (
        item.y.value + halfH > geometry.frontTop + 4 * geometry.scale &&
        item.x.value + halfW > 0 &&
        item.x.value - halfW < geometry.w
      );
    };

    const velocityOf = (samples: Array<[number, number, number]>): [number, number] => {
      if (samples.length < 2) return [0, 0];
      const first = samples[0];
      const last = samples[samples.length - 1];
      const span = Math.max(0.016, (last[0] - first[0]) / 1000);
      return [(last[1] - first[1]) / span, (last[2] - first[2]) / span];
    };

    const phaseOf = (s: typeof settingsRef.current, time: number): 'rest' | 'peek' | 'receive' | 'open' => {
      if (s.open) return 'open';
      if (state.receiving || time < state.receiveUntil) return 'receive';
      if (s.peek && state.hovered && !state.drag?.active) return 'peek';
      return 'rest';
    };

    const place = (
      rank: number,
      inside: number,
      phase: 'rest' | 'peek' | 'receive' | 'open',
      s: typeof settingsRef.current
    ) => {
      const pointer = state.hovered ? ((state.pointerX + 1) / 2) * s.g.w : null;
      return placeFlap(rank, inside, phase, s.layout, s.g, pointer);
    };

    const write = () => {
      const s = settingsRef.current;
      const { w, h, tabH, frontH, docW, docH, scale: sc } = s.g;
      const pivotX = w / 2;
      const pivotY = tabH + h / 2;
      const theta = state.front.value;
      const angle = (theta * Math.PI) / 180;
      const zoom = (1 + state.lift.value * 0.01) * state.squash.value * (0.96 + 0.04 * state.appear);
      root.style.opacity = state.appear < 0.999 ? state.appear.toFixed(3) : '';

      const desk = chain(
        move(pivotX, pivotY),
        turnX(state.rx.value),
        turnY(state.ry.value),
        stretch(zoom, zoom),
        move(-pivotX, -pivotY)
      );

      if (backRef.current) {
        backRef.current.style.transform = toCss(desk);
        backRef.current.style.setProperty('--folder-label', (1 - clamp((-theta - 18) / 26, 0, 1)).toFixed(3));
      }

      const frontMatrix = chain(desk, move(0, tabH + h, 2 * sc), turnX(theta), move(0, -frontH));
      const facing = Math.sin(angle) * 0.5 + Math.cos(angle) * 0.86;
      const light = facing / 0.86;
      const glint = clamp((light - 1) * 0.9, 0, 0.16);

      const front = frontRef.current;
      if (front) {
        front.style.transform = toCss(frontMatrix);
        front.style.zIndex = '40';
        front.style.setProperty('--folder-glint', glint.toFixed(3));
      }

      const outs = state.items
        .map((item, index) => [item, index] as const)
        .filter(([item]) => item.layer === 'out')
        .sort((a, b) => a[0].outOrder - b[0].outOrder)
        .map(([, index]) => index);

      state.items.forEach((item, index) => {
        const node = itemRefs.current[index];
        if (!node) return;
        const z = 3 * sc + item.z.value + item.hover.value * 24 * sc;
        const matrix = chain(
          desk,
          move(item.x.value + item.mx.value, item.y.value + item.my.value, z),
          turnY(item.ry.value),
          turnZ(item.r.value),
          stretch(item.s.value, item.s.value),
          move(-docW / 2, -docH / 2)
        );
        let layer = 10 + index;
        if (item.layer === 'inside' && state.phase === 'open' && state.hoveredItem === index) layer = 30;
        if (item.layer === 'out') layer = LAYERS.out + outs.indexOf(index);
        if (item.layer === 'drag') layer = LAYERS.drag;
        if (item.layer === 'focus') layer = LAYERS.focus;

        node.style.transform = toCss(matrix);
        node.style.zIndex = String(layer);
        node.style.opacity = item.alpha.value < 0.995 ? Math.max(0, item.alpha.value).toFixed(3) : '';
      });
    };

    const frame = (now: number) => {
      state.raf = 0;
      const s = settingsRef.current;
      const { g: geometry } = s;
      ensureItems(s.count);
      const time = now / 1000;
      const dt = state.last ? Math.min(0.05, (now - state.last) / 1000) : 1 / 60;
      state.last = now;

      const zeta = reduce ? 1 : 1 - 0.72 * s.bounce;
      const frontOmega = TAU * 2 * s.speed;
      const itemOmega = TAU * 2.1 * s.speed;
      const soft = TAU * 1.6 * s.speed;
      const phase = phaseOf(s, time);
      if (phase !== state.phase) {
        state.previous = state.phase;
        state.phase = phase;
        state.changedAt = now;
      }
      const elapsed = (now - state.changedAt) / 1000;
      let busy = time < state.receiveUntil;

      const ranks: number[] = [];
      state.items.forEach((item, index) => {
        if (item.place === 'inside') ranks.push(index);
      });
      const inside = ranks.length;
      ranks.forEach((index, rank) => {
        state.items[index].rank = rank;
      });
      if (state.focus >= 0 && phase !== 'open' && state.items[state.focus]?.place === 'inside') {
        state.focus = -1;
      }

      const introState = state.intro;
      if (!state.ready) introState.opening = s.open;
      if (introState.phase === 'run' && !introState.opening && (s.open || state.drag?.active)) {
        introState.phase = 'done';
      }
      const introTime = introState.phase === 'run' ? time - introState.start : 0;
      const staged = introState.phase !== 'done' && !introState.opening;
      const closeAt = (0.14 + inside * 0.065 + 0.25) / s.speed;
      const holding = staged && introTime < closeAt;
      const dropAt = (rank: number) => (0.12 + (inside - 1 - rank) * 0.065) / s.speed;
      const introPose = (item: ItemAnimState, slot: ReturnType<typeof place>) => ({
        ...slot,
        y: slot.y - geometry.h * 0.45,
        r: slot.r + (item.rank % 2 ? 7 : -6),
      });

      if (introState.phase === 'run') {
        busy = true;
        if (introTime > (introState.opening ? 1.2 : closeAt + 0.9) / s.speed) introState.phase = 'done';
      }
      const appear =
        introState.phase === 'wait'
          ? 0
          : introState.phase === 'run'
            ? clamp(introTime / (0.28 / s.speed), 0, 1)
            : 1;
      state.appear = 1 - (1 - appear) ** 3;

      const closing = state.previous === 'open' && phase !== 'open';
      const frontDelay = closing && !reduce ? (0.05 + 0.03 * inside) / s.speed : 0;
      const frontPhase = elapsed < frontDelay ? state.previous : phase;
      const frontTarget = holding ? -36 : FLAP_ANGLES[frontPhase];

      if (!state.ready) {
        state.ready = true;
        const openingIntro = introState.phase !== 'done' && introState.opening;
        if (openingIntro) {
          state.phase = 'rest';
          state.previous = 'rest';
        }
        snap(state.front, openingIntro ? 0 : frontTarget);
        state.items.forEach((item) => {
          const slot = place(item.rank, inside, openingIntro ? 'rest' : phase, s);
          const target = staged ? introPose(item, slot) : slot;
          snap(item.x, target.x);
          snap(item.y, target.y);
          snap(item.z, target.z);
          snap(item.r, target.r);
          snap(item.ry, target.ry);
          snap(item.s, target.s);
          snap(item.alpha, staged ? 0 : 1);
          snap(item.hover, 0);
          item.fresh = false;
        });
      }

      if (introState.phase === 'wait') {
        write();
        state.last = 0;
        return;
      }

      busy = integrate(state.front, frontTarget, frontOmega, zeta, dt) || busy;
      const restitution = 0.2 + 0.35 * s.bounce;
      if (state.front.value > 0) {
        state.front.value = -state.front.value;
        state.front.velocity = -state.front.velocity * restitution;
      }
      if (elapsed < frontDelay) busy = true;

      const engaged = state.hovered && !reduce;
      busy = integrate(state.rx, engaged ? -state.pointerY * 6 * s.tilt : 0, soft, 1, dt) || busy;
      busy = integrate(state.ry, engaged ? state.pointerX * 8 * s.tilt : 0, soft, 1, dt) || busy;
      busy = integrate(state.lift, state.hovered && phase !== 'open' ? 1 : 0, soft, 1, dt) || busy;
      busy = integrate(state.squash, state.pressed ? 0.975 : 1, TAU * 3.2, 0.6, dt) || busy;

      const opening = phase === 'open' && state.previous !== 'open';
      const drag = state.drag?.active ? state.drag : null;
      const hover = state.hoveredItem;
      const hovering = !drag && hover >= 0 && state.items[hover] ? state.items[hover] : null;
      const lead = hovering && hovering.place === 'inside' && phase === 'open' ? place(hovering.rank, inside, 'open', s) : null;
      const focusScale = clamp(((geometry.tabH + geometry.h) * 1.15) / geometry.docH, 1.2, 2.0);
      const focusY = geometry.tabH + geometry.h * 0.36;

      state.items.forEach((item, index) => {
        if (item.fresh) {
          const start = place(item.rank, inside, 'rest', s);
          snap(item.x, start.x);
          snap(item.y, start.y);
          snap(item.r, start.r);
          item.fresh = false;
        }
        let target: ReturnType<typeof place>;
        let omega = itemOmega;
        let damping = zeta;
        let lift = 0;
        let fade = 1;
        let magnet = false;

        if (state.focus === index) {
          target = { x: geometry.w / 2, y: focusY, z: 0, r: 0, ry: 0, s: focusScale };
          lift = 2.2;
          item.layer = 'focus';
        } else if (drag && drag.index === index) {
          const [vx] = velocityOf(drag.samples);
          target = {
            x: state.deskX + drag.grabX,
            y: state.deskY + drag.grabY,
            z: 0,
            r: clamp(vx * 0.012, -14, 14),
            ry: 0,
            s: drag.scale * 1.05,
          };
          omega = TAU * 5;
          damping = 0.78;
          lift = 1.4;
          if (!item.elevated && !inPocket(item)) item.elevated = true;
          item.layer = item.elevated ? 'drag' : 'inside';
        } else if (item.place === 'out') {
          target = { x: item.outX, y: item.outY, z: 0, r: item.outR, ry: 0, s: item.outS };
          lift = hover === index ? 1 : 0.15;
          magnet = hover === index;
          item.layer = 'out';
        } else {
          const delay = reduce
            ? 0
            : opening
              ? (0.04 + item.rank * 0.04) / s.speed
              : (item.rank * 0.025) / s.speed;
          const active = elapsed >= delay ? phase : state.previous;
          target = place(item.rank, inside, active, s);
          if (elapsed < delay) busy = true;

          if (staged && introTime < dropAt(item.rank)) {
            target = introPose(item, target);
            fade = 0;
            item.layer = 'inside';
          } else if (item.insertUntil > time) {
            busy = true;
            target = {
              ...target,
              y: Math.min(target.y, geometry.frontTop - geometry.docH * 0.5 * target.s - 8 * geometry.scale),
            };
            item.layer = 'drag';
            lift = 0.6;
          } else {
            item.insertUntil = 0;
            item.elevated = false;
            item.layer = 'inside';
            if (lead && active === 'open') {
              if (hover === index) {
                target = { ...target, y: target.y - 6 * geometry.scale, r: target.r * 0.2, s: target.s * 1.06 };
                lift = 1;
                magnet = true;
              } else {
                const distance = target.x - lead.x;
                target = {
                  ...target,
                  x: target.x + Math.sign(distance) * 10 * geometry.scale * Math.max(0, 1 - Math.abs(distance) / (geometry.w * 1.1)),
                };
                lift = 0.2;
              }
            } else if (active === 'open') {
              lift = 0.2;
            }
          }
        }

        busy = integrate(item.x, target.x, omega, damping, dt) || busy;
        busy = integrate(item.y, target.y, omega, damping, dt) || busy;

        if (item.layer === 'inside') {
          const tiltRad = (item.r.value * Math.PI) / 180;
          const reach =
            ((geometry.docW * Math.abs(Math.sin(tiltRad)) + geometry.docH * Math.abs(Math.cos(tiltRad))) * item.s.value) / 2;
          const floor = geometry.tabH + geometry.h - 2 - reach;
          if (item.y.value > floor) {
            item.y.value = floor;
            if (item.y.velocity > 0) item.y.velocity *= -0.25;
          }
        }

        busy = integrate(item.z, target.z, itemOmega, zeta, dt) || busy;
        busy = integrate(item.r, target.r, omega, damping, dt) || busy;
        busy = integrate(item.ry, target.ry, itemOmega, zeta, dt) || busy;
        busy = integrate(item.s, target.s, itemOmega, zeta, dt) || busy;
        busy = integrate(item.hover, lift, itemOmega, zeta, dt) || busy;
        busy = integrate(item.alpha, fade, TAU * 3 * s.speed, 1, dt) || busy;
        busy = integrate(item.mx, magnet ? item.localX * 6 * geometry.scale : 0, soft, 0.85, dt) || busy;
        busy = integrate(item.my, magnet ? item.localY * 6 * geometry.scale : 0, soft, 0.85, dt) || busy;
      });

      write();
      if (busy || drag) state.raf = requestAnimationFrame(frame);
      else state.last = 0;
    };

    const wake = () => {
      if (!state.raf) state.raf = requestAnimationFrame(frame);
    };

    const beginIntro = () => {
      if (state.intro.phase !== 'wait') return;
      state.intro.phase = 'run';
      state.intro.start = performance.now() / 1000;
      wake();
    };

    const updateReceiving = () => {
      const drag = state.drag;
      const item = drag ? state.items[drag.index] : null;
      state.receiving = Boolean(
        drag?.active && item && (item.place === 'out' || item.elevated) && overFolder(state.deskX, state.deskY)
      );
    };

    const startDrag = (drag: NonNullable<typeof state.drag>) => {
      const item = state.items[drag.index];
      if (!item) return;
      drag.active = true;
      drag.grabX = item.x.value - drag.downX;
      drag.grabY = item.y.value - drag.downY;
      drag.scale = item.place === 'out' ? item.outS : item.s.value;
      drag.clip = clipBounds();
      state.suppressClick = true;
      if (state.focus === drag.index) state.focus = -1;
      item.elevated = item.place === 'out' || !inPocket(item);
      root.dataset.dragging = '';
    };

    const drop = (drag: NonNullable<typeof state.drag>, cancelled: boolean) => {
      const s = settingsRef.current;
      const item = state.items[drag.index];
      state.receiving = false;
      delete root.dataset.dragging;
      if (!item) return;
      const time = performance.now() / 1000;
      const [vx, vy] = cancelled ? [0, 0] : velocityOf(drag.samples);
      if (overFolder(state.deskX, state.deskY)) {
        const entering = item.place === 'out' || item.elevated;
        item.place = 'inside';
        if (entering && !reduce) {
          item.insertUntil = time + 0.24 / s.speed;
          item.insertFrom = 'top';
          state.receiveUntil = item.insertUntil + 0.14 / s.speed;
        }
        item.elevated = false;
        syncOutside();
        s.onItemDrop?.(s.entries[drag.index], drag.index, true);
        return;
      }
      const clip = drag.clip ?? clipBounds();
      const halfW = (s.g.docW * drag.scale) / 2;
      const halfH = (s.g.docH * drag.scale) / 2;
      const x = state.deskX + drag.grabX + clamp(vx, -2400, 2400) * 0.09;
      const y = state.deskY + drag.grabY + clamp(vy, -2400, 2400) * 0.09;
      item.place = 'out';
      item.elevated = true;
      const margin = 8 * s.g.scale;
      const reachX = halfW * 1.08 + margin;
      const reachY = halfH * 1.08 + margin;
      item.outX = clamp(x, clip.left + reachX, Math.max(clip.left + reachX, clip.right - reachX));
      item.outY = clamp(y, clip.top + reachY, Math.max(clip.top + reachY, clip.bottom - reachY));
      item.outR = clamp(item.r.value * 0.5 + clamp(vx, -2400, 2400) * 0.003 + DROP_TURN[drag.index % 6] * 0.6, -12, 12);
      item.outS = drag.scale;
      state.dropCount += 1;
      item.outOrder = state.dropCount;
      syncOutside();
      s.onItemDrop?.(s.entries[drag.index], drag.index, false);
    };

    const onMove = (event: PointerEvent) => {
      const drag = state.drag;
      if (drag && event.pointerId === drag.id) {
        const [x, y] = toDesk(event.clientX, event.clientY);
        state.deskX = x;
        state.deskY = y;
        const now = performance.now();
        drag.samples.push([now, x, y]);
        while (drag.samples.length > 2 && now - drag.samples[0][0] > 100) drag.samples.shift();
        if (!drag.active) {
          const threshold = event.pointerType === 'touch' ? 8 : 4;
          if (Math.hypot(event.clientX - drag.clientX, event.clientY - drag.clientY) > threshold) {
            startDrag(drag);
          }
        }
        if (drag.active) updateReceiving();
        wake();
      }
      if (event.pointerType === 'touch') return;
      const box = root.getBoundingClientRect();
      state.pointerX = clamp(((event.clientX - box.left) / box.width) * 2 - 1, -1.5, 1.5);
      state.pointerY = clamp(((event.clientY - box.top) / box.height) * 2 - 1, -1.5, 1.5);
      const target = (event.target as HTMLElement | null)?.closest?.('[data-folder-item]');
      const index = target && root.contains(target) ? Number(target.getAttribute('data-folder-item')) : -1;
      state.hoveredItem = index;
      if (target && index >= 0 && !state.drag?.active) {
        const rect = target.getBoundingClientRect();
        const item = state.items[index];
        if (item) {
          item.localX = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
          item.localY = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
        }
      }
      if (!state.hovered) {
        state.hovered = true;
        if (settingsRef.current.openOn === 'hover') setOpenRef.current(true);
      }
      wake();
    };

    const onLeave = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || state.drag?.active) return;
      state.hovered = false;
      state.pressed = false;
      state.hoveredItem = -1;
      if (settingsRef.current.openOn === 'hover') setOpenRef.current(false);
      wake();
    };

    const onDown = (event: PointerEvent) => {
      if (event.button > 0) return;
      if ((event.target as HTMLElement | null)?.closest?.('[data-folder-overlay-action]')) return;
      state.suppressClick = false;
      const target = (event.target as HTMLElement | null)?.closest?.('[data-folder-item]') as HTMLElement | null;
      if (target && root.contains(target) && settingsRef.current.draggable) {
        const [x, y] = toDesk(event.clientX, event.clientY);
        state.deskX = x;
        state.deskY = y;
        state.drag = {
          index: Number(target.getAttribute('data-folder-item')),
          id: event.pointerId,
          clientX: event.clientX,
          clientY: event.clientY,
          downX: x,
          downY: y,
          grabX: 0,
          grabY: 0,
          scale: 1,
          clip: null,
          active: false,
          samples: [[performance.now(), x, y]],
        };
        try {
          target.setPointerCapture(event.pointerId);
        } catch {
          // Ignore environments without pointer capture
        }
      } else {
        state.pressed = true;
      }
      wake();
    };

    const onUp = (event: PointerEvent) => {
      state.pressed = false;
      const drag = state.drag;
      if (drag && event.pointerId === drag.id) {
        state.drag = null;
        if (drag.active) drop(drag, event.type === 'pointercancel');
      }
      wake();
    };

    const onDocumentDown = (event: PointerEvent) => {
      if (root.contains(event.target as Node)) return;
      const s = settingsRef.current;
      if (state.focus >= 0) {
        state.focus = -1;
        wake();
      }
      if (s.open && s.closeOnOutsideClick) setOpenRef.current(false);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (state.focus >= 0) {
        state.focus = -1;
        wake();
        return;
      }
      const s = settingsRef.current;
      if (s.open && s.closeOnOutsideClick) setOpenRef.current(false);
    };

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    document.addEventListener('pointerdown', onDocumentDown);
    document.addEventListener('keydown', onKey);

    let observer: IntersectionObserver | null = null;
    if (settingsRef.current.intro && !reduce) {
      state.intro.phase = 'wait';
      root.style.opacity = '0';
      if (typeof IntersectionObserver === 'undefined') {
        beginIntro();
      } else {
        observer = new IntersectionObserver(
          (entriesList) => {
            if (!entriesList.some((entry) => entry.isIntersecting)) return;
            observer?.disconnect();
            beginIntro();
          },
          { threshold: 0.15 }
        );
        observer.observe(root);
      }
    }

    engineRef.current = {
      wake,
      consumeClick: () => {
        if (!state.suppressClick) return false;
        state.suppressClick = false;
        return true;
      },
      interactive: (index: number) => settingsRef.current.open || state.items[index]?.place === 'out' || state.focus === index,
      select: (index: number) => {
        const s = settingsRef.current;
        if (s.zoomOnClick) state.focus = state.focus === index ? -1 : index;
        s.onItemClick?.(s.entries[index], index);
        wake();
      },
      blur: () => {
        if (state.focus < 0) return false;
        state.focus = -1;
        wake();
        return true;
      },
    };
    wake();

    return () => {
      cancelAnimationFrame(state.raf);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      document.removeEventListener('pointerdown', onDocumentDown);
      document.removeEventListener('keydown', onKey);
      observer?.disconnect();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.wake();
  });

  const toggle = () => {
    if (engineRef.current?.blur()) return;
    if (openOn === 'hover') return;
    setOpen(!isOpen);
  };

  const onItemActivate = (event: React.MouseEvent, index: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.consumeClick()) {
      event.stopPropagation();
      return;
    }
    if (!engine.interactive(index)) {
      // If folder is closed, clicking a peeking stamp opens the folder or triggers click cleanly
      return;
    }
    event.stopPropagation();
    engine.select(index);
  };

  const vars: CSSProperties & Record<string, string | number> = {
    '--folder-rgb': rgb.join(', '),
    '--folder-base': rgbString(rgb),
    '--folder-front-top': rgbString(mixRgb(rgb, [255, 255, 255], 0.14)),
    '--folder-front-bottom': rgbString(mixRgb(rgb, [0, 0, 0], 0.06)),
    '--folder-inside-top': insideTop,
    '--folder-inside-bottom': insideBottom,
    '--folder-tab-ink': luma(backTone) > 0.6 ? 'rgba(0, 0, 0, 0.72)' : 'rgba(255, 255, 255, 0.92)',
    '--folder-paper': rgbString(paper),
    '--folder-w': `${g.w}px`,
    '--folder-h': `${g.h}px`,
    '--folder-tab-h': `${g.tabH}px`,
    '--folder-front-y': `${g.frontTop}px`,
    '--folder-front-h': `${g.frontH}px`,
    '--folder-r': `${g.r}px`,
    '--folder-front-radius': `${g.r}px`,
    '--folder-doc-w': `${g.docW}px`,
    '--folder-doc-h': `${g.docH}px`,
    '--folder-frost': `${(1.5 + clamp(frost, 0, 1) * 10) * scale}px`,
    '--folder-depth': `${settingsRef.current.depth}px`,
    '--folder-scale': scale,
    ...style,
  };

  const shape = backPath(g);

  return (
    <div
      ref={rootRef}
      className={`folder-root${className ? ` ${className}` : ''}`}
      data-mode="flap"
      data-variant={variant}
      data-theme={theme === 'light' ? 'light' : 'dark'}
      data-open={isOpen ? '' : undefined}
      data-draggable={draggable ? '' : undefined}
      style={vars}
    >
      <div className="folder-stage">
        <div ref={backRef} className="folder-layer folder-back" aria-hidden="true">
          <div className="folder-back-fill" style={{ clipPath: `path('${shape}')` }} />
          <svg className="folder-back-rim" width={g.w} height={total} viewBox={`0 0 ${g.w} ${total}`}>
            <path className="folder-focus" d={shape} />
          </svg>
          {label && !hideTab && (
            <span className="folder-tab-text" style={{ left: g.tabX, width: g.tabW }}>
              {label}
            </span>
          )}
        </div>

        {entries.map((item, index) => {
          const interactive = isOpen || outside.includes(index);
          const itemKey =
            isValidElement(item) && item.key != null
              ? item.key
              : item && typeof item === 'object' && 'id' in item && item.id
                ? String(item.id)
                : index;
          return (
            <div
              key={itemKey}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              className="folder-layer folder-item"
              data-folder-item={index}
              role={interactive ? 'button' : undefined}
              tabIndex={interactive ? 0 : undefined}
              onClick={(event) => onItemActivate(event, index)}
              onKeyDown={(event) => {
                if (!interactive || (event.key !== 'Enter' && event.key !== ' ')) return;
                event.preventDefault();
                event.stopPropagation();
                engineRef.current?.select(index);
              }}
            >
              {renderItem(item)}
            </div>
          );
        })}

        <div ref={frontRef} className="folder-layer folder-front" data-face="outer">
          <button
            type="button"
            className="folder-face folder-face-outer"
            aria-expanded={isOpen}
            aria-label={ariaLabel || (label ? `${label} folder` : 'Toggle stamp folder')}
            onClick={toggle}
          />
          {frontOverlay && <div className="folder-front-overlay">{frontOverlay}</div>}
        </div>
      </div>

      {label && !hideTab && (
        <span ref={measureRef} className="folder-tab-text folder-measure" aria-hidden="true">
          {label}
        </span>
      )}
    </div>
  );
}

export default Folder;
