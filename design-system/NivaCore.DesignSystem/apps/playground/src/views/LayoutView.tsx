import React from 'react';
import {
  Header, Footer, Hero, PageHeader,
  Badge, Button, Card, CardContent, CardHeader, CardTitle, CardDescription,
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

export function LayoutView({ activeTab }: { activeTab: string }) {
  return (
    <div className="comp-view">

      <Section title="Header" desc="Global top navigation with search, theme switcher, and user dropdown." badge="layout/Header.tsx">
        <div className="debug-card" style={{ overflow: 'hidden' }}>
          <Header title="Enterprise Design System" currentTheme="light" onThemeChange={() => {}} />
        </div>
      </Section>

      <Section title="Hero" desc="High-impact enterprise hero banner with CTAs and metric highlights." badge="layout/Hero.tsx">
        <div className="debug-card" style={{ overflow: 'hidden' }}>
          <Hero
            title="Enterprise-Grade Component Infrastructure"
            subtitle="Explore standardized, accessible UI primitives styled with DTCG design tokens. Seamlessly switch between Light, Dark, and High-Contrast themes."
            onExploreClick={() => {}}
            onDocsClick={() => {}}
          />
        </div>
      </Section>

      <Section title="PageHeader" desc="Structured page title with breadcrumbs and action buttons." badge="layout/PageHeader.tsx">
        <div className="debug-card" style={{ overflow: 'hidden' }}>
          <PageHeader
            title="Component Explorer & Verification Workbench"
            description="Comprehensive testing environment for DTCG design tokens, global layout shells, and 60+ accessible component primitives."
            breadcrumbs={[
              { label: 'Enterprise Design System', href: '#' },
              { label: 'Component Explorer' },
            ]}
            actions={
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Button size="sm" variant="secondary">Export</Button>
                <Button size="sm">Deploy</Button>
              </div>
            }
          />
        </div>
      </Section>

      <Section title="Footer" desc="Enterprise footer with multi-column links, status indicators, and copyright." badge="layout/Footer.tsx">
        <div className="debug-card" style={{ overflow: 'hidden' }}>
          <Footer />
        </div>
      </Section>

    </div>
  );
}
