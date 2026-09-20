import { persona } from '@/api/client'

export type PersonaEntity = {
  id: string
  name?: string
  code?: string
  email?: string
  displayName?: string
  keycloakUserId?: string
  description?: string
  createdAt?: string
  units?: PersonaEntity[]
  areas?: PersonaEntity[]
  rolePermissions?: { permission?: PersonaEntity }[]
  user?: PersonaEntity
  organization?: PersonaEntity
  role?: PersonaEntity
  organizationUnit?: PersonaEntity
  scopeArea?: PersonaEntity
}

export function get<T>(path: string) {
  return persona<T>(path)
}

export function post<T>(path: string, body: unknown) {
  return persona<T>(path, { method: 'POST', body: JSON.stringify(body) })
}

export function displayTitle(entity: Partial<PersonaEntity>) {
  return entity.displayName || entity.name || entity.email || entity.code || 'Untitled'
}
