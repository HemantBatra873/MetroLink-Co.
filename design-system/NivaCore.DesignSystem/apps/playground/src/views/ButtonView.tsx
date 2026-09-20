import React, { useState } from 'react';
import {
  Button, ButtonGroup,
  Toggle, ToggleGroup, ToggleGroupItem,
  Label,
  ArrowRight, Check, Plus, Search, Sparkles,
} from '@enterprise/component-library';

// ─────────────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────────────
function Section({ title, desc, badge, children }: { title: string; desc?: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="comp-section">
      <div className="comp-section-header">
        <div>
          <h3 className="comp-section-title">{title}</h3>
          {desc && <p className="comp-section-desc">{desc}</p>}
        </div>
        {badge && <span className="comp-section-badge">{badge}</span>}
      </div>
      {children}
    </div>
  );
}

const VARIANTS = ['primary', 'secondary', 'tertiary', 'danger', 'ghost'] as const;
const SIZES = ['sm', 'md', 'lg', 'icon-sm', 'icon', 'icon-lg'] as const;
type BtnVariant = typeof VARIANTS[number];
type BtnSize = typeof SIZES[number];

function VariantRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="variant-matrix-row">
      <span className="variant-matrix-label">{label}</span>
      <div className="variant-row">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Interactive Sandbox
