import React from 'react';
import {
  Badge, Button, Card, CardContent, CardHeader, CardTitle, Separator,
} from '@enterprise/component-library';

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

const BLUE_SHADES = ['blue-50','blue-100','blue-200','blue-300','blue-400','blue-500','blue-600','blue-700','blue-800','blue-900'];
const SLATE_SHADES = ['slate-50','slate-100','slate-200','slate-300','slate-400','slate-500','slate-600','slate-700','slate-800','slate-900'];
const EMERALD_SHADES = ['emerald-50','emerald-100','emerald-200','emerald-300','emerald-400','emerald-500','emerald-600','emerald-700','emerald-800','emerald-900'];
const RED_SHADES = ['red-50','red-100','red-200','red-300','red-400','red-500','red-600','red-700','red-800','red-900'];
const AMBER_SHADES = ['amber-50','amber-100','amber-200','amber-300','amber-400','amber-500','amber-600','amber-700','amber-800','amber-900'];

const SEMANTIC_VARS = [
  { name: '--background', label: 'background' },
  { name: '--foreground', label: 'foreground' },
  { name: '--card', label: 'card' },
  { name: '--card-foreground', label: 'card-fg' },
  { name: '--primary', label: 'primary' },
  { name: '--primary-foreground', label: 'primary-fg' },
  { name: '--secondary', label: 'secondary' },
  { name: '--secondary-foreground', label: 'secondary-fg' },
  { name: '--muted', label: 'muted' },
  { name: '--muted-foreground', label: 'muted-fg' },
  { name: '--accent', label: 'accent' },
  { name: '--border', label: 'border' },
  { name: '--destructive', label: 'destructive' },
  { name: '--ring', label: 'ring' },
];

const SPACING_STEPS = [
  { token: 'space-1', value: '4px' },
  { token: 'space-2', value: '8px' },
  { token: 'space-3', value: '12px' },
  { token: 'space-4', value: '16px' },
  { token: 'space-6', value: '24px' },
  { token: 'space-8', value: '32px' },
  { token: 'space-12', value: '48px' },
  { token: 'space-16', value: '64px' },
];
const RADII_STEPS = [
  { token: 'radius-sm', value: '0.25rem', cls: 'rounded-sm' },
  { token: 'radius-md', value: '0.375rem', cls: 'rounded-md' },
  { token: 'radius-lg', value: '0.5rem', cls: 'rounded-lg' },
  { token: 'radius-xl', value: '0.75rem', cls: 'rounded-xl' },
  { token: 'radius-2xl', value: '1rem', cls: 'rounded-2xl' },
  { token: 'radius-full', value: '9999px', cls: 'rounded-full' },
];

function ColorScale({ shades }: { shades: string[] }) {
  return (
    <div className="token-scale">
      {shades.map(s => {
        const cssVar = `--color-${s}`;
        const shade = s.split('-').pop();
        return (
          <div
            key={s}
            className="token-scale-cell"
            style={{ background: `var(${cssVar})` }}
            title={`${cssVar}`}
          >
            <span style={{
              display: 'block',
              fontSize: '0.5rem',
              textAlign: 'center',
              paddingTop: '0.25rem',
              color: Number(shade) >= 500 ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
              fontFamily: 'monospace',
              lineHeight: 1,
            }}>{shade}</span>
          </div>
        );
      })}
    </div>
  );
}

export function TokensView({ activeTab }: { activeTab: string }) {
  return (
    <div className="comp-view">

      {/* Semantic Tokens */}
      <Section title="Semantic Color Tokens" desc="Live CSS variables that react to theme changes." badge="CSS Variables">
        <div className="debug-card">
          <div className="debug-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem' }}>
              {SEMANTIC_VARS.map(sv => (
                <div key={sv.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '100%', height: '2.25rem', borderRadius: '0.375rem', background: `var(${sv.name})`, border: '1px solid var(--border)' }} />
                  <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>{sv.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Color Primitives */}
      <Section title="Color Primitives" desc="Brand blue, neutral slate, semantic emerald/red/amber scales." badge="Primitive Colors">
        <div className="debug-card">
          <div className="debug-card-body" style={{ display: 'grid', gap: '0.625rem' }}>
            <div>
              <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--muted-foreground)', display: 'block', marginBottom: '0.25rem' }}>Blue (Brand)</span>
              <ColorScale shades={BLUE_SHADES} />
            </div>
            <div>
              <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--muted-foreground)', display: 'block', marginBottom: '0.25rem' }}>Slate (Neutral)</span>
              <ColorScale shades={SLATE_SHADES} />
            </div>
            <div>
              <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--muted-foreground)', display: 'block', marginBottom: '0.25rem' }}>Emerald (Success)</span>
              <ColorScale shades={EMERALD_SHADES} />
            </div>
            <div>
              <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--muted-foreground)', display: 'block', marginBottom: '0.25rem' }}>Red (Danger)</span>
              <ColorScale shades={RED_SHADES} />
            </div>
            <div>
              <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--muted-foreground)', display: 'block', marginBottom: '0.25rem' }}>Amber (Warning)</span>
              <ColorScale shades={AMBER_SHADES} />
            </div>
          </div>
        </div>
      </Section>

      {/* Spacing */}
      <Section title="Spacing Scale" desc="8pt grid system spacing tokens." badge="8pt Grid">
        <div className="debug-card">
          <div className="debug-card-body">
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {SPACING_STEPS.map(s => (
                <div key={s.token} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--muted-foreground)', width: '5rem' }}>{s.token}</span>
                  <div style={{ height: '1.25rem', background: 'var(--primary)', opacity: 0.25, borderRadius: '2px', width: s.value, border: '1px solid var(--primary)' }} />
                  <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Radii */}
      <Section title="Border Radius Scale" desc="Design system border radius tokens." badge="radius">
        <div className="debug-card">
          <div className="debug-card-body">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'flex-end' }}>
              {RADII_STEPS.map(r => (
                <div key={r.token} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    background: 'color-mix(in oklch, var(--primary) 20%, transparent)',
                    border: '2px solid var(--primary)',
                    borderRadius: r.value,
                  }} />
                  <span style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: 'var(--muted-foreground)' }}>{r.token}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: 'var(--foreground)' }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Theme scopes */}
      <Section title="Theme Selectors" desc="Generated CSS data-theme attribute scopes." badge="4 Themes">
        <div className="debug-card">
          <div className="debug-card-body" style={{ display: 'grid', gap: '0.5rem' }}>
            {[
              { selector: ':root, [data-theme="light"]', label: 'Light (Default)', badge: 'Default' },
              { selector: '[data-theme="dark"]', label: 'Dark Mode', badge: 'Dark' },
              { selector: '[data-theme="hc-light"]', label: 'High-Contrast Light', badge: 'A11y' },
              { selector: '[data-theme="hc-dark"]', label: 'High-Contrast Dark', badge: 'A11y' },
            ].map(t => (
              <div key={t.selector} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', background: 'var(--muted)', gap: '0.75rem' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--foreground)', fontWeight: 600 }}>{t.selector}</span>
                <Badge variant="outline">{t.badge}</Badge>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
