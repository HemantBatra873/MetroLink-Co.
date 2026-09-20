import React, { useState } from 'react';
import {
  Button, ButtonGroup,
  ArrowRight, Check, Plus, Search, Sparkles,
} from '@enterprise/component-library';
import { Section, VariantRow } from './Section.js';

const VARIANTS = ['primary', 'secondary', 'tertiary', 'danger', 'ghost'] as const;
const SIZES = ['sm', 'md', 'lg', 'icon-sm', 'icon', 'icon-lg'] as const;
type BtnVariant = typeof VARIANTS[number];
type BtnSize = typeof SIZES[number];

type Props = { componentId?: string; activeTab?: string };

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
        <Button variant={variant} size={size as BtnSize} loading={loading} disabled={disabled} fullWidth={fullWidth}>
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

function ButtonGroupSection() {
  return (
    <Section title="ButtonGroup" desc="Segmented button sets for filters and time ranges." badge="ButtonGroup">
      <div className="debug-card">
        <div className="debug-card-body">
          <div className="variant-matrix">
            <VariantRow label="default">
              <ButtonGroup>
                <Button size="sm">Day</Button>
                <Button size="sm" variant="secondary">Week</Button>
                <Button size="sm" variant="secondary">Month</Button>
              </ButtonGroup>
            </VariantRow>
            <VariantRow label="with active">
              <ButtonGroup>
                <Button size="sm" variant="secondary">Grid</Button>
                <Button size="sm">List</Button>
              </ButtonGroup>
            </VariantRow>
          </div>
        </div>
      </div>
    </Section>
  );
}

function ButtonDemos() {
  return (
    <>
      <Section title="Variant Matrix" desc="All five enterprise policy variants at a glance." badge="variant">
        <div className="debug-card">
          <div className="debug-card-body">
            <div className="variant-matrix">
              <div className="variant-matrix-row">
                <span className="variant-matrix-label" />
                {VARIANTS.map(v => (
                  <span key={v} className="variant-label" style={{ width: 90, textAlign: 'center' }}>{v}</span>
                ))}
              </div>
              <VariantRow label="default">
                {VARIANTS.map(v => <Button key={v} variant={v}>{v}</Button>)}
              </VariantRow>
              <VariantRow label="disabled">
                {VARIANTS.map(v => <Button key={v} variant={v} disabled>{v}</Button>)}
              </VariantRow>
              <VariantRow label="loading">
                {VARIANTS.map(v => <Button key={v} variant={v} loading>Loading</Button>)}
              </VariantRow>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Size Matrix" desc="All button sizes from xs to lg." badge="size">
        <div className="debug-card">
          <div className="debug-card-body">
            <div className="variant-matrix">
              <VariantRow label="size=sm">
                <Button size="sm" variant="primary">Small</Button>
                <Button size="sm" variant="secondary">Small</Button>
              </VariantRow>
              <VariantRow label="size=md (default)">
                <Button size="md" variant="primary">Medium</Button>
                <Button size="md" variant="secondary">Medium</Button>
              </VariantRow>
              <VariantRow label="size=icon">
                <Button size="icon" variant="primary" aria-label="Add"><Plus /></Button>
                <Button size="icon" variant="ghost" aria-label="Search"><Search /></Button>
              </VariantRow>
            </div>
          </div>
        </div>
      </Section>

      <Section title="With Icons" desc="Leading icon, trailing icon, icon-only." badge="icons">
        <div className="debug-card">
          <div className="debug-card-body">
            <VariantRow label="leading icon">
              <Button variant="primary"><Plus />Add Resource</Button>
              <Button variant="secondary"><Search />Search</Button>
            </VariantRow>
            <VariantRow label="trailing icon">
              <Button variant="primary">Continue <ArrowRight /></Button>
            </VariantRow>
            <VariantRow label="icon only">
              <Button size="icon" variant="danger" aria-label="Check"><Check /></Button>
              <Button size="icon" variant="ghost" aria-label="Sparkles"><Sparkles /></Button>
            </VariantRow>
          </div>
        </div>
      </Section>

      <Section title="Full Width" desc="fullWidth prop stretches to container." badge="fullWidth">
        <div className="debug-card">
          <div className="debug-card-body" style={{ display: 'grid', gap: '0.5rem', maxWidth: 480 }}>
            <Button fullWidth>Full Width Primary</Button>
            <Button fullWidth variant="secondary">Full Width Secondary</Button>
          </div>
        </div>
      </Section>
    </>
  );
}

export function ButtonView({ componentId = 'button', activeTab = 'preview' }: Props) {
  if (componentId === 'button-group') {
    return <div className="comp-view"><ButtonGroupSection /></div>;
  }

  if (activeTab === 'sandbox' && componentId === 'button') {
    return (
      <div className="comp-view">
        <Section title="Interactive Sandbox" desc="Tweak props in real-time using the controls panel.">
          <ButtonSandbox />
        </Section>
      </div>
    );
  }

  if (activeTab === 'code' && componentId === 'button') {
    return (
      <div className="comp-view">
        <Section title="Import" badge="@enterprise/component-library">
          <div className="code-snippet">
            <div className="code-snippet-header">TypeScript / TSX</div>
            <pre>{`import { Button } from '@enterprise/component-library';

<Button variant="primary">Save Changes</Button>
<Button variant="danger" loading>Deleting…</Button>`}</pre>
          </div>
        </Section>
      </div>
    );
  }

  if (componentId === 'button') {
    return (
      <div className="comp-view">
        <ButtonDemos />
      </div>
    );
  }

  return (
    <div className="comp-view">
      <Section title={componentId} badge="ButtonView">
        <div className="debug-card">
          <div className="debug-card-body">
            <Button size="sm">Preview</Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
