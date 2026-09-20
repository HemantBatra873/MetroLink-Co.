import React from 'react';
import {
  H1, H2, P, Lead, Muted,
} from '@enterprise/component-library';
import { Section } from './Section.js';

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
  { name: '--destructive-foreground', label: 'destructive-fg' },
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
  { token: 'radius-sm', value: '0.25rem' },
  { token: 'radius-md', value: '0.375rem' },
  { token: 'radius-lg', value: '0.5rem' },
  { token: 'radius-xl', value: '0.75rem' },
  { token: 'radius-2xl', value: '1rem' },
  { token: 'radius-full', value: '9999px' },
];

const GRADIENTS = [
  { token: '--gradient-brand', label: 'brand' },
  { token: '--gradient-brand-soft', label: 'brand-soft' },
  { token: '--gradient-ocean', label: 'ocean' },
  { token: '--gradient-sunset', label: 'sunset' },
  { token: '--gradient-aurora', label: 'aurora' },
  { token: '--gradient-slate', label: 'slate' },
  { token: '--gradient-midnight', label: 'midnight' },
  { token: '--gradient-mesh', label: 'mesh' },
];

const FONTS = [
  { id: 'Inter', sample: 'Inter — enterprise UI default', family: "'Inter', ui-sans-serif, system-ui, sans-serif", token: '--font-stack-inter' },
  { id: 'IBM Plex Sans', sample: 'IBM Plex Sans — product & documentation', family: "'IBM Plex Sans', 'Segoe UI', sans-serif", token: '--font-stack-ibm-plex' },
  { id: 'Plus Jakarta Sans', sample: 'Plus Jakarta Sans — display & marketing', family: "'Plus Jakarta Sans', 'Inter', sans-serif", token: '--font-stack-plus-jakarta' },
  { id: 'JetBrains Mono', sample: 'JetBrains Mono — code & tokens', family: "'JetBrains Mono', ui-monospace, monospace", token: '--font-family-mono' },
];

function ColorScale({ shades }: { shades: string[] }) {
  return (
    <div className="token-scale">
      {shades.map((s) => {
        const cssVar = `--color-${s}`;
        const shade = s.split('-').pop();
        return (
          <div key={s} className="token-scale-cell" style={{ background: `var(${cssVar})` }} title={cssVar}>
            <span style={{
              display: 'block', fontSize: '0.5rem', textAlign: 'center', paddingTop: '0.25rem',
              color: Number(shade) >= 500 ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
              fontFamily: 'var(--font-mono)', lineHeight: 1,
            }}>{shade}</span>
          </div>
        );
      })}
    </div>
  );
}

