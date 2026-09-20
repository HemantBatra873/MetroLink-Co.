import React from 'react';
import { Button } from '../components/button.js';
import { Badge } from '../components/ui/badge.js';
import {
  LayoutDashboard,
  Palette,
  Layers,
  Component,
  FormInput,
  Database,
  Sliders,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export interface AppSidebarNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

export interface AppSidebarProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  collapsed?: boolean;
  onCollapseToggle?: () => void;
  navItems?: AppSidebarNavItem[];
  sidebarLabel?: string;
  footerNote?: { title: string; subtitle: string };
}

const defaultNavItems: AppSidebarNavItem[] = [
    { id: 'dashboard', label: 'Enterprise Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'tokens', label: 'Design Tokens Catalog', icon: <Palette className="h-4 w-4" />, badge: '4 Themes' },
    { id: 'layout-components', label: 'Global Shared Layout', icon: <Layers className="h-4 w-4" /> },
    { id: 'form-controls', label: 'Forms & Inputs', icon: <FormInput className="h-4 w-4" />, badge: '16' },
    { id: 'data-display', label: 'Data & Feedback', icon: <Database className="h-4 w-4" />, badge: '14' },
    { id: 'overlays', label: 'Overlays & Dialogs', icon: <Sliders className="h-4 w-4" />, badge: '10' },
    { id: 'navigation', label: 'Navigation & Menus', icon: <Component className="h-4 w-4" />, badge: '12' },
    { id: 'messaging', label: 'Chat & Messaging', icon: <MessageSquare className="h-4 w-4" />, badge: '3' },
    { id: 'catalog', label: 'All 60+ Primitives', icon: <Sparkles className="h-4 w-4" /> },
];

export function AppSidebar({
  activeTab = 'dashboard',
  onTabChange,
  collapsed = false,
  onCollapseToggle,
  navItems = defaultNavItems,
  sidebarLabel = 'Navigation',
  footerNote = { title: 'Tokens Active', subtitle: 'WCAG 2.1 Compliant' },
}: AppSidebarProps) {
  return (
    <aside
      className={`ent-sidebar border-r border-border bg-card/60 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex h-12 items-center justify-between px-3 border-b border-border">
        {!collapsed && (
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {sidebarLabel}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground ml-auto"
          onClick={onCollapseToggle}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && (
                <span className="flex-1 text-left truncate">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <Badge
                  variant={isActive ? 'outline' : 'secondary'}
                  className={`text-[10px] px-1.5 py-0 ${
                    isActive ? 'border-primary-foreground/40 text-primary-foreground' : ''
                  }`}
                >
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      {!collapsed && (
        <div className="p-3 border-t border-border bg-muted/20">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border">
            <ShieldAlert className="h-4 w-4 text-primary shrink-0" />
            <div className="text-[11px] leading-tight">
              <p className="font-semibold text-foreground">{footerNote.title}</p>
              <p className="text-muted-foreground">{footerNote.subtitle}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
