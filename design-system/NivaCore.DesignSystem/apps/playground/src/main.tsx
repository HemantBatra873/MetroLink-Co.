import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import '@enterprise/design-tokens/css';
import '@enterprise/component-library/styles.css';
import {
  TooltipProvider,
  Badge,
  Sparkles, FormInput,
  Database, Sliders, MessageSquare, ShieldAlert, Search,
  Layers,
} from '@enterprise/component-library';
import { Palette, Box, Paintbrush } from 'lucide-react';
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
  ExtraComponentsView,
} from './views/index.js';

interface CompEntry {
  id: string;
  name: string;
  group: string;
  desc: string;
  path?: string;
}

const REGISTRY: CompEntry[] = [
  // Form Controls
  { id: 'button', name: 'Button', group: 'Form Controls', desc: 'Policy buttons: primary, secondary, tertiary, danger, ghost', path: 'components/button.tsx' },
  { id: 'button-group', name: 'Button Group', group: 'Form Controls', desc: 'Segmented button sets', path: 'ui/button-group.tsx' },
  { id: 'input', name: 'Input', group: 'Form Controls', desc: 'Single-line text input', path: 'ui/input.tsx' },
  { id: 'textarea', name: 'Textarea', group: 'Form Controls', desc: 'Multi-line text area', path: 'ui/textarea.tsx' },
  { id: 'checkbox', name: 'Checkbox', group: 'Form Controls', desc: 'Boolean selection control', path: 'ui/checkbox.tsx' },
  { id: 'radio-group', name: 'Radio Group', group: 'Form Controls', desc: 'Mutually exclusive options', path: 'ui/radio-group.tsx' },
  { id: 'switch', name: 'Switch', group: 'Form Controls', desc: 'Boolean toggle switch', path: 'ui/switch.tsx' },
  { id: 'select', name: 'Select', group: 'Form Controls', desc: 'Custom select picker', path: 'ui/select.tsx' },
  { id: 'native-select', name: 'Native Select', group: 'Form Controls', desc: 'Native browser select', path: 'ui/native-select.tsx' },
  { id: 'slider', name: 'Slider', group: 'Form Controls', desc: 'Range slider', path: 'ui/slider.tsx' },
  { id: 'toggle', name: 'Toggle', group: 'Form Controls', desc: 'Two-state toggle button', path: 'ui/toggle.tsx' },
  { id: 'toggle-group', name: 'Toggle Group', group: 'Form Controls', desc: 'Grouped toggles', path: 'ui/toggle-group.tsx' },
  { id: 'input-otp', name: 'Input OTP', group: 'Form Controls', desc: 'One-time passcode input', path: 'ui/input-otp.tsx' },
  { id: 'label', name: 'Label', group: 'Form Controls', desc: 'Form control label', path: 'ui/label.tsx' },
  { id: 'field', name: 'Field', group: 'Form Controls', desc: 'Labeled field layout', path: 'ui/field.tsx' },
  { id: 'input-group', name: 'Input Group', group: 'Form Controls', desc: 'Input with addons', path: 'ui/input-group.tsx' },
  { id: 'combobox', name: 'Combobox', group: 'Form Controls', desc: 'Searchable select', path: 'ui/combobox.tsx' },
  { id: 'calendar', name: 'Calendar', group: 'Form Controls', desc: 'Date calendar grid', path: 'ui/calendar.tsx' },
  { id: 'date-picker', name: 'Date Picker', group: 'Form Controls', desc: 'Popover date picker', path: 'ui/date-picker.tsx' },

  // Data Display
  { id: 'card', name: 'Card', group: 'Data Display', desc: 'Surface with header/content/footer', path: 'ui/card.tsx' },
  { id: 'badge', name: 'Badge', group: 'Data Display', desc: 'Status indicator tags', path: 'ui/badge.tsx' },
  { id: 'alert', name: 'Alert', group: 'Data Display', desc: 'Contextual banners', path: 'ui/alert.tsx' },
  { id: 'table', name: 'Table', group: 'Data Display', desc: 'Tabular data grid', path: 'ui/table.tsx' },
  { id: 'data-table', name: 'Data Table', group: 'Data Display', desc: 'Column-configured data table', path: 'ui/data-table.tsx' },
  { id: 'progress', name: 'Progress', group: 'Data Display', desc: 'Progress meter', path: 'ui/progress.tsx' },
  { id: 'spinner', name: 'Spinner', group: 'Data Display', desc: 'Loading indicator', path: 'ui/spinner.tsx' },
  { id: 'skeleton', name: 'Skeleton', group: 'Data Display', desc: 'Content placeholder', path: 'ui/skeleton.tsx' },
  { id: 'avatar', name: 'Avatar', group: 'Data Display', desc: 'User profile avatar', path: 'ui/avatar.tsx' },
  { id: 'empty', name: 'Empty', group: 'Data Display', desc: 'Empty state container', path: 'ui/empty.tsx' },
  { id: 'kbd', name: 'Kbd', group: 'Data Display', desc: 'Keyboard shortcut badge', path: 'ui/kbd.tsx' },
  { id: 'chart', name: 'Chart', group: 'Data Display', desc: 'Recharts chart wrappers', path: 'ui/chart.tsx' },
  { id: 'aspect-ratio', name: 'Aspect Ratio', group: 'Data Display', desc: 'Fixed aspect ratio box', path: 'ui/aspect-ratio.tsx' },
  { id: 'item', name: 'Item', group: 'Data Display', desc: 'List item primitive', path: 'ui/item.tsx' },
  { id: 'marker', name: 'Marker', group: 'Data Display', desc: 'Marker / pin indicator', path: 'ui/marker.tsx' },
  { id: 'typography', name: 'Typography', group: 'Data Display', desc: 'Text scale and styles', path: 'ui/typography.tsx' },
  { id: 'carousel', name: 'Carousel', group: 'Data Display', desc: 'Content carousel', path: 'ui/carousel.tsx' },

  // Overlays
  { id: 'dialog', name: 'Dialog', group: 'Overlays & Dialogs', desc: 'Modal dialog', path: 'ui/dialog.tsx' },
  { id: 'alert-dialog', name: 'Alert Dialog', group: 'Overlays & Dialogs', desc: 'Confirmation dialog', path: 'ui/alert-dialog.tsx' },
  { id: 'sheet', name: 'Sheet', group: 'Overlays & Dialogs', desc: 'Slide-in panel', path: 'ui/sheet.tsx' },
  { id: 'drawer', name: 'Drawer', group: 'Overlays & Dialogs', desc: 'Mobile-style drawer', path: 'ui/drawer.tsx' },
  { id: 'popover', name: 'Popover', group: 'Overlays & Dialogs', desc: 'Floating popover', path: 'ui/popover.tsx' },
  { id: 'tooltip', name: 'Tooltip', group: 'Overlays & Dialogs', desc: 'Context tooltip', path: 'ui/tooltip.tsx' },
  { id: 'hover-card', name: 'Hover Card', group: 'Overlays & Dialogs', desc: 'Hover preview card', path: 'ui/hover-card.tsx' },
  { id: 'dropdown-menu', name: 'Dropdown Menu', group: 'Overlays & Dialogs', desc: 'Action menu', path: 'ui/dropdown-menu.tsx' },
  { id: 'context-menu', name: 'Context Menu', group: 'Overlays & Dialogs', desc: 'Right-click menu', path: 'ui/context-menu.tsx' },
  { id: 'toast', name: 'Toast', group: 'Overlays & Dialogs', desc: 'Transient notifications', path: 'ui/toast.tsx' },
  { id: 'command', name: 'Command', group: 'Overlays & Dialogs', desc: 'Command palette', path: 'ui/command.tsx' },

  // Navigation
  { id: 'tabs', name: 'Tabs', group: 'Navigation', desc: 'Tabbed panels', path: 'ui/tabs.tsx' },
  { id: 'accordion', name: 'Accordion', group: 'Navigation', desc: 'Disclosure panels', path: 'ui/accordion.tsx' },
  { id: 'breadcrumb', name: 'Breadcrumb', group: 'Navigation', desc: 'Path navigation', path: 'ui/breadcrumb.tsx' },
  { id: 'pagination', name: 'Pagination', group: 'Navigation', desc: 'Page controls', path: 'ui/pagination.tsx' },
  { id: 'collapsible', name: 'Collapsible', group: 'Navigation', desc: 'Show/hide disclosure', path: 'ui/collapsible.tsx' },
  { id: 'separator', name: 'Separator', group: 'Navigation', desc: 'Divider line', path: 'ui/separator.tsx' },
  { id: 'scroll-area', name: 'Scroll Area', group: 'Navigation', desc: 'Custom scroll container', path: 'ui/scroll-area.tsx' },
  { id: 'menubar', name: 'Menubar', group: 'Navigation', desc: 'Desktop menu bar', path: 'ui/menubar.tsx' },
  { id: 'navigation-menu', name: 'Navigation Menu', group: 'Navigation', desc: 'Site navigation', path: 'ui/navigation-menu.tsx' },
  { id: 'sidebar', name: 'Sidebar', group: 'Navigation', desc: 'App sidebar shell', path: 'ui/sidebar.tsx' },
  { id: 'resizable', name: 'Resizable', group: 'Navigation', desc: 'Resizable panels', path: 'ui/resizable.tsx' },

  // Chat
  { id: 'message', name: 'Message', group: 'Chat & Messaging', desc: 'Chat message container', path: 'ui/message.tsx' },
  { id: 'bubble', name: 'Bubble', group: 'Chat & Messaging', desc: 'Chat bubble', path: 'ui/bubble.tsx' },
  { id: 'message-scroller', name: 'Message Scroller', group: 'Chat & Messaging', desc: 'Scrollable message list', path: 'ui/message-scroller.tsx' },
  { id: 'attachment', name: 'Attachment', group: 'Chat & Messaging', desc: 'File attachment chip', path: 'ui/attachment.tsx' },

  // Layout
  { id: 'header', name: 'Header', group: 'Global Layout', desc: 'Top navigation bar', path: 'layout/Header.tsx' },
  { id: 'footer', name: 'Footer', group: 'Global Layout', desc: 'Enterprise footer', path: 'layout/Footer.tsx' },
  { id: 'hero', name: 'Hero', group: 'Global Layout', desc: 'Hero banner', path: 'layout/Hero.tsx' },
  { id: 'page-header', name: 'Page Header', group: 'Global Layout', desc: 'Page title block', path: 'layout/PageHeader.tsx' },
  { id: 'direction', name: 'Direction', group: 'Global Layout', desc: 'LTR/RTL direction provider', path: 'ui/direction.tsx' },
  { id: 'questionnaire', name: 'Questionnaire', group: 'Global Layout', desc: 'Multi-step questionnaire', path: 'ui/questionnaire.tsx' },

  // Foundations
  { id: 'tokens', name: 'Colors', group: 'Foundations', desc: 'Semantic + primitive color tokens', path: 'packages/design-tokens' },
  { id: 'fonts', name: 'Fonts', group: 'Foundations', desc: 'Enterprise font stacks', path: 'primitives/typography.json' },
  { id: 'gradients', name: 'Gradients', group: 'Foundations', desc: 'Shared gradient tokens', path: 'primitives/gradients.json' },
];

