import React from 'react';
import { Button } from '../components/button.js';
import { Input } from '../components/ui/input.js';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar.js';
import { Badge } from '../components/ui/badge.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu.js';
import { Search, Bell, Sun, Moon, Sparkles, Shield, User, LogOut, Settings } from 'lucide-react';

export interface HeaderProps {
  currentTheme?: string;
  onThemeChange?: (theme: string) => void;
  title?: string;
  showSearch?: boolean;
  onSearchChange?: (val: string) => void;
}

export function Header({
  currentTheme = 'light',
  onThemeChange,
  title = 'Enterprise Platform',
  showSearch = true,
  onSearchChange,
}: HeaderProps) {
  return (
    <header className="ent-header sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-border">
      <div className="flex h-16 items-center px-4 md:px-6 gap-4 justify-between">
        {/* Left: Brand logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg shadow-sm">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-foreground flex items-center gap-2">
              {title}
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium border-primary/30 text-primary">
                v2.4 Enterprise
              </Badge>
            </span>
          </div>
        </div>

        {/* Center: Global Search */}
        {showSearch && (
          <div className="hidden md:flex flex-1 max-w-md items-center relative">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search components, design tokens, docs... (Ctrl+K)"
              className="pl-9 h-9 text-sm bg-muted/40 border-border focus-visible:bg-background transition-colors"
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
        )}

        {/* Right: Actions, Theme Switcher, Profile */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Theme Selector */}
          {onThemeChange && (
            <div className="flex items-center bg-muted/60 p-1 rounded-md border border-border text-xs">
              <button
                type="button"
                title="Light Theme"
                onClick={() => onThemeChange('light')}
                className={`px-2 py-1 rounded font-medium flex items-center gap-1 transition-all ${
                  currentTheme === 'light'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sun className="h-3.5 w-3.5" /> Light
              </button>
              <button
                type="button"
                title="Dark Theme"
                onClick={() => onThemeChange('dark')}
                className={`px-2 py-1 rounded font-medium flex items-center gap-1 transition-all ${
                  currentTheme === 'dark'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Moon className="h-3.5 w-3.5" /> Dark
              </button>
              <button
                type="button"
                title="High Contrast Dark"
                onClick={() => onThemeChange('hc-dark')}
                className={`px-2 py-1 rounded font-medium flex items-center gap-1 transition-all ${
                  currentTheme === 'hc-dark'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" /> High Contrast
              </button>
            </div>
          )}

          {/* Notifications button */}
          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          </Button>

          {/* User Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="User" />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">EP</AvatarFallback>
                </Avatar>
              </Button>
            } />
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground">Enterprise Administrator</p>
                  <p className="text-xs leading-none text-muted-foreground">admin@enterprise.org</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <User className="h-4 w-4" /> Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Settings className="h-4 w-4" /> Design System Tokens
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
