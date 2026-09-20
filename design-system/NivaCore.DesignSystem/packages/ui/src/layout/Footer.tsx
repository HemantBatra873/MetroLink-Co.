import React from 'react';
import { Badge } from '../components/ui/badge.js';
import { Separator } from '../components/ui/separator.js';
import { Shield, Globe, Share2, Code2, Heart } from 'lucide-react';

export interface FooterProps {
  companyName?: string;
  version?: string;
}

export function Footer({ companyName = 'Enterprise System Inc.', version = '1.0.0' }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="ent-footer border-t bg-muted/30 text-muted-foreground mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-foreground font-bold">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-primary-foreground">
                <Shield className="h-4 w-4" />
              </div>
              <span>Enterprise UI Kit</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Standardized, accessible design tokens and component primitives built for mission-critical enterprise web applications.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> All Systems Operational
              </Badge>
            </div>
          </div>

          {/* Links Col 1 */}
          <div className="space-y-2 text-xs">
            <h4 className="font-semibold text-foreground text-sm tracking-wide">Design Tokens</h4>
            <ul className="space-y-1.5">
              <li><a href="#primitives" className="hover:text-foreground transition-colors">Primitives Scale</a></li>
              <li><a href="#semantics" className="hover:text-foreground transition-colors">Semantic Mappings</a></li>
              <li><a href="#themes" className="hover:text-foreground transition-colors">Multi-Theme Engine</a></li>
              <li><a href="#components" className="hover:text-foreground transition-colors">Component Tokens</a></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div className="space-y-2 text-xs">
            <h4 className="font-semibold text-foreground text-sm tracking-wide">Component Library</h4>
            <ul className="space-y-1.5">
              <li><a href="#forms" className="hover:text-foreground transition-colors">Form Controls & Fields</a></li>
              <li><a href="#data-display" className="hover:text-foreground transition-colors">Data Tables & Display</a></li>
              <li><a href="#overlays" className="hover:text-foreground transition-colors">Dialogs & Overlays</a></li>
              <li><a href="#layout" className="hover:text-foreground transition-colors">Page Layout & Shell</a></li>
            </ul>
          </div>

          {/* Links Col 3 */}
          <div className="space-y-2 text-xs">
            <h4 className="font-semibold text-foreground text-sm tracking-wide">Enterprise Policy</h4>
            <ul className="space-y-1.5">
              <li><a href="#accessibility" className="hover:text-foreground transition-colors">WCAG 2.1 AA Compliance</a></li>
              <li><a href="#security" className="hover:text-foreground transition-colors">Security & Governance</a></li>
              <li><a href="#docs" className="hover:text-foreground transition-colors">Architecture Documentation</a></li>
              <li><a href="#support" className="hover:text-foreground transition-colors">Enterprise Support</a></li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 border-border" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {year} {companyName}. All rights reserved. Version {version}</p>
          <div className="flex items-center gap-4 text-muted-foreground">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors" title="Repository">
              <Code2 className="h-4 w-4" />
            </a>
            <a href="https://enterprise.org" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors" title="Website">
              <Globe className="h-4 w-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors" title="Connect">
              <Share2 className="h-4 w-4" />
            </a>
            <span className="flex items-center gap-1 text-[11px]">
              Built with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for Enterprise
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
