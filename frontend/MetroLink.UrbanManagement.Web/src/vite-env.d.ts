/// <reference types="vite/client" />
/// <reference types="vitest/globals" />

interface ImportMetaEnv {
  readonly VITE_IDENTITY_API_URL: string
  readonly VITE_PARKING_API_URL: string
  readonly VITE_ENFORCEMENT_API_URL: string
  readonly VITE_PAYMENT_API_URL: string
  readonly VITE_ORG_ID: string
  readonly VITE_TEST_USER_SUB: string
  readonly VITE_PAYMENT_TEST_ROLES: string
  readonly VITE_USER_DISPLAY_NAME: string
  readonly VITE_USER_PERMISSIONS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '@enterprise/design-tokens/css'
