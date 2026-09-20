import { useQuery } from '@tanstack/react-query'
import { Label } from '@enterprise/component-library'
import { useAuth } from '@/auth/AuthContext'
import { get, type PersonaEntity } from '@/api/persona'
import { useWorkspace } from '@/context/WorkspaceContext'

export function ContextBar() {
  const { session } = useAuth()
  const { areaId, setAreaId } = useWorkspace()

  const areas = useQuery({
    queryKey: ['persona', 'areas'],
    queryFn: () => get<PersonaEntity[]>('/areas'),
    enabled: Boolean(session),
  })

  return (
    <div className="mb-4 flex flex-wrap items-end gap-4 rounded-md border border-border bg-muted/30 px-4 py-3">
      <div className="min-w-[200px] max-w-md">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Organization</p>
        <p className="mt-1 truncate text-sm font-medium" title={session?.organizationId}>
          {session?.organizationId ?? '—'}
        </p>
      </div>
      <div className="min-w-[220px]">
        <Label htmlFor="area-context" className="text-xs uppercase tracking-wide text-muted-foreground">
          Operational area
        </Label>
        <select
          id="area-context"
          className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={areaId ?? ''}
          onChange={(e) => setAreaId(e.target.value || null)}
          disabled={areas.isLoading}
          aria-label="Operational area"
        >
          <option value="">All areas in scope</option>
          {(areas.data ?? []).map((area) => (
            <option key={area.id} value={area.id}>
              {area.name || area.code || area.id}
            </option>
          ))}
        </select>
        {areas.isError && (
          <p className="mt-1 text-xs text-muted-foreground">Areas unavailable (Identity API).</p>
        )}
      </div>
    </div>
  )
}