const FORM_IDS = new Set([
  'input', 'textarea', 'checkbox', 'radio-group', 'switch', 'select', 'native-select',
  'slider', 'toggle', 'toggle-group', 'input-otp', 'label', 'field', 'input-group', 'combobox',
]);
const DATA_IDS = new Set([
  'card', 'badge', 'alert', 'table', 'progress', 'spinner', 'skeleton', 'avatar', 'empty', 'kbd',
  'chart', 'aspect-ratio', 'item', 'marker',
]);
const OVERLAY_IDS = new Set([
  'dialog', 'alert-dialog', 'sheet', 'popover', 'tooltip', 'hover-card', 'dropdown-menu',
  'drawer', 'context-menu', 'toast',
]);
const NAV_IDS = new Set([
  'tabs', 'accordion', 'breadcrumb', 'pagination', 'collapsible', 'separator', 'scroll-area',
  'menubar', 'navigation-menu', 'sidebar', 'resizable',
]);
const MSG_IDS = new Set(['message', 'bubble', 'bubble-group', 'message-scroller', 'attachment']);
const LAYOUT_IDS = new Set(['header', 'footer', 'hero', 'page-header']);
const EXTRA_IDS = new Set([
  'calendar', 'date-picker', 'carousel', 'command', 'direction', 'questionnaire',
  'data-table', 'typography',
]);

