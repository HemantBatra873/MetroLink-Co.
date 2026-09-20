import React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose, SheetTrigger,
  Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription, PopoverTrigger,
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
  HoverCard, HoverCardContent, HoverCardTrigger,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerTrigger, DrawerClose,
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger,
  Toaster, toast,
  Button, Input, Label, Badge,
  Info,
} from '@enterprise/component-library';
import { Section, DebugCard, UnknownComponentSection } from './Section.js';

type Props = { componentId?: string; activeTab?: string };

export function OverlaysView({ componentId = 'dialog' }: Props) {
  let section: React.ReactNode = null;

  switch (componentId) {
    case 'dialog':
      section = (
        <Section title="Dialog" desc="Modal dialog overlay for focused confirmations and forms." badge="Dialog">
          <DebugCard>
            <Dialog>
              <DialogTrigger render={<Button size="sm">Open Dialog</Button>} />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Deploy Enterprise Release</DialogTitle>
                  <DialogDescription>Promote release v2.4 to the production cluster.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="secondary">Cancel</Button>
                  <Button>Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DebugCard>
        </Section>
      );
      break;

    case 'alert-dialog':
      section = (
        <Section title="AlertDialog" desc="High-urgency confirmation dialog for destructive actions." badge="AlertDialog">
          <DebugCard>
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="danger" size="sm">Delete Cluster</Button>} />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently destroy the cluster and all volumes.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DebugCard>
        </Section>
      );
      break;

    case 'sheet':
      section = (
        <Section title="Sheet" desc="Slide-in side drawer panel for secondary configuration." badge="Sheet">
          <DebugCard>
            <Sheet>
              <SheetTrigger render={<Button size="sm" variant="secondary">Open Sheet</Button>} />
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Environment Settings</SheetTitle>
                  <SheetDescription>Configure tenant runtime isolation.</SheetDescription>
                </SheetHeader>
                <div style={{ padding: '1rem', display: 'grid', gap: '0.75rem' }}>
                  <div style={{ display: 'grid', gap: '0.25rem' }}>
                    <Label>Max Concurrency</Label>
                    <Input defaultValue="2500" />
                  </div>
                </div>
                <SheetFooter>
                  <SheetClose render={<Button className="w-full">Apply</Button>} />
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </DebugCard>
        </Section>
      );
      break;

    case 'popover':
      section = (
        <Section title="Popover" desc="Rich floating popover content attached to a trigger." badge="Popover">
          <DebugCard>
            <Popover>
              <PopoverTrigger render={<Button size="sm" variant="tertiary">Open Popover</Button>} />
              <PopoverContent>
                <PopoverHeader>
                  <PopoverTitle style={{ fontSize: '0.8rem', fontWeight: 600 }}>Token Reference</PopoverTitle>
                  <PopoverDescription style={{ fontSize: '0.75rem' }}>
                    Values change when toggling theme modes.
                  </PopoverDescription>
                </PopoverHeader>
                <div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  <Badge variant="outline">--primary</Badge>
                </div>
              </PopoverContent>
            </Popover>
          </DebugCard>
        </Section>
      );
      break;

    case 'tooltip':
      section = (
        <Section title="Tooltip" desc="Lightweight context tooltip on hover or focus." badge="Tooltip">
          <DebugCard>
            <Tooltip>
              <TooltipTrigger render={<Button size="sm" variant="secondary">Hover for tooltip</Button>} />
              <TooltipContent>WCAG 2.1 AA accessible tooltip</TooltipContent>
            </Tooltip>
          </DebugCard>
        </Section>
      );
      break;

    case 'hover-card':
      section = (
        <Section title="HoverCard" desc="Preview card on pointer hover." badge="HoverCard">
          <DebugCard>
            <HoverCard>
              <HoverCardTrigger render={<Button size="sm" variant="ghost">Hover for HoverCard</Button>} />
              <HoverCardContent style={{ fontSize: '0.8rem' }}>
                <p style={{ margin: 0, fontWeight: 600 }}>Enterprise Policy</p>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--muted-foreground)' }}>Components adhere to token hierarchies and WCAG 2.1 AA.</p>
              </HoverCardContent>
            </HoverCard>
          </DebugCard>
        </Section>
      );
      break;

    case 'dropdown-menu':
      section = (
        <Section title="DropdownMenu" desc="Action menu popover for profiles and item actions." badge="DropdownMenu">
          <DebugCard>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button size="sm" variant="secondary">Open Menu ▾</Button>} />
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile settings</DropdownMenuItem>
                <DropdownMenuItem>API Keys</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem style={{ color: 'var(--destructive)' }}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </DebugCard>
        </Section>
      );
      break;

    case 'drawer':
      section = (
        <Section title="Drawer" desc="Mobile-friendly bottom sheet drawer." badge="Drawer">
          <DebugCard>
            <Drawer>
              <DrawerTrigger render={<Button size="sm">Open Drawer</Button>} />
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Quick actions</DrawerTitle>
                  <DrawerDescription>Swipe down or tap outside to dismiss.</DrawerDescription>
                </DrawerHeader>
                <div style={{ padding: '0 1rem 1rem', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                  Drawer content area
                </div>
                <DrawerFooter>
                  <DrawerClose render={<Button variant="secondary">Close</Button>} />
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </DebugCard>
        </Section>
      );
      break;

    case 'context-menu':
      section = (
        <Section title="ContextMenu" desc="Right-click contextual action menu." badge="ContextMenu">
          <DebugCard>
            <ContextMenu>
              <ContextMenuTrigger
                render={
                  <div
                    style={{
                      padding: '2rem',
                      border: '1px dashed var(--border)',
                      borderRadius: '0.5rem',
                      fontSize: '0.8rem',
                      color: 'var(--muted-foreground)',
                      textAlign: 'center',
                    }}
                  >
                    Right-click here
                  </div>
                }
              />
              <ContextMenuContent>
                <ContextMenuItem>Copy</ContextMenuItem>
                <ContextMenuItem>Paste</ContextMenuItem>
                <ContextMenuItem>Delete</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </DebugCard>
        </Section>
      );
      break;

    case 'toast':
      section = (
        <Section title="Toast" desc="Transient notification stack." badge="Toast">
          <DebugCard>
            <Toaster>
              <Button
                size="sm"
                onClick={() =>
                  toast.add({
                    title: 'Changes saved',
                    description: 'Your configuration was updated.',
                    type: 'success',
                  })
                }
              >
                Show toast
              </Button>
            </Toaster>
          </DebugCard>
        </Section>
      );
      break;

    default:
      section = (
        <UnknownComponentSection componentId={componentId}>
          <Button size="sm" variant="secondary">Overlay preview</Button>
        </UnknownComponentSection>
      );
  }

  return (
    <TooltipProvider>
      <div className="comp-view">{section}</div>
    </TooltipProvider>
  );
}
