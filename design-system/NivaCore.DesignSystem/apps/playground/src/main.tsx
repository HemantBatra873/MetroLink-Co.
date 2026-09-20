import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import '@enterprise/design-tokens/css';
import '@enterprise/component-library/styles.css';
import {
  TooltipProvider,
  Button, Badge,
  Sparkles, LayoutDashboard, Layers, FormInput,
  Database, Sliders, MessageSquare, ShieldAlert, Search,
  Plus, Check, Bell,
} from '@enterprise/component-library';
import { Palette, Box } from 'lucide-react';
import './playground.css';

import {
  ButtonView,
  FormControlsView,
  DataDisplayView,
  OverlaysView,
  NavigationView,
  MessagingView,
  LayoutView,
  TokensView,
} from './views/index.js';

// ─────────────────────────────────────────────────────────────────
// Component Registry
// ─────────────────────────────────────────────────────────────────
interface CompEntry {
  id: string;
  name: string;
  group: string;
  desc: string;
  path?: string;
}

const REGISTRY: CompEntry[] = [
  // Form Controls
  { id: 'button',      name: 'Button',      group: 'Form Controls', desc: 'Policy buttons: primary, secondary, tertiary, danger, ghost', path: 'components/button.tsx' },
  { id: 'input',       name: 'Input',       group: 'Form Controls', desc: 'Single-line text input with focus rings and error states', path: 'ui/input.tsx' },
  { id: 'textarea',    name: 'Textarea',    group: 'Form Controls', desc: 'Multi-line expandable text area', path: 'ui/textarea.tsx' },
  { id: 'checkbox',    name: 'Checkbox',    group: 'Form Controls', desc: 'Accessible boolean selection control', path: 'ui/checkbox.tsx' },
  { id: 'radio-group', name: 'RadioGroup',  group: 'Form Controls', desc: 'Mutually exclusive option group', path: 'ui/radio-group.tsx' },
  { id: 'switch',      name: 'Switch',      group: 'Form Controls', desc: 'High-visibility boolean toggle switch', path: 'ui/switch.tsx' },
  { id: 'select',      name: 'Select',      group: 'Form Controls', desc: 'Custom floating option select picker', path: 'ui/select.tsx' },
  { id: 'native-select', name: 'NativeSelect', group: 'Form Controls', desc: 'High-performance native browser select', path: 'ui/native-select.tsx' },
  { id: 'slider',      name: 'Slider',      group: 'Form Controls', desc: 'Continuous and stepped range slider', path: 'ui/slider.tsx' },
  { id: 'toggle',      name: 'Toggle',      group: 'Form Controls', desc: 'Two-state button for formatting preferences', path: 'ui/toggle.tsx' },
  { id: 'toggle-group', name: 'ToggleGroup', group: 'Form Controls', desc: 'Grouped toggles with single or multiple select', path: 'ui/toggle-group.tsx' },
  { id: 'input-otp',   name: 'InputOTP',    group: 'Form Controls', desc: 'One-time passcode pin input slots', path: 'ui/input-otp.tsx' },
  { id: 'label',       name: 'Label',       group: 'Form Controls', desc: 'Accessible form control title', path: 'ui/label.tsx' },

  // Data Display
  { id: 'card',        name: 'Card',        group: 'Data Display',  desc: 'Structured surface with header, content, and footer', path: 'ui/card.tsx' },
  { id: 'badge',       name: 'Badge',       group: 'Data Display',  desc: 'Visual status indicator tags', path: 'ui/badge.tsx' },
  { id: 'alert',       name: 'Alert',       group: 'Data Display',  desc: 'Contextual notification banners', path: 'ui/alert.tsx' },
  { id: 'table',       name: 'Table',       group: 'Data Display',  desc: 'Tabular data grid with sticky headers', path: 'ui/table.tsx' },
  { id: 'progress',    name: 'Progress',    group: 'Data Display',  desc: 'Visual progress meter', path: 'ui/progress.tsx' },
  { id: 'spinner',     name: 'Spinner',     group: 'Data Display',  desc: 'Indeterminate loading indicator', path: 'ui/spinner.tsx' },
  { id: 'skeleton',    name: 'Skeleton',    group: 'Data Display',  desc: 'Content placeholder shimmer', path: 'ui/skeleton.tsx' },
  { id: 'avatar',      name: 'Avatar',      group: 'Data Display',  desc: 'User profile with image and fallback initials', path: 'ui/avatar.tsx' },
  { id: 'empty',       name: 'Empty',       group: 'Data Display',  desc: 'Standardized empty state container', path: 'ui/empty.tsx' },
  { id: 'kbd',         name: 'Kbd',         group: 'Data Display',  desc: 'Keyboard shortcut indicator badge', path: 'ui/kbd.tsx' },

  // Overlays & Dialogs
  { id: 'dialog',          name: 'Dialog',        group: 'Overlays & Dialogs', desc: 'Modal dialog overlay', path: 'ui/dialog.tsx' },
  { id: 'alert-dialog',    name: 'AlertDialog',   group: 'Overlays & Dialogs', desc: 'High-urgency confirmation dialog', path: 'ui/alert-dialog.tsx' },
  { id: 'sheet',           name: 'Sheet',         group: 'Overlays & Dialogs', desc: 'Slide-in side drawer panel', path: 'ui/sheet.tsx' },
  { id: 'popover',         name: 'Popover',       group: 'Overlays & Dialogs', desc: 'Rich floating popover content', path: 'ui/popover.tsx' },
  { id: 'tooltip',         name: 'Tooltip',       group: 'Overlays & Dialogs', desc: 'Lightweight context tooltip', path: 'ui/tooltip.tsx' },
  { id: 'hover-card',      name: 'HoverCard',     group: 'Overlays & Dialogs', desc: 'Preview card on pointer hover', path: 'ui/hover-card.tsx' },
  { id: 'dropdown-menu',   name: 'DropdownMenu',  group: 'Overlays & Dialogs', desc: 'Action menu popover', path: 'ui/dropdown-menu.tsx' },

  // Navigation & Layout
  { id: 'tabs',        name: 'Tabs',        group: 'Navigation',    desc: 'Categorized content panel switcher', path: 'ui/tabs.tsx' },
  { id: 'accordion',   name: 'Accordion',   group: 'Navigation',    desc: 'Collapsible disclosure panels', path: 'ui/accordion.tsx' },
  { id: 'breadcrumb',  name: 'Breadcrumb',  group: 'Navigation',    desc: 'Hierarchical navigation path', path: 'ui/breadcrumb.tsx' },
  { id: 'pagination',  name: 'Pagination',  group: 'Navigation',    desc: 'Multi-page navigation controls', path: 'ui/pagination.tsx' },
  { id: 'collapsible', name: 'Collapsible', group: 'Navigation',    desc: 'Simple show/hide disclosure', path: 'ui/collapsible.tsx' },
  { id: 'separator',   name: 'Separator',   group: 'Navigation',    desc: 'Horizontal and vertical divider lines', path: 'ui/separator.tsx' },
  { id: 'scroll-area', name: 'ScrollArea',  group: 'Navigation',    desc: 'Custom styled scrollable container', path: 'ui/scroll-area.tsx' },

  // Chat & Messaging
  { id: 'message',     name: 'Message',     group: 'Chat & Messaging', desc: 'Chat message container with alignment', path: 'ui/message.tsx' },
  { id: 'bubble',      name: 'Bubble',      group: 'Chat & Messaging', desc: 'Chat bubble with variant styling', path: 'ui/bubble.tsx' },
  { id: 'bubble-group', name: 'BubbleGroup', group: 'Chat & Messaging', desc: 'Stacked bubbles from same participant', path: 'ui/bubble.tsx' },

  // Global Layout
  { id: 'header',     name: 'Header',     group: 'Global Layout', desc: 'Global top navigation bar', path: 'layout/Header.tsx' },
  { id: 'footer',     name: 'Footer',     group: 'Global Layout', desc: 'Enterprise footer with links', path: 'layout/Footer.tsx' },
  { id: 'hero',       name: 'Hero',       group: 'Global Layout', desc: 'High-impact hero banner', path: 'layout/Hero.tsx' },
  { id: 'page-header', name: 'PageHeader', group: 'Global Layout', desc: 'Structured page title with breadcrumbs', path: 'layout/PageHeader.tsx' },

  // Design Tokens
  { id: 'tokens', name: 'Design Tokens', group: 'Foundations', desc: 'Semantic + primitive color, spacing, radii tokens', path: 'packages/design-tokens' },
];