const GROUPS = [
  { id: 'Form Controls', icon: <FormInput className="h-3.5 w-3.5" /> },
  { id: 'Data Display', icon: <Database className="h-3.5 w-3.5" /> },
  { id: 'Overlays & Dialogs', icon: <Sliders className="h-3.5 w-3.5" /> },
  { id: 'Navigation', icon: <Box className="h-3.5 w-3.5" /> },
  { id: 'Chat & Messaging', icon: <MessageSquare className="h-3.5 w-3.5" /> },
  { id: 'Global Layout', icon: <Layers className="h-3.5 w-3.5" /> },
  { id: 'Foundations', icon: <Palette className="h-3.5 w-3.5" /> },
];

const FONT_OPTIONS = [
  { id: 'inter', label: 'Inter', css: "var(--font-stack-inter, 'Inter', ui-sans-serif, system-ui, sans-serif)" },
  { id: 'ibm-plex', label: 'IBM Plex Sans', css: "var(--font-stack-ibm-plex, 'IBM Plex Sans', 'Segoe UI', sans-serif)" },
  { id: 'plus-jakarta', label: 'Plus Jakarta', css: "var(--font-stack-plus-jakarta, 'Plus Jakarta Sans', 'Inter', sans-serif)" },
];

const DEFAULT_PRIMARY = '#2563eb';
const DEFAULT_SECONDARY = '#e2e8f0';

