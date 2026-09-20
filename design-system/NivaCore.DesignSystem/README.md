# Niva Design System

Niva is the shared design system for the Urban Management Platform.

Its purpose is to provide a consistent visual language, reusable UI components, and cross-platform design standards for all platform applications.

Two reusable packages: `@enterprise/design-tokens` defines the visual language; `@enterprise/component-library` provides accessible React primitives. Run `pnpm install`, then `pnpm build`, `pnpm typecheck`, `pnpm test`, or `pnpm dev` from this directory. Packages are versioned independently and are ready for an intentional future private-registry release.

The playground imports only package entry points, just as a consuming application would.

## Core Principles

### 1. One Design System, Multiple Platforms

Niva supports both **Web (React)** and **Mobile (React Native)**.

We share the design system across platforms, but we do **not** require identical component implementations.

```text
                    Niva Design System
                            │
             ┌──────────────┼──────────────┐
             │              │              │
          Tokens         Patterns       Components
             │                             │
             │                    ┌────────┴────────┐
             │                    │                 │
             ▼                    ▼                 ▼
          Shared              Web (React)     Native (React Native)
```

### 2. Shared Foundations

The following must remain consistent across Web and Mobile:

* Colors
* Typography
* Spacing
* Sizing
* Border radius
* Elevation
* Icons
* Motion principles
* Accessibility principles
* Design terminology

These are the foundation of Niva and should be platform-independent wherever possible.

### 3. Platform-Specific Components

Web and Mobile may have different implementations and interaction patterns.

**Web** may contain components such as:

* Data tables
* Desktop navigation
* Command menus
* Advanced filters
* Hover and keyboard interactions

**Mobile** may contain components such as:

* Bottom sheets
* Bottom navigation
* Swipe actions
* Mobile lists
* Touch-specific interactions

A component does not need to exist on both platforms simply for symmetry.

### 4. Shared Component Contracts

When a component exists on both platforms, its:

* Purpose
* Visual language
* Variants
* States
* Terminology
* Accessibility expectations

should remain consistent.

The underlying implementation may differ between React and React Native.

### 5. Domain Independence

Niva must remain **domain-agnostic**.

Niva provides reusable primitives and patterns such as:

```text
Button
Input
Card
Dialog
Badge
Table
Form
FilterBar
EmptyState
LoadingState
```

Domain-specific components belong to their respective applications.

For example:

```text
ParkCore
└── ParkingFacilityCard

EnforceCore
└── EnforcementCaseTable
```

These may use Niva components but must not become part of Niva.

### 6. Documentation and Showcase

Niva should provide a single documentation/showcase experience covering:

```text
Foundations
Components
Patterns
Web
Mobile
```

The showcase should document component usage, variants, states, accessibility, and platform differences.

Storybook or an equivalent component documentation system may be used.

## Target Repository Structure

The repository may evolve toward:

```text
Niva-Design/
├── packages/
│   ├── tokens/
│   ├── icons/
│   ├── web/
│   ├── native/
│   └── utilities/
├── docs/
└── examples/
    ├── web/
    └── native/
```

The exact structure can evolve, but the architectural principles above should remain stable.

## Golden Rule

> **Share design decisions aggressively. Share implementation only where it makes technical sense.**

Niva defines how the Urban Management Platform should feel and behave across platforms, while each platform remains free to use the interaction patterns appropriate to its environment.