const GROUPS = [
  { id: 'Form Controls',    icon: <FormInput className="h-3.5 w-3.5" />,     badge: '13' },
  { id: 'Data Display',     icon: <Database className="h-3.5 w-3.5" />,      badge: '10' },
  { id: 'Overlays & Dialogs', icon: <Sliders className="h-3.5 w-3.5" />,    badge: '7' },
  { id: 'Navigation',       icon: <Box className="h-3.5 w-3.5" />,           badge: '7' },
  { id: 'Chat & Messaging', icon: <MessageSquare className="h-3.5 w-3.5" />, badge: '3' },
  { id: 'Global Layout',    icon: <Layers className="h-3.5 w-3.5" />,        badge: '4' },
  { id: 'Foundations',      icon: <Palette className="h-3.5 w-3.5" />,       badge: '1' },
];

// ─────────────────────────────────────────────────────────────────
// View dispatcher — maps component ID → View component
// ─────────────────────────────────────────────────────────────────
function ViewContent({ id, activeTab }: { id: string; activeTab: string }) {
  // Form Controls
  if (id === 'button') return <ButtonView activeTab={activeTab} />;
  if (['input','textarea','checkbox','radio-group','switch','select','native-select','slider','toggle','toggle-group','input-otp','label'].includes(id))
    return <FormControlsView activeTab={activeTab} />;

  // Data Display
  if (['card','badge','alert','table','progress','spinner','skeleton','avatar','empty','kbd'].includes(id))
    return <DataDisplayView activeTab={activeTab} />;

  // Overlays
  if (['dialog','alert-dialog','sheet','popover','tooltip','hover-card','dropdown-menu'].includes(id))
    return <OverlaysView activeTab={activeTab} />;

  // Navigation
  if (['tabs','accordion','breadcrumb','pagination','collapsible','separator','scroll-area'].includes(id))
    return <NavigationView activeTab={activeTab} />;

  // Chat
  if (['message','bubble','bubble-group'].includes(id))
    return <MessagingView activeTab={activeTab} />;

  // Layout
  if (['header','footer','hero','page-header'].includes(id))
    return <LayoutView activeTab={activeTab} />;

  // Tokens
  if (id === 'tokens') return <TokensView activeTab={activeTab} />;

  return null;
}

