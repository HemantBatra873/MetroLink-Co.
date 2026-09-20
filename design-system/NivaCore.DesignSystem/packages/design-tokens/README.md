# Design tokens

`src/themes/light.json` is the source of truth. It contains primitives plus semantic aliases; `pnpm build` emits `tokens.css`. Use semantic variables in UI (`--semantic-color-action-primary`), reserving primitives for token definitions. Add themes as a new JSON source and selector without changing components.