function ViewContent({ id, activeTab }: { id: string; activeTab: string }) {
  if (id === 'button' || id === 'button-group') {
    return <ButtonView componentId={id} activeTab={activeTab} />;
  }
  if (FORM_IDS.has(id)) return <FormControlsView componentId={id} activeTab={activeTab} />;
  if (DATA_IDS.has(id)) return <DataDisplayView componentId={id} activeTab={activeTab} />;
  if (OVERLAY_IDS.has(id)) return <OverlaysView componentId={id} activeTab={activeTab} />;
  if (NAV_IDS.has(id)) return <NavigationView componentId={id} activeTab={activeTab} />;
  if (MSG_IDS.has(id)) return <MessagingView componentId={id} activeTab={activeTab} />;
  if (LAYOUT_IDS.has(id)) return <LayoutView componentId={id} activeTab={activeTab} />;
  if (EXTRA_IDS.has(id)) return <ExtraComponentsView componentId={id} activeTab={activeTab} />;
  if (id === 'tokens' || id === 'fonts' || id === 'gradients') {
    return <TokensView activeTab={activeTab} section={id} />;
  }
  return <ExtraComponentsView componentId={id} activeTab={activeTab} />;
}

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
  { id: '', label: 'Canvas' },
  { id: 'bg-grid', label: 'Grid' },
  { id: 'bg-checkered', label: 'Pattern' },
];
const SUBTABS = ['All Variants', 'Sandbox', 'Code'];
const SUBTAB_IDS = ['all', 'sandbox', 'code'];

