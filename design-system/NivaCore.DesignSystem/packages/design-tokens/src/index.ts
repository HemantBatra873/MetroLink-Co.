/** Design tokens package metadata and constants */
export const tokenPackage = '@enterprise/design-tokens';
export const availableThemes = ['light', 'dark', 'hc-light', 'hc-dark'] as const;
export type ThemeName = typeof availableThemes[number];
