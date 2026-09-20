import React from 'react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Badge,
  Alert, AlertTitle, AlertDescription,
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
  Progress,
  Spinner,
  Skeleton,
  Avatar, AvatarImage, AvatarFallback,
  Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription,
  Kbd,
  Button,
  CheckCircle2, FolderOpen, Info, ShieldCheck, ShieldAlert,
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

export function DataDisplayView({ activeTab }: { activeTab: string }) {
  return (
    <div className="comp-view">

      {/* Badge */}
      <Section title="Badge" desc="Visual status indicator tags with multiple variant styles." badge="Badge">
        <div className="debug-card">
          <div className="debug-card-body">
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
              <div className="variant-matrix-row">
                <span className="variant-matrix-label">use cases</span>
                <div className="variant-row">
                  <Badge>Operational</Badge>
                  <Badge variant="secondary">v2.4 LTS</Badge>
                  <Badge variant="outline">FIPS 140-2</Badge>
                  <Badge variant="destructive">2 Warnings</Badge>
                  <Badge variant="secondary">Syncing</Badge>
                  <Badge>Healthy</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Alert */}
      <Section title="Alert" desc="Contextual notification banners for various severity levels." badge="Alert">
        <div className="debug-card">
          <div className="debug-card-body" style={{ display: 'grid', gap: '0.75rem' }}>
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success — Deployment Complete</AlertTitle>
              <AlertDescription>Release v2.4 was successfully promoted to production in all regions.</AlertDescription>
            </Alert>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Info — Token Aliases Resolved</AlertTitle>
              <AlertDescription>Primitives and semantic color overrides compiled without errors.</AlertDescription>
            </Alert>
            <Alert>
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Warning — High Latency Detected</AlertTitle>
              <AlertDescription>Service <Kbd>billing-portal</Kbd> is exceeding the 100ms SLA threshold.</AlertDescription>
            </Alert>
            <Alert>
              <ShieldCheck className="h-4 w-4" />
              <AlertTitle>Secure — mTLS Active</AlertTitle>
              <AlertDescription>All inter-service communication is encrypted with mutual TLS certificates.</AlertDescription>
            </Alert>
          </div>
        </div>
      </Section>

      {/* Card */}
      <Section title="Card" desc="Structured surface card with header, content, and footer zones." badge="Card">
        <div className="debug-grid-auto">
          <Card>
            <CardHeader>
              <CardTitle>Infrastructure Overview</CardTitle>
              <CardDescription>Real-time cluster telemetry for production workloads.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="variant-row" style={{ gap: '0.375rem' }}>
                <Badge>12 Nodes</Badge>
                <Badge variant="secondary">4 Regions</Badge>
                <Badge variant="outline">Multi-AZ</Badge>
              </div>
              <Progress value={84} />
              <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: 0 }}>Storage usage: 84%</p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="secondary">View Details</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Security Audit</CardTitle>
              <CardDescription>Automated compliance checks across all services.</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>FIPS 140-2</span><Badge>Compliant</Badge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>WCAG 2.1 AA</span><Badge>Compliant</Badge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>SOC 2 Type II</span><Badge variant="secondary">Pending</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Table */}
      <Section title="Table" desc="Tabular data grid with sticky headers and bordered rows." badge="Table">
        <div className="debug-card">
          <div className="debug-card-body" style={{ padding: 0 }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead>Requests/s</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: 'Core Auth API', region: 'us-east-1', latency: '18ms', rps: '4,200', status: 'Healthy' },
                  { name: 'Event Stream', region: 'eu-west-1', latency: '42ms', rps: '1,850', status: 'Syncing' },
                  { name: 'Billing Portal', region: 'us-east-1', latency: '26ms', rps: '780', status: 'Healthy' },
                  { name: 'AI Inference', region: 'ap-southeast-1', latency: '104ms', rps: '230', status: 'Warning' },
                ].map(row => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{row.region}</TableCell>
                    <TableCell style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{row.latency}</TableCell>
                    <TableCell style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{row.rps}</TableCell>
                    <TableCell>
                      <Badge variant={row.status === 'Healthy' ? 'default' : row.status === 'Warning' ? 'destructive' : 'secondary'}>
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Section>

      {/* Progress & Loaders */}
      <Section title="Progress, Spinner & Skeleton" desc="Activity indicators and loading state placeholders." badge="Progress / Spinner / Skeleton">
        <div className="debug-card">
          <div className="debug-card-body" style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {[10, 30, 55, 75, 100].map(v => (
                <div key={v} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--muted-foreground)', width: '2.5rem' }}>{v}%</span>
                  <Progress value={v} style={{ flex: 1 }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Spinner />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Skeleton className="h-24 w-36 rounded-lg" />
              <Skeleton className="h-24 w-36 rounded-lg" />
              <Skeleton className="h-24 w-36 rounded-lg" />
            </div>
          </div>
        </div>
      </Section>

      {/* Avatar */}
      <Section title="Avatar" desc="User profile representation with image fallback." badge="Avatar">
        <div className="debug-card">
          <div className="debug-card-body">
            <div className="variant-matrix-row">
              <span className="variant-matrix-label">with initials</span>
              <div className="variant-row">
                {['AB', 'CD', 'EF', 'GH', 'IJ'].map(i => (
                  <Avatar key={i}>
                    <AvatarFallback>{i}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
            <div className="variant-matrix-row" style={{ marginTop: '0.75rem' }}>
              <span className="variant-matrix-label">sizes</span>
              <div className="variant-row" style={{ alignItems: 'center' }}>
                <Avatar style={{ width: '1.5rem', height: '1.5rem' }}><AvatarFallback style={{ fontSize: '0.55rem' }}>XS</AvatarFallback></Avatar>
                <Avatar style={{ width: '2rem', height: '2rem' }}><AvatarFallback style={{ fontSize: '0.6rem' }}>SM</AvatarFallback></Avatar>
                <Avatar><AvatarFallback>MD</AvatarFallback></Avatar>
                <Avatar style={{ width: '3rem', height: '3rem' }}><AvatarFallback>LG</AvatarFallback></Avatar>
                <Avatar style={{ width: '4rem', height: '4rem' }}><AvatarFallback>XL</AvatarFallback></Avatar>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Kbd */}
      <Section title="Kbd" desc="Keyboard shortcut indicator badge." badge="Kbd">
        <div className="debug-card">
          <div className="debug-card-body">
            <div className="variant-row">
              <Kbd>⌘K</Kbd>
              <Kbd>Ctrl+S</Kbd>
              <Kbd>Enter</Kbd>
              <Kbd>Escape</Kbd>
              <Kbd>Tab</Kbd>
              <Kbd>Space</Kbd>
              <Kbd>⌘⇧P</Kbd>
            </div>
          </div>
        </div>
      </Section>

      {/* Empty */}
      <Section title="Empty State" desc="Standardized empty state with illustration and action." badge="Empty">
        <div className="debug-card" style={{ maxWidth: 400 }}>
          <div className="debug-card-body">
            <Empty className="py-6">
              <EmptyHeader>
                <EmptyMedia variant="icon"><FolderOpen className="h-6 w-6" /></EmptyMedia>
                <EmptyTitle>No Archived Artifacts</EmptyTitle>
                <EmptyDescription>All system logs are stored in live cold storage. No archived snapshots found.</EmptyDescription>
              </EmptyHeader>
              <Button size="sm" variant="secondary">Create Snapshot</Button>
            </Empty>
          </div>
        </div>
      </Section>
    </div>
  );
}
