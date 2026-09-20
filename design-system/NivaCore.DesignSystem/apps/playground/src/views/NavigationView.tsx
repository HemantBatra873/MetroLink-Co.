import React from 'react';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
  Collapsible, CollapsibleContent, CollapsibleTrigger,
  Separator,
  ScrollArea,
  Badge, Button,
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

export function NavigationView({ activeTab }: { activeTab: string }) {
  return (
    <div className="comp-view">

      {/* Tabs */}
      <Section title="Tabs" desc="Categorized content panel switcher with keyboard navigation." badge="Tabs">
        <div className="debug-card">
          <div className="debug-card-body" style={{ display: 'grid', gap: '1.25rem' }}>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>Default tabs</p>
              <Tabs defaultValue="architecture">
                <TabsList>
                  <TabsTrigger value="architecture">Architecture</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                </TabsList>
                <TabsContent value="architecture" style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', paddingTop: '0.5rem' }}>
                  Distributed multi-package monorepo separating design tokens from consumer components.
                </TabsContent>
                <TabsContent value="security" style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', paddingTop: '0.5rem' }}>
                  Zero external runtime tracking; Radix and Base UI handle focus traps and WCAG 2.1 AA compliance.
                </TabsContent>
                <TabsContent value="metrics" style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', paddingTop: '0.5rem' }}>
                  Build time &lt; 1s via Tailwind CSS v4 lightning engine. Bundle size 195 kB gzipped.
                </TabsContent>
              </Tabs>
            </div>
            <Separator />
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>Full-width grid tabs</p>
              <Tabs defaultValue="tab1">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="tab1">Overview</TabsTrigger>
                  <TabsTrigger value="tab2">Logs</TabsTrigger>
                  <TabsTrigger value="tab3">Metrics</TabsTrigger>
                  <TabsTrigger value="tab4">Alerts</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1" style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', paddingTop: '0.5rem' }}>Overview content</TabsContent>
                <TabsContent value="tab2" style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', paddingTop: '0.5rem' }}>Logs content</TabsContent>
                <TabsContent value="tab3" style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', paddingTop: '0.5rem' }}>Metrics content</TabsContent>
                <TabsContent value="tab4" style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', paddingTop: '0.5rem' }}>Alerts content</TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </Section>

      {/* Accordion */}
      <Section title="Accordion" desc="Vertically stacked collapsible disclosure panels." badge="Accordion">
        <div className="debug-card">
          <div className="debug-card-body">
            <Accordion>
              <AccordionItem value="q1">
                <AccordionTrigger>How does multi-theme compilation work?</AccordionTrigger>
                <AccordionContent>
                  The build script merges primitives, semantic overrides, and component tokens into individual CSS theme scopes (<code>:root</code>, <code>[data-theme="dark"]</code>, <code>[data-theme="hc-light"]</code>, <code>[data-theme="hc-dark"]</code>).
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2">
                <AccordionTrigger>How are tokens consumed downstream?</AccordionTrigger>
                <AccordionContent>
                  Components reference semantic CSS variables (e.g. <code>var(--semantic-color-action-primary)</code>), guaranteeing full reactivity when <code>data-theme</code> attributes change at runtime.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q3">
                <AccordionTrigger>What accessibility standards are met?</AccordionTrigger>
                <AccordionContent>
                  All interactive components meet WCAG 2.1 AA contrast ratios, support keyboard navigation with visible focus rings, and include proper ARIA attributes via Radix UI and Base UI primitives.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </Section>

      {/* Breadcrumb */}
      <Section title="Breadcrumb" desc="Hierarchical navigation path indicators." badge="Breadcrumb">
        <div className="debug-card">
          <div className="debug-card-body" style={{ display: 'grid', gap: '0.875rem' }}>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink href="#">Infrastructure</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink href="#">Clusters</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>Production West</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink href="#">Settings</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink href="#">Security</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink href="#">API Keys</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>prod-key-01</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </Section>

      {/* Pagination */}
      <Section title="Pagination" desc="Multi-page navigation controls with previous, next, and ellipsis." badge="Pagination">
        <div className="debug-card">
          <div className="debug-card-body" style={{ display: 'grid', gap: '1rem' }}>
            <Pagination>
              <PaginationContent>
                <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
                <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
                <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
                <PaginationItem><PaginationEllipsis /></PaginationItem>
                <PaginationItem><PaginationLink href="#">12</PaginationLink></PaginationItem>
                <PaginationItem><PaginationNext href="#" /></PaginationItem>
              </PaginationContent>
            </Pagination>
            <Pagination>
              <PaginationContent>
                <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
                <PaginationItem><PaginationEllipsis /></PaginationItem>
                <PaginationItem><PaginationLink href="#">4</PaginationLink></PaginationItem>
                <PaginationItem><PaginationLink href="#" isActive>5</PaginationLink></PaginationItem>
                <PaginationItem><PaginationLink href="#">6</PaginationLink></PaginationItem>
                <PaginationItem><PaginationEllipsis /></PaginationItem>
                <PaginationItem><PaginationLink href="#">12</PaginationLink></PaginationItem>
                <PaginationItem><PaginationNext href="#" /></PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </Section>

      {/* Collapsible & Separator */}
      <Section title="Collapsible & Separator" desc="Simple show/hide disclosure container and visual dividers." badge="Collapsible / Separator">
        <div className="debug-grid-2">
          <div className="debug-card">
            <div className="debug-card-header">
              <p className="debug-card-title">Collapsible</p>
            </div>
            <div className="debug-card-body">
              <Collapsible>
                <CollapsibleTrigger render={<Button size="sm" variant="secondary" className="w-full">Toggle Advanced Options ▾</Button>} />
                <CollapsibleContent>
                  <div style={{ paddingTop: '0.75rem', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                    <p style={{ margin: 0 }}>These are hidden advanced options that are revealed on demand. Useful for progressive disclosure patterns.</p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
          <div className="debug-card">
            <div className="debug-card-header">
              <p className="debug-card-title">Separator</p>
            </div>
            <div className="debug-card-body" style={{ display: 'grid', gap: '0.75rem' }}>
              <p style={{ margin: 0, fontSize: '0.8rem' }}>Section A content</p>
              <Separator />
              <p style={{ margin: 0, fontSize: '0.8rem' }}>Section B content</p>
              <Separator />
              <p style={{ margin: 0, fontSize: '0.8rem' }}>Section C content</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ScrollArea */}
      <Section title="ScrollArea" desc="Custom styled scrollable container." badge="ScrollArea">
        <div className="debug-card">
          <div className="debug-card-body">
            <ScrollArea style={{ height: 200, borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
              <div style={{ padding: '0.875rem', display: 'grid', gap: '0.5rem' }}>
                {Array.from({ length: 20 }, (_, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.375rem 0', borderBottom: '1px solid var(--border)' }}>
                    <span>Service event #{i + 1}</span>
                    <Badge variant="outline" style={{ fontSize: '0.65rem' }}>INFO</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </Section>
    </div>
  );
}
