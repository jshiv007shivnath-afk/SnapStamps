import {
  ArrowLeft,
  Award,
  BagShopping,
  Bell,
  Bookmark,
  ChatRoundLine,
  Check,
  CloseCircle,
  Compass,
  Copy,
  Crown,
  CupTrophy,
  Diamonds,
  Download,
  FilterSearch,
  Flame,
  Folder,
  FolderCheck,
  FolderOpen,
  FolderPlus,
  Football,
  Gift,
  Globe,
  Heart,
  Home2,
  ImageSparkle,
  Map,
  MapPoint,
  Notification,
  Pin,
  Plus,
  Refresh,
  Search,
  Send,
  Setting2,
  Share,
  Sparkles,
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
  | 'store'
  | 'diamond'
  | 'trophy'
  | 'football'
  | 'crown'
  | 'plus'
  | 'search'
  | 'bell'
  | 'notification'
  | 'settings'
  | 'arrow-left'
  | 'heart'
  | 'star'
  | 'globe'
  | 'map'
  | 'map-point'
  | 'compass'
  | 'wand'
  | 'image-sparkle'
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
  | 'pin'
  | 'folder'
  | 'folder-plus'
  | 'folder-open'
  | 'folder-check'
  | 'sparkles'
  | 'award'
  | 'gift'
  | 'flame';

const ICON_MAP = {
  home: Home2,
  frame: TicketStar,
  chat: ChatRoundLine,
  user: User,
  store: BagShopping,
  diamond: Diamonds,
  trophy: CupTrophy,
  football: Football,
  crown: Crown,
  plus: Plus,
  search: Search,
  bell: Bell,
  notification: Notification,
  settings: Setting2,
  'arrow-left': ArrowLeft,
  heart: Heart,
  star: Star,
  globe: Globe,
  map: Map,
  'map-point': MapPoint,
  compass: Compass,
  wand: WandSparkle,
  'image-sparkle': ImageSparkle,
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
  folder: Folder,
  'folder-plus': FolderPlus,
  'folder-open': FolderOpen,
  'folder-check': FolderCheck,
  sparkles: Sparkles,
  award: Award,
  gift: Gift,
  flame: Flame,
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
