import { getActiveSession } from '@/auth/session'
import type { PaymentRole } from '@/auth/permissions'

export const identityApi =
  import.meta.env.VITE_IDENTITY_API_URL || 'http://localhost:5265/api/v1'
export const parkingApi =
  import.meta.env.VITE_PARKING_API_URL || 'http://localhost:5212/api/v1'
export const enforcementApi =
  import.meta.env.VITE_ENFORCEMENT_API_URL || 'http://localhost:5208/api/v1'
export const paymentApi =
  import.meta.env.VITE_PAYMENT_API_URL || 'http://localhost:5210/api/v1'

export function getOrgId(): string {
  return getActiveSession().organizationId
}

export function getTestUserSub(): string {
  return getActiveSession().userSub
}

export function getPaymentRoles(): PaymentRole[] {
  return getActiveSession().paymentRoles
}

export function isPaymentAdmin(): boolean {
  return getPaymentRoles().includes('PaymentAdmin')
}

export function buildAuthHeaders(options?: { forPayment?: boolean }): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Test-User-Sub': getTestUserSub(),
  }
  if (options?.forPayment) {
    headers['X-Test-User-Roles'] = getPaymentRoles().join(',')
  }
  return headers
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiRequest<T>(
  baseUrl: string,
  path: string,
  init?: RequestInit,
  options?: { forPayment?: boolean },
): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...buildAuthHeaders(options),
      ...(init?.headers as Record<string, string> | undefined),
    },
  })
  if (!response.ok) {
    const text = await response.text()
    throw new ApiError(text || `Request failed (${response.status})`, response.status)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const park = <T>(path: string, init?: RequestInit) =>
  apiRequest<T>(parkingApi, path, init)

export const enf = <T>(path: string, init?: RequestInit) =>
  apiRequest<T>(enforcementApi, path, init)

export const pay = <T>(path: string, init?: RequestInit) =>
  apiRequest<T>(paymentApi, path, init, { forPayment: true })

export const persona = <T>(path: string, init?: RequestInit) =>
  apiRequest<T>(identityApi, path, init)