function ColorsSection() {
  return (
    <>
      <Section title="Semantic Color Tokens" desc="Live CSS variables that react to theme and Brand overrides." badge="CSS Variables">
        <div className="debug-card">
          <div className="debug-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem' }}>
              {SEMANTIC_VARS.map((sv) => (
                <div key={sv.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '100%', height: '2.25rem', borderRadius: '0.375rem', background: `var(${sv.name})`, border: '1px solid var(--border)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>{sv.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Color Primitives" desc="Only design-system palette scales — no off-token colors." badge="Primitive Colors">
        <div className="debug-card">
          <div className="debug-card-body" style={{ display: 'grid', gap: '0.625rem' }}>
            {[
              ['Blue (Brand)', BLUE_SHADES],
              ['Slate (Neutral)', SLATE_SHADES],
              ['Emerald (Success)', EMERALD_SHADES],
              ['Red (Danger)', RED_SHADES],
              ['Amber (Warning)', AMBER_SHADES],
            ].map(([label, shades]) => (
              <div key={label as string}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted-foreground)', display: 'block', marginBottom: '0.25rem' }}>{label as string}</span>
                <ColorScale shades={shades as string[]} />
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Spacing Scale" desc="8pt grid system spacing tokens." badge="8pt Grid">
        <div className="debug-card">
          <div className="debug-card-body">
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {SPACING_STEPS.map((s) => (
                <div key={s.token} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted-foreground)', width: '5rem' }}>{s.token}</span>
                  <div style={{ height: '1.25rem', background: 'var(--primary)', opacity: 0.25, borderRadius: '2px', width: s.value, border: '1px solid var(--primary)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Border Radius Scale" desc="Design system border radius tokens." badge="radius">
        <div className="debug-card">
          <div className="debug-card-body">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'flex-end' }}>
              {RADII_STEPS.map((r) => (
                <div key={r.token} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
                  <div style={{
                    width: '3rem', height: '3rem',
                    background: 'color-mix(in srgb, var(--primary) 20%, transparent)',
                    border: '2px solid var(--primary)',
                    borderRadius: r.value,
                  }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--muted-foreground)' }}>{r.token}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

function FontsSection() {
  return (
    <>
      <Section title="Enterprise Font Stacks" desc="Switch fonts from the header toolbar — the whole playground updates via --font-family-sans." badge="3 Sans + Mono">
        <div className="debug-card">
          <div className="debug-card-body" style={{ display: 'grid', gap: '1rem' }}>
            {FONTS.map((f) => (
              <div key={f.id} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <strong style={{ color: 'var(--foreground)' }}>{f.id}</strong>
                  <code style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>{f.token}</code>
                </div>
                <p style={{ margin: 0, fontFamily: f.family, fontSize: '1.125rem', color: 'var(--foreground)' }}>{f.sample}</p>
                <p style={{ margin: '0.5rem 0 0', fontFamily: f.family, fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                  The quick brown fox jumps over the lazy dog — 0123456789
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Live Typography" desc="Uses the currently selected app font." badge="preview">
        <div className="debug-card">
          <div className="debug-card-body" style={{ display: 'grid', gap: '0.75rem' }}>
            <H1>Display heading</H1>
            <H2>Section heading</H2>
            <Lead>Lead text for supporting introductions across enterprise surfaces.</Lead>
            <P>Body copy inherits the active sans stack. Change Inter / IBM Plex / Plus Jakarta in the header to restyle the entire application.</P>
            <Muted>Muted caption · secondary metadata</Muted>
          </div>
        </div>
      </Section>
    </>
  );
}

function GradientsSection() {
  return (
    <>
      <Section title="Gradient Tokens" desc="Shared gradients for backgrounds and accents — same everywhere via CSS variables." badge="8 presets">
        <div className="debug-card">
          <div className="debug-card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {GRADIENTS.map((g) => (
              <div key={g.token} style={{ display: 'grid', gap: '0.35rem' }}>
                <div style={{
                  height: '5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border)',
                  background: `var(${g.token})`,
                }} />
                <code style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>{g.token}</code>
                <span style={{ fontSize: '0.75rem', color: 'var(--foreground)', fontWeight: 600 }}>{g.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Gradient on Text" desc="Use background-clip for branded headlines." badge="text">
        <div className="debug-card">
          <div className="debug-card-body" style={{ display: 'grid', gap: '1rem' }}>
            {['--gradient-brand', '--gradient-ocean', '--gradient-aurora', '--gradient-sunset'].map((token) => (
              <div
                key={token}
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-family-display, var(--font-sans))',
                  backgroundImage: `var(${token})`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Gradient headline · {token.replace('--gradient-', '')}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Gradient Backgrounds" desc="Surface treatments using token gradients only." badge="background">
        <div className="debug-card">
          <div className="debug-card-body" style={{ display: 'grid', gap: '0.75rem' }}>
            {['--gradient-brand-soft', '--gradient-mesh', '--gradient-midnight'].map((token) => (
              <div
                key={token}
                style={{
                  padding: '1.25rem',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--border)',
                  background: `var(${token})`,
                  color: token.includes('midnight') ? 'var(--color-slate-50)' : 'var(--foreground)',
                }}
              >
                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Panel on {token}</strong>
                <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>Token-only fill — no ad-hoc hex values.</span>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}

export function TokensView({
  activeTab: _activeTab,
  section = 'tokens',
}: {
  activeTab?: string;
  section?: 'tokens' | 'fonts' | 'gradients' | string;
}) {
  return (
    <div className="comp-view">
      {section === 'fonts' && <FontsSection />}
      {section === 'gradients' && <GradientsSection />}
      {(section === 'tokens' || !['fonts', 'gradients'].includes(section)) && <ColorsSection />}
    </div>
  );
}
