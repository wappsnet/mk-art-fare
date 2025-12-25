// Shared responsive breakpoints for the application
export const BREAKPOINTS = {
  mobile: '768px',
  tablet: '992px',
  desktop: '1200px',
  wide: '1600px',
} as const;

// Media query helpers
export const media = {
  mobile: `@media (min-width: ${BREAKPOINTS.mobile})`,
  tablet: `@media (min-width: ${BREAKPOINTS.tablet})`,
  desktop: `@media (min-width: ${BREAKPOINTS.desktop})`,
  wide: `@media (min-width: ${BREAKPOINTS.wide})`,
} as const;
