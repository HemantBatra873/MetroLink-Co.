import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '@/auth/AuthContext'

export interface WorkspaceState {
  organizationId: string
  areaId: string | null
  setAreaId: (areaId: string | null) => void
}

const WorkspaceContext = createContext<WorkspaceState | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [areaId, setAreaId] = useState<string | null>(null)

  const value = useMemo<WorkspaceState>(
    () => ({
      organizationId: session?.organizationId ?? '',
      areaId,
      setAreaId,
    }),
    [session?.organizationId, areaId],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return ctx
}
