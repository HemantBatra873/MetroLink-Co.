# Architecture

This workspace deliberately contains two publishable packages. `@enterprise/design-tokens` is framework-independent DTCG-inspired JSON source compiled into CSS variables and typed JavaScript. `@enterprise/component-library` depends on it and exposes React components through one public entry point.

The component library uses Tailwind CSS v4 to generate one distributable side-effect stylesheet (`@enterprise/component-library/styles.css`) and consumes semantic CSS variables from the tokens package. It uses shadcn-compatible Radix primitives for composite controls. Components are intentionally generic: domain workflows belong in applications that compose this package.

Future themes are added as a new source theme and emitted beneath a `[data-theme="..."]` selector; components continue to use the same semantic variables.
