import React from 'react';
import {
  Calendar,
  DatePicker,
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,
  Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem,
  DirectionProvider,
  Questionnaire, QuestionnaireItem, QuestionnaireTitle, QuestionnaireChoices, QuestionnaireChoice, QuestionnaireActions, QuestionnaireNext,
  DataTable,
  Typography,
  Attachment, AttachmentMedia, AttachmentContent, AttachmentTitle,
  Field, FieldLabel, FieldDescription, FieldGroup, Input,
  InputGroup, InputGroupAddon, InputGroupInput, Search,
  Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem,
  ChartContainer, ChartTooltip, ChartTooltipContent,
  AspectRatio,
  Item, ItemMedia, ItemContent, ItemTitle, ItemDescription,
  Marker, MarkerContent,
  Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem,
  NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink,
  Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose,
  ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem,
  Toaster, toast,
  ResizablePanelGroup, ResizablePanel, ResizableHandle,
  SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset,
  MessageScroller, MessageScrollerViewport, MessageScrollerContent, MessageScrollerButton,
  Bubble, BubbleContent,
  Button,
  FileText,
} from '@enterprise/component-library';
import { Bar, BarChart, XAxis } from 'recharts';
import { Section, DebugCard, UnknownComponentSection } from './Section.js';

type Props = { componentId?: string; activeTab?: string };

const chartData = [{ name: 'A', value: 40 }, { name: 'B', value: 65 }];
const tableData = [{ service: 'auth-api', region: 'us-east-1', status: 'Healthy' }];

