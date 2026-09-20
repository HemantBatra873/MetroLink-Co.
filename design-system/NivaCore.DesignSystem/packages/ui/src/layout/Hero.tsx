import React from 'react';
import { Button } from '../components/button.js';
import { Badge } from '../components/ui/badge.js';
import { Sparkles, ArrowRight, ShieldCheck, Layers, Cpu } from 'lucide-react';

export interface HeroProps {
  title?: string;
  subtitle?: string;
  onExploreClick?: () => void;
  onDocsClick?: () => void;
}

export function Hero({
  title = 'Enterprise Design System & Component Infrastructure',
  subtitle = 'Modular, DTCG-compliant design tokens, dark/light theme engines, and 60+ accessible component primitives engineered for mission-critical enterprise applications.',
  onExploreClick,
  onDocsClick,
}: HeroProps) {
  return (
    <section className="ent-hero relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card via-background to-muted/40 p-6 md:p-10 shadow-sm">
      {/* Background ambient gradient glow */}
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1 text-xs gap-1.5 font-medium border border-border">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Multi-Theme DTCG Architecture
          </Badge>
          <Badge variant="outline" className="px-2.5 py-0.5 text-[11px] font-mono border-primary/30 text-primary">
            @enterprise/component-library
          </Badge>
        </div>

        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          {title}
        </h1>

        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          {subtitle}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button onClick={onExploreClick} className="gap-2 shadow-xs">
            Explore 60+ Component Catalog <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="secondary" onClick={onDocsClick} className="gap-2">
            View Design Token Spec
          </Button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 mt-6 border-t border-border/60 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/80 border border-border">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary shrink-0">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-foreground">3-Tier Tokens</p>
              <p className="text-muted-foreground text-[11px]">Primitives, Semantic & Components</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/80 border border-border">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary shrink-0">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-foreground">4 Theme Engine</p>
              <p className="text-muted-foreground text-[11px]">Light, Dark, HC-Light & HC-Dark</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/80 border border-border">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-foreground">WCAG 2.1 AA</p>
              <p className="text-muted-foreground text-[11px]">Accessible keyboard & focus states</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
