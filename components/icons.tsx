import * as React from 'react';
import {
  Activity,
  AlertTriangle,
  Archive,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Award,
  Bot,
  BrainCircuit,
  Briefcase,
  Calendar,
  CalendarHeart,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Code,
  Copy,
  Cpu,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FilePenLine,
  FileText,
  Filter,
  GitCommit,
  Globe,
  GraduationCap,
  Heart,
  HelpCircle,
  History,
  Info,
  Layers,
  LayoutDashboard,
  Link as LinkIcon,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Maximize2,
  Menu,
  Minimize2,
  Monitor,
  Moon,
  Palette,
  PanelLeft,
  Phone,
  PlayCircle,
  Plus,
  Receipt,
  RefreshCw,
  Save,
  Search,
  Send,
  Server,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Trash2,
  Upload,
  UploadCloud,
  User,
  Users,
  X,
  type LucideProps
} from 'lucide-react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
}

const LUCIDE_ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  // Navigation & Core
  dashboard: LayoutDashboard,
  'layout-dashboard': LayoutDashboard,
  upload: Upload,
  'upload-cloud': UploadCloud,
  settings: Settings,
  heart: Heart,
  star: Star,
  close: X,
  x: X,
  send: Send,
  menu: Menu,
  check: Check,
  'check-circle': CheckCircle2,
  bot: Bot,
  'play-circle': PlayCircle,
  link: LinkIcon,
  export: ExternalLink,
  'external-link': ExternalLink,
  download: Download,
  share: Share2,
  'share-2': Share2,
  search: Search,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
  'panel-left': PanelLeft,
  info: Info,
  'alert-triangle': AlertTriangle,
  'alert-circle': AlertTriangle,
  sun: Sun,
  moon: Moon,
  desktop: Monitor,
  monitor: Monitor,
  refresh: RefreshCw,
  'refresh-cw': RefreshCw,
  'log-out': LogOut,
  word: FileText,
  'file-text': FileText,
  compare: ArrowLeftRight,
  copy: Copy,
  mail: Mail,
  sparkles: Sparkles,
  filter: Filter,
  plus: Plus,
  maximize: Maximize2,
  minimize: Minimize2,
  'brain-circuit': BrainCircuit,
  users: Users,
  user: User,
  history: History,
  save: Save,
  archive: Archive,
  activity: Activity,
  cpu: Cpu,
  'git-commit': GitCommit,
  layers: Layers,
  database: Database,
  code: Code,
  server: Server,
  'arrow-right': ArrowRight,
  'arrow-left': ArrowLeft,
  calendar: Calendar,
  'calendar-heart': CalendarHeart,
  briefcase: Briefcase,
  'file-pen': FilePenLine,
  receipt: Receipt,
  clock: Clock,
  award: Award,
  eye: Eye,
  globe: Globe,
  lock: Lock,
  'map-pin': MapPin,
  palette: Palette,
  phone: Phone,
  trash: Trash2,
  'graduation-cap': GraduationCap,
  'shield-check': ShieldCheck,
  'file-check': FileCheck,
  help: HelpCircle,
};

export const Icon: React.FC<IconProps> = ({ name, className = '', ...props }) => {
  // Brand & Country Flags (non-Lucide vector graphics)
  switch (name) {
    case 'fr-flag':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 3 2" className={className} {...props}>
          <path fill="#002395" d="M0 0h1v2H0z" />
          <path fill="#fff" d="M1 0h1v2H1z" />
          <path fill="#ED2939" d="M2 0h1v2H2z" />
        </svg>
      );
    case 'gb-flag':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 60 30" className={className} {...props}>
          <clipPath id="lucide-gb-flag"><path d="M0 0v30h60V0z" /></clipPath>
          <path d="M0 0v30h60V0z" fill="#012169" />
          <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" />
          <path d="M0 0l60 30m0-30L0 30" clipPath="url(#lucide-gb-flag)" stroke="#C8102E" strokeWidth="4" />
          <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
          <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
        </svg>
      );
    case 'ma-flag':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 800 500" className={className} {...props}>
          <path fill="#c1272d" d="M0 0h800v500H0z" />
          <path fill="none" stroke="#006233" strokeWidth="23.3" d="M400 153.1 350.5 311l155-97.5H245l155 97.5z" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM12.04 21.08c-1.52 0-3-.38-4.32-1.11L4.45 21l1.13-3.3c-.8-1.4-1.28-3.01-1.28-4.67 0-4.9 3.98-8.88 8.88-8.88s8.88 3.98 8.88 8.88-3.98 8.88-8.88 8.88zm4.83-6.14c-.27-.13-1.62-.8-1.87-.89s-.43-.13-.61.13c-.18.27-.71.89-.87 1.08-.16.18-.32.21-.59.08s-1.13-.42-2.15-1.33c-.8-.71-1.34-1.59-1.5-1.87s-.16-.43.06-.56c.21-.15.45-.4.61-.61s.21-.27.32-.45c.1-.18.05-.34-.02-.47s-.61-1.45-.83-2c-.22-.54-.45-.47-.61-.47h-.54c-.18 0-.48.06-.73.32s-.98.96-.98 2.34c0 1.38 1 2.71 1.13 2.89s1.98 3.01 4.8 4.25c.67.29 1.2.47 1.6.6c.68.21 1.3.18 1.78.11.52-.08 1.62-.66 1.85-1.3c.22-.63.22-1.18.16-1.3s-.18-.21-.45-.34z"/>
        </svg>
      );
    case 'google':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
          <path d="M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" />
          <path d="M12 18v-6" />
          <path d="M15 15H9" />
        </svg>
      );
    case 'spinner':
      return <Loader2 className={`animate-spin ${className}`} {...(props as any)} />;
    default:
      break;
  }

  // Official Lucide Icon
  const LucideComp = LUCIDE_ICON_MAP[name];
  if (LucideComp) {
    return <LucideComp className={className} {...(props as any)} />;
  }

  return null;
};