export function ExtraComponentsView({ componentId = 'calendar' }: Props) {
  let section: React.ReactNode = null;

  switch (componentId) {
    case 'calendar':
      section = (
        <Section title="Calendar" desc="Date grid for picking days and ranges." badge="Calendar">
          <DebugCard>
            <Calendar mode="single" className="rounded-lg border" />
          </DebugCard>
        </Section>
      );
      break;

    case 'date-picker':
      section = (
        <Section title="DatePicker" desc="Popover trigger with calendar popup." badge="DatePicker">
          <DebugCard>
            <DatePicker defaultDate={new Date()} />
          </DebugCard>
        </Section>
      );
      break;

    case 'carousel':
      section = (
        <Section title="Carousel" desc="Embla-powered slide carousel." badge="Carousel">
          <DebugCard>
            <Carousel className="max-w-xs">
              <CarouselContent>
                {[1, 2, 3].map(n => (
                  <CarouselItem key={n}>
                    <div style={{ padding: '2rem', background: 'var(--muted)', borderRadius: '0.5rem', textAlign: 'center', fontSize: '0.8rem' }}>
                      Slide {n}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </DebugCard>
        </Section>
      );
      break;

    case 'command':
      section = (
        <Section title="Command" desc="Command palette search surface." badge="Command">
          <DebugCard>
            <Command className="max-w-md border rounded-lg">
              <CommandInput placeholder="Search commands…" />
              <CommandList>
                <CommandEmpty>No results.</CommandEmpty>
                <CommandGroup heading="Actions">
                  <CommandItem>Deploy to staging</CommandItem>
                  <CommandItem>Rotate API keys</CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </DebugCard>
        </Section>
      );
      break;

    case 'direction':
      section = (
        <Section title="Direction" desc="RTL/LTR direction provider." badge="DirectionProvider">
          <DebugCard>
            <DirectionProvider direction="rtl">
              <p style={{ margin: 0, fontSize: '0.8rem' }}>RTL layout — text flows right-to-left.</p>
            </DirectionProvider>
          </DebugCard>
        </Section>
      );
      break;

    case 'questionnaire':
      section = (
        <Section title="Questionnaire" desc="Multi-step survey flow." badge="Questionnaire">
          <DebugCard>
            <Questionnaire style={{ maxWidth: 420 }}>
              <QuestionnaireItem name="role">
                <QuestionnaireTitle>What is your primary role?</QuestionnaireTitle>
                <QuestionnaireChoices>
                  <QuestionnaireChoice value="eng">Engineering</QuestionnaireChoice>
                  <QuestionnaireChoice value="design">Design</QuestionnaireChoice>
                </QuestionnaireChoices>
                <QuestionnaireActions>
                  <QuestionnaireNext />
                </QuestionnaireActions>
              </QuestionnaireItem>
            </Questionnaire>
          </DebugCard>
        </Section>
      );
      break;

    case 'data-table':
      section = (
        <Section title="DataTable" desc="Column-driven table with empty state." badge="DataTable">
          <DebugCard>
            <DataTable
              columns={[
                { key: 'service', header: 'Service' },
                { key: 'region', header: 'Region' },
                { key: 'status', header: 'Status' },
              ]}
              data={tableData}
            />
          </DebugCard>
        </Section>
      );
      break;

    case 'typography':
      section = (
        <Section title="Typography" desc="Semantic heading and body styles." badge="Typography">
          <DebugCard>
            <div style={{ display: 'grid', gap: '0.5rem', maxWidth: 520 }}>
              <Typography.H1>Heading 1</Typography.H1>
              <Typography.H2>Heading 2</Typography.H2>
              <Typography.H3>Heading 3</Typography.H3>
              <Typography.Lead>Lead paragraph for intros.</Typography.Lead>
              <Typography.P>Body paragraph with default line height.</Typography.P>
              <Typography.Large>Large emphasis text</Typography.Large>
              <Typography.Small>Small caption text</Typography.Small>
              <Typography.Muted>Muted secondary copy</Typography.Muted>
              <Typography.Blockquote>Blockquote for callouts.</Typography.Blockquote>
              <Typography.P>Inline <Typography.InlineCode>code</Typography.InlineCode> snippet.</Typography.P>
            </div>
          </DebugCard>
        </Section>
      );
      break;

    case 'attachment':
      section = (
        <Section title="Attachment" desc="File attachment chip." badge="Attachment">
          <DebugCard>
            <Attachment>
              <AttachmentMedia variant="icon"><FileText className="h-4 w-4" /></AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>spec.pdf</AttachmentTitle>
              </AttachmentContent>
            </Attachment>
          </DebugCard>
        </Section>
      );
      break;

    case 'field':
      section = (
        <Section title="Field" desc="Label + control + helper layout." badge="Field">
          <DebugCard>
            <FieldGroup style={{ maxWidth: 360 }}>
              <Field>
                <FieldLabel htmlFor="ex-field">Tenant ID</FieldLabel>
                <Input id="ex-field" placeholder="tenant_…" />
                <FieldDescription>Used for billing isolation.</FieldDescription>
              </Field>
            </FieldGroup>
          </DebugCard>
        </Section>
      );
      break;

    case 'input-group':
      section = (
        <Section title="InputGroup" desc="Grouped input with addons." badge="InputGroup">
          <DebugCard>
            <InputGroup style={{ maxWidth: 320 }}>
              <InputGroupAddon><Search className="h-4 w-4" /></InputGroupAddon>
              <InputGroupInput placeholder="Filter…" />
            </InputGroup>
          </DebugCard>
        </Section>
      );
      break;

    case 'combobox':
      section = (
        <Section title="Combobox" desc="Filterable select." badge="Combobox">
          <DebugCard>
            <div style={{ maxWidth: 320 }}>
              <Combobox defaultValue="alpha">
                <ComboboxInput placeholder="Pick…" />
                <ComboboxContent>
                  <ComboboxList>
                    <ComboboxItem value="alpha">Alpha</ComboboxItem>
                    <ComboboxItem value="beta">Beta</ComboboxItem>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          </DebugCard>
        </Section>
      );
      break;

    case 'chart':
      section = (
        <Section title="Chart" desc="Themed Recharts container." badge="Chart">
          <DebugCard>
            <ChartContainer config={{ value: { label: 'Value', color: 'var(--chart-1)' } }} className="max-w-sm">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={4} />
              </BarChart>
            </ChartContainer>
          </DebugCard>
        </Section>
      );
      break;

    case 'aspect-ratio':
      section = (
        <Section title="AspectRatio" desc="Fixed ratio container." badge="AspectRatio">
          <DebugCard>
            <AspectRatio ratio={4 / 3} className="max-w-xs rounded-lg bg-muted">
              <div style={{ display: 'grid', placeItems: 'center', height: '100%', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>4:3</div>
            </AspectRatio>
          </DebugCard>
        </Section>
      );
      break;

    case 'item':
      section = (
        <Section title="Item" desc="Structured list row." badge="Item">
          <DebugCard>
            <Item variant="outline" style={{ maxWidth: 400 }}>
              <ItemMedia variant="icon"><FileText className="h-4 w-4" /></ItemMedia>
              <ItemContent>
                <ItemTitle>Item title</ItemTitle>
                <ItemDescription>Supporting description</ItemDescription>
              </ItemContent>
            </Item>
          </DebugCard>
        </Section>
      );
      break;

    case 'marker':
      section = (
        <Section title="Marker" desc="Timeline / list marker." badge="Marker">
          <DebugCard>
            <Marker variant="separator"><MarkerContent>Marker label</MarkerContent></Marker>
          </DebugCard>
        </Section>
      );
      break;

    case 'menubar':
      section = (
        <Section title="Menubar" desc="Desktop menu bar." badge="Menubar">
          <DebugCard>
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent><MenubarItem>New</MenubarItem></MenubarContent>
              </MenubarMenu>
            </Menubar>
          </DebugCard>
        </Section>
      );
      break;

    case 'navigation-menu':
      section = (
        <Section title="NavigationMenu" desc="Site navigation." badge="NavigationMenu">
          <DebugCard>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink href="#">Docs</NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </DebugCard>
        </Section>
      );
      break;

    case 'drawer':
      section = (
        <Section title="Drawer" desc="Bottom sheet drawer." badge="Drawer">
          <DebugCard>
            <Drawer>
              <DrawerTrigger render={<Button size="sm">Open</Button>} />
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Drawer</DrawerTitle>
                  <DrawerDescription>Swipe to dismiss.</DrawerDescription>
                </DrawerHeader>
                <DrawerClose render={<Button variant="secondary" size="sm">Close</Button>} />
              </DrawerContent>
            </Drawer>
          </DebugCard>
        </Section>
      );
      break;

    case 'context-menu':
      section = (
        <Section title="ContextMenu" desc="Right-click menu." badge="ContextMenu">
          <DebugCard>
            <ContextMenu>
              <ContextMenuTrigger render={<div style={{ padding: '1.5rem', border: '1px dashed var(--border)', borderRadius: 8, fontSize: '0.8rem', textAlign: 'center' }}>Right-click</div>} />
              <ContextMenuContent>
                <ContextMenuItem>Edit</ContextMenuItem>
                <ContextMenuItem>Duplicate</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </DebugCard>
        </Section>
      );
      break;

    case 'toast':
      section = (
        <Section title="Toast" desc="Toast notifications." badge="Toast">
          <DebugCard>
            <Toaster>
              <Button size="sm" onClick={() => toast.add({ title: 'Saved', type: 'success' })}>Show toast</Button>
            </Toaster>
          </DebugCard>
        </Section>
      );
      break;

    case 'resizable':
      section = (
        <Section title="Resizable" desc="Resizable panels." badge="Resizable">
          <DebugCard>
            <ResizablePanelGroup style={{ minHeight: 100, border: '1px solid var(--border)', borderRadius: 8 }}>
              <ResizablePanel defaultSize={50}><div style={{ padding: 8, fontSize: '0.8rem' }}>A</div></ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={50}><div style={{ padding: 8, fontSize: '0.8rem' }}>B</div></ResizablePanel>
            </ResizablePanelGroup>
          </DebugCard>
        </Section>
      );
      break;

    case 'sidebar':
      section = (
        <Section title="Sidebar" desc="App sidebar layout." badge="Sidebar">
          <DebugCard>
            <SidebarProvider style={{ minHeight: 160 }}>
              <Sidebar collapsible="none" style={{ position: 'relative', height: 160 }}>
                <SidebarContent>
                  <SidebarGroup>
                    <SidebarGroupLabel>Nav</SidebarGroupLabel>
                    <SidebarMenu>
                      <SidebarMenuItem><SidebarMenuButton isActive>Home</SidebarMenuButton></SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroup>
                </SidebarContent>
              </Sidebar>
              <SidebarInset style={{ padding: 12, fontSize: '0.8rem' }}>Content</SidebarInset>
            </SidebarProvider>
          </DebugCard>
        </Section>
      );
      break;

    case 'message-scroller':
      section = (
        <Section title="MessageScroller" desc="Chat scroll viewport." badge="MessageScroller">
          <DebugCard>
            <MessageScroller style={{ height: 160, border: '1px solid var(--border)', borderRadius: 8 }}>
              <MessageScrollerViewport>
                <MessageScrollerContent style={{ padding: 8, display: 'grid', gap: 4 }}>
                  <Bubble variant="default"><BubbleContent>Hello</BubbleContent></Bubble>
                  <Bubble variant="secondary"><BubbleContent>Hi there</BubbleContent></Bubble>
                </MessageScrollerContent>
                <MessageScrollerButton direction="end" />
              </MessageScrollerViewport>
            </MessageScroller>
          </DebugCard>
        </Section>
      );
      break;

    default:
      section = <UnknownComponentSection componentId={componentId} />;
  }

  return <div className="comp-view">{section}</div>;
}