// ─────────────────────────────────────────────────────
function ButtonSandbox() {
  const [variant, setVariant] = useState<BtnVariant>('primary');
  const [size, setSize] = useState<BtnSize>('md');
  const [label, setLabel] = useState('Click me');
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [fullWidth, setFullWidth] = useState(false);

  return (
    <div className="sandbox-split">
      <div className="sandbox-preview">
        <Button
          variant={variant}
          size={size as any}
          loading={loading}
          disabled={disabled}
          fullWidth={fullWidth}
        >
          {label}
        </Button>
      </div>
      <div className="sandbox-controls">
        <div className="sandbox-controls-header">Props</div>
        <div className="sandbox-control-row">
          <label className="sandbox-control-label">variant</label>
          <select value={variant} onChange={e => setVariant(e.target.value as BtnVariant)}>
            {VARIANTS.map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div className="sandbox-control-row">
          <label className="sandbox-control-label">size</label>
          <select value={size} onChange={e => setSize(e.target.value as BtnSize)}>
            {SIZES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="sandbox-control-row">
          <label className="sandbox-control-label">children (label)</label>
          <input type="text" value={label} onChange={e => setLabel(e.target.value)} />
        </div>
        <div className="sandbox-checkbox-row">
          <input id="sb-loading" type="checkbox" checked={loading} onChange={e => setLoading(e.target.checked)} />
          <label className="sandbox-checkbox-label" htmlFor="sb-loading">loading</label>
        </div>
        <div className="sandbox-checkbox-row">
          <input id="sb-disabled" type="checkbox" checked={disabled} onChange={e => setDisabled(e.target.checked)} />
          <label className="sandbox-checkbox-label" htmlFor="sb-disabled">disabled</label>
        </div>
        <div className="sandbox-checkbox-row">
          <input id="sb-fullwidth" type="checkbox" checked={fullWidth} onChange={e => setFullWidth(e.target.checked)} />
          <label className="sandbox-checkbox-label" htmlFor="sb-fullwidth">fullWidth</label>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Main View
// ─────────────────────────────────────────────────────
export function ButtonView({ activeTab }: { activeTab: string }) {
  if (activeTab === 'sandbox') return (
    <div className="comp-view">
      <Section title="Interactive Sandbox" desc="Tweak props in real-time using the controls panel.">
        <ButtonSandbox />
      </Section>
    </div>
  );

  if (activeTab === 'code') return (
    <div className="comp-view">
      <Section title="Import" badge="@enterprise/component-library">
        <div className="code-snippet">
          <div className="code-snippet-header">TypeScript / TSX</div>
          <pre>{`import { Button } from '@enterprise/component-library';

// Basic usage
<Button variant="primary">Save Changes</Button>
<Button variant="secondary" size="sm">Cancel</Button>
<Button variant="danger" loading>Deleting…</Button>
<Button variant="ghost" size="icon"><PlusIcon /></Button>
<Button disabled>Not available</Button>
<Button fullWidth>Full-width Button</Button>`}</pre>
        </div>
      </Section>
      <Section title="Variant API" badge="ButtonProps">
        <div className="code-snippet">
          <pre>{`interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
  size?:    'sm' | 'md' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg';
  loading?: boolean;     // shows a spinner, disables interaction
  fullWidth?: boolean;   // width: 100%
  disabled?: boolean;
}`}</pre>
        </div>
      </Section>
    </div>
  );

  // Default: All Variants & States
  return (
    <div className="comp-view">

      {/* ── Variant Matrix ── */}
      <Section title="Variant Matrix" desc="All five enterprise policy variants at a glance." badge="variant">
        <div className="debug-card">
          <div className="debug-card-header">
            <p className="debug-card-title">Variants × States</p>
            <p className="debug-card-subtitle">Each column = a variant; each row = a state modifier</p>
          </div>
          <div className="debug-card-body">
            <div className="variant-matrix">
              {/* Header row */}
              <div className="variant-matrix-row">
                <span className="variant-matrix-label" />
                {VARIANTS.map(v => (
                  <span key={v} className="variant-label" style={{ width: 90, textAlign: 'center' }}>{v}</span>
                ))}
              </div>
              {/* Default */}
              <VariantRow label="default">
                {VARIANTS.map(v => <Button key={v} variant={v}>{v}</Button>)}
              </VariantRow>
              {/* Disabled */}
              <VariantRow label="disabled">
                {VARIANTS.map(v => <Button key={v} variant={v} disabled>{v}</Button>)}
              </VariantRow>
              {/* Loading */}
              <VariantRow label="loading">
                {VARIANTS.map(v => <Button key={v} variant={v} loading>Loading</Button>)}
              </VariantRow>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Size Matrix ── */}
      <Section title="Size Matrix" desc="All button sizes from xs to lg." badge="size">
        <div className="debug-card">
          <div className="debug-card-body">
            <div className="variant-matrix">
              <VariantRow label="size=sm">
                <Button size="sm" variant="primary">Small</Button>
                <Button size="sm" variant="secondary">Small</Button>
                <Button size="sm" variant="tertiary">Small</Button>
              </VariantRow>
              <VariantRow label="size=md (default)">
                <Button size="md" variant="primary">Medium</Button>
                <Button size="md" variant="secondary">Medium</Button>
                <Button size="md" variant="tertiary">Medium</Button>
              </VariantRow>
              <VariantRow label="size=lg">
                <Button size="lg" variant="primary">Large</Button>
                <Button size="lg" variant="secondary">Large</Button>
                <Button size="lg" variant="tertiary">Large</Button>
              </VariantRow>
              <VariantRow label="size=icon-sm">
                <Button size="icon-sm" variant="primary" aria-label="plus"><Plus className="h-3.5 w-3.5" /></Button>
                <Button size="icon-sm" variant="secondary" aria-label="plus"><Plus className="h-3.5 w-3.5" /></Button>
                <Button size="icon-sm" variant="ghost" aria-label="plus"><Plus className="h-3.5 w-3.5" /></Button>
              </VariantRow>
              <VariantRow label="size=icon">
                <Button size="icon" variant="primary" aria-label="plus"><Plus /></Button>
                <Button size="icon" variant="secondary" aria-label="plus"><Plus /></Button>
                <Button size="icon" variant="ghost" aria-label="plus"><Plus /></Button>
              </VariantRow>
              <VariantRow label="size=icon-lg">
                <Button size="icon-lg" variant="primary" aria-label="plus"><Plus /></Button>
                <Button size="icon-lg" variant="secondary" aria-label="plus"><Plus /></Button>
                <Button size="icon-lg" variant="ghost" aria-label="plus"><Plus /></Button>
              </VariantRow>
            </div>
          </div>
        </div>
      </Section>

      {/* ── With Icons ── */}
      <Section title="With Icons" desc="Leading icon, trailing icon, icon-only." badge="icons">
        <div className="debug-card">
          <div className="debug-card-body">
            <div className="variant-matrix">
              <VariantRow label="leading icon">
                <Button variant="primary"><Plus />Add Resource</Button>
                <Button variant="secondary"><Search />Search</Button>
                <Button variant="tertiary"><Sparkles />Generate</Button>
              </VariantRow>
              <VariantRow label="trailing icon">
                <Button variant="primary">Continue <ArrowRight /></Button>
                <Button variant="secondary">Export <ArrowRight /></Button>
              </VariantRow>
              <VariantRow label="icon only">
                <Button size="icon" variant="primary" aria-label="Add"><Plus /></Button>
                <Button size="icon" variant="secondary" aria-label="Search"><Search /></Button>
                <Button size="icon" variant="ghost" aria-label="Sparkles"><Sparkles /></Button>
                <Button size="icon" variant="danger" aria-label="Check"><Check /></Button>
              </VariantRow>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Full Width ── */}
      <Section title="Full Width" desc="fullWidth prop stretches to container." badge="fullWidth">
        <div className="debug-card">
          <div className="debug-card-body" style={{ display: 'grid', gap: '0.5rem', maxWidth: 480 }}>
            <Button fullWidth>Full Width Primary</Button>
            <Button fullWidth variant="secondary">Full Width Secondary</Button>
            <Button fullWidth variant="tertiary">Full Width Tertiary</Button>
            <Button fullWidth variant="danger">Full Width Danger</Button>
          </div>
        </div>
      </Section>

      {/* ── ButtonGroup ── */}
      <Section title="ButtonGroup" desc="Segmented button sets for filters and time ranges." badge="ButtonGroup">
        <div className="debug-card">
          <div className="debug-card-body">
            <div className="variant-matrix">
              <VariantRow label="default">
                <ButtonGroup>
                  <Button size="sm">Day</Button>
                  <Button size="sm" variant="secondary">Week</Button>
                  <Button size="sm" variant="secondary">Month</Button>
                  <Button size="sm" variant="secondary">Year</Button>
                </ButtonGroup>
              </VariantRow>
              <VariantRow label="with active">
                <ButtonGroup>
                  <Button size="sm" variant="secondary">Grid</Button>
                  <Button size="sm">List</Button>
                  <Button size="sm" variant="secondary">Card</Button>
                </ButtonGroup>
              </VariantRow>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Toggle ── */}
      <Section title="Toggle & ToggleGroup" desc="Two-state toggles for formatting and preferences." badge="Toggle">
        <div className="debug-card">
          <div className="debug-card-body">
            <div className="variant-matrix">
              <VariantRow label="ToggleGroup">
                <ToggleGroup defaultValue={['bold']}>
                  <ToggleGroupItem value="bold" aria-label="Bold"><strong>B</strong></ToggleGroupItem>
                  <ToggleGroupItem value="italic" aria-label="Italic"><em>I</em></ToggleGroupItem>
                  <ToggleGroupItem value="underline" aria-label="Underline"><u>U</u></ToggleGroupItem>
                  <ToggleGroupItem value="strike" aria-label="Strike"><s>S</s></ToggleGroupItem>
                </ToggleGroup>
              </VariantRow>
            </div>
          </div>
        </div>
      </Section>

    </div>
  );
}
