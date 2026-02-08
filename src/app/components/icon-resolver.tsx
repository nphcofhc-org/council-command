/**
 * Resolves a Lucide icon name string (from data) to the actual icon component.
 * This lets Google Sheets store icon names as text ("Calendar", "FileText", etc.)
 * and the UI renders the correct icon.
 */

import {
  Calendar,
  FileText,
  FolderOpen,
  Users,
  MessageCircle,
  Clock,
  DollarSign,
  Target,
  ClipboardCheck,
  Shield,
  Lock,
  ExternalLink,
  Building2,
  BookOpen,
  User,
  Mail,
  MapPin,
  AlertTriangle,
  GraduationCap,
  TrendingUp,
  Home,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Calendar,
  FileText,
  FolderOpen,
  Users,
  MessageCircle,
  Clock,
  DollarSign,
  Target,
  ClipboardCheck,
  Shield,
  Lock,
  ExternalLink,
  Building2,
  BookOpen,
  User,
  Mail,
  MapPin,
  AlertTriangle,
  GraduationCap,
  TrendingUp,
  Home,
};

interface IconProps {
  name: string;
  className?: string;
}

export function DynamicIcon({ name, className = "size-4" }: IconProps) {
  const IconComponent = iconMap[name];
  if (!IconComponent) {
    // Fallback to FileText for unknown icon names
    return <FileText className={className} />;
  }
  return <IconComponent className={className} />;
}

/**
 * Get the raw Lucide icon component by name (for cases where you need the component ref).
 */
export function getIconComponent(name: string): LucideIcon {
  return iconMap[name] || FileText;
}