// ─────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────
const THEMES = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'hc-light', label: 'HC Light' },
  { id: 'hc-dark', label: 'HC Dark' },
];
const VIEWPORTS = [
  { id: 'vp-full', label: 'Full' },
  { id: 'vp-desktop', label: 'Desktop' },
  { id: 'vp-tablet', label: 'Tablet' },
  { id: 'vp-mobile', label: 'Mobile' },
];
const BACKGROUNDS = [
  { id: '', label: 'Plain' },
  { id: 'bg-grid', label: 'Grid' },
  { id: 'bg-checkered', label: 'Pattern' },
];
const SUBTABS = ['All Variants', 'Sandbox', 'Code'];
const SUBTAB_IDS = ['all', 'sandbox', 'code'];

function App() {
  // Read initial hash
  const initialId = window.location.hash.replace('#', '') || '';
  const [selectedId, setSelectedId] = useState(initialId);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('light');
  const [viewport, setViewport] = useState('vp-full');
  const [background, setBackground] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('all');

  // Sync theme to <html> so CSS [data-theme] selectors cascade from root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    return () => document.documentElement.removeAttribute('data-theme');
  }, [theme]);

  // Sync hash on selection
  const selectComp = useCallback((id: string) => {
    setSelectedId(id);
    setActiveSubTab('all');
    window.location.hash = id;
  }, []);

  // Listen for hash change (browser back/forward)
  useEffect(() => {
    const handleHash = () => {
      const id = window.location.hash.replace('#', '');
      if (id) setSelectedId(id);
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Filtered registry
  const filteredGroups = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return GROUPS.map(g => ({
      ...g,
      items: REGISTRY.filter(c =>
        c.group === g.id &&
        (q === '' || c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q))
      ),
    })).filter(g => g.items.length > 0);
  }, [searchQuery]);

  const selected = REGISTRY.find(c => c.id === selectedId);

  return (
    <TooltipProvider>
      <div className="explorer-shell" data-theme={theme}>

        {/* ── Header ── */}
        <header className="explorer-header">
          <div className="explorer-header-brand">
            <Sparkles style={{ width: '1rem', height: '1rem', color: 'var(--primary)' }} />
            Niva <span>Design System</span>
          </div>
          <div className="explorer-header-spacer" />
          <div className="explorer-header-meta">
            <span>Component Explorer</span>
            <Badge variant="outline" style={{ fontSize: '0.65rem' }}>{REGISTRY.length} primitives</Badge>
          </div>
          {/* Theme switcher */}
          <div className="toolbar-segment">
            {THEMES.map(t => (
              <button
                key={t.id}
                className={`toolbar-seg-btn${theme === t.id ? ' active' : ''}`}
                onClick={() => setTheme(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </header>

        {/* ── Sidebar ── */}
        <aside className="explorer-sidebar">
          {/* Search */}
          <div className="sidebar-search">
            <Search className="sidebar-search-icon" />
            <input
              type="text"
              placeholder="Search components…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              id="sidebar-search"
            />
            {searchQuery && (
              <button className="sidebar-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">×</button>
            )}
          </div>

          {/* Nav */}
          <nav className="sidebar-nav" aria-label="Component navigation">
            {filteredGroups.length === 0 ? (
              <div className="sidebar-empty">No components match "{searchQuery}"</div>
            ) : (
              filteredGroups.map(g => (
                <div key={g.id} className="sidebar-group">
                  <div className="sidebar-group-header">{g.id}</div>
                  {g.items.map(item => (
                    <button
                      key={item.id}
                      className={`sidebar-item${selectedId === item.id ? ' active' : ''}`}
                      onClick={() => selectComp(item.id)}
                      title={item.desc}
                      id={`sidebar-${item.id}`}
                    >
                      <span className="sidebar-item-label">{item.name}</span>
                    </button>
                  ))}
                </div>
              ))
            )}
          </nav>

          {/* Footer */}
          <div className="sidebar-footer">
            <ShieldAlert style={{ width: '0.875rem', height: '0.875rem', color: 'var(--primary)' }} />
            <span>WCAG 2.1 AA · DTCG Tokens</span>
          </div>
        </aside>

        {/* ── View Window ── */}
        <div className="view-window">
          {!selected ? (
            /* Welcome screen */
            <div className="view-canvas-wrap">
              <div className="view-welcome">
                <div className="view-welcome-icon">
                  <Sparkles style={{ width: '1.75rem', height: '1.75rem' }} />
                </div>
                <h2>Select a component to inspect</h2>
                <p>Click any component in the sidebar to view all its variants, sizes, states, and an interactive sandbox for debugging.</p>
                <div className="view-welcome-grid">
                  {['button', 'badge', 'dialog', 'input', 'tabs', 'card', 'alert', 'tooltip'].map(id => {
                    const c = REGISTRY.find(r => r.id === id);
                    return c ? (
                      <button key={id} className="view-welcome-chip" onClick={() => selectComp(id)}>
                        <strong style={{ display: 'block' }}>{c.name}</strong>
                        <span style={{ fontSize: '0.65rem', opacity: 0.75 }}>{c.group}</span>
                      </button>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="view-toolbar">
                <div className="view-toolbar-title">
                  <span className="view-toolbar-name">{selected.name}</span>
                  {selected.path && (
                    <span className="view-toolbar-path">@enterprise/component-library › {selected.path}</span>
                  )}
                </div>
                <div className="view-toolbar-spacer" />
                <div className="view-toolbar-controls">
                  {/* Viewport */}
                  <div className="toolbar-segment">
                    {VIEWPORTS.map(v => (
                      <button
                        key={v.id}
                        className={`toolbar-seg-btn${viewport === v.id ? ' active' : ''}`}
                        onClick={() => setViewport(v.id)}
                        title={v.label}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                  {/* Background */}
                  <div className="toolbar-segment">
                    {BACKGROUNDS.map(b => (
                      <button
                        key={b.id || 'plain'}
                        className={`toolbar-seg-btn${background === b.id ? ' active' : ''}`}
                        onClick={() => setBackground(b.id)}
                        title={b.label}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sub-nav */}
              <nav className="view-subnav" aria-label="View tabs">
                {SUBTABS.map((tab, i) => (
                  <button
                    key={tab}
                    className={`view-subnav-tab${activeSubTab === SUBTAB_IDS[i] ? ' active' : ''}`}
                    onClick={() => setActiveSubTab(SUBTAB_IDS[i])}
                    id={`view-tab-${SUBTAB_IDS[i]}`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>

              {/* Canvas */}
              <div className={`view-canvas-wrap ${background}`}>
                <div className={`view-canvas-inner ${viewport}`}>
                  <ViewContent id={selectedId} activeTab={activeSubTab} />
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </TooltipProvider>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
