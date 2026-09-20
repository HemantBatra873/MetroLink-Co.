import React from 'react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Badge,
  Alert, AlertTitle, AlertDescription,
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
  Progress,
  Spinner,
  Skeleton,
  Avatar, AvatarFallback,
  Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription,
  Kbd,
  Button,
  AspectRatio,
  ChartContainer, ChartTooltip, ChartTooltipContent,
  Item, ItemContent, ItemTitle, ItemDescription, ItemMedia,
  Marker, MarkerContent,
  CheckCircle2, FolderOpen, Info, ShieldCheck, ShieldAlert, FileText,
} from '@enterprise/component-library';
import { Bar, BarChart, XAxis } from 'recharts';
import { Section, DebugCard, UnknownComponentSection } from './Section.js';

type Props = { componentId?: string; activeTab?: string };

const chartData = [
  { name: 'Mon', requests: 420 },
  { name: 'Tue', requests: 380 },
  { name: 'Wed', requests: 510 },
  { name: 'Thu', requests: 470 },
];

export function DataDisplayView({ componentId = 'badge' }: Props) {
  let section: React.ReactNode = null;

  switch (componentId) {
    case 'badge':
      section = (
        <Section title="Badge" desc="Visual status indicator tags with multiple variant styles." badge="Badge">
          <DebugCard>
            <div className="variant-matrix">
              <div className="variant-matrix-row">
                <span className="variant-matrix-label">variants</span>
                <div className="variant-row">
                  <Badge>default</Badge>
                  <Badge variant="secondary">secondary</Badge>
                  <Badge variant="outline">outline</Badge>
                  <Badge variant="destructive">destructive</Badge>
                </div>
              </div>
            </div>
          </DebugCard>
        </Section>
      );
      break;

    case 'alert':
      section = (
        <Section title="Alert" desc="Contextual notification banners for various severity levels." badge="Alert">
          <DebugCard>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Success — Deployment Complete</AlertTitle>
                <AlertDescription>Release v2.4 was successfully promoted to production.</AlertDescription>
              </Alert>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Info — Token Aliases Resolved</AlertTitle>
                <AlertDescription>Semantic color overrides compiled without errors.</AlertDescription>
              </Alert>
            </div>
          </DebugCard>
        </Section>
      );
      break;

    case 'card':
      section = (
        <Section title="Card" desc="Structured surface card with header, content, and footer zones." badge="Card">
          <div className="debug-grid-auto">
            <Card>
              <CardHeader>
                <CardTitle>Infrastructure Overview</CardTitle>
                <CardDescription>Real-time cluster telemetry for production workloads.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Progress value={84} />
                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: 0 }}>Storage usage: 84%</p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="secondary">View Details</Button>
              </CardFooter>
            </Card>
          </div>
        </Section>
      );
      break;

    case 'table':
      section = (
        <Section title="Table" desc="Tabular data grid with sticky headers and bordered rows." badge="Table">
          <div className="debug-card">
            <div className="debug-card-body" style={{ padding: 0 }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Core Auth API</TableCell>
                    <TableCell>us-east-1</TableCell>
                    <TableCell><Badge>Healthy</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Event Stream</TableCell>
                    <TableCell>eu-west-1</TableCell>
                    <TableCell><Badge variant="secondary">Syncing</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </Section>
      );
      break;

    case 'progress':
      section = (
        <Section title="Progress" desc="Visual progress meter." badge="Progress">
          <DebugCard>
            <div style={{ display: 'grid', gap: '0.5rem', maxWidth: 400 }}>
              {[25, 55, 100].map(v => (
                <Progress key={v} value={v} />
              ))}
            </div>
          </DebugCard>
        </Section>
      );
      break;

    case 'spinner':
      section = (
        <Section title="Spinner" desc="Indeterminate loading indicator." badge="Spinner">
          <DebugCard>
            <Spinner />
          </DebugCard>
        </Section>
      );
      break;

    case 'skeleton':
      section = (
        <Section title="Skeleton" desc="Content placeholder shimmer." badge="Skeleton">
          <DebugCard>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-24 w-36 rounded-lg" />
            </div>
          </DebugCard>
        </Section>
      );
      break;

    case 'avatar':
      section = (
        <Section title="Avatar" desc="User profile representation with image fallback." badge="Avatar">
          <DebugCard>
            <div className="variant-row">
              {['AB', 'CD', 'EF'].map(i => (
                <Avatar key={i}><AvatarFallback>{i}</AvatarFallback></Avatar>
              ))}
            </div>
          </DebugCard>
        </Section>
      );
      break;

    case 'kbd':
      section = (
        <Section title="Kbd" desc="Keyboard shortcut indicator badge." badge="Kbd">
          <DebugCard>
            <div className="variant-row">
              <Kbd>⌘K</Kbd>
              <Kbd>Ctrl+S</Kbd>
              <Kbd>Enter</Kbd>
            </div>
          </DebugCard>
        </Section>
      );
      break;

    case 'empty':
      section = (
        <Section title="Empty State" desc="Standardized empty state with illustration and action." badge="Empty">
          <DebugCard>
            <Empty className="py-6">
              <EmptyHeader>
                <EmptyMedia variant="icon"><FolderOpen className="h-6 w-6" /></EmptyMedia>
                <EmptyTitle>No Archived Artifacts</EmptyTitle>
                <EmptyDescription>No archived snapshots found.</EmptyDescription>
              </EmptyHeader>
              <Button size="sm" variant="secondary">Create Snapshot</Button>
            </Empty>
          </DebugCard>
        </Section>
      );
      break;

    case 'chart':
      section = (
        <Section title="Chart" desc="Recharts wrapper with design-token theming." badge="Chart">
          <DebugCard>
            <ChartContainer
              config={{ requests: { label: 'Requests', color: 'var(--chart-1)' } }}
              className="max-w-md"
            >
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="requests" fill="var(--color-requests)" radius={4} />
              </BarChart>
            </ChartContainer>
          </DebugCard>
        </Section>
      );
      break;

    case 'aspect-ratio':
      section = (
        <Section title="AspectRatio" desc="Maintains width/height ratio for media." badge="AspectRatio">
          <DebugCard>
            <AspectRatio ratio={16 / 9} className="max-w-md overflow-hidden rounded-lg bg-muted">
              <div style={{ display: 'grid', placeItems: 'center', height: '100%', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                16:9 content area
              </div>
            </AspectRatio>
          </DebugCard>
        </Section>
      );
      break;

    case 'item':
      section = (
        <Section title="Item" desc="Flexible list row with media and actions." badge="Item">
          <DebugCard>
            <Item variant="outline" style={{ maxWidth: 420 }}>
              <ItemMedia variant="icon"><FileText className="h-4 w-4" /></ItemMedia>
              <ItemContent>
                <ItemTitle>audit-log-2026-03.json</ItemTitle>
                <ItemDescription>Exported 2 minutes ago · 1.2 MB</ItemDescription>
              </ItemContent>
            </Item>
          </DebugCard>
        </Section>
      );
      break;

    case 'marker':
      section = (
        <Section title="Marker" desc="Inline annotation marker for timelines and lists." badge="Marker">
          <DebugCard>
            <Marker variant="separator">
              <MarkerContent>Section divider marker</MarkerContent>
            </Marker>
          </DebugCard>
        </Section>
      );
      break;

    default:
      section = (
        <UnknownComponentSection componentId={componentId}>
          <Badge variant="outline">{componentId}</Badge>
        </UnknownComponentSection>
      );
  }

  return <div className="comp-view">{section}</div>;
}
