import {
  ArrowLeft,
  Bell,
  Bookmark,
  ChatRoundLine,
  Check,
  CloseCircle,
  Code,
  Compass,
  Copy,
  Download,
  FilterSearch,
  Globe,
  Heart,
  Home2,
  ImageSparkle,
  Map,
  MapPoint,
  Pin,
  Plus,
  Refresh,
  Search,
  Send,
  Share,
  Star,
  TicketStar,
  Trash,
  User,
  WandSparkle,
  type IconWeight,
} from 'reicon-react';

export type ReiconName =
  | 'home'
  | 'frame'
  | 'chat'
  | 'user'
  | 'plus'
  | 'search'
  | 'bell'
  | 'arrow-left'
  | 'heart'
  | 'star'
  | 'globe'
  | 'map'
  | 'map-point'
  | 'compass'
  | 'wand'
  | 'image-sparkle'
  | 'code'
  | 'copy'
  | 'download'
  | 'trash'
  | 'share'
  | 'bookmark'
  | 'check'
  | 'close'
  | 'refresh'
  | 'send'
  | 'filter'
  | 'pin';

const ICON_MAP = {
  home: Home2,
  frame: TicketStar,
  chat: ChatRoundLine,
  user: User,
  plus: Plus,
  search: Search,
  bell: Bell,
  'arrow-left': ArrowLeft,
  heart: Heart,
  star: Star,
  globe: Globe,
  map: Map,
  'map-point': MapPoint,
  compass: Compass,
  wand: WandSparkle,
  'image-sparkle': ImageSparkle,
  code: Code,
  copy: Copy,
  download: Download,
  trash: Trash,
  share: Share,
  bookmark: Bookmark,
  check: Check,
  close: CloseCircle,
  refresh: Refresh,
  send: Send,
  filter: FilterSearch,
  pin: Pin,
};

interface ReiconProps {
  name: ReiconName;
  size?: number;
  weight?: IconWeight;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export function Reicon({
  name,
  size = 20,
  weight = 'Outline',
  color = 'currentColor',
  strokeWidth = 1.75,
  className = '',
}: ReiconProps) {
  const Component = ICON_MAP[name];
  return (
    <Component
      size={size}
      weight={weight}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
    />
  );
}