function applyBrandColors(primary: string, secondary: string) {
  const root = document.documentElement;
  root.style.setProperty('--semantic-color-action-primary', primary);
  root.style.setProperty('--semantic-color-action-primary-hover', primary);
  root.style.setProperty('--primary', primary);
  root.style.setProperty('--semantic-color-action-secondary', secondary);
  root.style.setProperty('--secondary', secondary);
}

function clearBrandColors() {
  const root = document.documentElement;
  [
    '--semantic-color-action-primary',
    '--semantic-color-action-primary-hover',
    '--primary',
    '--semantic-color-action-secondary',
    '--secondary',
  ].forEach((v) => root.style.removeProperty(v));
}

function App() {
  const initialId = window.location.hash.replace('#', '') || '';
  const [selectedId, setSelectedId] = useState(initialId);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('light');
  const [viewport, setViewport] = useState('vp-full');
  const [background, setBackground] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('all');
  const [fontId, setFontId] = useState('inter');
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY);
  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_SECONDARY);
  const [brandDirty, setBrandDirty] = useState(false);
  const [themePanelOpen, setThemePanelOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    return () => document.documentElement.removeAttribute('data-theme');
  }, [theme]);

  useEffect(() => {
    const font = FONT_OPTIONS.find((f) => f.id === fontId) ?? FONT_OPTIONS[0];
    document.documentElement.style.setProperty('--font-family-sans', font.css);
    document.documentElement.style.setProperty('--font-sans', font.css);
    document.body.style.fontFamily = font.css;
  }, [fontId]);

  const selectComp = useCallback((id: string) => {
    setSelectedId(id);
    setActiveSubTab('all');
    window.location.hash = id;
  }, []);

  useEffect(() => {
    const handleHash = () => {
      const id = window.location.hash.replace('#', '');
      if (id) setSelectedId(id);
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const filteredGroups = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return GROUPS.map((g) => ({
      ...g,
      items: REGISTRY.filter(
        (c) =>
          c.group === g.id &&
          (q === '' || c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)),
      ),
    })).filter((g) => g.items.length > 0);
  }, [searchQuery]);

  const selected = REGISTRY.find((c) => c.id === selectedId);

  const onPrimaryChange = (value: string) => {
    setPrimaryColor(value);
    setBrandDirty(true);
    applyBrandColors(value, secondaryColor);
  };
  const onSecondaryChange = (value: string) => {
    setSecondaryColor(value);
    setBrandDirty(true);
    applyBrandColors(primaryColor, value);
  };
  const resetBrand = () => {
    setPrimaryColor(DEFAULT_PRIMARY);
    setSecondaryColor(DEFAULT_SECONDARY);
    setBrandDirty(false);
    clearBrandColors();
  };

  return (
    <TooltipProvider>
      <div className="explorer-shell" data-theme={theme}>
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

          <div className="toolbar-segment" title="App font">
            {FONT_OPTIONS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`toolbar-seg-btn${fontId === f.id ? ' active' : ''}`}
                onClick={() => setFontId(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="toolbar-segment">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`toolbar-seg-btn${theme === t.id ? ' active' : ''}`}
                onClick={() => setTheme(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`toolbar-seg-btn theme-panel-toggle${themePanelOpen ? ' active' : ''}`}
            onClick={() => setThemePanelOpen((o) => !o)}
            title="Brand colors"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              border: '1px solid var(--border)',
              borderRadius: '0.375rem',
              padding: '0.25rem 0.6rem',
              background: themePanelOpen ? 'var(--background)' : 'var(--muted)',
              color: 'var(--foreground)',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontWeight: 600,
            }}
          >
            <Paintbrush style={{ width: '0.85rem', height: '0.85rem' }} />
            Brand
          </button>
        </header>

        {themePanelOpen && (
          <div className="brand-panel" role="region" aria-label="Brand color controls">
            <label className="brand-panel-field">
              <span>Primary</span>
              <input type="color" value={primaryColor} onChange={(e) => onPrimaryChange(e.target.value)} />
              <code>{primaryColor}</code>
            </label>
            <label className="brand-panel-field">
              <span>Secondary</span>
              <input type="color" value={secondaryColor} onChange={(e) => onSecondaryChange(e.target.value)} />
              <code>{secondaryColor}</code>
            </label>
            <button type="button" className="brand-panel-reset" onClick={resetBrand} disabled={!brandDirty}>
              Reset to defaults
            </button>
            <span className="brand-panel-hint">
              {brandDirty ? 'Live override active across the playground' : 'Using design-token defaults'}
            </span>
          </div>
        )}

        <aside className="explorer-sidebar">
          <div className="sidebar-search">
            <Search className="sidebar-search-icon" />
            <input
              type="text"
              placeholder="Search components…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="sidebar-search"
            />
            {searchQuery && (
              <button type="button" className="sidebar-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">×</button>
            )}
          </div>

          <nav className="sidebar-nav" aria-label="Component navigation">
            {filteredGroups.length === 0 ? (
              <div className="sidebar-empty">No components match "{searchQuery}"</div>
            ) : (
              filteredGroups.map((g) => (
                <div key={g.id} className="sidebar-group">
                  <div className="sidebar-group-header">
                    {g.icon}
                    <span style={{ marginLeft: '0.35rem' }}>{g.id}</span>
                    <span className="sidebar-item-badge" style={{ marginLeft: 'auto' }}>{g.items.length}</span>
                  </div>
                  {g.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
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

          <div className="sidebar-footer">
            <ShieldAlert style={{ width: '0.875rem', height: '0.875rem', color: 'var(--primary)' }} />
            <span>WCAG 2.1 AA · DTCG Tokens</span>
          </div>
        </aside>

        <div className="view-window">
          {!selected ? (
            <div className="view-canvas-wrap">
              <div className="view-welcome">
                <div className="view-welcome-icon">
                  <Sparkles style={{ width: '1.75rem', height: '1.75rem' }} />
                </div>
                <h2>Select a component to inspect</h2>
                <p>Each sidebar item opens that component alone — variants, states, and sandbox.</p>
                <div className="view-welcome-grid">
                  {['button', 'typography', 'date-picker', 'dialog', 'data-table', 'gradients', 'fonts', 'alert'].map((id) => {
                    const c = REGISTRY.find((r) => r.id === id);
                    return c ? (
                      <button key={id} type="button" className="view-welcome-chip" onClick={() => selectComp(id)}>
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
              <div className="view-toolbar">
                <div className="view-toolbar-title">
                  <span className="view-toolbar-name">{selected.name}</span>
                  {selected.path && (
                    <span className="view-toolbar-path">@enterprise/component-library › {selected.path}</span>
                  )}
                </div>
                <div className="view-toolbar-spacer" />
                <div className="view-toolbar-controls">
                  <div className="toolbar-segment">
                    {VIEWPORTS.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        className={`toolbar-seg-btn${viewport === v.id ? ' active' : ''}`}
                        onClick={() => setViewport(v.id)}
                        title={v.label}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                  <div className="toolbar-segment">
                    {BACKGROUNDS.map((b) => (
                      <button
                        key={b.id || 'plain'}
                        type="button"
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

              <nav className="view-subnav" aria-label="View tabs">
                {SUBTABS.map((tab, i) => (
                  <button
                    key={tab}
                    type="button"
                    className={`view-subnav-tab${activeSubTab === SUBTAB_IDS[i] ? ' active' : ''}`}
                    onClick={() => setActiveSubTab(SUBTAB_IDS[i])}
                    id={`view-tab-${SUBTAB_IDS[i]}`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>

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
