import React from 'react';
import {
  Header, Footer, Hero, PageHeader,
  Button,
} from '@enterprise/component-library';
import { Section, UnknownComponentSection } from './Section.js';

type Props = { componentId?: string; activeTab?: string };

export function LayoutView({ componentId = 'header' }: Props) {
  let section: React.ReactNode = null;

  switch (componentId) {
    case 'header':
      section = (
        <Section title="Header" desc="Global top navigation with search, theme switcher, and user dropdown." badge="layout/Header.tsx">
          <div className="debug-card" style={{ overflow: 'hidden' }}>
            <Header title="Enterprise Design System" currentTheme="light" onThemeChange={() => {}} />
          </div>
        </Section>
      );
      break;

    case 'hero':
      section = (
        <Section title="Hero" desc="High-impact enterprise hero banner with CTAs and metric highlights." badge="layout/Hero.tsx">
          <div className="debug-card" style={{ overflow: 'hidden' }}>
            <Hero
              title="Enterprise-Grade Component Infrastructure"
              subtitle="Explore standardized, accessible UI primitives styled with DTCG design tokens."
              onExploreClick={() => {}}
              onDocsClick={() => {}}
            />
          </div>
        </Section>
      );
      break;

    case 'page-header':
      section = (
        <Section title="PageHeader" desc="Structured page title with breadcrumbs and action buttons." badge="layout/PageHeader.tsx">
          <div className="debug-card" style={{ overflow: 'hidden' }}>
            <PageHeader
              title="Component Explorer & Verification Workbench"
              description="Testing environment for design tokens and accessible component primitives."
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
      );
      break;

    case 'footer':
      section = (
        <Section title="Footer" desc="Enterprise footer with multi-column links, status indicators, and copyright." badge="layout/Footer.tsx">
          <div className="debug-card" style={{ overflow: 'hidden' }}>
            <Footer />
          </div>
        </Section>
      );
      break;

    default:
      section = (
        <UnknownComponentSection componentId={componentId}>
          <p style={{ margin: 0, fontSize: '0.8rem' }}>Layout shell preview</p>
        </UnknownComponentSection>
      );
  }

  return <div className="comp-view">{section}</div>;
}
