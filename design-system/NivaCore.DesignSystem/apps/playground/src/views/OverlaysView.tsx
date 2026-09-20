import React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose, SheetTrigger,
  Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription, PopoverTrigger,
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
  HoverCard, HoverCardContent, HoverCardTrigger,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  Button, Input, Label, Badge,
  Info,
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

export function OverlaysView({ activeTab }: { activeTab: string }) {
  return (
    <TooltipProvider>
      <div className="comp-view">

        {/* Dialog */}
        <Section title="Dialog" desc="Modal dialog overlay for focused confirmations and forms." badge="Dialog">
          <div className="debug-card">
            <div className="debug-card-body">
              <div className="variant-row">
                <Dialog>
                  <DialogTrigger render={<Button size="sm">Open Dialog</Button>} />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Deploy Enterprise Release</DialogTitle>
                      <DialogDescription>This will promote release v2.4 to the multi-region production cluster.</DialogDescription>
                    </DialogHeader>
                    <div style={{ padding: '0.5rem 0', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                      Target environment: <strong style={{ color: 'var(--foreground)' }}>AWS us-east-1 + eu-west-1</strong>
                    </div>
                    <DialogFooter>
                      <Button variant="secondary">Cancel</Button>
                      <Button>Confirm Deployment</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger render={<Button size="sm" variant="secondary">Form Dialog</Button>} />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Service Configuration</DialogTitle>
                      <DialogDescription>Update the max concurrency and timeout for billing-portal.</DialogDescription>
                    </DialogHeader>
                    <div style={{ display: 'grid', gap: '0.75rem', padding: '0.25rem 0' }}>
                      <div style={{ display: 'grid', gap: '0.25rem' }}>
                        <Label htmlFor="d-concurrency">Max Concurrency</Label>
                        <Input id="d-concurrency" defaultValue="2500" />
                      </div>
                      <div style={{ display: 'grid', gap: '0.25rem' }}>
                        <Label htmlFor="d-timeout">Heartbeat Timeout (ms)</Label>
                        <Input id="d-timeout" defaultValue="30000" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="secondary">Discard</Button>
                      <Button>Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </Section>

        {/* AlertDialog */}
        <Section title="AlertDialog" desc="High-urgency confirmation dialog for destructive actions." badge="AlertDialog">
          <div className="debug-card">
            <div className="debug-card-body">
              <div className="variant-row">
                <AlertDialog>
                  <AlertDialogTrigger render={<Button variant="danger" size="sm">Delete Cluster</Button>} />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently destroy cluster <strong>prod-core-01</strong> and all its volumes and snapshots.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Yes, delete cluster
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </Section>

        {/* Sheet */}
        <Section title="Sheet" desc="Slide-in side drawer panel for secondary configuration." badge="Sheet">
          <div className="debug-card">
            <div className="debug-card-body">
              <div className="variant-row">
                {(['right', 'left', 'bottom'] as const).map(side => (
                  <Sheet key={side}>
                    <SheetTrigger render={<Button size="sm" variant="secondary">Sheet from {side}</Button>} />
                    <SheetContent side={side}>
                      <SheetHeader>
                        <SheetTitle>Environment Settings</SheetTitle>
                        <SheetDescription>Configure parameters for tenant runtime isolation. (Side: {side})</SheetDescription>
                      </SheetHeader>
                      <div style={{ padding: '1rem', display: 'grid', gap: '0.75rem' }}>
                        <div style={{ display: 'grid', gap: '0.25rem' }}>
                          <Label>Max Concurrency</Label>
                          <Input defaultValue="2500" />
                        </div>
                        <div style={{ display: 'grid', gap: '0.25rem' }}>
                          <Label>Heartbeat Timeout (ms)</Label>
                          <Input defaultValue="30000" />
                        </div>
                      </div>
                      <SheetFooter>
                        <SheetClose render={<Button className="w-full">Apply Changes</Button>} />
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Popover */}
        <Section title="Popover" desc="Rich floating popover content attached to a trigger." badge="Popover">
          <div className="debug-card">
            <div className="debug-card-body">
              <div className="variant-row">
                <Popover>
                  <PopoverTrigger render={<Button size="sm" variant="tertiary">Open Popover</Button>} />
                  <PopoverContent>
                    <PopoverHeader>
                      <PopoverTitle style={{ fontSize: '0.8rem', fontWeight: 600 }}>Token Reference</PopoverTitle>
                      <PopoverDescription style={{ fontSize: '0.75rem' }}>
                        Values dynamically change when toggling Light / Dark / High-Contrast modes.
                      </PopoverDescription>
                    </PopoverHeader>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', display: 'grid', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--muted-foreground)' }}>--primary</span>
                        <Badge variant="outline" style={{ fontSize: '0.65rem' }}>oklch(…)</Badge>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--muted-foreground)' }}>--background</span>
                        <Badge variant="outline" style={{ fontSize: '0.65rem' }}>oklch(…)</Badge>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </Section>

        {/* Tooltip & HoverCard */}
        <Section title="Tooltip & HoverCard" desc="Lightweight context overlays on hover or focus." badge="Tooltip / HoverCard">
          <div className="debug-card">
            <div className="debug-card-body">
              <div className="variant-row">
                <Tooltip>
                  <TooltipTrigger render={<Button size="icon" variant="ghost" aria-label="Info"><Info className="h-4 w-4" /></Button>} />
                  <TooltipContent>WCAG 2.1 AA accessible tooltip</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger render={<Button size="sm" variant="secondary">Hover for tooltip</Button>} />
                  <TooltipContent>This is a tooltip with more info!</TooltipContent>
                </Tooltip>
                <HoverCard>
                  <HoverCardTrigger render={<Button size="sm" variant="ghost">Hover for HoverCard</Button>} />
                  <HoverCardContent style={{ fontSize: '0.8rem' }}>
                    <p style={{ margin: '0 0 0.25rem', fontWeight: 600 }}>Enterprise Policy</p>
                    <p style={{ margin: 0, color: 'var(--muted-foreground)' }}>All components adhere to strict token hierarchies and WCAG 2.1 AA accessibility requirements.</p>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
          </div>
        </Section>

        {/* DropdownMenu */}
        <Section title="DropdownMenu" desc="Action menu popover for user profiles and item actions." badge="DropdownMenu">
          <div className="debug-card">
            <div className="debug-card-body">
              <div className="variant-row">
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button size="sm" variant="secondary">Open Menu ▾</Button>} />
                  <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile settings</DropdownMenuItem>
                    <DropdownMenuItem>API Keys</DropdownMenuItem>
                    <DropdownMenuItem>Billing & Plans</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem style={{ color: 'var(--destructive)' }}>Sign Out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </TooltipProvider>
  );
}
