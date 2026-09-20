import React from 'react';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
  Collapsible, CollapsibleContent, CollapsibleTrigger,
  Separator,
  ScrollArea,
  Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem,
  NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink,
  SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset,
  ResizablePanelGroup, ResizablePanel, ResizableHandle,
  Badge, Button,
} from '@enterprise/component-library';
import { Section, DebugCard, UnknownComponentSection } from './Section.js';

type Props = { componentId?: string; activeTab?: string };

export function NavigationView({ componentId = 'tabs' }: Props) {
  let section: React.ReactNode = null;

  switch (componentId) {
    case 'tabs':
      section = (
        <Section title="Tabs" desc="Categorized content panel switcher with keyboard navigation." badge="Tabs">
          <DebugCard>
            <Tabs defaultValue="architecture">
              <TabsList>
                <TabsTrigger value="architecture">Architecture</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
              </TabsList>
              <TabsContent value="architecture" style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', paddingTop: '0.5rem' }}>
                Distributed multi-package monorepo separating design tokens from components.
              </TabsContent>
              <TabsContent value="security" style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', paddingTop: '0.5rem' }}>
                Radix and Base UI handle focus traps and WCAG 2.1 AA compliance.
              </TabsContent>
              <TabsContent value="metrics" style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', paddingTop: '0.5rem' }}>
                Build time under 1s via Tailwind CSS v4.
              </TabsContent>
            </Tabs>
          </DebugCard>
        </Section>
      );
      break;

    case 'accordion':
      section = (
        <Section title="Accordion" desc="Vertically stacked collapsible disclosure panels." badge="Accordion">
          <DebugCard>
            <Accordion>
              <AccordionItem value="q1">
                <AccordionTrigger>How does multi-theme compilation work?</AccordionTrigger>
                <AccordionContent>
                  Themes merge primitives, semantic overrides, and component tokens into CSS scopes.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2">
                <AccordionTrigger>How are tokens consumed downstream?</AccordionTrigger>
                <AccordionContent>
                  Components reference semantic CSS variables for full runtime reactivity.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </DebugCard>
        </Section>
      );
      break;

    case 'breadcrumb':
      section = (
        <Section title="Breadcrumb" desc="Hierarchical navigation path indicators." badge="Breadcrumb">
          <DebugCard>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink href="#">Infrastructure</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink href="#">Clusters</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>Production West</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </DebugCard>
        </Section>
      );
      break;

    case 'pagination':
      section = (
        <Section title="Pagination" desc="Multi-page navigation controls." badge="Pagination">
          <DebugCard>
            <Pagination>
              <PaginationContent>
                <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
                <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
                <PaginationItem><PaginationEllipsis /></PaginationItem>
                <PaginationItem><PaginationLink href="#">12</PaginationLink></PaginationItem>
                <PaginationItem><PaginationNext href="#" /></PaginationItem>
              </PaginationContent>
            </Pagination>
          </DebugCard>
        </Section>
      );
      break;

    case 'collapsible':
      section = (
        <Section title="Collapsible" desc="Simple show/hide disclosure container." badge="Collapsible">
          <DebugCard>
            <Collapsible>
              <CollapsibleTrigger render={<Button size="sm" variant="secondary" className="w-full">Toggle Advanced Options ▾</Button>} />
              <CollapsibleContent>
                <div style={{ paddingTop: '0.75rem', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                  Hidden advanced options revealed on demand.
                </div>
              </CollapsibleContent>
            </Collapsible>
          </DebugCard>
        </Section>
      );
      break;

    case 'separator':
      section = (
        <Section title="Separator" desc="Horizontal and vertical divider lines." badge="Separator">
          <DebugCard>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <p style={{ margin: 0, fontSize: '0.8rem' }}>Section A</p>
              <Separator />
              <p style={{ margin: 0, fontSize: '0.8rem' }}>Section B</p>
            </div>
          </DebugCard>
        </Section>
      );
      break;

    case 'scroll-area':
      section = (
        <Section title="ScrollArea" desc="Custom styled scrollable container." badge="ScrollArea">
          <DebugCard>
            <ScrollArea style={{ height: 160, borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
              <div style={{ padding: '0.875rem', display: 'grid', gap: '0.5rem' }}>
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span>Event #{i + 1}</span>
                    <Badge variant="outline" style={{ fontSize: '0.65rem' }}>INFO</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DebugCard>
        </Section>
      );
      break;

    case 'menubar':
      section = (
        <Section title="Menubar" desc="Horizontal menu bar for desktop apps." badge="Menubar">
          <DebugCard>
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>New tab</MenubarItem>
                  <MenubarItem>Share</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>Undo</MenubarItem>
                  <MenubarItem>Redo</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </DebugCard>
        </Section>
      );
      break;

    case 'navigation-menu':
      section = (
        <Section title="NavigationMenu" desc="Site-wide navigation with mega-menu panels." badge="NavigationMenu">
          <DebugCard>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <NavigationMenuLink href="#">Platform</NavigationMenuLink>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink href="#">Docs</NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </DebugCard>
        </Section>
      );
      break;

    case 'sidebar':
      section = (
        <Section title="Sidebar" desc="Collapsible application sidebar shell." badge="Sidebar">
          <DebugCard>
            <SidebarProvider style={{ minHeight: 200 }}>
              <Sidebar collapsible="none" style={{ position: 'relative', height: 200 }}>
                <SidebarContent>
                  <SidebarGroup>
                    <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton isActive>Dashboard</SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton>Settings</SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroup>
                </SidebarContent>
              </Sidebar>
              <SidebarInset style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                Main content inset
              </SidebarInset>
            </SidebarProvider>
          </DebugCard>
        </Section>
      );
      break;

    case 'resizable':
      section = (
        <Section title="Resizable" desc="Drag handles to resize panel groups." badge="Resizable">
          <DebugCard>
            <ResizablePanelGroup style={{ minHeight: 120, border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
              <ResizablePanel defaultSize={50}>
                <div style={{ padding: '1rem', fontSize: '0.8rem' }}>Panel A</div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50}>
                <div style={{ padding: '1rem', fontSize: '0.8rem' }}>Panel B</div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </DebugCard>
        </Section>
      );
      break;

    default:
      section = (
        <UnknownComponentSection componentId={componentId}>
          <Button size="sm" variant="secondary">Navigation preview</Button>
        </UnknownComponentSection>
      );
  }

  return <div className="comp-view">{section}</div>;
}
